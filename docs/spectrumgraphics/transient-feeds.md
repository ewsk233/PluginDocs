# 临时 HUD Feed

`transient-feed` 是可组合的短暂停留队列，适合拾取物品、击杀、任务、连杀或任何附属玩法提示。`channel` 是附属插件自定义字符串，不是 `pickup`、`kill-feed` 等固定枚举。

## 在主插件中声明模板

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: example:feeds
presentation: hud

body:
  killFeed:
    type: transient-feed
    channel: gungame:kill-feed
    templateId: kill-card
    card:
      type: panel
      backgroundColor: '#CC201018'
      style: { width: 100%, height: 100%, padding: 5, cornerRadius: 5 }
      children:
        killer:
          type: text
          text: Killer
          style: { anchor: center-left }
        weapon:
          type: image
          source: minecraft:textures/item/iron_sword.png
          style: { x: 90, width: 16, height: 16, anchor: center-left }
        victim:
          type: text
          text: Victim
          style: { x: 112, anchor: center-left }
        headshot:
          type: text
          text: HEADSHOT
          style: { x: 176, visible: false, anchor: center-left }
    bindings:
      '$card': { backgroundColor: entry.event.backgroundColor }
      killer: { text: entry.killer.displayName, color: entry.killer.teamColor }
      weapon: { source: entry.weapon.icon, tint: entry.weapon.tint }
      victim: { text: entry.victim.displayName, color: entry.victim.teamColor }
      headshot: { text: entry.event.badge, visible: entry.event.headshot }
    direction: down
    maxVisible: 4
    entryHeight: 28
    gap: 3
    fadeIn: 80ms
    fadeOut: 500ms
    style: { anchor: top-right, x: -18, y: 32, width: 270, height: 124 }
```

`card` 是完整且受协议预算限制的 UiNode 树，不是只有 text/icon 两个字段。`bindings` 把任意有界 payload 路径映射到节点属性；`$card` 表示根卡片。

## 附属插件发布

```kotlin
SpectrumGraphics.api.hud.publishFeed(
    player,
    channel = "gungame:kill-feed",
    notice = SpectrumFeedNotice(
        templateId = "kill-card",
        values = mapOf(
            "killer" to mapOf(
                "uuid" to killer.uniqueId.toString(),
                "displayName" to killer.displayName,
                "teamColor" to "#FFFF5555",
            ),
            "victim" to mapOf(
                "uuid" to victim.uniqueId.toString(),
                "displayName" to victim.displayName,
                "teamColor" to "#FF55AAFF",
            ),
            "weapon" to mapOf(
                "id" to "ak47",
                "name" to "AK-47",
                "icon" to "gungame:textures/weapons/ak47.png",
                "tint" to "#FFFFFFFF",
            ),
            "event" to mapOf(
                "headshot" to true,
                "badge" to "HEADSHOT",
                "backgroundColor" to "#CC201018",
                "distance" to 42.5,
            ),
        ),
        ttlMillis = 4_000,
        priority = 10,
    ),
)
```

payload 可以包含有界的 null、boolean、number、string、list 和 object。附属不直接传递任意 `UiDocument` 或 `UiNode`：模板由服主 Pack 预先编译，附属只传业务数据，因此资源、节点预算和交互权限仍可审计。

## 队列操作

- 相同非空 `mergeKey` 与 `templateId` 会在同玩家、同频道中合并，整数 `count` 相加并刷新 TTL；
- `priority` 控制排序；
- `dismissFeed(player, channel, entryId)` 删除一项；
- `clearFeed(player, channel)` 清空频道；
- `publishFeedToWorld(world, channel, notice)` 广播给 Bukkit 世界内玩家。

淡入淡出在客户端完成，不会每帧发包。Feed 属于 HUD 合成阶段；聊天或背包 Screen 打开时它位于 Screen 下方，而不是临时隐藏或盖在最上层。

下一步：[HUD 与原版 HUD](./hud.md) · [公共 API](./api.md)
