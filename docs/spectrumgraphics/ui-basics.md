# 文档与节点

本章使用推荐的 `spectrumgraphics/ui/authoring-v1`。生成工具或底层 API 也可使用 canonical `ui/v1`，但两者最终编译为同一种不可变文档。

## 文档骨架

```yaml
schema: spectrumgraphics/ui/authoring-v1
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

body:
  statusCard:
    type: panel
    children: {}
```

`body` 与 `children` 都是“节点 ID → 节点声明”的有序映射。节点 ID 在文档内必须稳定且唯一；它也是 binding、动画、交互校验和 retained 状态的身份。

## presentation 与 layer

| presentation | 用途 |
| --- | --- |
| `menu` | 聚焦的自定义界面，通常接管输入 |
| `hud` | 游戏内常驻 HUD |
| `overlay` | 非持久浮层或装饰层 |
| `tooltip` | 匹配原版物品 Tooltip 的模板 |
| `world-popup` | 短暂世界空间 UI，例如伤害数字 |

`layer.order` 越大，同一合成阶段中越靠上。`layer.input` 使用 `capture` 或 `pass-through`；纯展示 HUD 不应捕获输入。

## 节点分类

| 分类 | 节点类型 |
| --- | --- |
| 基础 | `panel`、`text`、`rich-text`、`image`、`nine-slice`、`polygon` |
| 布局 | `row`、`column`、`stack`、`flex`、`grid`、`scroll`、`virtual-list` |
| 输入 | `button`、`pressable`、`text-input`、`slider`、`toggle`、`checkbox`、`dropdown` |
| 浮层 | `tooltip`、`popover`、`modal`、`tabs` |
| Minecraft | `item-stack`、`hotbar-slot`、`slot`、`menu-slot`、`menu-slot-proxy`、`menu-slot-grid`、`extra-slot`、`extra-slot-grid`、`player-head`、`entity-preview`、`entity`、`vanilla-icon`、`sg-model` |
| 专用 | `chat-history`、`chat-overlay`、`chat-input-proxy`、`selected-item-prompt`、`transient-feed`、`sprite-number` |
| 扩展 | `extension`，必须声明客户端 feature、最低版本与 fallback |

精确属性和默认值以当前随构建分发的 Schema 为准；节点类型使用 `kebab-case`，属性使用 `lowerCamelCase`。

## 基础示例

```yaml
body:
  card:
    type: panel
    backgroundColor: '#E0182030'
    style:
      width: 320
      height: 170
      anchor: center
      padding: [10, 12]
      cornerRadius: 10
      border: { width: 1, color: '#FF78BEFF' }
      shadows:
        - { offsetX: 0, offsetY: 4, blurRadius: 12, color: '#78000000' }
    children:
      title:
        type: text
        text: '<gradient:#78BEFF:#7CE38B>SpectrumGraphics</gradient>'
        color: '#FFFFFFFF'
        fontSize: 14
      logo:
        type: image
        source: example:textures/gui/logo.png
        tint: '#FFFFFFFF'
        loop: false
        style: { anchor: top-right, width: 32, height: 32 }
```

颜色接受 ARGB 整数、`#RRGGBB` 和 `#AARRGGBB`。动态本地图片可使用 GIF；`loop` 只控制 Image 节点的动画循环。

## Minecraft 节点

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
    font: 主界面
    style: { width: 24, height: 24 }

  player:
    type: entity
    uuid: ''
    hideTag: true
    followMouse: true
    style: { width: 54, height: 72 }
```

`entity` 使用客户端世界中已经同步的真实实体；空 UUID 表示本地玩家。`entity-preview` 按 `entityType` 和可选 NBT 创建合成预览。实时容器物品必须使用 `menu-slot*`，不能用普通 `slot` 冒充。

## 交互状态

```yaml
buy:
  type: pressable
  selected: false
  backgroundColor: '#80304A5D'
  onClick: purchase
  style: { width: 90, height: 24, cornerRadius: 8 }
  states:
    hover: { backgroundColor: '#B0446680' }
    pressed: { style: { opacity: 0.8 } }
    selected:
      backgroundColor: '#E05DBDDE'
      style: { border: { width: 1, color: '#FFD7F5FF' } }
```

交互状态只覆盖声明的属性。所有状态都应继承基础 `cornerRadius`、边框和布局；不要把选中状态写成一棵结构不同的节点树。

## 扩展节点

客户端扩展必须有协商和 fallback：

```yaml
custom:
  type: extension
  feature: myaddon:radar
  minimumVersion: 1
  extensionType: radar
  properties: { range: 64 }
  fallback: text
  fallbackText: 雷达不可用
```

服务器不能假定所有客户端都有附属扩展。缺失能力时必须选择隐藏或有界 fallback，而不是发送未知绘制命令。

下一步：[布局与响应式](./layout-responsive.md) · [状态、表达式与 Flow](./state-flow.md)
