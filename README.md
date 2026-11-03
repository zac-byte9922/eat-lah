# Eat Lah V1.2 — 选餐顺序修正版（本地交互原型）

**状态：真实可交互的原型，不是正式上线应用。**

## 使用

- 双击 `index.html` 体验多文件版本；或者使用目录外另附的 `Eat_Lah_V1_2_Standalone.html`。
- 首次使用分四步设置：邮编与厨具储存能力、预算与热量提示、忌口与口味、常备调味品。
- 回到首页选择早餐 / 午餐 / 晚餐，先选择“我想做点”或“今天省点事”：前者再选清淡 / 普通 / 罪恶 / 减脂 / 你看着办，后者直接选在家 / 外食 / 外卖。
- 单张卡片选主食、可选配菜和小食；可以切换省事模式。
- 选好后自动进入购物清单。确认实际买到的整包装商品就入库。
- 接着进入烹饪步骤。点击“完成这顿”，对应餐次打卡并自动按默认食材用量扣库存。
- 螺蛳粉例子支持可选火腿肠、鸡蛋、青菜或少油煎蛋加料，加料会进入购物清单及扣减逻辑。

## 内容与数据的真实范围

- 数据文件 `data.js` + `data-extra.js` 目前总计 58 个演示条目，包含主食、配菜、小食和加料，而**不是** 58 道完整、实测、可商业上线的食谱。
- 价格、营养和包装规格是演示估算。不存在真实的店铺库存 API、实时价格同步或营养审核。
- 数据保存在浏览器 localStorage；没有账号系统、Supabase 服务端、跨设备同步或真正的交易确认。
- 页面使用中文与英文食材名称。首次设置中的住址是选填，不建议在本地原型输入完整门牌号。
- 一键完成只扣已经存在于个人库存的数量；没有库存的商品不会被虚构成已购入。

## 文件

- `index.html`: 入口
- `styles.css`: 简约风格
- `data.js`: 原始演示食材与餐食
- `data-extra.js`: 新增原创演示餐食、半成品和加料
- `app.js`: 用户交互和库存模拟
- `RECIPE_LIBRARY_AND_SOURCE_PLAN.md`: 内容库规模、审核、来源许可计划
- `CONTENT_SOURCE_RESEARCH.csv`: 食谱/商品来源研究队列（不包含平台作品正文）
- `CODEX_IMPLEMENTATION_SPEC.md`: 接下来交给 Codex 的正式建站工作说明
- `test_v12_vm.js`: V1.2 的完整流程、库存与设置逻辑测试（Node.js）

## 测试

已运行 `node --check app.js`、`node --check data-extra.js`、`node test_v12_vm.js`，并对内联单文件版本用无头 Chromium 验证了初次设置、早餐/午餐/晚餐→做饭精力→口味→选菜的导航，以及移动端显示截图。覆盖购物入库和做饭打卡的逻辑路径。仍未测试真实设备的手势体验或核实实际超市价格、食品加热方法和营养值。

## 下一步

阅读 `CODEX_IMPLEMENTATION_SPEC.md`，交给 Codex 基于 Next.js + Supabase 重建真正的多用户产品；食谱内容遵循 `RECIPE_LIBRARY_AND_SOURCE_PLAN.md` 进行独立编辑和审核。不要直接拿本原型的估算商品价格做商业发布。

## V1.2 改动

- 餐次 → 做饭精力模式 → （想做点）心情口味 → 单卡片餐食。
- 冷藏条件采用有冷藏、有冷冻（也有冷藏）、都没有；旧浏览器数据继续兼容。
- 首次注册和我的设置增加一人每周买菜预算示例与单餐热量说明，含不限制热量选项。参考：HealthHub https://www.healthhub.sg/well-being-and-lifestyle/personal-care/healthy-weight-loss ；MoneySmart https://blog.moneysmart.sg/budgeting/cost-living-singapore/ 。示例不是标准消费金额或个性化营养建议。
- 移除超市品牌偏好选项；按邮编打开地图搜索附近超市与亚洲杂货店，不声称已实现距离排序。正式接入需 OneMap Token 和已核实的门店位置数据。 https://www.onemap.gov.sg/apidocs/search 。
- 修复录入食品有效期时的脚本错误。
