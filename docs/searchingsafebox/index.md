# SearchingSafeBox 保险箱附属

SearchingSafeBox 是 Searching 的附属插件，用于给指定 `nodeTypeId` 的搜刮箱增加“密码保险箱 / 破译开锁”流程。它的机制是监听 Searching 的 `SearchingPreOpenEvent`，在玩家进入原始搜刮 UI 前接管打开流程。

项目仓库：[ewsk233/SearchingSafeBox](https://github.com/ewsk233/SearchingSafeBox)

## 工作流程

1. 玩家右键 Searching 搜刮点。
2. Searching 触发 `SearchingPreOpenEvent`。
3. SearchingSafeBox 读取 `event.node.typeId`。
4. 如果 `typeId` 命中 `config.yml` 的 `safeboxes` 规则，并且规则启用，则继续判断是否需要破译。
5. 默认 Bridge 只在节点状态为 `Unsearched` 时要求破译。
6. 插件取消原 Searching 打开流程，创建 `UnlockSession`。
7. 打开配置指定的 `UnlockUIProvider`。
8. 玩家破译成功，或自动破译完成后，继续经过 Searching 打开前检查，再打开原搜刮箱。
9. 会话被清理。

这意味着：已经打开过、但尚未被 Searching 刷新的节点，不会再次进入破译界面。节点刷新回 `Unsearched` 后，下次打开会重新要求破译。

## 默认破译 UI

默认 UI Provider ID：

```text
default
```

默认 UI 是一个三位数字密码界面：

- 发光数字表示本轮密码会出现的数字。
- 密码由两个相同数字和一个不同数字组成，并随机打乱顺序。
- 点击数字后，上方 3 个输入槽会显示正确或错误。
- `退格` 会把上一位输入槽恢复为灰色“待输入”。
- 输入正确后关闭界面，并调用 `context.success()`。
- 输入错误时，如果 `consume-on-fail: true`，本次破译失败；否则短暂显示错误后重置输入槽。
- 关闭破译界面会取消当前会话。

默认 UI 是可替换实现，正式项目可以注册自己的 `UnlockUIProvider`。

## 自动破译

如果规则启用了 `auto-unlock`，插件会在破译界面底部 9 格显示自动破译进度：

- 灰色：等待中
- 绿色：已完成进度
- 总槽位固定为 9
- `auto-unlock-seconds: 9` 时，大约每秒点亮 1 格
- 读条完成后触发自动破译完成，并打开原 Searching 搜刮箱

进度计算逻辑：

```kotlin
val totalTicks = autoUnlockSeconds * 20
val slotIntervalTicks = max(1, totalTicks / 9)
val progressSlots = min(9, elapsedTicks / slotIntervalTicks)
```

## 手动成功行为

当前实现中，UI 调用 `context.success()` 后会进入原 Searching 搜刮箱打开流程，并清理会话。与房卡、权限门禁等附属联动时，破译完成后仍会经过打开前检查。

`open-immediately-on-success` 字段已被配置系统解析，但当前 Manager 没有基于该字段做延迟打开分支。因此现版本应按“手动破译成功后立即打开”理解。

## 会话生命周期

同一玩家同时只能存在一个破译会话。以下情况会清理会话：

- 玩家破译成功
- 自动破译完成
- 玩家破译失败
- 玩家关闭破译界面
- 玩家退出服务器
- 解锁超时
- 插件重载配置
- 插件关闭
- 管理员执行 session clear 命令

会话状态：

| 状态 | 含义 |
| --- | --- |
| `CREATED` | 已创建 |
| `OPENING_UI` | 正在打开 UI |
| `UNLOCKING` | 破译中 |
| `SUCCESS` | 手动破译成功 |
| `FAILED` | 破译失败 |
| `CANCELLED` | 被取消 |
| `EXPIRED` | 超时 |
| `AUTO_UNLOCKED` | 自动破译完成 |
| `OPENED` | 已打开原搜刮箱 |

## 命令

主命令：

```text
/searchingsafebox
```

别名：

```text
/ssafebox
/safebox
```

命令列表：

| 命令 | 说明 | 权限 |
| --- | --- | --- |
| `/searchingsafebox reload` | 重载配置并清理当前破译会话 | `searchingsafebox.command.reload` |
| `/searchingsafebox debug <nodeTypeId>` | 查看指定保险箱规则解析结果 | `searchingsafebox.command.debug` |
| `/searchingsafebox ui list` | 查看已注册 UI Provider | `searchingsafebox.command.ui` |
| `/searchingsafebox session list` | 查看当前活跃破译会话 | `searchingsafebox.command.session` |
| `/searchingsafebox session clear <player>` | 清理指定玩家的破译会话 | `searchingsafebox.command.session` |

主命令权限：

```text
searchingsafebox.command
```

该权限默认 OP 拥有。

## 文档导航

- [配置文件](./config.md)
- [开发 API](./api.md)
