# UI 基础

SpectrumGraphics UI 使用版本化 YAML：

```yaml
schema: spectrumgraphics/ui/v1
id: example:shop
presentation: menu
```

`schema` 必须精确匹配当前契约；`id` 使用 `namespace:path`；`presentation` 可为 `menu`、`hud` 或 `overlay`。

## 文档结构

```yaml
schema: spectrumgraphics/ui/v1
id: example:status
presentation: hud

layer:
  name: player-status
  order: 100
  input: pass-through

state: {}
computed: {}
flows: {}
shortcuts: {}
lifecycle: {}
theme: {}
transitions: {}
timelines: {}
statecharts: {}
breakpoints: {}

root:
  statusCard:
    type: panel
    children: {}
```

`root` 与 `children` 都是“节点 ID → 节点声明”的有序映射。不要写节点内联 `id:`，也不要把 `children` 写成列表。空 `root` 合法，表示当前文档没有布局、绘制或输入区域。

## presentation 与 layer

| presentation | 用途 |
| --- | --- |
| `menu` | 聚焦界面，通常捕获鼠标和键盘 |
| `hud` | 可与游戏同时显示的持久 HUD |
| `overlay` | Toast、提示层、非持久浮层 |

Layer 决定合成顺序和输入：

```yaml
layer:
  name: modal
  order: 1000
  input: capture       # capture 或 pass-through
```

多个 HUD/Overlay 可以同时显示；`order` 越大越靠上。只有确实需要交互的层才应使用 `capture`。

## 常用节点

| 分类 | 节点类型 |
| --- | --- |
| 基础 | `panel`、`text`、`image`、`button`、`pressable`、`polygon` |
| 布局 | `row`、`column`、`stack`、`flex`、`grid`、`scroll`、`virtual-list` |
| 输入 | `text-input`、`slider`、`toggle`、`checkbox`、`dropdown` |
| 展示 | `rich-text`、`progress`、`nine-slice` |
| 浮层 | `tooltip`、`popover`、`modal`、`tabs` |
| Minecraft | `item-stack`、`slot`、`menu-slot`、`menu-slot-proxy`、`menu-slot-grid`、`player-head`、`entity-preview`、`entity`、`vanilla-icon` |
| 扩展 | `extension`，需要客户端 feature 协商与 fallback |

### 文本、图片和面板

```yaml
root:
  card:
    type: panel
    backgroundColor: "#E0182030"
    style:
      width: 300
      height: 160
      anchor: center
      padding: [10, 12]
      border: { width: 1, color: "#FF78BEFF" }
      cornerRadius: 8
      shadows:
        - { offsetX: 0, offsetY: 4, blurRadius: 12, color: "#78000000" }
    children:
      title:
        type: text
        text: 商店
        color: "#FFFFFFFF"
        fontSize: 14
      logo:
        type: image
        source: example:textures/gui/logo.png
        tint: "#FFFFFFFF"
        loop: false
        style: { x: 250, y: 8, width: 32, height: 32 }
```

颜色使用 `#AARRGGBB`。`image` 支持 Minecraft namespaced 资源、Spectrum 本地资源和受限 HTTPS 源；GIF 是否循环由 `loop` 控制。

### Minecraft 节点

```yaml
children:
  sword:
    type: item-stack
    item:
      id: minecraft:diamond_sword
      count: 1
      components: '{"minecraft:custom_name":"Example Blade"}'
    showCount: true
    showDecorations: true
    style: { width: 24, height: 24 }

  head:
    type: player-head
    playerId: Notch
    showHatLayer: true
    style: { width: 28, height: 28 }

  zombie:
    type: entity-preview
    entityType: minecraft:zombie
    entityData: '{"IsBaby":false,"NoAI":true}'
    yaw: 22
    pitch: -8
    scale: 1.1
    style: { width: 70, height: 76 }
```

`entity-preview` 创建预览实体；`entity` 读取客户端世界中已经存在的实体 UUID，不会创建合成实体。无效或非生物实体会安全降级。

## style

常用字段：

```yaml
style:
  x: 0
  y: 0
  width: 80%
  height: 40vh
  minWidth: 240px
  maxWidth: 560px
  anchor: center
  padding: [8, 12, 10, 12]
  margin: { bottom: 4 }
  gap: 6
  visible: true
  opacity: 1
  zIndex: 2
  clip: true
  pointerEvents: auto
```

尺寸支持逻辑像素、`px`、百分比、`vw`/`vh`、物理像素 `ppx`/`physical` 和 `auto`。`minWidth`、`maxWidth`、`minHeight`、`maxHeight` 用于约束响应式结果。

`anchor` 常用值包括 `top-left`、`top-right`、`bottom-left`、`bottom-right` 和 `center`。Row/Column/Flex 中的子项仍参与流式布局，绝对偏移应谨慎使用。

## 布局容器

```yaml
children:
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
        style: { width: 64, height: 20 }
      cancel:
        type: button
        text: 取消
        action: flow:cancel
        style: { width: 64, height: 20 }
```

- `row`/`column`：顺序排列；
- `stack`：子节点重叠；
- `flex`：方向、换行、主轴和交叉轴对齐；
- `grid`：等宽列网格；
- `scroll`：保留滚动状态；
- `virtual-list`：只布局可见范围及 overscan，适合长列表。

## 动作命名

节点 `action` 有两类：

```yaml
action: flow:confirm       # 调用当前文档 Flow
action: shop:purchase     # 服务端声明 Action；通常建议由 Flow call 包装
```

Flow 可以做本地状态、分支、动画与服务端调用。
