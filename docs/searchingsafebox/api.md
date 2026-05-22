# SearchingSafeBox 开发 API

SearchingSafeBox 的扩展重点是 UI Provider、Bridge 和 Bukkit 事件。具体破解小游戏不应该写进 Manager，而应通过 `UnlockUIProvider` 插拔。

## 入口对象

插件入口：

```kotlin
object SearchingSafeBox : Plugin()
```

常用公开成员：

```kotlin
SearchingSafeBox.config
SearchingSafeBox.uiRegistry
SearchingSafeBox.sessionStore
SearchingSafeBox.manager
SearchingSafeBox.bridge
```

判断插件是否初始化完成：

```kotlin
if (!SearchingSafeBox.isReady()) {
    return
}
```

## 注册 UI Provider

接口：

```kotlin
interface UnlockUIProvider {
    val id: String

    fun open(context: UnlockContext)
}
```

注册示例：

```kotlin
import org.ewsk.searchingsafebox.SearchingSafeBox
import org.ewsk.searchingsafebox.api.unlock.UnlockContext
import org.ewsk.searchingsafebox.api.unlock.UnlockUIProvider

object TerminalHackProvider : UnlockUIProvider {
    override val id: String = "terminal_hack"

    override fun open(context: UnlockContext) {
        // 打开你的破解 UI
        // 成功：context.success()
        // 失败：context.fail("wrong-password")
        // 取消：context.cancel("close")
    }
}

fun registerProvider() {
    SearchingSafeBox.uiRegistry.register(TerminalHackProvider)
}
```

配置中使用：

```yaml
safeboxes:
  实验室保险库:
    unlock-ui: "terminal_hack"
```

Registry 会把 Provider ID 转成小写保存，因此建议 ID 使用小写字母、数字、下划线。

## UnlockContext

接口：

```kotlin
interface UnlockContext {
    val player: Player
    val session: UnlockSession
    val rule: SafeBoxRule

    fun success()

    fun fail(reason: String? = null)

    fun cancel(reason: String? = null)
}
```

调用含义：

| 方法 | 结果 |
| --- | --- |
| `success()` | 标记手动破译成功，取消自动破译任务，打开原 Searching 搜刮箱 |
| `fail(reason)` | 标记失败，取消自动破译和超时任务，清理会话，不打开原搜刮箱 |
| `cancel(reason)` | 标记取消，取消自动破译和超时任务，清理会话，不打开原搜刮箱 |

UI Provider 不应直接调用 Searching API 打开原搜刮箱，应统一通过 `UnlockContext` 回调结果。

## 自定义 UI 注意事项

推荐做法：

- 打开 UI 后先取消玩家点击事件。
- 玩家关闭 UI 时调用 `context.cancel("inventory-close")`。
- 执行回调前检查 `context.session.isActive()`。
- 成功后关闭自己的 UI，再延迟 1 tick 调用 `context.success()`，避免和 InventoryClose 逻辑互相影响。
- 不要在 UI 内维护全局玩家状态，优先使用 `UnlockSession` 或自己的 session 映射。

最小示例：

```kotlin
override fun open(context: UnlockContext) {
    val player = context.player

    // 这里只演示逻辑，实际应打开你的 GUI
    if (context.session.isActive()) {
        context.success()
    }
}
```

## 替换 Searching Bridge

Bridge 负责判断节点是否需要破译，以及破译完成后如何打开原 Searching 搜刮箱。

接口：

```kotlin
interface SearchingOpenBridge {
    fun requiresUnlock(node: Any): Boolean {
        return true
    }

    fun openOriginal(player: Player, node: Any)
}
```

注册：

```kotlin
SearchingSafeBox.registerBridge(MySearchingOpenBridge())
```

默认实现行为：

- `node` 是 `SearchingNodeView` 时，只有 `state == "Unsearched"` 才需要破译。
- 打开原搜刮箱时，通过 Bukkit `ServicesManager` 获取 `SearchingApi`。
- 调用 `api.nodes.openNode(PlayerId(player.uniqueId.toString()), view.id)`。

如果你需要改变“哪些状态需要破译”，可以覆盖 `requiresUnlock`：

