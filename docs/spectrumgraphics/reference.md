# 快速参考

## 契约 ID

| 内容 | schema |
| --- | --- |
| Pack | `spectrumgraphics/pack/v1` |
| UI canonical | `spectrumgraphics/ui/v1` |
| UI compact authoring | `spectrumgraphics/ui/authoring-v1` |
| Behavior | `spectrumgraphics/behavior/v1` |
| WorldCanvas authoring | `spectrumgraphics/world/authoring-v1` |
| WorldCanvas canonical | `spectrumgraphics/world/v1` |
| Model scene | `spectrumgraphics/model/v1` |

普通 UI Pack 建议沿用本手册示例的 canonical `ui/v1`；WorldCanvas 的紧凑对象写法使用 `world/authoring-v1`。不要把 authoring 节点语法和 canonical `root/children` 语法混在同一个文件中。

## 关键目录

```text
plugins/SpectrumGraphics/packs/      Pack
plugins/SpectrumGraphics/ui/         兼容独立 UI
plugins/SpectrumGraphics/world/      兼容独立 WorldCanvas
plugins/SpectrumGraphics/model/      独立模型场景
plugins/SpectrumGraphics/resource/   独立客户端资源源文件
plugins/SpectrumGraphics/releases/   加密发布
plugins/SpectrumGraphics/schemas/    生成的 JSON Schema
```

## UI 节点速查

| 用途 | 节点 |
| --- | --- |
| 容器 | `panel`、`row`、`column`、`stack`、`flex`、`grid` |
| 长内容 | `scroll`、`virtual-list` |
| 文字与纹理 | `text`、`rich-text`、`image`、`nine-slice`、`polygon` |
| 按钮与表单 | `button`、`pressable`、`text-input`、`slider`、`toggle`、`checkbox`、`dropdown`、`progress` |
| 浮层 | `tooltip`、`popover`、`modal`、`tabs` |
| Minecraft | `item-stack`、`slot`、`menu-slot`、`menu-slot-proxy`、`menu-slot-grid`、`player-head`、`entity-preview`、`entity`、`vanilla-icon` |
| 扩展 | `extension` |

## 状态与 Flow

```text
scope: local | document | player | pack
concurrency: replace | drop | queue | parallel
node command: focus | blur | scroll-to | set-text
animation command: play | pause | resume | stop | seek | send-event
```

Flow 指令：`set`、`toggle`、`close`、`if`、`switch`、`sequence`、`parallel`、`delay`、`every`、`command`、`effect`、`animation`、`call`。

## Mount

```text
mode: replace | decorate | overlay
activation: automatic | manual
containerLayout: auto | vanilla | declared | hybrid
target kind: screen | menu | title
match: exact | glob | regex
```

## WorldCanvas

```text
anchor: location | position | entity | entityName | localPlayer
point: feet | center | eyes | head
missing: hide | last-known
facing: fixed | billboard | yaw-billboard
scale: world | screen-clamped | screen-fixed
button: primary | secondary | middle
```

## 模型 Controller

```text
parameter: boolean | number | string
op: equals | not-equals | greater | greater-or-equal | less | less-or-equal
trigger: condition（默认）| completion
```

## 常用指令

```text
/sg validate
/sg reload
/sg schema
/sg open <template> [player]
/sg pack enable|disable|unload <pack>
/sg model load
/sg model spawn <scene> [player]
/sg model play <scene> <instance> <animation> [player]
/sg model stop <scene> <instance> [player]
/sg assets reload
/sg assets build [release]
/sg assets publish <release>
/sg assets status
/sg stats
```
