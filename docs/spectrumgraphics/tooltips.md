# 物品 Tooltip

自定义 Tooltip 是 `presentation: tooltip` 的普通 UI 文档。它按物品条件选择模板，并用 `tooltip-name`、`tooltip-lore`、`tooltip-details` 分别渲染名字、自定义 Lore 和 Minecraft 生成的其余信息。

## 完整骨架

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: example:item_tooltip
presentation: tooltip

tooltip:
  priority: 100
  match: default
  anchor: cursor
  placement: auto
  offset: [12, 12]
  fallback: native
  maxWidth: 320
  fadeInMillis: 80

body:
  card:
    type: tooltip
    backgroundColor: '#F0100010'
    style:
      padding: 8
      cornerRadius: 4
      shadows: { offsetX: 2, offsetY: 2, blurRadius: 4, color: '#80000000' }
    children:
      content:
        type: row
        style: { gap: 7 }
        children:
          icon:
            type: item-stack
            item: hovered
            style: { width: 24, height: 24 }
          text:
            type: column
            style: { gap: 2 }
            children:
              name:
                type: tooltip-name
                font: 主界面
                formatting: { mode: preserve, legacyColors: auto }
                textStyle: { fontSize: 11 }
              lore:
                type: tooltip-lore
                maxLines: 16
                font: 主界面
                formatting: { mode: preserve, legacyColors: auto }
                lineStyle: { fontSize: 9 }
              details:
                type: tooltip-details
                maxLines: 16
                font: 主界面
                formatting: { mode: preserve, legacyColors: auto }
                lineStyle: { fontSize: 9 }
```

旧 `tooltip-lines` 已移除；把名称、Lore 和详情拆开后，可以分别设置字体、字号、间距、最大行数和条件显示。

## 格式和颜色

`formatting.mode`：

| 模式 | 行为 |
| --- | --- |
| `preserve` | 使用原版 Component 的完整格式，忽略会覆盖它的行级颜色 |
| `merge` | 保留原版格式并允许合并作者样式 |
| `override` | 使用纯文字，并由作者完全决定样式 |

`legacyColors` 可为 `off`、`ampersand`、`section`、`both`、`auto`。因此带 `&a`、`§a` 的名称和 Lore 不需要先被压成固定单色；是否解析由文档显式控制。

`tooltip-name` 自己拥有文字 binding，不能再声明 `text`、`bind` 或 children。`tooltip-lore` 和 `tooltip-details` 会按 `maxLines` 生成有界行节点。

## 匹配与回退

`match: default` 是兜底模板。精细匹配支持物品 ID、名称、Lore、类型和指定数据键；同一组内条件 AND，不同组 OR。高 `priority` 先匹配。

`fallback: native` 在模板缺失、能力不足或无法布局时显示原版 Tooltip；`none` 才会明确隐藏。生产环境建议使用 `native`，避免配置错误使玩家完全看不到物品信息。

## 与 Spectrum UI 一起渲染

Tooltip 在专用顶层阶段合成，背景、物品、文字和 hover 内容必须作为一个整体位于 Screen/UI 内容之上，并使用统一 clip/depth 生命周期。不要通过给普通 UI 节点设置极大 `zIndex` 模拟 Tooltip，否则专用 Item/Entity 渲染器可能与背景分层。

下一步：[字体、富文本与图标](./text.md) · [物品外观与额外渲染](./item-appearance.md)
