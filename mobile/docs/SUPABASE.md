# Supabase 接入计划

当前无 Supabase 连接、假登录或虚构云端权限。`src/storage/supabase-contract.ts` 是后续接口契约；本阶段使用 `LocalKitchenRepository`，通过 `KitchenSession` 串行保存本机数据。

## 1. 账号与会话

引入 SDK 匹配的 Supabase JS 客户端和移动端会话存储，接入 Auth、邮件回跳及 `eatlah://` 深链接。客户端只使用公开项目 URL 和 publishable/anon key，绝不包含 service-role key。完成登录、退出、过期刷新与切换账号测试；按用户 ID 隔离缓存，退出后清除该用户内存状态，防止串号。

配置 `EXPO_PUBLIC_SUPABASE_URL` 和 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；公开变量不是秘密。OAuth/邮件回跳还需配置 Supabase redirect allowlist 和开发/生产 scheme。真实值在接入阶段从项目设置获取，不编造。

## 2. Schema 与访问控制

公共内容表：ingredients、recipes、recipe_ingredients、recipe_steps、recipe_tools、recipe_addons、recipe_sources、products、product_offers、retailers。保留 editorial/review、licensing、nutrition、source_url、last_reviewed_at 等状态。商品 SKU 与食材独立，真实包装、价格和采集时间必须有来源。

私人表：profiles、preferences、favorites、meal_plans、meal_plan_items、shopping_lists、inventory_batches、purchase_events、meal_logs、meal_consumptions、inventory_events、reminder_preferences。

私人行均以 `user_id` 关联 `auth.users`，开启 RLS；select/insert/update/delete 分别使用 `auth.uid() = user_id` 的 USING / WITH CHECK。服务端从会话推断用户，不接受客户端指定任意 user_id。公共内容读取和后台编辑权限另行设计，不开放匿名写入。

约束至少包括：数量非负；有效日期合法；同一用户同一天同一餐次最多一个有效日志；幂等操作键唯一；原购买批次和消费事件外键完整。撤销采用事件记录或撤销状态，不删除审计轨迹。

## 3. 购买、完成和撤销必须是事务

实现 `confirm_purchase`、`complete_meal`、`undo_meal` PostgreSQL RPC：

1. 检查当前身份、菜单归属、幂等键和日期；有效期按新加坡日期处理。
2. 完成餐次时锁定候选库存批次，按 FEFO 分配；排除过期、丢弃、未核对和不适合储存的批次。
3. 库存不足时回滚，不产生部分扣减或成功日志；常备调料核对可用状态但不按餐扣量。
4. 原子写入日志、批次变更、消费事件及幂等结果。并发重复请求返回同一结果。
5. 撤销按原始 consumption 事件恢复原批次数量；已丢弃的批次保持不可用。行锁和幂等键防止双重恢复。

客户端不能通过上传整个 AppState 来覆盖服务端库存。现有本地 repository 的 snapshot save 只适合单机阶段，云端适配器应改成调用以上 domain commands，然后获取已提交的权威快照与 revision。

## 4. 本机数据迁移与离线同步

登录后先展示本机资料导入预览，明确哪些批次需要重新核对包装。上传带客户端稳定 ID 的幂等事件；由服务端验证后合并。设计 outbox、重试、revision 冲突和撤销依赖，不能把本机时间当权威。对分享备份设计版本化的导入验证后再开放恢复功能。

## 5. 上线前测试

- 两个真实测试用户在所有私人表和 RPC 上互不可读写；匿名用户不能读私人数据。
- 两台设备并发完成相同餐次只扣一次，并发消费同一批次不为负。
- 网络断开/超时后的幂等重试，撤销后再完成、跨新加坡日期边界、已过期批次、库存不足回滚。
- 数据导入去重、账号切换缓存清理、过期会话刷新、深链接回跳。
- 建立 RLS/事务的数据库集成测试和 Android/iOS 真机端到端测试，再开放云账号。
