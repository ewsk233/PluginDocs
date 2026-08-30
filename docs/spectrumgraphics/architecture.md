# 架构与运行边界

理解服务端、客户端和资源发布的边界，可以避免把业务逻辑、源资源或高频状态放错位置。

## 一次 UI 更新如何到达屏幕

```text
Pack / authoring YAML
  → Decoder / Authoring Lowerer / Preprocessor
  → Compiler + Contract Validator
  → 不可变 UiDocument + 独立 SpectrumState
  → Open/Patch + StateSnapshot/StatePatch
  → 客户端 session、revision、hash、ACK/NACK
  → Retained Scene → Layout → DrawCommand
  → Minecraft HUD / Screen / World renderer
```

文档描述结构和规则；状态描述当前玩家看到的值。频繁变化的血量、输入内容、频道或进度不应通过重发整份文档实现。

## 服务端负责什么

- 读取 Pack、配置和数据源；
- 保存玩家状态、额外槽位和物品 PDC；
- 验证 session、revision、sequence、节点可见性、权限、距离和限流；
- 执行 Action、Behavior、Capability 和数据库写入；
- 编译、加密、发布资源；
- 构造完整候选快照并原子重载。

任何扣款、发物品、容器交易或权限判断都必须在服务端完成。

## 客户端负责什么

- 响应式布局、命中测试、滚动、焦点和文本草稿；
- 动画、Flow 中允许的本地状态和受限 Effect；
- Minecraft Screen/HUD/Tooltip/World 的合成；
- 字体、图片、模型、物品和粒子资源的加载与缓存；
- 模型动画、Camera 和粒子的逐帧模拟。

客户端不会获得 Bukkit 对象、任意 JVM 脚本、文件访问或服务端业务执行权。

## Retained UI 与稳定 NodeId

客户端按 NodeId 保留布局、焦点、滚动位置、输入草稿和绘制缓存。更新时只让依赖发生变化的节点失效。因此：

- 同一个语义节点在重载前后保持相同 ID；
- `repeat` 使用稳定且唯一的 `key`；
- 不要把每帧变化塞进文档结构；
- 不要为了视觉分组创建大量无意义容器。

## 层级和生命周期

HUD 与临时 Feed 在游戏 HUD 阶段绘制；打开聊天、背包等原版 Screen 时，它们处于 Screen 下方，不应穿透到最上层。挂载到 Screen 的 Spectrum 文档由 Screen 自己的 underlay/content/overlay 阶段合成。

玩家断线或离开服务器后，客户端立即停止服务端 UI 的继续显示，并丢弃旧连接的排队包。重新加入会建立新的 session，旧 revision 不能复用。

## 支持边界

| 目标 | 当前状态 |
| --- | --- |
| Paper/TabooLib + Fabric 1.20.1 | 完整运行闭环 |
| Spectrum Studio | 作者与预览工具，不能替代游戏验收 |
| Forge 1.20.1 | 独立构建骨架，尚非分发闭环 |
| Minecraft 1.21.11 | 编译兼容骨架，尚非发布适配 |

下一步：[Spectrum Pack](./pack.md) · [公共 API](./api.md)
