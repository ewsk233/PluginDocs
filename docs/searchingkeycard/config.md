# SearchingKeycard 配置文件

SearchingKeycard 使用三份配置/数据文件：

| 文件 | 作用 |
| --- | --- |
| `keycards.yml` | 定义房卡种类、物品外观、PDC 标记、是否消耗、访问时长和搜刮权限模式 |
| `rooms.yml` | 定义房间类型，也就是一类房间共用的规则 |
| `data.yml` | 记录实际房间实例，包括门位置和室内 Searching 节点位置 |

推荐理解方式：

- `keycards.yml` 管“什么卡”。
- `rooms.yml` 管“什么房间规则”。
- `data.yml` 管“地图上哪一扇门、哪几个箱子属于哪个房间”。

## keycards.yml

示例：

```yaml
keycards:
  ceo_keycard:
    material: PAPER
    displayName: "&bCEO房卡"
    lore:
      - "&7用于开启CEO办公室的房间"
    customModelData: 10001
    pdc:
      namespace: searching_keycard
      key: card_id
      value: ceo_room
    consume: true
    accessSeconds: 180
    lootAccessMode: opener
```

`keycards` 下的键名就是房卡 ID。发卡命令中使用的 `<房卡ID>` 就是这里的键名，例如：

```text
/skc give Steve ceo_keycard 1
```

### 房卡字段

| 字段 | 说明 |
| --- | --- |
| `material` | 房卡物品材质，例如 `PAPER`、`TRIPWIRE_HOOK` |
| `displayName` | 房卡显示名，支持 `&` 颜色符号 |
| `lore` | 房卡 lore，支持多行 |
| `customModelData` | 房卡模型数据，资源包服常用 |
| `pdc.namespace` | PDC 命名空间，默认建议保持 `searching_keycard` |
| `pdc.key` | PDC 键名，默认建议保持 `card_id` |
| `pdc.value` | PDC 值，用来标记这张卡的真实身份 |
| `consume` | 开门成功后是否消耗一张房卡 |
| `accessSeconds` | 玩家获得房间访问权限的时长，单位秒 |
| `lootAccessMode` | 搜刮权限模式，可选 `opener` 或 `all` |

`lootAccessMode` 的含义：

| 值 | 效果 |
| --- | --- |
| `opener` | 只有本轮刷过房卡的玩家可以搜刮房间内节点 |
| `all` | 房间开启周期内所有玩家都可以搜刮房间内节点 |

高价值房间建议：

```yaml
consume: true
lootAccessMode: opener
```

公共探索房间可以：

```yaml
consume: false
lootAccessMode: all
```

## PDC 识别

房卡判断不是只看名字和 lore。插件发放房卡时会写入 PDC，开门时也会检查 PDC。

正式服建议：

- 每种房卡使用独立的 `pdc.value`。
- 用 `/skc give` 发卡。
- 不要只靠显示名和 lore 识别房卡。

## rooms.yml

`rooms.yml` 定义房间类型。房间类型不是地图上的某个具体房间，而是一套可复用规则。

示例：

```yaml
roomTypes:
  ceo_room:
    allowedKeycards:
      - ceo_keycard
    doorOpenTicks: 100
    closeRetryTicks: 20
    activeCycleGraceSeconds: 30
    indoorNodes:
      positions: {}
      cuboids: {}
```

### 房间类型字段

| 字段 | 说明 |
| --- | --- |
| `allowedKeycards` | 允许打开该类房间的房卡 ID 列表 |
| `doorOpenTicks` | 门打开后自动关闭的延迟，单位 tick，20 tick = 1 秒 |
| `closeRetryTicks` | 如果关门时门附近有人，延迟多少 tick 再尝试关门 |
| `activeCycleGraceSeconds` | 房间访问结束后的空闲保留时间，单位秒 |
| `indoorNodes.positions` | 房间类型固定包含的室内节点坐标 |
| `indoorNodes.cuboids` | 房间类型固定包含的室内节点区域 |

