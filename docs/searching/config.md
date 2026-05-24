# Searching 配置文件

Searching 配置文件如下：

| 文件 | 作用 |
| --- | --- |
| `config.yml` | 基础设置、统计存储、搜索动画 |
| `node_types.yml` | 搜刮箱类型 |
| `tables.yml` | 奖励表和物品池 |
| `items.yml` | 可抽取物品 |
| `tiers.yml` | 物品品质 |
| `refresh.yml` | 刷新策略和悬浮字模板 |

## 通用写法

范围值支持两种格式：

```yaml
amount: 1
amount: 2-5
rolls: 0-4
```

注意：

- `tables.*.rolls` 可以从 0 开始，`0-4` 表示可能抽 0 次，因此搜刮箱可能为空。
- `items.*.amount` 必须大于 0。
- ID 可以使用中文，但必须保持引用完全一致。
- 推荐使用 UTF-8 保存配置文件。

## config.yml

```yaml
config-version: 1
debug: false
language: zh_CN

progress:
  level-expression: "1 + (exp / 100) ^ 0.5"

stats:
  storage:
    type: sqlite
    sqlite-file: searching.db
    host: 127.0.0.1
    port: 3306
    database: searching
    user: root
    password: ""

search-animation:
  enabled: true
  start-sound: UI_BUTTON_CLICK
  hidden-item:
    item: BLACK_STAINED_GLASS_PANE
    name: "&7未搜索"
    lore:
      - "&8等待搜索"
    custom-model-data: -1
  frames:
    -
      item: YELLOW_STAINED_GLASS_PANE
      name: "&e搜索中"
      lore:
        - "&e33%"
    -
      item: ORANGE_STAINED_GLASS_PANE
      name: "&6搜索中.."
      lore:
        - "&e66%"
    -
      item: RED_STAINED_GLASS_PANE
      name: "&c搜索中..."
      lore:
        - "&e99%"
```

字段说明：

| 路径 | 说明 |
| --- | --- |
| `config-version` | 配置版本，当前为 `1` |
| `debug` | 是否输出调试信息 |
| `language` | 语言文件 ID，例如 `zh_CN` |
| `progress.level-expression` | 等级表达式，可使用 `level`、`currentLevel`、`exp`、`totalExp` |
| `stats.storage.type` | `sqlite` 或 `mysql` |
| `stats.storage.sqlite-file` | SQLite 文件名 |
| `search-animation.enabled` | 是否启用搜索揭示动画 |
| `search-animation.start-sound` | 开始搜索某个格子时播放的 Bukkit Sound |
| `search-animation.hidden-item` | 未搜索格子的占位物品 |
| `search-animation.frames` | 搜索过程中的动画帧 |

## node_types.yml

```yaml
示例搜索箱:
  display-name: "&e示例搜索箱"
  table: 搜索箱
  refresh-policy: default_cooldown
  slots: 27
  hologram-id: default
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `display-name` | 搜刮界面标题和显示名 |
| `table` | 引用 `tables.yml` 中的奖励表 ID |
| `refresh-policy` | 引用 `refresh.yml` 中的刷新策略 ID，可不填 |
| `slots` | 搜刮 UI 槽位数，必须大于 0 |
| `hologram-id` | 使用的悬浮字模板 ID，可不填 |

兼容写法：加载器也兼容 `displayName`、`refreshPolicy`、`hologramId`。

## tables.yml

```yaml
tables:
  搜索箱:
    root-pool: 基础物品池
    rolls: 2-4
    modifiers:
      - tier: 稀有
        weight-script: 'calc "weight + 2"'

  可能为空的搜索箱:
    root-pool: 基础物品池
    rolls: 0-4

  VIP奖励箱:
    root-pool: 高级物品池
    rolls: 2-3
    modifiers:
      - tier: 神话
        condition: 'check perm "searching.vip"'
        weight-script: 'calc "weight * 2"'

pools:
  基础物品池:
    modifiers:
      - tier: 稀有
        weight-script: 'calc "weight + 1"'
    entries:
      - item: 圆石
      - item: 煤炭
        weight: 10
      - pool: 稀有物品池
        weight: 2
        weight-condition: 'check perm "searching.vip"'
        weight-script: 'calc "weight + 2"'

  稀有物品池:
    entries:
      - item: 钻石
      - item: 绿宝石
