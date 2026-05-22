# Searching 配置文件

Searching 使用拆分配置文件。当前稳定加载的文件如下：

| 文件 | 作用 |
| --- | --- |
| `config.yml` | 基础设置、统计存储、搜索动画 |
| `node_types.yml` | 搜刮箱类型 |
| `tables.yml` | 奖励表和物品池 |
| `items.yml` | 可抽取物品 |
| `tiers.yml` | 物品品质 |
| `refresh.yml` | 刷新策略和悬浮字模板 |

`loot_spawn.yml` 目前属于预留配置，写出器中有结构，但运行时加载入口尚未启用，不建议作为正式配置依赖。

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

  可能为空的搜索箱:
    root-pool: 基础物品池
    rolls: 0-4

pools:
  基础物品池:
    entries:
      - item: 圆石
      - item: 煤炭
        weight: 10
      - pool: 稀有物品池
        weight: 2

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
| `pools.<id>.entries[].item` | 引用 `items.yml` 中的物品 ID |
| `pools.<id>.entries[].pool` | 引用另一个物品池 ID |
| `pools.<id>.entries[].weight` | 权重，不填时物品使用品质权重，子池默认为 1 |
| `pools.<id>.entries[].condition` | 预留条件字段，当前核心抽取流程不会执行条件判断 |

一个 entry 必须且只能配置 `item` 或 `pool` 其中之一。

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
