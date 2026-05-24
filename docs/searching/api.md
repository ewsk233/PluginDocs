# Searching API

Searching 会在 Bukkit `ServicesManager` 中注册 `SearchingApi`。附属插件不需要修改 Searching 主插件源码，只需要在运行时获取服务即可。

## 获取 API

```kotlin
import org.bukkit.Bukkit
import org.ewsk.searching.api.SearchingApi

val searchingApi: SearchingApi? =
    Bukkit.getServicesManager().load(SearchingApi::class.java)
```

建议在插件 `onEnable` 后再获取，并处理 `null`，因为 Searching 可能未安装或未启用。

## 节点 API

```kotlin
interface SearchingNodeApi {
    fun findNode(id: NodeId): SearchingNodeView?

    fun findNodeAt(pos: SearchingBlockPos): SearchingNodeView?

    fun createNode(typeId: String, pos: SearchingBlockPos): ApiResult<NodeId>

    fun createNode(request: SearchingCreateNodeRequest): ApiResult<NodeId>

    fun removeNode(id: NodeId): ApiResult<Boolean>

    fun removeNodeAt(pos: SearchingBlockPos, typeId: String? = null): ApiResult<Boolean>

    fun clearNodes(world: WorldId, typeId: String? = null): ApiResult<Int>

    fun refreshNode(id: NodeId): ApiResult<Boolean>

    fun refreshNodes(ids: Collection<NodeId>): ApiResult<Int>

    fun openNode(playerId: PlayerId, nodeId: NodeId): ApiResult<SearchSessionId>
}
```

`createNode(typeId, pos)` 会按 Searching 配置里的 `node_types.yml` 生成节点奖励。`createNode(request)` 则由附属插件直接传入节点 ID、槽位和物品，适合动态生成类功能。

## 查询节点

```kotlin
val node = api.nodes.findNodeAt(
    SearchingBlockPos(
        world = WorldId("world"),
        x = 100,
        y = 64,
        z = 100
    )
)
```

`SearchingNodeView` 包含：

| 字段 | 说明 |
| --- | --- |
| `id` | 节点 ID |
| `typeId` | 节点类型 ID |
| `kind` | 节点来源类型：`Static` 或 `Instance` |
| `pos` | 世界坐标 |
| `state` | 当前状态 |
| `openedCount` | 打开次数 |
| `totalValue` | 当前奖励总价值 |
| `slots` | 当前槽位、物品和揭示状态 |

## 创建配置节点

```kotlin
val result = api.nodes.createNode(
    typeId = "测试箱",
    pos = SearchingBlockPos(WorldId("world"), 100, 64, 100)
)
```

`typeId` 必须存在于 `node_types.yml`。同一坐标不能重复创建搜刮点。

## 创建自定义节点

附属插件可以创建自定义 `Instance` 节点，并直接提供搜索槽位。这适合由附属插件自己负责方块、实体、特效、生成规则和持久化，而只把可搜索背包交给 Searching。

```kotlin
val result = api.nodes.createNode(
    SearchingCreateNodeRequest(
        typeId = "dynamic_drop",
        nodeId = NodeId("dynamic:${world.name}:100:64:100"),
        pos = SearchingBlockPos(WorldId(world.name), 100, 64, 100),
        kind = SearchingNodeKind.Instance,
        persist = false,
        slots = listOf(
            SearchingInventorySlot(
                index = 0,
                item = SearchingLootItem(
                    ref = "DIAMOND",
                    tierId = "rare",
                    amountMin = 2,
                    amountMax = 2,
                    value = 25,
                    revealTicks = 20,
                    exp = 3.0,
                    searchSound = "ENTITY_ITEM_PICKUP",
                    metadata = mapOf(
                        "name" to "&b动态奖励",
                        "lore" to "&7由附属插件生成"
                    )
                )
            )
        )
    )
)
```

`persist = false` 表示节点只存在于本次运行内，不写入 Searching 的节点数据库。附属插件如果需要跨重启保留动态节点，应自行保存生成状态，并在启动后重新调用 API 创建节点。确实希望由 Searching 持久化节点时，可以传 `persist = true`。