```

字段说明：

| 路径 | 说明 |
| --- | --- |
| `tables.<id>.root-pool` | 根物品池 ID |
| `tables.<id>.rolls` | 抽取次数，支持 `固定值` 或 `最小-最大` |
| `tables.<id>.modifiers` | 表级动态权重修饰器，影响该表抽到的所有池条目 |
| `pools.<id>.modifiers` | 池级动态权重修饰器，只影响该池内条目 |
| `pools.<id>.entries[].item` | 引用 `items.yml` 中的物品 ID |
| `pools.<id>.entries[].pool` | 引用另一个物品池 ID |
| `pools.<id>.entries[].weight` | 权重，不填时物品使用品质权重，子池默认为 1 |
| `pools.<id>.entries[].condition` | 条目可用条件，不满足时该条目本轮不参与抽取，等价于本轮权重为 0 |
| `pools.<id>.entries[].weight-condition` | 条目动态权重条件，只控制该条 `weight-script` 是否执行 |
| `pools.<id>.entries[].weight-script` | 条目动态权重脚本，脚本结果作为最终权重 |
| `tables.<id>.modifiers[].condition` | 表级权重修改条件，不满足时跳过该 modifier |
| `pools.<id>.modifiers[].condition` | 池级权重修改条件，不满足时跳过该 modifier |

一个 entry 必须且只能配置 `item` 或 `pool` 其中之一。

### 动态爆率

动态爆率基于 Kether 脚本执行。`weight-script` 必须返回一个数字，常见写法是 `calc "weight * 2"`；插件会把结果转成整数权重，结果小于等于 0 时，该条目本轮不会参与抽取。

权重计算顺序：

```text
entry.condition 可用性检查
-> entry.weight 或品质默认 weight
-> table.modifiers
-> pool.modifiers
-> entry.weight-condition 判断
-> entry.weight-script
-> 最终权重
```

`entries[].condition` 是硬条件：不满足时该条目本轮直接不可抽取，也不会继续执行该条目的 `weight-script`。`modifiers[].condition` 只判断对应 modifier 是否执行。`entries[].weight-condition` 只判断该条目的 `weight-script` 是否执行；不满足时保留经过表级/池级 modifier 后的当前权重。

可用权重变量：

| 变量 | 含义 |
| --- | --- |
| `baseWeight` | 条目原始权重，永远不变 |
| `weight` | 当前权重，已经包含前面修饰器的结果 |
| `currentWeight` | `weight` 的别名 |

可用上下文变量：

| 变量 | 含义 |
| --- | --- |
| `tableId` | 当前奖励表 ID |
| `poolId` | 当前物品池 ID |
| `rootPoolId` | 根物品池 ID |
| `itemRef` | 当前物品引用，仅物品条目有值 |
| `tier` / `tierId` | 当前物品品质，仅物品条目有值 |
| `entryType` | `item` 或 `pool` |
| `nestedPoolId` | 子池 ID，仅子池条目有值 |
| `nodeType` / `nodeTypeId` | 搜刮箱类型 |
| `world` | 世界名 |
| `x` / `y` / `z` | 节点坐标 |
| `slotCount` | 搜刮 UI 槽位数 |
| `rollIndex` | 当前第几次抽取，从 0 开始 |
| `playerId` | 触发本轮生成的玩家 UUID 字符串 |

权限判断可以写在 `modifiers[].condition`、`entries[].condition` 或 `entries[].weight-condition` 中，按对应字段语义生效。`perm` 是 Kether 动作，`"searching.vip"` 是传给它的权限参数：

```yaml
condition: 'check perm "searching.vip"'
```

`check` 用于比较两个值，例如判断世界名：

```yaml
condition: 'check get world == *world_nether'
```

`*` 本身不是通用“转数字”标记，而是在 Kether 语法层把后面的 token 作为字面量传给动作；最终返回类型由具体动作决定。PAPI 动作常见写法：

| 写法 | 返回值 |
| --- | --- |
| `papi "%xxx%"` | 字符串 |
| `papi *"%xxx%"` | 数字 |
| `papi bool "%xxx%"` | 布尔值 |

表级按品质批量提高 VIP 高品质爆率：

```yaml
tables:
  Boss奖励:
    root-pool: Boss奖励池
    rolls: 2-3
    modifiers:
      - tier: 神话
        condition: 'check perm "searching.vip"'
        weight-script: 'calc "weight * 2"'
      - tier: 史诗
        condition: 'check perm "searching.vip"'
        weight-script: 'calc "weight + 3"'
```

池级只提高某个池内的稀有物品爆率：

```yaml
pools:
  稀有物品池:
    modifiers:
      - tier: 稀有
        weight-script: 'calc "weight + 2"'
    entries:
      - item: 钻石
      - item: 绿宝石
```

条目级直接覆盖单个物品爆率：

```yaml
pools:
  Boss奖励池:
    entries:
      - item: 下界之星
        weight: 1
        weight-condition: 'check perm "searching.vip"'
        weight-script: 'calc "baseWeight * 5"'
