# Spectrum Studio

Spectrum Studio 是基于 Compose Desktop 的 Spectrum Pack 工作台。

## 工作区

- Design：节点选择、拖动和画布预览；
- Logic：State、Flow、Timeline、Statechart 等逻辑视图；
- Source：YAML/JavaScript/Kether 源码；
- Split：源码与预览并排；
- 项目树：创建、复制、剪切、粘贴、删除、拖放移动和会话内 Undo/Redo。

Studio 使用与运行时共享的 `UiCompiler`、`LayoutEngine` 和 `FrameBuilder`，支持多种 Minecraft GUI viewport 与 GUI Scale。

## 可以预览什么

- UI v1、组件、responsive binding、Flow、Theme；
- transition、timeline、statechart；
- hover/pressed、焦点、滚动和本地状态；
- Pack 内 PNG/JPG/JPEG/BMP/WebP 和 GIF 首帧；
- Image/NineSlice 和 namespaced Pack 资源；
- 编译诊断、文档 outline、State 与预算。

Studio 不在编辑器进程执行服务端脚本。Action 与客户端 Effect 只显示为明确的安全模拟。Minecraft 字体、物品、实体、原生 Slot、模型、Shader 和其他版本相关效果仍需实机验证。
