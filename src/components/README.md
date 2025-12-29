# 公共组件说明（components）

此目录存放可复用的 UI 组件与小型交互组件。每个组件目录应包含组件文件及必要的使用说明（props/events）。

- `RoleGuide`：角色展示与引导气泡  
  - props：`roleType: string`（idle/point/speak/cheer/think），`guideText: string`，`age: number`  
  - 事件：`tap`
  - 使用：`<RoleGuide roleType="speak" :guideText="'跟我读：a'"/>`

- `AudioPlayer`：隐形组件，提供播放接口  
  - 使用方式：在根组件或页面中放置`<AudioPlayer ref="audio"/>`，通过 `this.$refs.audio.play({file:'xxx.mp3'})` 调用。  
  - 事件：`ended`, `error`

- `HandGuide`：小手引导图，用于提示点击/拖拽  
  - props：`type: 'click'|'drag'`, `show: boolean`, `position: {top,left}`

- `GameCard`：游戏卡片展示组件  
  - props：`image`, `title`；事件：`tap`

约定：
- 组件尽量无副作用（不直接操作全局 store），需要共享逻辑通过 props/events 或组合式 API 暴露。  
- 组件目录若较复杂，添加对应 `README.md` 说明用法与示例。

---

设计与视觉要点（儿童友好主题）
- 主色（Brand Primary）：`#ff6b3d`（活泼、温暖） — 用于主按钮、关键交互
- 强调色（Accent）：`#ffd79e` — 用于气泡和次级高亮
- 卡片背景：`#fbfcff`，全局柔和背景 `#fff7f0`
- 圆角与阴影：大圆角 `18rpx`，卡片/按钮阴影使用 `0 6rpx 18rpx rgba(34,49,63,0.06)`
- 按钮：使用 `.btn-primary` 类，提供一致尺寸和交互反馈

组件遵循视觉规范时请：
- 使用 `uni.scss` 中的 tokens（如 `$brand-primary`, `$radius-md`）以保证一致性  
- 在组件 README 中标注尺寸、内边距与重要视觉参数，便于 AI 编译器与自动化工具生成合规界面

