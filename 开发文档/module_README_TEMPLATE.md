# 模块 README 模板（module README 模板）

用途：每个业务模块在提交代码时必须包含该 README，便于模块自描述、文档驱动开发与自动化编译器生成校验。

模板内容：

```
模块名：<module-name>
负责人：<姓名/工号>
简介：一句话说明模块用途

路由 / 页面列表：
 - /pages/<module>/index  # 页面说明（功能点）
 - /pages/<module>/detail

组件（本模块私有）：
 - <ComponentName.vue>：props、事件、用途（简要）

依赖的公共组件：
 - RoleGuide, AudioPlayer, ...

服务（后端 / 云）：
 - services/<module>.ts
 - 列出外部 API/云函数名称及输入输出契约（JSON schema 或字段列表）

素材清单：
 - images/: 列出文件名及用途
 - audio/: 列出文件名及用途

兼容性要求：
 - 平台：MP-WEIXIN / H5 / APP（标注哪些平台支持）
 - 是否依赖 `wx.cloud`：是/否

初始化 / 注册逻辑（若需要）：
 - 在模块 `index.ts` 中导出路由、store 初始化、组件注册说明

测试：
 - 单元测试命名约定与示例（若适用）

变更记录：
 - 日期 / 作者 / 变更摘要
```

使用说明：
- 提交新模块时，README 必须与代码一起提交；PR 必须包含“README 已更新”复选项。
- AI 编译器生成模块代码时也应输出该 README（参见 `开发文档/01_ai编译器开发流程说明.md` 的约束）。


---

视觉与设计指引（摘要）
- 主题：儿童友好（明亮、圆润、温暖）
- 关键 tokens（请在 `uni.scss` 中引用）：
  - 主色（Brand Primary）：`#ff6b3d`  
  - 强调色（Accent）：`#ffd79e`  
  - 卡片背景：`#fbfcff`，柔和背景：`#fff7f0`  
  - 圆角：`18rpx`（大），`12rpx`（常规）  
  - 阴影：`0 6rpx 18rpx rgba(34,49,63,0.06)`
- 组件视觉注意：
  - 使用 `.btn-primary` 实现主操作按钮样式；禁用态使用灰色与降低透明度。  
  - 卡片/选项使用浅色渐变与圆角，文字加粗居中。  
  - 角色气泡使用强调色浅色背景且字体稍大（16rpx）。

在模块 README 中请注明：若模块需要特定颜色或变体，必须在 README 的“视觉要求”一节声明，并引用 `uni.scss` 的 token 名称以保证一致性。

