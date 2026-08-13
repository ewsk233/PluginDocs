# 状态、表达式与 Flow

SpectrumGraphics 把视觉状态分为四个作用域，并在编译期检查类型和写权限。

## 状态声明

```yaml
state:
  page:
    type: number
    scope: local
    default: 0
  profile.name:
    type: string
    scope: document
    default: Adventurer
    source:
      placeholder: "%player_name%"
  profile.rank:
    type: string
    scope: player
    default: Novice
    source:
      type: custom
      value: example:profile
      arguments: { field: rank }
      cost: 2
  server.motto:
    type: string
    scope: pack
    default: Welcome
```

| scope | 所有者 | Flow 可写 |
| --- | --- | --- |
| `local` | 当前客户端文档 | 是 |
| `document` | 服务端当前文档 | 否 |
| `player` | 服务端玩家范围 | 否 |
| `pack` | 服务端 Pack 共享范围 | 否 |

常用类型为 `boolean`、`number`、`string`、`color`。服务器状态通过初始 snapshot 和有 revision/hash 的 patch 下发。

Placeholder 源在服务端解析。自定义源必须由附属插件通过 `registerDataSource` 注册，并声明足够的 cost；单次解析有总成本预算。

## computed

```yaml
computed:
  doubled: "= state.page * 2"
  canGoBack:
    type: boolean
    value: "= state.page > 0"
  title:
    type: string
    value: "= state.profile.name + ' · 第 ' + state.page + ' 页'"
```

computed 是只读派生状态。编译器提取精确依赖图、检查类型并拒绝循环；状态变化只让依赖它的节点失效。

## binding、when 与表达式

```yaml
title:
  type: text
  text: 默认标题
  when: "= state.page >= 0"
  bind:
    text: title
    visible: "= state.page < 10"
    opacity: "= state.canGoBack ? 1 : 0.5"
```

- 直接状态引用可写 `title` 或 `state.title`，具体位置应沿用生成 schema 与示例；
- 以 `=` 开头的是强类型表达式；
- 表达式被编译成受限字节码，不接触 JavaScript、JVM、文件、网络或任意数据包；
- `when` 控制节点是否存在；`visible` 只控制可见性，两者语义不同。

## Flow 基础

```yaml
flows:
  nextPage:
    concurrency: replace
    debounceMillis: 0
    throttleMillis: 50
    steps:
      - set: { state: page, value: "= state.page + 1" }
      - if:
          condition: "= state.page >= 5"
          then: reachedEnd
          else: playSound

  reachedEnd:
    - set: { state: status, value: 已到最后一页 }

  playSound:
    - effect:
        id: spectrumgraphics:sound-play
        arguments:
          sound: minecraft:ui.button.click
          volume: 0.7
          pitch: 1.1
```

Flow 在客户端 tick 调度，不创建脚本线程，不阻塞渲染线程。

## 指令表

| 指令 | 用途 |
| --- | --- |
| `set` | 写入 `local` 状态 |
| `toggle` | 翻转本地 boolean |
| `if` | 条件选择后续 Flow |
| `switch` | 按标量值选择后续 Flow |
| `sequence` | 按声明顺序运行多个 Flow |
| `parallel` | 同一 tick 启动多个独立 Flow |
| `delay` | 延迟一次执行，不阻塞线程 |
| `every` | 有次数上限的周期执行 |
| `command` | `focus`、`blur`、`scroll-to`、`set-text` |
| `effect` | 调用已注册、受权限和预算限制的客户端 Effect |
| `animation` | 控制 transition/timeline/statechart |
| `call` | 调用强类型服务端 Action，并等待结果 |
| `close` | 请求关闭当前 Minecraft Screen |

## 并发、去抖与节流

| concurrency | 行为 |
| --- | --- |
| `replace` | 新调用取消并替换旧调用，默认值 |
| `drop` | 运行中时丢弃新调用 |
| `queue` | 排队顺序执行 |
| `parallel` | 允许并行实例 |

```yaml
flows:
  searchChanged:
    concurrency: replace
    debounceMillis: 150
    steps:
      - set: { state: status, value: 正在搜索 }
```

高频输入使用 debounce；滚动、拖动或连续数值变化使用 throttle；有业务副作用的 Action 通常用 `drop` 或 `queue`。

## 调用服务端 Action

```yaml
flows:
  purchase:
    - call:
        action: shop:purchase
        input:
          amount: "= state.amount"
        result:
          receipt: state.receipt
          balance: state.balance
        error:
          code: state.errorCode
          message: state.errorMessage
          retryable: state.retryable
        onSuccess: purchaseSucceeded
        onError: purchaseFailed
```

`call` 暂停当前 Flow。请求包含 request ID、文档 revision、Action ID 和有界类型输入；服务端验证 Pack 声明、ActionContract 和幂等键后返回类型化结果或结构化错误。

## 快捷键与生命周期

```yaml
shortcuts:
  submit:
    key: enter
    flow: purchase
    trigger: press
    modifiers: [shift]
    consume: true
  closeWithEscape:
    key: escape
    flow: closeScreen

lifecycle:
  onOpen: initialize
  onClose: leaving
  onMount: mounted
  onUnmount: unmounted
```

`onOpen/onClose` 对应文档生命周期；`onMount/onUnmount` 对应文档附着或脱离某个匹配的 Minecraft Screen。

## 内置客户端 Effect 示例

```yaml
- effect: { id: spectrumgraphics:screen-close, arguments: {} }
- effect: { id: spectrumgraphics:hud-visible, arguments: { element: player-status, visible: true } }
- effect: { id: spectrumgraphics:image-animation-restart, arguments: { source: example:logo.gif } }
- effect: { id: spectrumgraphics:container-click, arguments: { node: proxy/quick_move, button: 0 } }
```

Effect 不是任意客户端脚本。每个 Effect 都经过协商、权限、频率和加权资源预算检查；敏感 Effect 可能需要更严格授权。
