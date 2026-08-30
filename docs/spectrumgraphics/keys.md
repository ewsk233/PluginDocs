# 自定义按键

Key v1 声明跨 UI 的服务器玩法按键。可重绑定按键注册到 Minecraft Controls；固定按键保持隐藏。客户端只报告逻辑按键、按下/释放和 modifiers，服务端负责条件、冷却与实际动作。

## 最小文档

```yaml
schema: spectrumgraphics/key/authoring-v1
id: example:controls
category: Example Server

keys:
  open-dashboard:
    name: Open Dashboard
    mode: bindable
    default: G
    context: gameplay

groups:
  default:
    priority: 0
    active: true
    bindings:
      open-dashboard:
        consume: true
        cooldown: 250ms
        conditions:
          permission: example.dashboard
        deny:
          - playSound: minecraft:block.note_block.bass
        onPress:
          - openUi: example:dashboard
```

## Key 与 context

- `bindable`：出现在 Minecraft Controls，并按服务器、文档和 Key ID 保存玩家选择；
- `fixed`：不出现在 Controls，始终使用 `default`；
- `gameplay`：没有 Screen 时；
- `screen`：Screen 打开时；
- `always`：两种场景都可触发。

UI 文档内的 `shortcuts` 只属于当前文档；Key 文档是服务器玩法级绑定，两者用途不同。

## Group、优先级与条件

Group 可按玩家启停。多个 active group 绑定相同 Key 和精确 modifiers 时，高 priority 胜出；相同 priority 的冲突会在验证阶段拒绝。`consume` 只阻止较低优先级 SpectrumGraphics binding 继续执行。

条件在服务端 AND 计算：permission、Bukkit world、gameMode、sneaking、sprinting、Vault hasMoney、Arim hasItem。`deny`/`onDeny` 在条件失败时执行。

## 动作

内建作者动作包括 give/take/has money、give/take/has item、world、command、openUi、closeUi、playSound、playModel、stopModel、cameraPlay、cameraStop。`request: namespace:action` 调用 Pack Behavior。动作按顺序执行，并在第一次失败时停止。

服务端不会执行客户端任意传来的命令字符串；每个动作、条件、文档 revision、sequence、group 和 cooldown 都重新校验。

## 指令与 API

```text
/sg key load
/sg key list
/sg key debug [player]
/sg key group <document> <group> <true|false> [player]
```

API `SpectrumGraphics.api.keys` 可读取/加载文档、为玩家开关 group、查询 active group 与客户端支持情况。

下一步：[Behavior 与 Capability](./behaviors.md) · [Camera](./camera.md)
