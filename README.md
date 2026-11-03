# Eat Lah · Android / iOS App

当前开发项目位于 **[mobile/](mobile/README.md)**，使用 React Native + Expo + TypeScript + Expo Router，直接渲染原生组件，没有 Next.js 或 HTML WebView。

## 第一阶段

已建立首次设置、餐次与做饭模式选择、原生滑动单卡、可选配菜/小食/加料、双语购物清单、真实包装输入与购买确认、按批次库存、分步烹饪、幂等打卡与撤销、3–7 天菜单、收藏、历史及 App 内库存提醒。本机数据通过 AsyncStorage 持久化。

这是可开发和手机测试的本地首阶段版本，尚未接入账号、Supabase、真实超市数据或应用商店。58 项旧原型条目只作为明确标记的演示内容；没有导入旧的估算商品价格或假称真实商品来源。

## 快速开始

安装 Node.js 24 LTS，在 Windows PowerShell 中：

```powershell
cd mobile
npm ci
npm start
```

Android 或 iPhone 安装与 Expo SDK 58 匹配的 Expo Go，手机和电脑在同一 Wi-Fi；Android 在 Expo Go 扫码，iPhone 用相机扫码。Windows 可以启动 Metro 并在 iPhone 真机测试，iOS Simulator 和本地 iOS 编译需要 macOS + Xcode。

[完整文件结构、Windows 启动和手机测试](mobile/README.md) · [有效需求](mobile/docs/REQUIREMENTS.md) · [实际验证记录](mobile/docs/VALIDATION.md) · [真机验收清单](mobile/docs/DEVICE_CHECKLIST.md) · [Supabase 计划](mobile/docs/SUPABASE.md)

## 保留的早期原型

根目录 index.html、styles.css、app.js、data.js、data-extra.js 和 test_v12_vm.js 保留用于设计对照，不是移动 App 的运行依赖。旧原型说明备份于 [LEGACY_PROTOTYPE.md](mobile/docs/LEGACY_PROTOTYPE.md)。

CODEX_IMPLEMENTATION_SPEC.md 的历史 Next.js 路线已被新的手机需求覆盖。内容来源研究文件仅为选题与许可研究，不能作为转载授权或实时商品数据。
