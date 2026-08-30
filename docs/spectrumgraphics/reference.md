# 快速参考

## 当前发布目标

```text
服务端：Paper/TabooLib，Java 17+
客户端：Minecraft 1.20.1 Fabric
依赖：Fabric Loader 0.19.3+、Fabric API、Fabric Language Kotlin
```

Forge 1.20.1 与 Minecraft 1.21.11 当前不是完整发布适配。

## Schema

| 内容 | schema |
| --- | --- |
| Pack | `spectrumgraphics/pack/v1` |
| UI 作者格式 | `spectrumgraphics/ui/authoring-v1` |
| UI canonical | `spectrumgraphics/ui/v1` |
| WorldCanvas 作者格式 | `spectrumgraphics/world/authoring-v1` |
| WorldCanvas canonical | `spectrumgraphics/world/v1` |
| Model | `spectrumgraphics/model/v1` |
| Camera 作者格式 | `spectrumgraphics/camera/authoring-v1` |
| Camera canonical | `spectrumgraphics/camera/v1` |
| Key 作者格式 | `spectrumgraphics/key/authoring-v1` |
| Key canonical | `spectrumgraphics/key/v1` |
| Avatar | `spectrumgraphics/avatar/v1` |
| Text | `spectrumgraphics/text/v1` |
| Slot | `spectrumgraphics/slot/v1` |
| Item Appearance | `spectrumgraphics/item-appearance/v1` |
| Particle | `spectrumgraphics/particle/v1` |
| Behavior | `spectrumgraphics/behavior/v1` |

JSON Schema `$id` 使用 `urn:spectrumgraphics:schema:...:v1`，由编辑器映射到本地文件。

## 目录

```text
packs/<pack>/   ui tooltip world model camera key avatar text item behaviors
ui/             独立 UI/HUD/Tooltip/World Popup
world/          独立 WorldCanvas
model/          模型场景 YAML
camera/         Camera
key/            Key
avatar/         Avatar
text/           Text registry
slot/           Extra Slot
item/           Item Appearance
resource/       源资源
releases/       加密发布
```

## UI

```text
presentation: menu | hud | overlay | tooltip | world-popup
layer.input: capture | pass-through
anchor: top-left | top-center | top-right | center-left | center | center-right |
        bottom-left | bottom-center | bottom-right
```

| 用途 | 节点 |
| --- | --- |
| 容器 | `panel`、`row`、`column`、`stack`、`flex`、`grid` |
| 长内容 | `scroll`、`virtual-list` |
| 文字/纹理 | `text`、`rich-text`、`image`、`nine-slice`、`polygon` |
| 控件 | `button`、`pressable`、`text-input`、`slider`、`toggle`、`checkbox`、`dropdown`、`progress` |
| 浮层 | `tooltip`、`popover`、`modal`、`tabs` |
| Minecraft | `item-stack`、`hotbar-slot`、`slot`、`menu-slot*`、`extra-slot*`、`player-head`、`entity-preview`、`entity`、`vanilla-icon`、`sg-model` |
| 专用 | `chat-history`、`chat-overlay`、`chat-input-proxy`、`selected-item-prompt`、`transient-feed`、`sprite-number` |

单位：数字/`px` 为逻辑像素，`ppx` 为物理像素，另有 `%`、`vw`、`vh`。`gap` 不支持 `%`；`cornerRadius` 不支持 `vw/vh`。

## State 与 Flow

```text
scope: local | document | player | pack
concurrency: replace | drop | queue | parallel
Flow: set toggle if switch sequence parallel delay every command effect animation call close
animation: play pause resume stop seek send-event
```

只有 local State 可由客户端 Flow 写入；服务端状态通过 snapshot/patch 更新。

## Mount

```text
mode: replace | decorate | overlay
activation: automatic | manual
containerLayout: auto | vanilla | declared | hybrid
target: screen | menu | title
match: exact | glob | regex
```

容器 replace 使用 `preserveContainer`；自定义聊天 replace 使用 `preserveNativeLogic`。

## 客户端按键

| 默认键 | 作用 |
| --- | --- |
| `F8` | 性能面板 |
| `F9` | 图形化计分板开关 |
| `F7` | 重载 Spectrum 客户端资源 |
| `F6` | Spectrum 按键设置 |
| `Backspace` | 跳过允许跳过的 Camera scene |

均可在 Minecraft Controls 中按实际注册情况重映射。

## 常用指令

```text
/sg validate
/sg reload
/sg open <template> [player]
/sg stats
/sg pack enable|disable|unload <id>
/sg model load|inspect|spawn|play|stop
/sg camera load|play|stop|preset|modifier|editor
/sg particle play|stop
/sg avatar load|list|set|clear|equip|unequip|play
/sg key load|list|debug|group
/sg item list|set|inspect|clear|apply|effect
/sg damage test [template] [amount]
/sg assets reload|build|publish|status
```

完整参数见[管理指令](./commands.md)。
