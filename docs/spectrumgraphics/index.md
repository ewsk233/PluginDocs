# SpectrumGraphics

SpectrumGraphics 是面向 Minecraft 服务器的声明式视觉平台。服主用 YAML 组织 UI、HUD、世界画布、模型、镜头、字体、粒子和物品外观；附属插件通过分领域 API 注入状态、业务行为和临时消息，而不需要自行维护客户端渲染协议。

> 当前完整运行闭环是 **Paper/TabooLib 服务端 + Minecraft 1.20.1 Fabric 客户端**。Forge 1.20.1 和 Minecraft 1.21.11 仍是构建或兼容骨架，不应作为已发布适配部署。Plugin 与 Mod 必须来自同一次构建。

## 按角色开始

| 你要做什么 | 从这里开始 |
| --- | --- |
| 第一次安装 | [安装与快速开始](./getting-started.md) |
| 编写服主配置 | [Spectrum Pack](./pack.md) → [文档与节点](./ui-basics.md) → [布局与响应式](./layout-responsive.md) |
| 改造聊天、背包或 HUD | [原版 Screen 与容器](./mount-container.md)、[聊天界面](./chat.md)、[HUD](./hud.md) |
| 制作字体、模型、粒子或物品外观 | [字体与图标](./text.md)、[资源发布](./assets.md)、[物品外观](./item-appearance.md) |
| 开发附属插件 | [公共 API](./api.md) 与 [Behavior/Capability](./behaviors.md) |
| 定位加载或显示问题 | [验证与故障排查](./operations.md) |

## 已实现能力

### UI 与 Minecraft 集成

- Menu、HUD、Overlay、Tooltip 和短暂 World Popup；
- Row、Column、Stack、Flex、Grid、Scroll、Virtual List；
- `%`、`vw`、`vh`、逻辑像素、物理像素、min/max 和 breakpoint；
- Text、RichText、Image、NineSlice、表单、Tabs、Popover、Modal 和 Minecraft 专用节点；
- 原版 Screen 的 `replace`、`decorate`、`overlay`，并可保留容器交易、聊天输入和命令补全；
- 自定义聊天历史、聊天输入、近期消息层、物品 Tooltip、选中物品提示和额外槽位；
- 可组合的临时 HUD Feed，适合拾取提示、击杀信息和任务通知。

### 内容与视觉资源

- TTF/OTF 字体、原版字体覆盖、富文本、行内 PNG/GIF 图标；
- WorldCanvas、伤害数字、交互式世界面板和 Waypoint API；
- Blockbench/Bedrock 模型、动画层、控制器、Avatar 和时装；
- Camera preset、跟随、固定、orbit、spline、镜头事件和无障碍限制；
- Bedrock/Snowstorm 粒子、MoLang 子集、事件链和模型 Locator 锚点；
- PNG/GIF/SGModel 物品外观及 `before-item`、`after-item`、`after-decorations` 额外渲染层；
- AES-256-GCM 资源归档、手动分发、HTTPS/CDN 下载和客户端缓存。

### 响应式与业务能力

- typed State、computed、binding、Flow、Signal、Theme、Timeline 和 Statechart；
- 组件、typed props、slot、import、repeat 和稳定 NodeId；
- 强类型服务端 Action、受限 JavaScript/Kether Behavior、Capability 事务与补偿；
- Pack 依赖、原子热重载、文档/状态差量、ACK/NACK 和重同步。

## 核心原则

1. 服务端保存业务、玩家数据和交互结果的最终权威。
2. 客户端负责布局、输入采集、动画和渲染，不接受任意脚本。
3. 文档模板保持不可变；高频数据通过独立 State patch 或客户端本地绑定更新。
4. 重载先验证完整候选快照，失败时继续使用上一份有效内容。
5. 自动化预览不能替代真实 Minecraft、GUI Scale 和显卡环境中的验收。

继续阅读：[架构与运行边界](./architecture.md) · [快速参考](./reference.md)
