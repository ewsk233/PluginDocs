# HUD 与原版 HUD

`presentation: hud` 的无 mount 文档会在玩家完成握手后自动发布。HUD 使用客户端本地数据源更新，不需要服务端每 Tick 发送血量、饥饿或选中物品。

## 替换指定原版区域

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: example:status
presentation: hud

vanilla:
  replace: [player-status, experience, scoreboard]

body:
  health:
    type: progress
    value: 0
    trackColor: '#D0200808'
    fillColor: '#FFDC2D37'
    bind: { progress: client.player.healthRatio }
    style: { width: 160, height: 9, anchor: bottom-center, y: -48 }
  healthText:
    type: text
    text: ''
    bind: { text: client.player.healthText }
```

`vanilla.replace` 支持 `hotbar`、`player-status`、`experience`、`scoreboard`、`boss-bar`、`selected-item-name`。只有明确列出的 pass 会被抑制。

## 常用客户端绑定

```text
client.player.healthRatio / healthText
client.player.absorptionRatio
client.player.foodRatio / foodText
client.player.saturationRatio
client.player.armorRatio / armorText
client.player.armorToughnessRatio / armorToughnessText
client.player.airRatio / airText
client.player.experienceProgress / experienceLevelText
client.player.selectedHotbarSlot
client.player.mainHand.itemId / count / empty
client.scoreboard.visible / title
client.scoreboard.lines.0..14.name / score / formatted / visible
```

这些值由客户端合成，不要在 `state` 中重新声明。

## 自定义 Hotbar

```yaml
vanilla: { replace: [hotbar] }
body:
  hotbar:
    type: row
    style: { width: 182, height: 20, anchor: bottom-center, y: -3, gap: 2 }
    children:
      slot0:
        type: hotbar-slot
        index: 0
        image: example:textures/gui/hotbar/slot.png
        selectedImage: example:textures/gui/hotbar/selected.png
        style: { width: 18, height: 18 }
```

继续声明索引 1–8。`hotbar-slot` 直接读取玩家本地真实物品；背景、完整边框和装饰仍用普通 Image/NineSlice/Panel 组合。

## 选中物品提示

```yaml
vanilla: { replace: [selected-item-name] }
body:
  prompt:
    type: selected-item-prompt
    duration: 2.2s
    fadeIn: 90ms
    fadeOut: 450ms
    retrigger: [selected-slot, item-type, item-name, item-components]
    style: { width: 220, height: 42, anchor: bottom-center, y: -58 }
    children:
      icon:
        type: item-stack
        item: selected
        style: { x: 6, y: 8, width: 26, height: 26 }
      name:
        type: text
        text: '= $item.formattedName'
        style: { x: 40, y: 8, width: 168, height: 14 }
```

`$item` 提供 `present`、`visible`、`opacity`、`ageMillis`、`progress`、`slot`、`itemId`、`name`、`formattedName`、`customName`、`count`、`rarity`、`rarityColor`、`damageable`、`damage`、`maxDamage`、`durabilityRatio`。`formattedName` 保留原版 Component 格式。

## HUD 层级

HUD、选中物品提示和 transient feed 属于游戏 HUD。打开聊天、背包等 Screen 时，它们仍会在 Screen 下方绘制，而不是盖住 Screen 内容。若某个效果本来就要随 Screen 显示，应使用 mount，而不是提高 HUD `layer.order`。

下一步：[临时 HUD Feed](./transient-feeds.md) · [聊天界面与消息层](./chat.md)
