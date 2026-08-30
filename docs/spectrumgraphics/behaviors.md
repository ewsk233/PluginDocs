# Behavior 与 Capability

Behavior 是服务端业务 Action 的实现。它接受类型化输入，产生类型化输出、结构化错误和不可变 EffectPlan。Capability 是被明确授权的外部能力，例如经济与背包。

## 在 Pack 中声明

```yaml
features: [ui, behaviors]
actions:
  - shop:purchase
capabilities:
  - spectrumgraphics:economy
  - spectrumgraphics:inventory
```

未在 Pack 清单声明的 Action 不能注册或被客户端调用；未声明的 Capability 不能被 Behavior 使用。

## Behavior 描述文件

`behaviors/purchase.behavior.yml`：

```yaml
schema: spectrumgraphics/behavior/v1
action: shop:purchase
engine: javascript
source: purchase.js
timeoutMillis: 50
idempotent: true
concurrency: serialize

input:
  allowAdditional: false
  fields:
    amount:
      type: integer
      minimum: 1
      maximum: 64
    item:
      type: identifier
      namespace: minecraft
      default: minecraft:diamond
    note:
      type: string
      required: false
      maxLength: 64

output:
  fields:
    receipt: { type: string, minLength: 1, maxLength: 128 }
    balance: { type: number, minimum: 0 }

errors:
  - code: shop:insufficient_funds
    retryable: false
    description: 余额不足

fallback:
  output:
    receipt: 服务暂时不可用
    balance: 0
```

Value schema 支持 boolean、number、integer、string、identifier、color、list、object 等有界类型。输入与输出都会在执行边界验证。

## JavaScript

`purchase.js`：

```javascript
function execute(input, context) {
  var amount = input.amount;
  return {
    output: {
      receipt: "Purchased " + amount + " item(s)",
      balance: 0
    },
    effects: [
      {
        capability: "spectrumgraphics:economy",
        operation: "withdraw",
        input: { amount: amount * 10 }
      },
      {
        capability: "spectrumgraphics:inventory",
        operation: "give",
        input: { material: String(input.item), amount: amount }
      }
    ]
  };
}
```

每次调用使用新的受限 Nashorn 引擎：Java host access 被关闭，class filter 拒绝 JVM 类，也没有 Bukkit 对象、文件或网络 API。脚本只返回 JSON 兼容结构。

## Kether

```yaml
schema: spectrumgraphics/behavior/v1
action: shop:audit
engine: kether
source: audit.kether
timeoutMillis: 25
idempotent: false
concurrency: drop
input: {}
output: {}
```

Kether 只在隔离的 `spectrum` 命名空间解析纯计算动作。命令、玩家、wait、loop、反射、属性访问、JavaScript、JEXL 和显式 namespace 访问会被拒绝。

## 并发、超时与熔断

- `serialize`：同一 Action 顺序执行；
- `drop`：已有执行时拒绝新请求；
- 运行在有界 daemon worker pool；
- 每 Action 有 timeout、队列配额、取消、失败熔断和静态 fallback；
- `/sg stats` 显示调用、成功、失败、超时、拒绝、fallback、平均和最大耗时。

## 幂等

`idempotent: true` 时，请求必须带幂等键。Flow `call` 使用 request ID 作为键：

- 同一个键和相同输入会重放之前结果；
- 同一个键配不同输入会被拒绝；
- 避免网络重试造成重复扣款或发物品。

## Capability 事务

所有 Effect 先 prepare，再一起 commit。如果后续 commit 失败，已经提交的 Effect 按逆序 rollback。

内置 Provider：

| Capability | 操作 |
| --- | --- |
| `spectrumgraphics:economy` | `balance`、`withdraw`、`deposit`，需要 Vault 与经济实现 |
| `spectrumgraphics:inventory` | `count`、`contains`、`take`、`give` |

背包修改使用快照/prepare；组合 Effect 失败时恢复或补偿。不要在脚本中绕过 Capability 直接修改外部状态。

## Kotlin Action

```kotlin
val packId = NamespacedId("shop:main")

SpectrumGraphics.api.extensions.registerBehaviors(packId) {
    action("purchase") {
        input { number("amount", minimum = 0.01) }
        output { string("receipt") }
        error("shop:insufficient_funds")
        idempotent = true
        concurrency = BehaviorConcurrency.SERIALIZE
        handle { _, input ->
            BehaviorDecision(
                output = SpectrumValue.ObjectValue(
                    mapOf("receipt" to SpectrumValue.Text("accepted")),
                ),
            )
        }
    }
}
```

## 自定义 Capability

```kotlin
SpectrumGraphics.api.extensions.registerCapability(
    packId,
    NamespacedId("shop:economy"),
) {
    command("withdraw") {
        input { number("amount", minimum = 0.01) }
        output { number("balance", minimum = 0.0) }
        transactional { _, input, prepared ->
            val amount = input.number("amount")
            prepared.commit {
                // 在主系统中提交，并返回类型化结果
            }
            prepared.rollback {
                // 对已经提交的修改进行补偿
            }
        }
    }
}
```

注册方法返回 `AutoCloseable`，附属插件卸载时必须关闭。

## 测试

`HeadlessBehaviorHost` 可以在没有 Bukkit/Minecraft 的环境中运行生产 Router、schema、幂等缓存、Capability 和事务引擎。至少测试：

- 正常成功和所有声明错误；
- 输入/输出边界；
- 同一幂等键重放与冲突；
- timeout、queue full、circuit open 与 fallback；
- 第二个 Effect 失败时前一个是否正确回滚；
- Pack disable/unload 后请求是否被拒绝。
