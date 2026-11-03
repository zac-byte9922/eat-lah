# Eat Lah · 原生手机 App

第一阶段本地版本，使用 **React Native 0.88.1 + Expo SDK 58 + React 19.3 + TypeScript 6 + Expo Router**。使用原生 View、Text、Pressable、TextInput、ScrollView、Animated 和 PanResponder，不使用 WebView。应用目标仅 Android/iOS。

## 已实现的主要流程

1. 首次四步设置：邮编、厨具、冷藏条件、预算、热量参考、忌口与味道偏好。
2. 首页早餐/午餐/晚餐 → 做点饭/省点事 → 口味或在家/外食/外卖。
3. 一张卡片推荐，左滑跳过、右滑保留；可用按钮操作和撤销跳过、收藏。做饭路径可选配菜、小食，部分主食支持加料。
4. 合并双语购物清单；按已有可用库存、计划日期和实际包装取整。用户填写包装含量与实际包数，勾选确认后才入库，价格可留空。
5. 按购买批次管理库存。有效期、人工包装核对、储存条件参与可用性判断；过期、未核对或丢弃的批次不用于完成。
6. 分步骤烹饪，完成当天餐次时 FEFO 扣减。库存不足不允许伪造打卡；重复完成不重复扣，撤销恢复原批次。
7. 3–7 天三餐菜单、收藏、历史、App 内临期及待核对提醒、本机备份分享。
8. AsyncStorage 持久化，Zod 校验资料，串行写入，保存失败不更新 UI 的成功状态。

预算与热量是排序参考。库存和安全/过敏/设备限制优先；“一键推荐”选择排序后的第一项，不宣称机器学习或随机智能。菜单会有演示条目重复，并非已扩充的正式内容库。

## 完整文件结构

以下列出项目源文件；node_modules、.expo、dist、覆盖率等生成内容不纳入源码。

```text
eat-lah/
├── .github/workflows/mobile.yml      # 可复现检查与双平台 JS 编译
├── README.md
├── CODEX_IMPLEMENTATION_SPEC.md       # 历史设计，新手机需求优先
├── RECIPE_LIBRARY_AND_SOURCE_PLAN.md
├── CONTENT_SOURCE_RESEARCH.csv
├── index.html                       # 下列 6 个为保留的旧原型
├── styles.css
├── app.js
├── data.js
├── data-extra.js
├── test_v12_vm.js
└── mobile/
    ├── .gitignore
    ├── .prettierrc.json
    ├── .prettierignore
    ├── AGENTS.md                    # 官方模板的开发约定
    ├── LICENSE                      # 保留官方模板许可证
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── app.json                     # App 名、scheme、Android/iOS 配置
    ├── tsconfig.json
    ├── eslint.config.js
    ├── assets/                      # 官方模板的占位图标，尚非最终品牌设计
    │   ├── icon.png
    │   ├── android-icon-background.png
    │   ├── android-icon-foreground.png
    │   ├── android-icon-monochrome.png
    │   ├── splash-icon.png
    │   └── favicon.png              # 模板残留，不创建网页目标
    ├── src/
    │   ├── app/
    │   │   ├── _layout.tsx          # Provider、首次设置守卫、Stack
    │   │   ├── onboarding.tsx
    │   │   ├── choose.tsx
    │   │   ├── cook.tsx
    │   │   └── (tabs)/
    │   │       ├── _layout.tsx      # 原生底栏
    │   │       ├── index.tsx        # 首页与多日规划
    │   │       ├── shopping.tsx
    │   │       ├── pantry.tsx
    │   │       ├── history.tsx
    │   │       └── profile.tsx
    │   ├── components/
    │   │   ├── ui.tsx
    │   │   └── SwipeCard.tsx
    │   ├── data/
    │   │   └── catalog.json         # 58 项演示条目、52 项食材
    │   ├── domain/
    │   │   ├── types.ts
    │   │   ├── catalog.ts
    │   │   └── kitchen.ts           # 推荐、购买、库存、打卡、撤销、规划
    │   ├── screens/
    │   │   ├── ProfileScreen.tsx
    │   │   ├── HomeScreen.tsx
    │   │   ├── ChooseScreen.tsx
    │   │   ├── ShoppingScreen.tsx
    │   │   ├── PantryScreen.tsx
    │   │   ├── CookScreen.tsx
    │   │   └── HistoryScreen.tsx
    │   └── storage/
    │       ├── context.tsx
    │       ├── repository.ts
    │       ├── schema.ts
    │       └── supabase-contract.ts
    ├── tests/
    │   ├── setup.ts
    │   ├── kitchen.test.ts
    │   ├── storage.test.ts
    │   ├── screens.test.tsx
    │   ├── navigation.test.tsx
    │   └── swipe.test.tsx
    └── docs/
        ├── REQUIREMENTS.md
        ├── SUPABASE.md
        ├── VALIDATION.md
        ├── DEVICE_CHECKLIST.md
        └── LEGACY_PROTOTYPE.md
```

## 在 Windows 上启动

安装 Git 和 **Node.js 24 LTS**（SDK 58/RN 0.88 要求较新的 Node；当前已在 24.22.1 验证）。重新打开 PowerShell：

