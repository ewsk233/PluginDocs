# 布局与响应式

SpectrumGraphics 在 GUI 逻辑坐标中布局，再由 Minecraft GUI Scale 映射到物理像素。服主应先建立约束式布局，再用 breakpoint 处理真正的结构变化。

## 单位

| 写法 | 含义 |
| --- | --- |
| `12`、`12px` | GUI 逻辑像素 |
| `12ppx` | 物理 framebuffer 像素 |
| `50%` | 相对父节点可用尺寸 |
| `40vw`、`30vh` | 相对当前 GUI viewport |
| `auto`、`fill` | 由内容或父容器决定，是否可用取决于字段 |

支持的单位由具体字段决定，不是所有数值字段都接受所有单位：

- `x/y/width/height/min/max/padding/margin/fontSize` 支持响应式长度；
- `gap` 支持逻辑像素、`px`、`ppx`、`vw`、`vh`，**不支持 `%`**；
- `cornerRadius` 支持逻辑像素、`px`、`ppx`、`%`，**不支持 `vw/vh`**；
- 阴影、边框、滚动条等子字段按 Schema 各自限制，不要凭 CSS 经验猜测。

```yaml
style:
  width: 72vw
  height: 60vh
  minWidth: 280
  maxWidth: 760
  minHeight: 180
  maxHeight: 430
  padding: [2vh, 2vw]
  gap: 1vh
  cornerRadius: 4%
```

## anchor 与偏移

```yaml
style:
  anchor: bottom-right
  x: -16
  y: -20
  width: 260
  height: 90
```

可用 anchor：`top-left`、`top-center`、`top-right`、`center-left`、`center`、`center-right`、`bottom-left`、`bottom-center`、`bottom-right`。

绝对偏移适合根级 HUD、浮层和局部装饰；大面积内容优先使用 Row/Column/Flex/Grid，否则窗口缩放后容易重叠。

## 流式容器

```yaml
actions:
  type: flex
  direction: row
  wrap: wrap
  justifyContent: space-between
  alignItems: center
  style: { width: 100%, gap: 6 }
  children:
    confirm:
      type: button
      text: 确认
      action: flow:confirm
      style: { width: 70, height: 22 }
    cancel:
      type: button
      text: 取消
      action: flow:cancel
      style: { width: 70, height: 22 }
```

- Row/Column：顺序排列，适合简单线性结构；
- Stack：子节点共享区域并叠放；
- Flex：方向、换行和两轴对齐；
- Grid：固定列数和行列间距；
- Scroll：保留滚动位置并裁剪内容；
- Virtual List：只布局可见项和 overscan，适合长列表。

## 节点级响应式覆盖

```yaml
breakpoints:
  compact:
    maxWidth: 520

body:
  shell:
    type: panel
    style:
      width: 680
      height: 320
      anchor: center
      at:
        compact:
          width: 94vw
          height: 88vh
          padding: 6
```

断点还可按高度和 GUI Scale 筛选。基础 Style 始终存在，`at` 只覆盖发生变化的字段，因此不会在断点切换时意外丢失圆角或边框。

## 适配策略

1. 根容器使用 viewport 百分比并设置 min/max；
2. 内部主要结构使用 Flex/Grid，而非绝对坐标；
3. 字体和间距使用逻辑单位，只有需要物理锐度时用 `ppx`；
4. 用 `clip: true` 限制滚动区、聊天历史和 Feed 卡片；
5. breakpoint 只处理列数、方向、显隐等结构差异；
6. 在 GUI Scale 1–5、宽屏和小窗口中分别验收点击区域与视觉位置。

SpectrumGraphics 不会自动进行“安全区域避让”。两个独立 HUD 是否重叠由作者的 layer、anchor、尺寸和配置协调。

下一步：[组件、响应式与动画](./components-animation.md) · [HUD 与原版 HUD](./hud.md)
