# 原版 Screen 与容器

`mount` 让一个 UI 模板在匹配的 Minecraft Screen/Menu 打开时自动附着。

## 基础声明

```yaml
mount:
  activation: automatic
  mode: replace
  priority: 100
  preserveContainer: true
  preserveNativeLogic: true
  containerLayout: declared
  targets:
    - menu: minecraft:generic_9x3
    - screen: minecraft:death
    - screen: minecraft:*
    - screen: "[regex]^class:com\\.example\\..+$"
```

| 字段 | 说明 |
| --- | --- |
| `activation` | `automatic` 在握手后发布；`manual` 只对 API 或 `/sg open` 激活的玩家生效 |
| `mode` | `replace`、`decorate` 或 `overlay` |
| `priority` | 多个规则同时匹配时的优先级 |
| `preserveContainer` | 替换画面时保留原始 Menu、Slot、拖拽、快捷移动和关闭包 |
| `preserveNativeLogic` | 保留当前 Screen 的原生输入逻辑；自定义聊天时必须开启 |
| `containerLayout` | `auto`、`vanilla`、`declared` 或 `hybrid` |

### 三种模式

- `replace`：替换原版绘制；可保留真实容器或 ChatScreen 逻辑；
- `decorate`：保留原版画面，再添加可交互 Spectrum 内容；
- `overlay`：添加不接管原版输入的穿透层。

HUD 的 `layer.order` 只在 HUD 阶段排序，不能把 HUD 提升到 Screen 上方。需要显示在聊天或背包中的内容，应挂载到对应 Screen。

### 匹配方式

- 普通值：精确匹配；
- 包含 `*` 或 `?`：glob；
- `[regex]` 前缀：正则；
- `screen` 使用稳定语义 ID，Mod 界面可使用 `class:<完整类名>`；
- `menu` 使用如 `minecraft:generic_9x3` 的 MenuType 注册 ID；
- 复合 target 可同时约束 menu、screen 和无格式标题。

```yaml
targets:
  - container:
      menu:
        exact: minecraft:generic_9x3
      title:
        regex: "^(Chest|箱子|Example).*$"
```

Fabric 1.20.1 客户端在 Screen 打开时记录解析后的 Screen/Menu ID，可从客户端日志发现第三方界面的目标值。

## containerLayout

| 值 | 行为 |
| --- | --- |
| `auto` | 有 live slot 时选 `declared`，否则选 `vanilla` |
| `vanilla` | 所有原版 Slot 保持原位置 |
| `declared` | 只绘制和命中明确声明的 Slot |
| `hybrid` | 声明的 Slot 重排，未声明 Slot 保持原位 |

## 单个实时 Slot

```yaml
nativeSlot:
  type: menu-slot
  slot: container:0
  enabled: true
  renderItem: true
  showHighlight: true
  tooltipMode: native
  clickMode: native
  clickButton: -1
  dragEnabled: true
  image: example:textures/gui/slot.png
  hoverImage: example:textures/gui/slot_hover.png
  style: { x: 12, y: 30, width: 20, height: 20 }
```

它仍然是服务器容器中的真实 Slot。SpectrumGraphics 只负责布局、绘制和经过校验的点击代理，不复制或伪造物品状态。

## Slot 网格

```yaml
chestSlots:
  type: menu-slot-grid
  source: container
  start: 0
  count: 27
  columns: 9
  slotWidth: 18
  slotHeight: 18
  columnGap: 2
  rowGap: 2
  image: example:textures/gui/slot.png
  hoverImage: example:textures/gui/slot_hover.png
  showHighlight: false
  style: { x: 30, y: 36 }
```

常用 `source`：`menu`、`container`、`player-main`、`player-hotbar`、`player-armor`、`player-offhand`。也可以使用预设：

```yaml
playerMain:
  type: menu-slot-grid
  preset: player-main
  style: { x: 30, y: 112 }
```

## menu-slot-proxy

代理节点可以显式指定原版点击模式：

```yaml
quickMove:
  type: menu-slot-proxy
  slot:
    source: container
    index: 2
  renderItem: true
  tooltipMode: custom
  tooltip: [Shift-click 语义]
  clickMode: quick-move
  clickButton: 0
  dragEnabled: false
  style: { width: 20, height: 20 }
```

支持 `pickup`、`quick-move`、`swap`、`clone`、`throw`、`quick-craft`、`pickup-all` 和 `native`。具体模式仍受玩家权限、游戏模式和服务端原版容器规则约束。

Flow 也可以发起类型化容器点击：

```yaml
flows:
  quickMove:
    - effect:
        id: spectrumgraphics:container-click
        arguments:
          node: quickMove
          button: 0
```

## 安全原则

- `preserveContainer: true` 用于需要保留交易语义的 replace；
- 不要使用普通 `slot` 冒充实时容器 Slot；普通 `slot` 只是 Spectrum 控件；
- 点击必须引用已编译节点，服务端会校验 session、revision、sequence、可见性、启用状态和值；
- 不要通过客户端 Flow 扣除金币和发放物品，业务副作用使用服务端 Action/Capability；
- `overlay` 适合纯装饰，避免无意吞掉原版输入。

## 测试

1. 创建一个普通 27 格箱子；
2. 使用 `menu: minecraft:generic_9x3` 的 automatic mount；
3. 执行 `/sg reload`，重新打开箱子；
4. 检查拿取、放入、拖拽、Shift 快捷移动和关闭同步；
5. 分别测试 declared/hybrid/vanilla；
6. 调整 GUI Scale 和窗口尺寸，确认 breakpoint 后 Slot 与点击区域仍一致。

自定义聊天需要额外测试 Tab 建议鼠标点击、滚轮、Component hover/click、输入草稿和窗口缩放，详见[聊天界面与消息层](./chat.md)。