```powershell
git clone https://github.com/zac-byte9922/eat-lah.git
cd eat-lah\mobile
node --version
npm ci
npm start
```

若已经有仓库，直接进入该仓库的 mobile 目录即可。PR 合并前请先下载或检出 `feat/eat-lah-mobile-phase1` 分支；合并后 main 才包含 mobile 项目。使用 Git 时可在 clone 后执行 `git switch feat/eat-lah-mobile-phase1`；下载 ZIP 时先在 GitHub 切换到该分支，再选择 Code → Download ZIP。

`npm ci` 使用已提交的 package-lock.json，避免依赖飘移。`react-dom` 作为 Router 依赖的版本匹配项存在，不代表本项目采用网页界面；没有网页启动脚本或 WebView 页面。

默认不需要 .env、Supabase key、登录 Expo 账号或购买任何服务。不要在根目录启动旧 HTML 服务器作为手机 App 的入口。

PowerShell 若阻止 npm.ps1，使用系统同附的 `npm.cmd ci`、`npm.cmd start`，无需全局放宽执行策略。端口冲突时：

```powershell
npm start -- --port 8082
```

手机与电脑连同一 Wi-Fi，允许 Windows 防火墙中的 Node.js 私有网络访问。检查 VPN、访客 Wi-Fi 的设备隔离；不要把 localhost 地址手工填进另一台手机，使用 Metro 显示的局域网二维码。

需要清理 Metro 缓存：

```powershell
npm start -- --clear
```

局域网确实不可用时可选 `npx expo start --tunnel`。Tunnel 依赖额外联网服务及工具，当前云环境未验证；优先使用同一 Wi-Fi 的 LAN 方式。

## Android / iPhone 测试

**真机：**安装与 Expo SDK 58 对应的 Expo Go（Android/iOS）。运行 npm start，Android 用 Expo Go 扫码，iPhone 用系统相机扫码，再在 Expo Go 打开。首次设置中填 6 位邮编即可进入，未实现真实账户登录。

如果 Expo Go 提示 SDK 不匹配，按其提示安装兼容版本，或创建 development build；不要仅通过强制升级 React/React Native 来消除提示。iPhone 的 App Store 版 Expo Go 通常跟随当前 SDK，因此请确认支持 SDK 58。

**Windows + Android 模拟器：**安装 Android Studio 与 SDK，创建并先启动 AVD，配置 Android SDK/adb 后在 Metro 按 a，或执行 `npm run android`。这条命令打开 Expo Go，尚不生成 APK。

**Windows + iPhone：**可用上述局域网 Expo Go 直接测试；Windows 无法运行 iOS Simulator 或进行本地 Xcode 编译。iOS Simulator 需要 macOS + Xcode，然后 `npm run ios`。后续需要自定义原生模块时，再配置 EAS development build 或本地 `npx expo run:android` / macOS 上的 `npx expo run:ios`。

首次验收建议选“今天省点事 → 在家吃”，在清单中填写手中包装含量、实际包数、核对安全状态并确认入库，再查看每一步做法并完成打卡。详见 [真机验收清单](docs/DEVICE_CHECKLIST.md)。

## 开发与检查

在 mobile 目录：

```powershell
npm run check
npm run format:check
npm run export:android
npm run export:ios
```

check 执行 ESLint、严格 TypeScript 检查和 Jest 测试。两项 export 实际用 Metro/Hermes 编译对应平台 JS 代码、资源和 metadata，输出到被忽略的 dist/android、dist/ios；**它们不是 APK、AAB 或 IPA，也不能当安装包分发**。

默认目标仅 Android/iOS。生成的 ios/、android/ 目录不纳入仓库，原生配置放在 app.json；应用 ID com.eatlah.app 是开发占位标识，上架前需确认拥有且唯一。模板图标未做最终品牌设计。

在受限云环境中，Expo 的在线版本查询可能被网络策略拒绝，可用已安装 SDK 的兼容表和离线模式：

```powershell
$env:EXPO_OFFLINE = "1"
npm run check
npx expo install --check
npm start -- --localhost --port 8081
```

localhost 方式仅供云环境内部验证，不用于手机连接。Windows 正常开发不必设置 EXPO_OFFLINE；完成离线检查后可 `Remove-Item Env:EXPO_OFFLINE`。

## 数据与后续工作

- 资料保存在本机 AsyncStorage，包含邮编、偏好、库存、计划和历史。没有云同步；卸载、清除数据可能丢失。系统分享可导出 JSON，导入恢复尚未实现。
- 没有真实价格、商店库存或来源认证。包装和价格由用户手工填写；估算热量、时间及食谱步骤不代表已审核食品或营养建议。
- 无冷藏时采用保守过滤，不推荐需要冷藏/冷冻储存的食材。没有做“买完立即用完”的特殊例外。
- 只有 App 内提醒，尚无系统推送权限、定时通知或后台任务。
- [实际运行与测试记录](docs/VALIDATION.md)明确区分编译、组件测试和待执行的真机检查。
- [Supabase 计划](docs/SUPABASE.md)：Auth → 用户表 RLS → 购买/打卡/撤销事务 RPC → 本机资料迁移与离线同步；已有 TypeScript 接口，但尚未部署数据库和登录功能。
