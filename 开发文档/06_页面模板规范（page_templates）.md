# 页面模板规范（Page Templates Specification）

> 本文档在《05_页面设计规范（UI-UX）》基础上，进一步将页面**模板化、结构化**，用于直接指导 AI 编译器或前端工程生成统一页面结构。
>
> 目标：**所有页面 = 套模板 + 换内容 + 换素材**。

---
## 一、模板使用总原则

1. **一个页面只能使用一个模板**
2. 模板不随年龄变化，**内容与引导策略随年龄变化**
3. 所有模板必须包含：
   - 核心内容区
   - 角色引导区（RoleGuide）
   - 音频触发点

---
## 二、模板一：欢迎 / 过渡页模板（Welcome Template）

### 使用场景
- 首次进入小程序
- 模块切换过渡
- 学习完成总结

### 页面结构
```
[TopBar]

[MainVisual]
  - 大图 / 动画

[RoleGuide]
  - role_idle / role_speak
```

### 必须组件
- RoleGuide
- AudioPlayer（自动播放）

### 必用素材
- role_idle.png
- guide_welcome_x-x_01.mp3

### 示例引导文案
> “你好呀，我们一起开始学拼音吧！”

---
## 三、模板二：年龄选择页模板（Age Select Template）

### 使用场景
- 用户首次进入

### 页面结构
```
[TopBar]

[AgeCardGrid]
  - 3–4
  - 4–5
  - 5–6
  - 6–8

[RoleGuide + HandGuide]
```

### 交互规则
- 点击年龄卡 → 语音确认 + 进入课程

### 必用素材
- role_point.png
- hand_click.png
- guide_click_3-6_01.mp3

---
## 四、模板三：课程学习页模板（Learning Template）

### 使用场景
- 拼音跟读
- 拼音规则讲解

### 页面结构
```
[TopBar]

[ContentCard]
  - 拼音 / 音节

[ActionButton]
  - 点击跟读

[RoleGuide]
```

### 行为流程
1. 角色讲解
2. 点击 → 跟读音频
3. 成功反馈

### 必用素材
- role_speak.png
- phonics_xx_x-x_01.mp3

---
## 五、模板四：游戏训练页模板（Game Template）

### 使用场景
- 点点乐
- 拼音拼图
- 连连看

### 页面结构
```
[TopBar]

[GameArea]

[RoleGuide + HandGuide]
```

### 交互规则
- 操作错误 → 不失败，只提示
- 操作正确 → 即时反馈

### 必用素材
- role_point.png
- role_cheer.png
- feedback_success_*.mp3
- feedback_fail_*.mp3

---
## 六、模板五：结果反馈页模板（Feedback Template）

### 使用场景
- 课程完成
- 游戏关卡完成

### 页面结构
```
[TopBar]

[ResultVisual]
  - 成功 / 鼓励动画

[RoleGuide]
```

### 必用素材
- role_cheer.png
- feedback_success_*.mp3

### 示例文案
> “太棒啦，你完成啦！”

---
## 七、模板六：家长监管页模板（Parent Template）

### 使用场景
- 家长设置使用时长
- 解锁

### 页面结构
```
[TopBar]

[FormArea]
  - 时间设置

[ConfirmButton]
```

### 设计约束
- 不出现卡通角色
- 不自动播放音频

---
## 八、模板与素材映射表

| 模板 | 角色图 | 是否使用小手 |
|---|---|---|
| 欢迎页 | role_idle | 否 |
| 年龄选择 | role_point | 是 |
| 学习页 | role_speak | 视年龄 |
| 游戏页 | role_point / cheer | 是 |
| 反馈页 | role_cheer | 否 |
| 家长页 | 无 | 否 |

---
## 九、AI 编译器强制约束

AI 在生成页面时必须：
1. 明确声明所用模板
2. 不得混用模板结构
3. 页面结构不得自行增减区域
4. 素材引用必须符合《04_素材清单规范》

---
## 十、验收清单

- 所有页面可归类到某一模板
- 新增功能无需新增模板
- 页面之间切换体验一致