### 自定义节点 DTO

```kotlin
data class SearchingCreateNodeRequest(
    val typeId: String,
    val pos: SearchingBlockPos,
    val slots: List<SearchingInventorySlot>,
    val nodeId: NodeId? = null,
    val kind: SearchingNodeKind = SearchingNodeKind.Instance,
    val persist: Boolean = false
)

data class SearchingInventorySlot(
    val index: Int,
    val state: SearchingSlotState = SearchingSlotState.Hidden,
    val item: SearchingLootItem? = null
)

data class SearchingLootItem(
    val ref: String,
    val tierId: String,
    val amountMin: Int = 1,
    val amountMax: Int = amountMin,
    val value: Int = 0,
    val revealTicks: Long = 0,
    val exp: Double = 0.0,
    val searchSound: String? = null,
    val metadata: Map<String, String> = emptyMap()
)
```

`metadata` 会传入物品渲染层，常用键包括：

| 键 | 作用 |
| --- | --- |
| `name` | 物品显示名 |
| `lore` | 物品 lore，多行使用 `\n` 分隔 |
| `custom-model-data` | 自定义模型数据 |

## 移除节点

按节点 ID 移除：

```kotlin
val result = api.nodes.removeNode(nodeId)
```

按坐标移除：

```kotlin
val result = api.nodes.removeNodeAt(
    pos = SearchingBlockPos(WorldId("world"), 100, 64, 100)
)
```

按坐标并限制节点类型：

```kotlin
val result = api.nodes.removeNodeAt(
    pos = SearchingBlockPos(WorldId("world"), 100, 64, 100),
    typeId = "测试箱"
)
```

返回 `ApiResult.Success(true)` 表示实际移除了节点，`false` 表示未找到匹配节点。

移除节点时会同步清理：

- 进行中的搜索会话
- 节点缓存
- 数据库存储
- 节点悬浮字

同时会发布 `SearchingApiEvent.NodeRemoved`，附属插件可在这里清理自己的方块、实体或数据。

## 清空世界节点

清空世界内所有搜刮点：

```kotlin
val result = api.nodes.clearNodes(WorldId("world"))
```

只清空指定类型：

```kotlin
val result = api.nodes.clearNodes(WorldId("world"), "测试箱")
```

返回值为移除数量：

```kotlin
when (result) {
    is ApiResult.Success -> println("已移除 ${result.value} 个节点")
    is ApiResult.Failure -> println("${result.code}: ${result.message}")
}
```

## 刷新节点

刷新单个节点：

```kotlin
api.nodes.refreshNode(nodeId)
```

批量刷新节点：

```kotlin
api.nodes.refreshNodes(roomNodeIds)
```

刷新会重新按 Searching 配置生成槽位。对附属插件创建的自定义槽位节点，通常不建议调用刷新，除非该节点的 `typeId` 已在 Searching 配置中准备了可用奖励表。

## 打开原始搜刮 UI

```kotlin
val result = api.nodes.openNode(
    playerId = PlayerId(player.uniqueId.toString()),
    nodeId = node.id
)
```

`openNode` 会直接进入 Searching 的原始搜刮流程，不会再次触发 `SearchingPreOpenEvent`。这适合附属插件在完成前置流程后继续打开原箱子，例如密码箱、破解 UI、权限检查等。

## ApiResult

所有会改变状态的 API 使用 `ApiResult`：

```kotlin
sealed interface ApiResult<out T> {
    data class Success<T>(val value: T) : ApiResult<T>
    data class Failure(val code: String, val message: String) : ApiResult<Nothing>
}
```

推荐写法：

```kotlin
when (val result = api.nodes.createNode("测试箱", pos)) {
    is ApiResult.Success -> {
        val nodeId = result.value
    }
    is ApiResult.Failure -> {
        logger.warning("Searching API failed: ${result.code} ${result.message}")
    }
}
```

## 打开前事件

Searching 在玩家右键搜刮点、但尚未进入原始搜刮 UI 前触发：