```

注意：

- `tier` 修饰器只匹配具体物品条目；子池条目本身没有品质，不会被 `tier` 命中。
- 静态配置节点在创建或刷新后处于待生成状态，首次打开该轮节点的玩家会提供权限上下文。因此 VIP 爆率影响的是“本轮首次打开生成内容”的结果。
- 已经生成内容的节点不会因为后续其他玩家权限不同而重新计算，直到下一次刷新。
- API 自定义节点如果直接传入槽位和物品，则不会再经过配置表动态爆率计算。

## items.yml

```yaml
钻石:
  item: "minecraft:diamond"
  tier: 稀有
  amount: 1-2
  value: 40
  reveal-ticks: 0
  exp: 8.0
  name: "&b钻石"
  lore:
    - "&7稀有的矿物奖励"
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `item` | 物品引用。原版物品可写 `minecraft:diamond` |
| `tier` | 引用 `tiers.yml` 中的品质 ID |
| `amount` | 数量范围，必须大于 0 |
| `value` | 价值，用于节点总价值统计 |
| `reveal-ticks` | 搜索揭示时间，20 ticks = 1 秒。配置为 0 时继承品质时间 |
| `exp` | 玩家揭示该物品后获得的经验 |
| `name` | 物品显示名 |
| `lore` | 物品 Lore |
| `metadata` | 额外元数据，供物品适配器扩展 |

兼容写法：`item` 也可以写作 `ref` 或 `material`。

## tiers.yml

```yaml
普通:
  weight: 80
  reveal-ticks: 20
  exp: 1.0
  display-name: "&f普通"
  search-sound: "ENTITY_ITEM_PICKUP"

稀有:
  weight: 18
  reveal-ticks: 40
  exp: 4.0
  display-name: "&b稀有"
  search-sound: "ENTITY_PLAYER_LEVELUP"
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `weight` | 当物品池 entry 未填写 weight 时，使用该品质权重 |
| `reveal-ticks` | 物品 `reveal-ticks: 0` 时继承该值 |
| `exp` | 品质经验字段，当前物品实际经验以 `items.yml` 的 `exp` 为准 |
| `display-name` | 品质显示名 |
| `search-sound` | 物品揭示完成时播放的 Bukkit Sound |

兼容写法：`reveal-ticks` 也可以写作 `ticks`，`display-name` 也可以写作 `name`。

## refresh.yml

```yaml
refreshPolicies:
  default_cooldown:
    type: cooldown
    cooldownSeconds: 60
    scope: node

hologram:
  enabled: true
  provider: DecentHolograms
  defaultId: default
  holograms:
    default:
      offset:
        x: 0.0
        y: 1.6
        z: 0.0
      lines:
        - "&e{type}"
        - "&7{state}"
        - "&b{time}"
```

刷新策略字段：

| 字段 | 说明 |
| --- | --- |
| `type` | `never`、`cooldown` 或 `cron` |
| `cooldownSeconds` | 冷却秒数，会转换为 ticks |
| `cooldown-ticks` | 也可以直接写 ticks |
| `cron` | cron 表达式 |
| `scope` | `node`、`world` 或 `global` |

当前运行时推荐使用 `cooldown` 或 `never`。`cron` 配置会通过校验，但运行时尚未接入 cron 计算器。

悬浮字字段：

| 字段 | 说明 |
| --- | --- |
| `hologram.enabled` | 是否启用悬浮字 |
| `hologram.provider` | Provider 名称，当前默认 `DecentHolograms` |
| `hologram.defaultId` | 默认模板 ID |
| `hologram.holograms.<id>.offset` | 相对搜刮点坐标偏移 |
| `hologram.holograms.<id>.lines` | 显示文本 |

悬浮字可用变量：

| 变量 | 含义 |
| --- | --- |
| `{type}` | 搜刮箱类型显示名 |
| `{state}` | 当前搜刮状态 |
| `{time}` | 剩余刷新时间 |
| `{seconds}` | 剩余刷新秒数 |

## 最小可用示例

```yaml
# node_types.yml
测试箱:
  display-name: "&a测试箱"
  table: 测试表
  refresh-policy: test_refresh
  slots: 27
```

```yaml
# tables.yml
tables:
  测试表:
    root-pool: 测试池
    rolls: 1-3

pools:
  测试池:
    entries:
      - item: 测试钻石
        weight: 1
```

```yaml
# items.yml
测试钻石:
  item: "minecraft:diamond"
  tier: 普通
  amount: 1
  value: 10
  reveal-ticks: 20
  exp: 1.0
  name: "&b测试钻石"
```

```yaml
# tiers.yml
普通:
  weight: 1
  reveal-ticks: 20
  exp: 1.0
  display-name: "&f普通"
```

```yaml
# refresh.yml
refreshPolicies:
  test_refresh:
    type: cooldown
    cooldownSeconds: 60
    scope: node

hologram:
  enabled: false
  provider: DecentHolograms
  defaultId: default
  holograms: {}
```

创建搜刮点：

```text
/searching node create 测试箱
```
