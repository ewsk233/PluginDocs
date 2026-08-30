# 验证与故障排查

按数据流排查：服务端是否加载 → 是否向目标玩家发布 → 客户端是否接收 → 资源是否可用 → 节点是否布局并进入正确渲染阶段。不要只盯着最终画面猜原因。

## 标准检查顺序

1. `/sg validate`：先解决第一个结构诊断；
2. `/sg reload`：确认候选原子切换成功；
3. 服务端日志：确认目标文档/资源 ID 和玩家；
4. 实际客户端 `.minecraft/logs/latest.log`：确认握手、Open/Patch/State/资源状态；
5. `F8`：检查布局、绘制、缓存、网络、ACK/NACK、resync；
6. 用最小配置复现，再逐段恢复复杂节点。

使用 Gradle `runClient` 时，日志在项目运行目录；独立客户端必须检查独立实例自己的 `latest.log`。不要用另一个客户端的日志解释当前实例。

## 指令成功但没有 UI

检查：

- Fabric 1.20.1 Mod、Fabric API、Fabric Language Kotlin 是否实际加载；
- Plugin 与 Mod 是否来自同一次构建；
- 客户端握手是否完成，是否因协议或 feature 不兼容被拒绝；
- Pack 是否 enabled，文档 ID 是否与加载结果一致；
- automatic mount 是否匹配真实 Screen/Menu ID；
- 是否有更高 priority 的规则命中同一个 Screen；
- HUD 是否被 Camera cinematic 或作者条件隐藏。

独立客户端与 `runClient` 行为不同时，重点比较实际 Mod JAR、资源目录、配置、缓存和 Mixin/资源编译日志，而不是假定代码路径相同。

## `/sg reload` 失败

常见原因：

- `schema` 或 authoring/canonical 语法混写；
- `body/children/root` 结构错误或节点 ID 重复；
- Pack feature、Action、Capability 未声明；
- import、component、Flow、资源或模型引用不存在；
- Pack ID/Action 使用了非法 namespaced 格式；
- 内容 ID 重复，即使它们来自不同 Pack；
- 依赖缺失、版本不匹配或循环；
- 正则非法；
- 超过节点、深度、字符串或资源预算。

失败候选不会替换现有运行快照。先修复所有领域的验证结果，再执行重载。

## 图片、字体、模型或物品缺失

- `/sg reload` 只重载声明，不编译源资源；
- 正式资源必须位于服务端 `resource/`，随后 build/publish；
- 本地测试资源必须位于当前客户端实例的 `resourcepacks/SpectrumGraphics/resource/`；
- namespaced source 走 Minecraft ResourceManager，相对 source 走 Spectrum resource 根；
- 检查当前发布 hash 与客户端状态；
- Item Appearance 的 `id` 与 `layers.image`/`visual.texture` 不要求同名；
- 显式 `sha256` 必须与实际字节一致。

字体小字号不清晰时，优先使用 `renderer: native` 或 `auto`、`size: auto`、`hinting: auto`、`pixelSnap: true`，再微调 weight/sharpness。阴影过重可设 `vanilla.shadow: false` 或降低 opacity/offset。

## 粒子报告 sibling texture 缺失

纹理按“同名兄弟 PNG → description texture 对应的 `resource/` PNG → Minecraft ResourceLocation”解析。`textures/particle/particles` 是 Bedrock 默认图集路径，不等于必须存在 `<粒子名>.png`；若客户端 Java 资源包没有该图集，提供 `resource/textures/particle/particles.png`。

## 自定义聊天仍显示原版

- replace mount 必须匹配 `minecraft:chat`；
- 使用 `preserveNativeLogic: true`；
- `chat-history` 与 `chat-input-proxy` 必须成功布局；
- 确认没有另一个更高 priority mount；
- 只想移动游戏中的近期消息应使用 `chat-overlay`，它不会替换打开后的 ChatScreen；
- chat-overlay 只有存在有效可绘制节点时才抑制原版 gameplay chat。

Tab 建议或 Component hover 被遮挡，通常是 Screen 合成阶段错误，而不是提高 zIndex 就能解决。Tooltip/建议必须在 Screen 顶层阶段绘制；HUD 和 transient feed 则应保持在 Screen 下方。

## 容器 Slot 或额外槽位错位

- 真实容器使用 `menu-slot*`，普通 `slot` 不是服务器 Menu Slot；
- replace 容器通常设置 `preserveContainer: true`；
- 核对 `containerLayout: vanilla/declared/hybrid`；
- 响应式缩放后，视觉与命中必须共享同一 bounds；
- Extra Slot hover 由 `showHighlight` 控制；
- 验收拿取、放入、右键拆分、拖拽、Shift 快捷移动和 carried item。

`Node ... is not interactive` 表示客户端发送了不应存在的交互。装饰节点设置 `pointerEvents: none`，点击行为放在 Pressable/Button/Slot 等交互节点；如果普通鼠标移动就触发该日志，应保留客户端与服务端日志作为实现缺陷排查。

## 窗口缩放后布局或输入异常

- 根节点使用 vw/vh + min/max；
- 内部使用 Flex/Grid；
- breakpoint 通过 `style.at` 只覆盖差异字段；
- 保持节点 ID 和 repeat key 稳定；
- 输入草稿、滚动和焦点由 retained state 按 NodeId 保留；
- GUI Scale 改变后测试文字物理像素对齐与点击区域。

## 圆角、阴影或分隔线异常

- 避免多个尺寸略有差异的深色 Panel 在同一区域叠加；
- Header/Footer 只给需要的角设置半径，其余显式为 0；
- 检查 backgroundColor alpha 与 shadows，不要把阴影误认为角落变黑；
- 滚动区的 clip、背景和行高必须一致，避免每行背景间露出 1px 间隔；
- 极细边框和小半径会受 GUI Scale 量化，应在多个 Scale 实机验收。

## 观察工具

客户端 `F8`：layout、render、cache、network、patch/state、ACK/NACK、resync 和帧预算。服务端 `/sg stats`：Behavior worker、队列、每 Action 成功/失败/超时/拒绝/fallback，以及模型和伤害显示统计。

## 关键协议上限

| 限制 | 默认值 |
| --- | ---: |
| 单网络包 / 解压后 | 32,256 bytes / 2 MiB |
| 文档节点 / 树深 | 4,096 / 64 |
| 单字符串 UTF-8 | 16,384 bytes |
| 状态键 / 总值 / 深度 | 2,048 / 8,192 / 16 |
| 状态 patch 操作 | 1,024 |
| 事件 payload 顶层条目 | 64 |

完整文档、patch 后结果、状态和事件都会再次验证，不能用压缩或差量绕过累计限制。这些是拒绝异常输入的硬边界，不是推荐生产规模。

下一步：[管理指令](./commands.md) · [快速参考](./reference.md)
