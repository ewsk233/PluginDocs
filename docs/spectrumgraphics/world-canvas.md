# WorldCanvas

WorldCanvas 把普通 Spectrum UI 投射到世界空间。它适合任务标记、全息面板、传送点、NPC 头顶信息和可交互世界终端。

## 第一个场景

Pack 中放在 `world/quest.yml`，并声明 `features: [world-canvas]`：

```yaml
schema: spectrumgraphics/world/authoring-v1
scene: example:quest-waypoint

objects:
  - surface:
      ref: ruins
      anchor:
        location: [120, 68, -32]
        world: survival_world
        face: up
      visibility:
        maxDistance: 128
        fadeFrom: 100
        hideWithin: 0
      size: [160, 40]
      pixelsPerBlock: 80
      facing: billboard
      scale: screen-fixed
      throughBlocks: false
      interaction:
        enabled: true
        maxDistance: 8
        button: secondary
      body:
        column:
          style: { gap: 2 }
          children:
            - text: 远古遗迹
            - text:
                text: "= round(world.anchor.distance) + ' m'"
```

Pack `world/` 下的场景会随启用状态自动挂载。兼容目录 `plugins/SpectrumGraphics/world/` 也会递归加载和自动挂载。

## Anchor

### 方块与精确位置

```yaml
anchor:
  location: [120, 68, -32]
  face: north
  world: survival_world
  dimension: minecraft:overworld
```

```yaml
anchor:
  position: [120.5, 68.25, -31.75]
```

`world` 是 Bukkit 逻辑世界名，`dimension` 是客户端维度 key；只检查你明确声明的条件。

### 实体 UUID 与本地玩家

```yaml
anchor:
  entity: 550e8400-e29b-41d4-a716-446655440000
  point: head
  missing: hide
```

```yaml
anchor:
  localPlayer: true
  point: eyes
```

`point` 可为 `feet`、`center`、`eyes`、`head`。实体缺失策略可为 `hide` 或 `last-known`。

### 实体显示名与正则

精确匹配可简写：

```yaml
anchor:
  entityName: 任务使者
```

正则匹配：

```yaml
anchor:
  entityName:
    pattern: '^任务使者(?: · .+)?$'
    match: regex
    point: feet
    missing: last-known
```

匹配对象是去除格式后的显示文本。多个实体匹配时，客户端选择离本地玩家最近者，再用 UUID 稳定打破平局。pattern 最长 256 字符；非法正则在 YAML/协议边界拒绝，不进入渲染线程。

## 变换、朝向和缩放

```yaml
offset: [0, 2.2, 0]
rotation: [0, 180, 0]     # pitch, yaw, roll
worldScale: [1, 1, 1]
facing: yaw-billboard
scale: screen-clamped
```

| 字段 | 值 |
| --- | --- |
| `facing` | `fixed`、`billboard`、`yaw-billboard` |
| `scale` | `world`、`screen-clamped`、`screen-fixed` |

- `world`：保持物理方块尺寸；
- `screen-clamped`：保留物理尺寸，但确保不小于画布逻辑尺寸；
- `screen-fixed`：始终投射为 `size` 指定的逻辑像素，最适合 Waypoint 标签。

`throughBlocks: true` 会关闭深度测试，让内容透过方块显示。它会显著改变视觉和玩法信息边界，应谨慎使用。

## 距离上下文

Surface body 可读取：

```text
world.anchor.distance
world.anchor.horizontalDistance
world.anchor.verticalDistance
world.anchor.distanceText
world.anchor.horizontalDistanceText
world.anchor.verticalDistanceText
```

这些值由相机与已解析 Anchor 计算，可用于距离文字、透明度和条件显示。

## 交互与服务端校验

`button` 可为 `primary`、`secondary` 或 `middle`，对应玩家重映射后的攻击、使用和选取方块键。交互还会检查：

- session、scene revision 和事件顺序；
- surface、节点、可见性和启用状态；
- 当前 world/dimension；
- 服务端重新解析的 Anchor 和最大距离。

动态虚拟 NPC 可通过 `registerWorldAnchorResolver` 提供服务端权威位置。静态 location/position 不允许被自定义 resolver 覆盖。

## 附属插件 Waypoint API

```kotlin
val waypoint = SpectrumWaypoint.fromNode(
    id = "myquests:ancient_ruins",
    body = ColumnNode(
        id = NodeId("marker"),
        children = listOf(
            TextNode(NodeId("name"), text = "远古遗迹"),
        ),
    ),
)

val handle = SpectrumGraphics.api.world.createWaypoint(player, waypoint)
handle.show(targetLocation)
handle.moveTo(updatedLocation)
handle.hide()
handle.show(targetLocation)
handle.close()
```

`createWaypoint` 只创建内存定义，不发送无坐标场景，也不写 YAML。第一次 `show` 才挂载；`hide` 保留可复用定义；`close` 永久释放 handle。持久化由附属插件负责。

只移动一个可见 Surface 的 Anchor/Transform 时，支持的客户端会收到原子 surface patch；旧客户端回退为完整 WorldDocument patch。

## 预算

- 单 WorldDocument 最多 256 个 Surface；
- 单 Surface 宽高各 1–512；
- 所有 Surface 画布像素总量不超过 2,097,152；
- `pixelsPerBlock` 范围 1–1024；
- 最大显示距离不超过 256；
- 最大交互距离不超过 16。