```kotlin
import org.ewsk.searching.platform.bukkit.event.SearchingPreOpenEvent
import taboolib.common.platform.event.SubscribeEvent

object MySearchingListener {

    @SubscribeEvent
    fun onPreOpen(event: SearchingPreOpenEvent) {
        if (event.node.typeId != "保险箱") {
            return
        }

        event.isCancelled = true

        // 在这里打开你的前置 UI。
        // 前置流程成功后，再调用 api.nodes.openNode(...)
    }
}
```

`SearchingPreOpenEvent` 是 Bukkit 平台事件，继承 `BukkitProxyEvent`。取消该事件后：

- Searching 不会打开原始搜刮 UI。
- 本次不会执行原始打开逻辑。
- 不会提前增加玩家打开搜刮箱统计。
- 搜索揭示倒计时不会启动。

前置流程成功后可以这样继续：

```kotlin
api.nodes.openNode(
    PlayerId(event.player.uniqueId.toString()),
    event.node.id
)
```

## 内部事件

Searching 的内部事件基于 TabooLib `InternalEvent`：

| 事件 | 触发时机 |
| --- | --- |
| `NodeOpenedEvent` | 节点刷新后第一次进入原始搜刮流程 |
| `ItemRevealedEvent` | 某个物品格子揭示完成 |
| `ItemTakenEvent` | 玩家取走某个已揭示物品 |
| `NodeEmptiedEvent` | 节点内最后一个可取物品被取走 |
| `NodeRemovedEvent` | 节点被 API、命令或管理操作移除 |
| `NodeRefreshedEvent` | 节点刷新完成 |
| `StatsChangedEvent` | 统计变更事件类型 |

监听示例：

```kotlin
import org.ewsk.searching.core.event.ItemTakenEvent
import taboolib.common.platform.event.SubscribeEvent

object SearchingInternalListener {

    @SubscribeEvent
    fun onItemTaken(event: ItemTakenEvent) {
        val nodeId = event.nodeId
        val playerId = event.playerId
        val item = event.item
        val remainingItems = event.remainingItems
    }
}
```

## API 事件订阅

也可以通过 `api.events.subscribe` 订阅 API 层事件。API 事件是平台无关 DTO，更适合普通附属插件使用：

```kotlin
val subscription = api.events.subscribe { event ->
    when (event) {
        is SearchingApiEvent.NodeOpened -> {
            // 节点打开
        }
        is SearchingApiEvent.SlotRevealed -> {
            // 格子揭示
        }
        is SearchingApiEvent.SlotTaken -> {
            // 玩家取走物品，可同步附属插件自己的记录
        }
        is SearchingApiEvent.NodeEmptied -> {
            // 节点已取空，可移除附属插件生成的方块或实体
        }
        is SearchingApiEvent.NodeRemoved -> {
            // 节点被移除，可清理附属插件数据
        }
        is SearchingApiEvent.NodeRefreshed -> {
            // 节点刷新
        }
        is SearchingApiEvent.StatsChanged -> {
            // 统计变化
        }
    }
}

subscription.cancel()
```

## 附属插件建议

如果你要开发密码保险箱、破解界面、多阶段开锁等前置流程插件，推荐流程：

1. 监听 `SearchingPreOpenEvent`。
2. 根据 `event.node.typeId` 判断是否接管。
3. `event.isCancelled = true`。
4. 打开自己的 UI 或任务流程。
5. 玩家成功后调用 `api.nodes.openNode(playerId, event.node.id)`。
6. 失败、取消、超时则不要调用 `openNode`。

如果你要开发动态生成类附属插件，推荐流程：

1. 附属插件自己负责生成点选择、方块或实体创建、特效、TTL 和持久化。
2. 需要可搜索背包时调用 `api.nodes.createNode(SearchingCreateNodeRequest(...))`。
3. `persist` 通常保持 `false`，由附属插件自己恢复运行时状态。
4. 玩家取走奖励时监听 `SlotTaken`。
5. 节点取空时监听 `NodeEmptied` 并移除自己的方块或实体。
6. 管理员或其他系统移除节点时监听 `NodeRemoved` 并清理附属插件数据。

这样可以让 Searching 专注于“搜索 UI、揭示倒计时、领取物品、统计和节点 API”，附属插件专注于自己的生成规则和世界表现。
