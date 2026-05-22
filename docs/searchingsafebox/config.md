# SearchingSafeBox 配置文件

SearchingSafeBox 使用单个配置文件：

```text
plugins/SearchingSafeBox/config.yml
```

## 完整示例

```yaml
settings:
  debug: false

safeboxes:
  Boss奖励箱:
    enabled: true
    unlock-ui: "default"
    title: "&c保险箱破译"
    auto-unlock: true
    auto-unlock-seconds: 30
    open-immediately-on-success: true
    unlock-timeout-seconds: 90
    consume-on-fail: false
    cooldown-seconds: 3
    permission: ""
    messages:
      locked: "&c这个保险箱被加密保护，需要先破译。"
      unlocked: "&a破译成功，正在打开保险箱。"
      failed: "&c破译失败。"
      auto-unlocked: "&a自动破译完成。"

  实验室保险库:
    enabled: true
    unlock-ui: "default"
    title: "&c实验室保险库破译"
    auto-unlock: false
    auto-unlock-seconds: 0
    open-immediately-on-success: true
    unlock-timeout-seconds: 90
    consume-on-fail: false
    cooldown-seconds: 5
    permission: "searchingsafebox.lab"
    messages:
      locked: "&c这个保险库被加密保护，需要先破译。"
      unlocked: "&a破译成功，正在打开保险库。"
      failed: "&c破译失败。"
      auto-unlocked: "&a自动破译完成。"
```

## settings

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `settings.debug` | `false` | 是否启用调试标记。当前核心流程主要保留该字段供扩展使用 |

## safeboxes

`safeboxes` 下的键名必须等于 Searching 的 `nodeTypeId`。

例如 Searching 的 `node_types.yml` 中存在：

```yaml
Boss奖励箱:
  display-name: "&dBoss奖励箱"
  table: Boss奖励
  refresh-policy: default_cooldown
  slots: 27
```

那么 SearchingSafeBox 中应写：

```yaml
safeboxes:
  Boss奖励箱:
    enabled: true
    unlock-ui: "default"
```

## 规则字段

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `enabled` | `true` | 是否启用该 `nodeTypeId` 的保险箱规则 |
| `unlock-ui` | `default` | 使用的 UI Provider ID |
| `title` | `&c保险箱破译` | 默认破译界面标题 |
| `auto-unlock` | `false` | 是否启用自动破译读条 |
| `auto-unlock-seconds` | `0` | 自动破译耗时，单位秒，小于 0 会按 0 处理 |
| `open-immediately-on-success` | `true` | 已解析的兼容字段；当前实现手动成功始终立即打开原搜刮箱 |
| `unlock-timeout-seconds` | `60` | 最大破译时间，最小为 1 秒 |
| `consume-on-fail` | `false` | 默认 UI 输入错误时是否直接失败 |
| `cooldown-seconds` | `0` | 同一玩家对同一节点再次尝试的冷却，单位秒 |
| `permission` | 空 | 打开该保险箱需要的权限，空字符串表示不限制 |
| `messages` | 空 | 当前规则的提示消息 |

兼容写法：

- `unlock-ui` 也可以写作 `unlockUi`
- `auto-unlock` 也可以写作 `autoUnlock`
- `auto-unlock-seconds` 也可以写作 `autoUnlockSeconds`
- `open-immediately-on-success` 也可以写作 `openImmediatelyOnSuccess`
- `unlock-timeout-seconds` 也可以写作 `unlockTimeoutSeconds`
- `consume-on-fail` 也可以写作 `consumeOnFail`
- `cooldown-seconds` 也可以写作 `cooldownSeconds`

## messages

当前默认流程会读取以下消息键：

| 键 | 触发时机 |
| --- | --- |
| `locked` | 玩家进入破译流程时 |
| `unlocked` | 手动破译成功时 |
| `failed` | 破译失败时 |
| `auto-unlocked` | 自动破译完成时 |

示例：

```yaml
messages:
  locked: "&c这个保险箱被加密保护，需要先破译。"
  unlocked: "&a破译成功，正在打开保险箱。"
  failed: "&c破译失败。"
  auto-unlocked: "&a自动破译完成。"
```

缺省时会使用代码中的 fallback 文本。

## 自动破译配置

启用自动破译：

```yaml
auto-unlock: true
auto-unlock-seconds: 30
```

关闭自动破译：

```yaml
auto-unlock: false
auto-unlock-seconds: 0
```

关闭后，玩家必须通过 UI 调用 `context.success()` 才能打开原搜刮箱。

## 权限配置

不限制权限：

```yaml
permission: ""
```

限制权限：

```yaml
permission: "searchingsafebox.lab"
```

当玩家没有权限时，SearchingSafeBox 已经取消了原 Searching 打开流程，因此玩家不会绕过保险箱进入原搜刮 UI。

## 冷却配置

```yaml
cooldown-seconds: 3
```

冷却键由玩家 UUID 和节点引用组成。冷却只限制同一玩家重复尝试同一个节点，不限制其他玩家尝试。

## 超时配置

```yaml
unlock-timeout-seconds: 90
```

会话超时后会被取消，不会打开原搜刮箱。该值最小为 1 秒。

## 最小配置

```yaml
settings:
  debug: false

safeboxes:
  Boss奖励箱:
    enabled: true
    unlock-ui: "default"
    title: "&c保险箱破译"
    auto-unlock: false
    unlock-timeout-seconds: 60
```