### activeCycleGraceSeconds

玩家刷房卡成功后，房间进入一个 active cycle。本周期内室内节点只刷新一次。周期结束后，下次合法刷卡才会再次刷新节点。

`activeCycleGraceSeconds` 表示权限结束后，房间状态额外保留多久。数值越大，房间越不容易被快速重置；数值越小，房间更快进入下一轮。

高价值房间建议设置稍长：

```yaml
activeCycleGraceSeconds: 60
```

普通房间可以短一些：

```yaml
activeCycleGraceSeconds: 15
```

### positions

`positions` 适合少量固定节点。坐标使用房间实例所在世界。

```yaml
indoorNodes:
  positions:
    crate_1:
      x: 100
      y: 64
      z: 100
    crate_2:
      x: 102
      y: 64
      z: 100
```

多数情况下，更推荐用命令登记实际房间节点：

```text
/skc room addnode <房间ID>
```

### cuboids

`cuboids` 适合一个房间内有很多 Searching 节点的情况。插件会扫描区域内的 Searching 节点。

```yaml
indoorNodes:
  cuboids:
    main_room:
      minX: 90
      minY: 60
      minZ: 90
      maxX: 110
      maxY: 70
      maxZ: 110
```

区域不要写得过大。区域越大，开门时需要解析的位置越多。

## data.yml

`data.yml` 记录实际房间实例。一般由命令自动写入，不建议手工维护。

空文件示例：

```yaml
rooms: {}
```

有房间后的结构类似：

```yaml
rooms:
  ceo_office_01:
    roomType: ceo_room
    world: world
    doors:
      - world,100,64,98
    nodePositions:
      - world,101,64,101
      - world,103,64,101
    nodeIds:
      - world:101:64:101
      - world:103:64:101
```

### data 字段

| 字段 | 说明 |
| --- | --- |
| `roomType` | 引用 `rooms.yml` 中的房间类型 |
| `world` | 房间所在世界 |
| `doors` | 该房间的门方块位置 |
| `nodePositions` | 该房间的室内 Searching 节点位置 |
| `nodeIds` | 已缓存的 Searching 节点 ID |

`doors` 和 `nodePositions` 使用：

```text
world,x,y,z
```

例如：

```text
world,100,64,98
```

## 推荐配置流程

1. 在 Searching 中创建室内搜刮节点。
2. 把这些室内节点的 `refresh-policy` 设置为 `never`。
3. 在 `keycards.yml` 中定义房卡。
4. 在 `rooms.yml` 中定义房间类型。
5. 进游戏后执行：

```text
/skc room create ceo_office_01 ceo_room
/skc room adddoor ceo_office_01
/skc room addnode ceo_office_01
/skc give Steve ceo_keycard 1
```

`adddoor` 和 `addnode` 都使用玩家当前看着的方块。

## 与 Searching 刷新策略配合

室内节点建议在 Searching 的 `node_types.yml` 中使用 `never` 刷新策略。

这样有三个好处：

- 创建节点时不会提前生成奖励。
- 玩家没有房卡时，房间内节点不会自己刷新。
- 每次合法刷房卡时，SearchingKeycard 才刷新本房间节点。

示例：

```yaml
CEO办公室箱:
  display-name: "&bCEO办公室箱"
  table: 高级办公室奖励
  refresh-policy: manual_room
  slots: 27
```

`refresh.yml`：

```yaml
refreshPolicies:
  manual_room:
    type: never
    scope: node
```

## 常见配置方案

### 一次性高价值房卡

```yaml
consume: true
accessSeconds: 180
lootAccessMode: opener
```

适合高级资源房、空投房、保险库。

### 长期门禁卡

```yaml
consume: false
accessSeconds: 30
lootAccessMode: opener
```

适合玩家住宅、阵营基地、工作区。

### 队伍共享房间

```yaml
consume: true
accessSeconds: 180
lootAccessMode: all
```

适合副本奖励房。一个人刷卡开门，队伍成员都能搜刮。
