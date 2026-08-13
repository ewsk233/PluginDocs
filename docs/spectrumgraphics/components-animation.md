# 组件、响应式与动画

## 本地组件

```yaml
components:
  StatusPill:
    props:
      text: string
      color:
        type: color
        default: "#FF78BEFF"
    template:
      type: text
      text: "${props.text}"
      color: "${props.color}"
      horizontalAlignment: center
      style:
        width: 80
        height: 14
        border: { width: 1, color: "${props.color}" }
        cornerRadius: 7
```

调用：

```yaml
root:
  status:
    component: StatusPill
    props:
      text: Online
      color: "#FF7CE38B"
```

Props 有类型、默认值和必填检查。模板替换发生在服务端编译期，不把动态模板解释器带进客户端运行时。

## 跨文件 import 与 slot

`components.yml`：

```yaml
schema: spectrumgraphics/ui/v1
components:
  SectionCard:
    props:
      title: string
    slots: [content, footer]
    template:
      type: panel
      children:
        heading: { type: text, text: "${props.title}" }
        content: { slot: content }
        footer: { slot: footer }
```

页面中导入：

```yaml
imports:
  SectionCard: components.yml#SectionCard

root:
  card:
    component: SectionCard
    props: { title: 玩家资料 }
    slots:
      content:
        name: { type: text, text: Steve }
      footer:
        close: { type: button, text: 关闭, action: flow:close }
```

导入路径、组件名、Prop 和 Slot 都在编译阶段解析；缺失引用和循环引用会成为诊断，而不是运行时空白。

## repeat

静态列表：

```yaml
badge:
  component: StatusPill
  repeat:
    items:
      - { id: online, label: Online, color: "#FF7CE38B" }
      - { id: admin, label: Admin, color: "#FFFFD166" }
    as: badge
    key: badge.id
  props:
    text: "${badge.label}"
    color: "${badge.color}"
```

计数 repeat：

```yaml
dot:
  type: text
  repeat:
    count: "= state.pageCount"
    max: 8
    key: index
  text: "◆"
```

稳定 `key` 用来保留焦点、文本草稿和滚动等 retained 状态。动态计数必须有上限，不要用 repeat 规避节点预算。

## 响应式 breakpoint

```yaml
breakpoints:
  compact:
    maxWidth: 420
    maxHeight: 260
    minScale: 1
    maxScale: 3
    nodes:
      page:
        width: 96vw
        height: 92vh
        padding: [6, 8]
      grid:
        widthDimension: 100%

  spacious:
    minWidth: 421
    overrides:
      page:
        width: 520
        height: 300
```

断点可以同时考虑窗口宽高和 GUI Scale，并只覆盖指定节点字段。优先使用百分比、viewport、min/max 与 Flex/Grid，再用 breakpoint 修正真正发生结构变化的部分。

## Theme token

```yaml
theme:
  name: nebula
  colors:
    surface: "#F0182030"
    accent: "#FF78BEFF"
    body: "#FFE1E7F0"
  numbers:
    cardWidth: 316
    radius: 9
  text:
    headline: SpectrumGraphics
```

引用：

```yaml
backgroundColor: $surface
color: $accent
text: $headline
style:
  width: $cardWidth
  cornerRadius: $radius
```

Token 仅能用于兼容类型的字段，类型错误在编译期报告。

## transition

```yaml
transitions:
  fade:
    node: card
    property: opacity
    from: 0
    to: 1
    duration: 320
    delay: 40
    easing: ease-out
    autoplay: true
    onStart: animationStarted
    onComplete: animationCompleted
    onCancel: animationCancelled
```

适合单属性进入、退出或简单反馈。

## timeline

```yaml
timelines:
  cardPulse:
    node: card
    duration: 800
    iterations: 1
    direction: normal
    fillMode: forwards
    autoplay: false
    keyframes:
      - offset: 0
        values: { y: 0, opacity: 1 }
        easing: linear
      - offset: 0.5
        values: { y: -8, opacity: 0.85 }
        easing:
          type: cubic-bezier
          x1: 0.2
          y1: 0.8
          x2: 0.3
          y2: 1
      - offset: 1
        values: { y: 0, opacity: 1 }
        easing:
          type: spring
          stiffness: 190
          damping: 22
          mass: 1
```

方向支持 `normal`、`reverse`、`alternate`、`alternate-reverse`；fillMode 支持常见的 none/forwards/backwards/both 语义。

## statechart

```yaml
statecharts:
  cardState:
    initial: idle
    states:
      idle:
        animations: []
      active:
        animations: [cardPulse]
    transitions:
      - { event: toggle, from: idle, to: active }
      - { event: toggle, from: active, to: idle }
      - { event: reset, to: idle }
```

Flow 控制动画：

```yaml
flows:
  play: [{ animation: { command: play, target: cardPulse } }]
  seek: [{ animation: { command: seek, target: cardPulse, position: 0.5 } }]
  toggle: [{ animation: { command: send-event, target: cardState, event: toggle } }]
```

可用命令包括 `play`、`pause`、`resume`、`stop`、`seek` 和 `send-event`。动画回调只跳转到已声明 Flow。
