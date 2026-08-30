# 作者工作流

推荐循环是“编辑 → 静态校验 → 服务端候选校验 → 原子重载 → 多环境实机验收”。不要把 `/sg reload` 当作 YAML 语法检查器，更不要直接在生产服上试错。

## 选择作者格式

新的人类维护 UI 使用：

```yaml
schema: spectrumgraphics/ui/authoring-v1
```

它支持 `body`、紧凑节点、组件语法和便捷时长等写法，编译时确定性降低为：

```yaml
schema: spectrumgraphics/ui/v1
```

Canonical `ui/v1` 是运行时与生成工具的规范模型，使用 `root` 和完整字段。两种语法不能在同一文档里随意混写。

## Schema 与编辑器

Schema 的 `$id` 使用 URN，例如：

```text
urn:spectrumgraphics:schema:authoring-ui:v1
```

URN 是稳定标识，不是需要能在浏览器打开的网址。实际 JSON Schema 随项目和作者工具分发；编辑器应将 URN 映射到本地 `authoring-ui-v1.schema.json`。

主要 Schema：

```text
authoring-ui-v1.schema.json
pack-v1.schema.json
world-v1.schema.json
model-v1.schema.json
authoring-camera-v1.schema.json
authoring-key-v1.schema.json
avatar-v1.schema.json
text-v1.schema.json
slot-v1.schema.json
item-appearance-v1.schema.json
particle-v1.schema.json
behavior-v1.schema.json
```

## 修改循环

1. 在本地副本中编辑 Pack 和资源；
2. 使用随项目提供的 Schema、validator 或 Spectrum authoring 工具检查；
3. 上传到测试服，运行 `/sg validate`；
4. 没有错误后运行 `/sg reload`；
5. 使用 `/sg open` 或对应领域指令触发；
6. 测试 GUI Scale 1–5、多个分辨率和窗口缩放；
7. 检查 Fabric 客户端日志和 `F8` 性能面板；
8. 资源改动完成后再 build/publish，不要为每次 YAML 改动重发资源包。

## 诊断的阅读方式

诊断通常包含来源文件、YAML path 和节点 ID，例如：

```text
shop.yml:$.body.buy [node=buy] ...
```

先修最靠前的结构错误。一个错误的缩进或类型可能让后续引用、节点和 Flow 同时报错；不要从最后一条开始逐个掩盖症状。

## 实机验收矩阵

至少覆盖：

- GUI Scale 1、3、5；
- 宽屏、16:9、小窗口；
- HUD、聊天、背包和第三方 Screen；
- 鼠标点击、滚轮、拖拽、Tab 补全、键盘历史；
- 断线、快速重连、窗口缩放和资源重载；
- 缺失资源、旧缓存和发布 hash 不匹配；
- `F8` 中布局、渲染、缓存、网络和重同步指标。

Studio 和无头渲染能发现结构与视觉问题，但无法证明 Minecraft Font、RenderType、Screen 层级或具体显卡驱动下的最终效果。

下一步：[文档与节点](./ui-basics.md) · [验证与故障排查](./operations.md)
