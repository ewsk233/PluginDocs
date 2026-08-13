# SpectrumGraphics

SpectrumGraphics 是面向 Minecraft 服务器的下一代视觉平台。它由 Bukkit 服务端插件、Fabric 客户端 Mod、共享编译与运行时，以及可视化工作台 Spectrum Studio 组成。

当前版本已经形成以下闭环：

- 声明式 Menu、HUD、Overlay 与原版容器替换；
- 强类型状态、响应式表达式、组件、Flow 与动画；
- 服务端权威同步、增量补丁、ACK/NACK、重同步和硬预算；
- WorldCanvas 世界空间界面与Waypoint API；
- Blockbench 模型编译、世界渲染、动作播放与状态控制器；
- Spectrum Pack、受限 Behavior、Capability 事务和原子热重载；
- AES-256-GCM 加密资源发布、手动或 HTTPS 自动分发；
- Spectrum Studio、JSON Schema、无头渲染和自动验证工具。

> 当前正式闭环是 **Paper 服务端 + Minecraft 1.20.1 Fabric 客户端**。项目仍处于早期阶段，公开 API 与 v1 契约可能继续完善，不建议未经实机验收直接投入大型生产服。

## 工作方式

```text
TabooLib 插件
  ├─ Spectrum Pack、UI、WorldCanvas、模型场景
  ├─ 服务端状态、Action 与 Capability
  └─ Open/Patch/State + revision/hash
                 │
                 ▼
           自定义数据通道
                 │
                 ▼
客户端 Mod
  ├─ Screen / HUD / Overlay
  ├─ WorldCanvas / Model3D
  ├─ 原版容器代理
  └─ 输入、ACK/NACK、缓存与重同步
```

服务端拥有文档、状态和业务结果的最终权威。客户端只运行经过编译和限额的表达式、Flow 与视觉效果；涉及经济、背包或其他外部修改的操作必须回到服务端 Action/Capability。

## 推荐阅读顺序

1. [安装与第一个界面](./getting-started.md)
2. [目录与配置](./configuration.md)
3. [Spectrum Pack](./pack.md)
4. [UI 基础](./ui-basics.md)
5. [状态、表达式与 Flow](./state-flow.md)
6. 根据需求阅读 [WorldCanvas](./world-canvas.md)、[3D 模型与动作](./models.md) 或 [Behavior](./behaviors.md)
7. [验证、排错与限制](./operations.md)
