# Spectrum Studio

Spectrum Studio 是 Compose Desktop 作者工作台，复用 Core 编译器、布局和 DrawCommand 生成流程。它适合编辑 Pack、观察诊断和快速比较 viewport，不是独立运行时，也不能替代 Minecraft 实机验收。

## 工作区

- Design：节点选择、属性和画布预览；
- Logic：State、Flow、Timeline、Statechart；
- Source：YAML、JavaScript、Kether；
- Split：源码与预览并排；
- 项目树：创建、复制、剪切、粘贴、移动、删除和会话内 Undo/Redo。

从项目仓库运行：

```powershell
.\gradlew.bat runStudio
```

## 能预览什么

- UI v1 与 authoring-v1；
- 组件、binding、响应式 Style、Theme；
- transition、timeline、statechart；
- hover/pressed、焦点、滚动和本地状态；
- Pack 内常见静态图片与 GIF 首帧；
- 编译诊断、文档 outline、状态和预算。

## 安全模拟

Studio 不执行服务端脚本、Bukkit Action 或敏感客户端 Effect。它们显示为明确的模拟结果。不要为了预览成功而在 Studio 中复制一套业务逻辑；实际结果仍由测试服服务端验证。

## 必须实机验收的内容

- Minecraft FontSet、自定义字体 hinting 与 GUI Scale；
- ItemStack、真实 Entity、原版 Menu Slot 与 carried item；
- ChatScreen 输入、Tab 建议和 Component hover/click；
- Screen/HUD/Tooltip 专用渲染阶段；
- SGModel、Avatar、Camera、Bedrock 粒子；
- RenderType、深度、裁剪、显卡驱动和资源包组合。

推荐把 Studio 当作“作者反馈循环的第一关”，随后仍执行 `/sg validate`、测试服 `/sg reload` 和多分辨率验收。

下一步：[作者工作流](./authoring-workflow.md) · [验证与故障排查](./operations.md)
