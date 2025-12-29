# 拼音小豆丁 — 项目快速上手（README）

项目使用 uni-app + Vue3 开发，首要目标平台为微信小程序（MP-WEIXIN）。在开始页面开发前，请先阅读并按下列步骤准备环境。

## 版本要求（请在团队中锁定并记录）
- uni-app: >= 3.x（需为支持 Vue3 的分支）
- HBuilderX / uni-cli: 对应 uni-app 版本的稳定发布（请在团队 README 中记录最低可用版本）
- Vue: 3.x（Composition API 优先）
- Node.js: 14 或 16（用于本地云函数测试/构建）

## 开发环境安装与本地运行

1. 安装依赖

```bash
# npm
npm install
# 或 yarn
yarn
```

2. 本地运行（微信小程序预览）

```bash
# 使用 uni-cli 在 dev 模式下运行小程序（示例）
npx @dcloudio/uni-cli dev:mp-weixin
```

3. 本地 H5 调试（快速预览）

```bash
npx @dcloudio/uni-cli dev:h5
```

4. 云函数本地测试（说明）
- 本项目已提供云抽象层：`src/services/cloud`。页面请通过该层调用云能力（`initCloud`, `callFunction`），不要直接在页面中使用 `wx.cloud`。
- H5 / 本地调试会使用 `src/services/cloud/mock.ts` 的 mock 实现，避免因云不可用导致启动失败。

## 目录布局兼容说明
- 项目支持两种源码布局：推荐使用 `src/` 根目录（与文档一致）；若项目使用根目录（`pages/`, `components/` 在工程根），工具会回退到根目录布局以保持兼容。详见 `开发文档/00_开发快速指引.md`。

## 开发前检查清单（最小）
- 已安装并验证 Node、uni-cli/HBuilderX 与 Vue 版本兼容。  
- 依赖已安装并能启动 H5 与 MP-WEIXIN 本地预览。  
- `src/services/cloud` 已就位（若项目未迁移到 `src/`，请将该文件夹放在项目对应路径或在工具中配置查找路径）。  
- 已知第三方库需兼容 Vue3；若存在 Vue2-only 库，需替换或隔离使用。  

## 常见命令
- 安装依赖：`npm install` 或 `yarn`  
- 运行小程序（MP-WEIXIN）：`npx @dcloudio/uni-cli dev:mp-weixin`  
- 运行 H5：`npx @dcloudio/uni-cli dev:h5`  
- 打包发布（示例）：根据团队使用的工具链执行相应打包命令（HBuilderX / ci 脚本）

## 联系与变更记录
- 若需要更新支持的最低版本或运行命令，请在此 README 和 `开发文档/compatibility.md` 中同时记录并提交 PR。



