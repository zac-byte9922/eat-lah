# 实际运行与测试记录

验证日期：2026-11-03。环境：Linux 云开发机，Node.js 24.22.1 / npm 11.9.0；Expo 58.0.22、React Native 0.88.1、React 19.3.0、TypeScript 6.0.3。以下是当前工作区结果，不代表 GitHub main 已提交或真机已验收。

| 检查                                                       | 实际结果                                                                                            |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm ci`                                                   | 从最终 lockfile 重新安装成功                                                                        |
| `EXPO_OFFLINE=1 npm run lint`                              | 通过，无错误或警告                                                                                  |
| `npm run typecheck`                                        | 严格 TypeScript 检查通过                                                                            |
| `npm test`                                                 | **5 个 suite，29 个测试全部通过**，没有跳过或预期失败                                               |
| `npm run format:check`                                     | 通过                                                                                                |
| `EXPO_OFFLINE=1 npx expo install --check`                  | SDK 内置兼容表核对通过；属于离线校验，在线目录未验证                                                |
| `EXPO_OFFLINE=1 npm run export:android -- --max-workers 2` | 成功编译 1267 个模块，生成约 3.3MB Android Hermes 代码包及资源                                      |
| `EXPO_OFFLINE=1 npm run export:ios -- --max-workers 2`     | 成功编译 1273 个模块，生成约 3.3MB iOS Hermes 代码包及资源                                          |
| Metro 开发服务                                             | 已启动；两端启动清单及实际原生开发 bundle 均 HTTP 200（约 6.85MB / 6.88MB），包含移动端本机存储入口 |
| 根目录 `node test_v12_vm.js`                               | 旧 HTML 原型回归测试通过                                                                            |
| GitHub Actions                                             | 已添加 mobile 检查流程，尚未在 GitHub 执行                                                          |
| Windows PowerShell                                         | 已编写启动步骤，当前没有 Windows 主机，未声称实际执行                                               |
| Android/iPhone 真机、模拟器                                | 当前环境无设备/模拟器，尚未执行                                                                     |
| APK / AAB / IPA、签名、商店发布                            | 未生成、未发布；Metro export 不等于安装包                                                           |

## GitHub 下载后的复现检查

已将完整项目推送到 `feat/eat-lah-mobile-phase1`，并从 GitHub 在 `/tmp` 下全新 clone，不复用工作区的 node_modules、.expo 或未提交源码。该副本 `npm ci` 和 `npm start` 均成功，Android/iOS Expo 启动清单均返回 HTTP 200。冷缓存 Jest 检查的 29 项测试全部通过；原生集成测试等待上限设为 15 秒，以容纳首次原生模块初始化，所有行为断言保持不变。线上 main 仅在 PR 合并后包含此项目。

## 自动测试覆盖

- catalog：58 个 draft 演示条目、52 项双语食材、加料引用、无真实商品价格。
- domain：新加坡日期、设置验证、过敏/未知加工食品/设备/储存/忌口硬过滤、选餐不入库、真实包装取整、部分确认购买、购买幂等与输入校验、排除过期和不安全批次、FEFO、库存不足原子失败、完成幂等、撤销恢复、外食不扣库存、常备调料、多日菜单以及按日期分配库存。
- storage：重启持久化、损坏资料保留、并发操作串行、保存失败后不发布并能恢复。
- native screens：首次设置验证与保存；首页 → 省事 → 单卡收藏 → 真实包装输入 → 确认入库 → 分步烹饪 → 完成打卡 → 历史/厨房 → Provider 重启后仍保留日志；常规做饭顺序、跳过配菜/小食和外食路径。
- navigation：实际 Expo Router 测试，未完成设置无法进入购物页面，原生 Tabs/Stack 能导航到选餐并在打卡后跳转历史。
- swipe：React Native PanResponder 的左右方向回调和纵向/小幅移动过滤，以及 Animated 完成后的保留/跳过。不是实体屏幕手势测试。

Jest 中的原生平台模块使用官方测试 mock；screen 测试使用实际本地 repository 和 domain 逻辑，不连接真实超市或后端。没有通过浏览器网页测试来替代手机 App 验证。

## 网络与当前限制

云环境的 npm/GitHub 访问正常，受限策略会拒绝 Expo 在线兼容目录、`docs.expo.dev` 等目的地。安装使用 Expo SDK 自带的 bundledNativeModules 兼容表，构建使用 `EXPO_OFFLINE=1`，保留 npm 包完整性和 TLS 校验。当前 SDK API 同时通过已安装的类型声明、官方测试工具和双平台 Metro 编译验证；在线 expo-doctor 未执行。

Expo 官方模板带来的 AGENTS.md 要求检查 lint/typecheck，均已执行；使用 src/app 路由目录，未手工生成或修改 ios/android 原生工程。

App 内提醒、本机持久化和用户手动核对已实现；系统推送、云账户、RLS、实时商品接口、正式食谱/营养审核尚未实现。继续按 [真机验收清单](DEVICE_CHECKLIST.md) 在 Android 和 iPhone 上验证滑动手感、字体/安全区/键盘、后台恢复与不同系统行为。
