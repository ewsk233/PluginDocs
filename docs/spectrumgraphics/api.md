# 公共 API

Paper 侧唯一入口是 `SpectrumGraphics.api`。API 已按领域拆分；不要访问 `runtime`、repository、session 或其他 internal 实现。

```kotlin
import org.ewsk.spectrumgraphics.plugin.SpectrumGraphics

val api = SpectrumGraphics.api
```

## 领域服务

| 服务 | 职责 |
| --- | --- |
| `api.ui` | UI 模板、文档、状态、交互订阅 |
| `api.world` | WorldCanvas、Waypoint、World Popup |
| `api.hud` | transient feed 发布、移除、清空 |
| `api.models` | 模型场景、实例、动画、参数、事件 |
| `api.cameras` | Camera 文档、preset、scene、modifier |
| `api.particles` | 粒子与声音播放、停止 |
| `api.avatars` | Profile、Cosmetic、loadout、语义动作 |
| `api.items` | 物品外观与额外效果 |
| `api.text` | Text 注册表与图标展开 |
| `api.packs` | Pack 查询、启停、重载和资源同步 |
| `api.keys` | Key 文档与玩家 group |
| `api.slots` | 额外槽位读写 |
| `api.extensions` | 数据源、Behavior、Capability、Anchor resolver |
| `api.diagnostics` | 客户端能力、session 和脚本指标 |

除文档明确说明的只读查询外，打开、更新、关闭、Pack 生命周期、模型/镜头/槽位/物品写操作都必须在服务端主线程调用，目标玩家必须在线。

## UI

```kotlin
val title = SpectrumStateKey.of<String>("shop.title")
val state = SpectrumState.build {
    this[title] = "限时商店"
}

api.ui.open(player, "shop:main", state)
api.ui.updateState(player, DocumentId("shop:main"), changedState)
api.ui.refreshDataSources(player, DocumentId("shop:main"))
api.ui.close(player, DocumentId("shop:main"), "Shop closed")
```

也可传递代码构造的 `UiDocument` 或 `UiTemplate`。`update` 自动比较完整文档和 patch；`updateState` 自动选择 snapshot/patch。每次结果都有 revision、sequence 和 hash，客户端可 NACK 并请求重同步。

### 交互订阅

```kotlin
val subscription = api.ui.onAction(
    SpectrumGraphicsAction.of("shop.buy"),
) { event ->
    // 在权威服务端验证并执行业务
}

val allInteractions = api.ui.onInteraction { event -> }
val sessionErrors = api.ui.onSessionError { event -> }
```

订阅返回 `AutoCloseable`；附属卸载时关闭，避免热重载后重复监听。也可以订阅对应 TabooLib InternalEvent。

## 自定义数据源

```kotlin
val registration = api.extensions.registerDataSource(
    id = "myaddon:profile",
    cost = 2,
) { context ->
    StateValue.TextValue(loadRank(context.player.uniqueId))
}
```

```yaml
state:
  profile.rank:
    type: string
    scope: player
    source:
      type: custom
      value: myaddon:profile
      arguments: { field: rank }
      cost: 2
```

Provider cost 为 1–100，YAML 声明不能低于 Provider cost；单次解析有总预算。拥有自己失效事件的附属可调用 `api.ui.refreshDataSources`，不要建立无界每 Tick 查询。

## WorldCanvas 与 Waypoint

```kotlin
val handle = api.world.showWaypoint(player, waypoint, location)
handle.moveTo(nextLocation)
handle.hide()
handle.show(nextLocation)
handle.close()
```

`createWaypoint` 只创建内存定义，第一次 `show` 才挂载；`hide` 可复用，`close` 永久释放。附属持久化由附属自己负责。

动态 Anchor：

```kotlin
val resolver = api.extensions.registerWorldAnchorResolver { player, anchor ->
    resolveTarget(player, anchor)?.let {
        SpectrumResolvedWorldAnchor(it.position, it.world, it.dimension)
    }
}
```

返回 null 会继续尝试下一个 resolver 与内建解析。

## 临时 Feed

```kotlin
api.hud.publishFeed(
    player,
    "gungame:kill-feed",
    SpectrumFeedNotice(
        templateId = "kill-card",
        values = mapOf(
            "killer" to mapOf("displayName" to killer.displayName),
            "victim" to mapOf("displayName" to victim.displayName),
            "event" to mapOf("headshot" to true),
        ),
        ttlMillis = 4_000,
        priority = 10,
    ),
)
```

频道可自定义，payload 可嵌套。服主 Pack 提供受限 UiNode card，附属不传任意文档。详见[临时 HUD Feed](./transient-feeds.md)。

## 模型、镜头与粒子

```kotlin
api.models.spawn(player, "npc:guide")
api.models.play(player, "npc:guide", "guide", "wave", loop = false, fadeMillis = 150)
api.models.setParameters(
    player, "npc:guide", "guide",
    mapOf("moving" to ModelParameterValue.BooleanValue(true)),
)

api.cameras.load(player, "quest:intro")
api.cameras.play(player, "quest:intro", "arrival")
api.cameras.preset(player, "quest:intro", "肩后")

val handle = api.particles.playAt(location, "magic")
handle.stop()
```

模型事件和 Camera 事件都提供订阅。粒子还支持 Entity、Model Locator 和 Camera anchor。

## Avatar、Item、Text、Slot

```kotlin
api.avatars.set(player, "示例玩家")
api.avatars.equip(player, "示例帽子")

api.items.setAppearance(itemStack, "boss:crystal_blade")
api.items.addEffect(itemStack, "传说边框")

val glyph = api.text.iconGlyph("金币")
val expanded = api.text.expandIcons("奖励 <icon:金币>")

api.slots.set(player, "护符", itemStack)
```

Avatar catalog/entitlement/loadout、额外槽位 store 都可以注册替代 Provider。注册对象必须在附属卸载时关闭。

## Pack 与校验

```kotlin
val packId = NamespacedId("shop:main")
api.packs.isEnabled(packId)
api.packs.enable(packId)
api.packs.disable(packId)

api.ui.validate()
api.world.validate()
api.models.validate()
api.cameras.validate()
api.keys.validate()
api.avatars.validate()
api.slots.validate()
api.packs.validate()
```

`validate` 不切换在线快照。附属若编排跨领域重载，也必须先完成所有候选验证，再执行切换，避免半成功状态。

下一步：[Behavior 与 Capability](./behaviors.md) · [临时 HUD Feed](./transient-feeds.md)
