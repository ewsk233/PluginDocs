# 开发 API

Paper 侧公共入口是：

```kotlin
import org.ewsk.spectrumgraphics.plugin.SpectrumGraphics

val api = SpectrumGraphics.api
```

公共接口优先使用 TabooLib `ProxyPlayer` 和 `InternalEvent`。除 Waypoint 的便利重载外，不要求附属插件把 Bukkit 类型带入核心逻辑。

> `open`、`update`、`updateState`、`close`、WorldCanvas、模型控制和 Pack 生命周期等写操作必须在服务端主线程调用，并且目标玩家必须在线。

## 打开模板与状态

```kotlin
val buttonText = SpectrumStateKey.of<String>("shop.button")
val state = SpectrumState.build {
    this[buttonText] = "购买 10 金币"
}

SpectrumGraphics.api.open(player, "shop:main", state)
```

也可以打开代码构造的 `UiDocument` 或 `UiTemplate`：

```kotlin
SpectrumGraphics.api.open(player, document)
SpectrumGraphics.api.open(player, template, state)
```

常用查询：

```kotlin
api.template("shop:main")
api.templateIds()
api.world("quests:markers")
api.worldIds()
api.modelScene("npc:guide")
api.modelSceneIds()
```

## 更新与关闭

```kotlin
api.update(player, changedDocument)
api.update(player, changedTemplate)
api.updateState(player, DocumentId("shop:main"), newState)
api.refreshDataSources(player, DocumentId("shop:main"))
api.close(player, DocumentId("shop:main"), "Shop closed")
```

`update` 自动比较完整文档与差量，发送更合适的形式。`updateState` 自动选择 snapshot 或 patch。每次应用都有 revision、sequence 和结果哈希；客户端异常时可 NACK 并请求重同步。

## 交互订阅

按 Action 订阅：

```kotlin
val subscription = api.onAction(
    SpectrumGraphicsAction.of("shop.buy"),
) { event ->
    logger.info("${event.player.name} clicked ${event.nodeId}")
}
```

其他订阅：

```kotlin
api.onInteraction { event -> /* 所有经过权威校验的交互 */ }
api.onClick { event -> /* 兼容点击事件 */ }
api.onSessionError { event -> /* 协议或会话错误 */ }
api.onModelEvent { player, event -> /* 动作完成/控制器迁移 */ }
```

也可以使用 TabooLib 事件总线：

```kotlin
@SubscribeEvent
fun onInteraction(event: SpectrumGraphicsInteractionEvent) {
    info("${event.player.name}: ${event.interaction}")
}
```

订阅对象可关闭；附属插件卸载时应释放，避免热重载后重复监听。

## 自定义数据源

```kotlin
val registration = api.registerDataSource(
    id = "myaddon:profile",
    cost = 2,
) { context ->
    StateValue.TextValue(loadRank(context.player.uniqueId))
}
```

YAML：

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

Provider cost 范围 1–100。YAML 声明的 cost 不得低于 Provider cost，单次模板解析总预算默认 100。

## WorldCanvas

代码文档：

```kotlin
api.openWorld(player, worldDocument, initialState)
api.updateWorld(player, changedWorldDocument)
api.updateWorldState(player, documentId, state)
api.close(player, documentId)
```

Waypoint：

```kotlin
val handle = api.showWaypoint(player, waypoint, location)
handle.moveTo(nextLocation)
handle.hide()
handle.close()
```

自定义动态 Anchor resolver：

```kotlin
val resolver = api.registerWorldAnchorResolver { player, anchor ->
    val target = taskTargets.resolve(player.uniqueId, anchor)
        ?: return@registerWorldAnchorResolver null
    SpectrumResolvedWorldAnchor(
        position = WorldVec3(target.x, target.y, target.z),
        world = target.world,
        dimension = target.dimension,
    )
}
```

Resolver 返回 `null` 会继续尝试下一个 resolver 和内置实体/玩家解析。

## 模型场景

```kotlin
api.spawnModelScene(player, "npc:guide")
api.playModel(
    player = player,
    sceneId = "npc:guide",
    instanceId = "guide",
    animation = "wave",
    loop = false,
    speed = 1f,
    fadeMillis = 150,
)

api.setModelParameters(
    player,
    "npc:guide",
    "guide",
    mapOf("moving" to ModelParameterValue.BooleanValue(true)),
)

api.stopModel(player, "npc:guide", "guide", fadeMillis = 150)
api.closeModelScene(player, "npc:guide")
```

`openModelScene` 打开代码构造且不跟随仓库热重载的文档；`spawnModelScene` 打开仓库场景并绑定后续 `/sg model load`。

## Pack 与 Behavior

```kotlin
val packId = NamespacedId("shop:main")

api.packIds()
api.packManifest(packId)
api.isPackEnabled(packId)
api.enablePack(packId)
api.disablePack(packId)
api.unloadPack(packId)

val actions = api.registerBehaviors(packId) { /* typed Action DSL */ }
val capability = api.registerCapability(
    packId,
    NamespacedId("shop:economy"),
) { /* typed operation DSL */ }
```

`registerBehaviors` 只能注册 Pack 清单已经声明的 Action；`registerCapability` 也受 Pack 声明限制。

## 校验与重载

```kotlin
api.validatePacks()
api.validateTemplates()
api.validateWorlds()
api.validateModels()

api.reloadPacks()
api.reloadTemplates()
api.reloadWorlds()
api.reloadModels()
```

`validate*` 不切换在线快照。自己编排多仓库重载时，应像 `/sg reload` 一样先全部预检，再执行切换，避免形成跨仓库半成功状态。

## 客户端能力与指标

```kotlin
api.clientFeatures(player)
api.supportsClientFeature(player, "example:shader-node", minimumVersion = 2)
api.sessionStats(player)
api.scriptStats()
```

Session 指标包括包量、字节、完整打开、patch、state snapshot/patch、缓存命中、ACK/NACK、resync、事件接受/拒绝与限流。
