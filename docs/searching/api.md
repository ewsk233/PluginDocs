# Searching API

Searching 会在 Bukkit ServicesManager 中注册 `SearchingApi`。附属插件不需要修改 Searching 主插件源码，只需要在运行时获取服务即可。

## 获取 API

```kotlin
import org.bukkit.Bukkit
import org.ewsk.searching.api.SearchingApi

val searchingApi: SearchingApi? =
    Bukkit.getServicesManager().load(SearchingApi::class.java)
```

建议在插件 `onEnable` 后再获取，并处理 `null`，因为 Searching 可能未安装或未启用。

## 节点 API

接口：

```kotlin
interface SearchingNodeApi {
    fun findNode(id: NodeId): SearchingNodeView?

    fun findNodeAt(pos: SearchingBlockPos): SearchingNodeView?

    fun createNode(typeId: String, pos: SearchingBlockPos): ApiResult<NodeId>

    fun removeNode(id: NodeId): ApiResult<Boolean>

    fun removeNodeAt(pos: SearchingBlockPos, typeId: String? = null): ApiResult<Boolean>

    fun clearNodes(world: WorldId, typeId: String? = null): ApiResult<Int>

    fun openNode(playerId: PlayerId, nodeId: NodeId): ApiResult<SearchSessionId>
}
```

### 查询节点

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
| `kind` | 节点来源类型 |
| `pos` | 世界坐标 |
| `state` | 当前状态 |
| `openedCount` | 打开次数 |
| `totalValue` | 当前奖励总价值 |

### 创建节点

```kotlin
val result = api.nodes.createNode(
    typeId = "测试箱",
    pos = SearchingBlockPos(WorldId("world"), 100, 64, 100)
)
```

`typeId` 必须存在于 `node_types.yml`。同一坐标不能重复创建搜刮点。

### 移除节点

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

### 清空世界节点

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

### 打开原始搜刮 UI

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
| `NodeRefreshedEvent` | 节点刷新完成 |
| `StatsChangedEvent` | 统计变更事件类型，当前核心统计系统未主动广播 |

监听示例：

```kotlin
import org.ewsk.searching.core.event.ItemRevealedEvent
import taboolib.common.platform.event.SubscribeEvent

object SearchingInternalListener {

    @SubscribeEvent
    fun onItemRevealed(event: ItemRevealedEvent) {
        val playerId = event.playerId
        val item = event.item
    }
}
```

## API 事件订阅

也可以通过 `api.events.subscribe` 订阅 API 层事件：

```kotlin
val subscription = api.events.subscribe { event ->
    when (event) {
        is SearchingApiEvent.NodeOpened -> {
            // 节点打开
        }
        is SearchingApiEvent.SlotRevealed -> {
            // 格子揭示
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

如果你要开发密码保险箱、破解界面、多阶段开锁等附属插件，推荐流程：

1. 监听 `SearchingPreOpenEvent`。
2. 根据 `event.node.typeId` 判断是否接管。
3. `event.isCancelled = true`。
4. 打开自己的 UI 或任务流程。
5. 玩家成功后调用 `api.nodes.openNode(playerId, event.node.id)`。
6. 失败、取消、超时则不要调用 `openNode`。

这样可以保证玩家未通过前置流程时，不会进入 Searching 原始搜刮逻辑，也不会提前开始揭示倒计时。