```kotlin
class AlwaysUnlockBridge : SearchingOpenBridge {
    override fun requiresUnlock(node: Any): Boolean {
        return true
    }

    override fun openOriginal(player: Player, node: Any) {
        // 自行接入 Searching API
    }
}
```

## 事件

SearchingSafeBox 提供以下 Bukkit 平台事件，均继承 `BukkitProxyEvent`：

| 事件 | 触发时机 |
| --- | --- |
| `SafeBoxUnlockStartEvent` | 会话创建后、打开 UI 前 |
| `SafeBoxUnlockSuccessEvent` | 手动破译成功后 |
| `SafeBoxUnlockFailEvent` | 破译失败后 |
| `SafeBoxUnlockCancelEvent` | 会话被取消后 |
| `SafeBoxAutoUnlockCompleteEvent` | 自动破译完成后 |
| `SafeBoxOpenOriginalEvent` | 即将调用 Bridge 打开原搜刮箱前 |

监听示例：

```kotlin
import org.ewsk.searchingsafebox.event.SafeBoxUnlockSuccessEvent
import taboolib.common.platform.event.SubscribeEvent

object SafeBoxListener {

    @SubscribeEvent
    fun onSuccess(event: SafeBoxUnlockSuccessEvent) {
        val player = event.player
        val rule = event.rule
        val session = event.session
    }
}
```

Manager 当前会读取取消结果的事件：

| 事件 | 取消后的行为 |
| --- | --- |
| `SafeBoxUnlockStartEvent` | 取消会话，不打开 UI |
| `SafeBoxOpenOriginalEvent` | 取消打开原搜刮箱，并取消会话 |

其他事件即使被取消，也不会改变当前 Manager 流程。

## 会话对象

```kotlin
data class UnlockSession(
    val sessionId: UUID,
    val player: UUID,
    val nodeTypeId: String,
    val nodeRef: Any,
    val rule: SafeBoxRule,
    val startTime: Long,
    val expiresAt: Long,
    var state: UnlockState,
    var autoUnlockTaskId: Int? = null,
    var autoUnlockProgress: Int = 0,
    var timeoutTaskId: Int? = null
)
```

判断会话是否仍可操作：

```kotlin
if (context.session.isActive()) {
    context.success()
}
```

`isActive()` 为 true 的状态：

- `CREATED`
- `OPENING_UI`
- `UNLOCKING`
- `SUCCESS`

## 规则对象

```kotlin
data class SafeBoxRule(
    val nodeTypeId: String,
    val enabled: Boolean,
    val title: String,
    val unlockUi: String,
    val autoUnlock: Boolean,
    val autoUnlockSeconds: Int,
    val openImmediatelyOnSuccess: Boolean,
    val unlockTimeoutSeconds: Int,
    val consumeOnFail: Boolean,
    val cooldownSeconds: Int,
    val permission: String?,
    val messages: Map<String, String>
)
```

读取规则：

```kotlin
val rule = SearchingSafeBox.config.getRule("Boss奖励箱")
```

列出所有规则：

```kotlin
val rules = SearchingSafeBox.config.allRules()
```

## 消息工具

```kotlin
SafeBoxMessages.send(player, "&a带插件前缀的消息")
SafeBoxMessages.sendRaw(player, "&a不带插件前缀的消息")
SafeBoxMessages.color("&a彩色文本")
```

规则消息：

```kotlin
SafeBoxMessages.sendRule(
    player = player,
    rule = rule,
    key = "locked",
    fallback = "&c这个保险箱被加密保护，需要先破译。"
)
```

## 与 Searching 的关系

SearchingSafeBox 自己不会生成搜刮箱，也不会修改 Searching 的节点数据。它只在 `SearchingPreOpenEvent` 阶段接管打开动作。

如果玩家没有通过破译流程，插件不会调用 Searching API 的 `openNode`，因此：

- 不会进入 Searching 原始搜刮 UI。
- 不会启动 Searching 的物品揭示倒计时。
- 不会提前增加 Searching 的打开统计。

破译成功后，默认 Bridge 通过 Searching API 打开原节点，后续奖励生成、揭示、领取、刷新和统计仍由 Searching 负责。
