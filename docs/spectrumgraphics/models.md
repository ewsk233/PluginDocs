# 3D 模型与动作

SpectrumGraphics 把 Blockbench/Bedrock 模型视为作者输入，而不是运行时格式。`.bbmodel`、`.geo.json` 与相邻动画先被严格校验、归一化并编译为带内容哈希的 `.sgmodel`；客户端渲染线程只读取稳定运行时格式。

## 能力阶段

| 阶段 | 已实现内容 |
| --- | --- |
| M1 | Blockbench bbmodel V4/V5 编译、Cube、刚性 Mesh、多贴图、骨骼、Locator、动画轨道 |
| M2 | 世界模型实例、Anchor、距离/视锥裁剪、光照和材质路径、替换锚定实体 |
| M3 | 独立动作播放器、循环/单次、速度、暂停/恢复/seek/stop、cross-fade、完成事件 |
| M4 | 版本化模型场景协议、Pack `model/`、热重载、资源哈希与管理指令 |
| M5 | typed 参数、状态、条件/完成迁移、优先级、cross-fade 与有序事件 |

## 从 Blockbench 编译

```powershell
.\gradlew.bat :core:model3d:compileSgModel `
  -PsgModelInput=example.bbmodel `
  -PsgModelOutput=build/models/example.sgmodel `
  -PsgModelId=example:npc
```

支持：

- bbmodel V4/V5；
- Cube、刚性 Mesh、多贴图材质；
- 父子骨骼、Locator 和静止姿势；
- Linear、Step、Catmull-Rom、Bezier 关键帧；
- V4/V5 动画轴差异归一化；
- 源文件、骨骼、顶点、三角形、动画和关键帧预算。

当前一个顶点只归属一个骨骼，即刚性蒙皮。权重蒙皮、IK、MoLang/Bedrock 控制器和相机轨道尚未伪装为已支持能力。

正常服主工作流不需要手工运行 Gradle task：把 `.bbmodel` 或 Bedrock GEO、动画与纹理放入服务端 `resource/`，`/sg assets build` 会自动编译。Gradle task 适合仓库开发和独立验证。

## 发布 `.sgmodel`

```text
plugins/SpectrumGraphics/resource/models/guide.sgmodel
```

然后：

```text
/sg assets build model-2026-01
/sg assets publish model-2026-01
```

模型场景 YAML 和模型二进制是不同内容：YAML 放在 Pack `model/` 或独立 `model/`，`.sgmodel` 放在独立客户端 `resource/` 发布中。

## 模型场景

Pack `model/guide.yml`：

```yaml
schema: spectrumgraphics/model/v1
scene: example:guide

assets:
  example:guide:
    source: models/guide.sgmodel

instances:
  - id: guide
    asset: example:guide
    animation: idle
    replaceEntity: true
    anchor:
      entityName:
        pattern: '^向导(?: · .+)?$'
        match: regex
        point: feet
        missing: last-known
    offset: [0, 0, 0]
    rotation: [0, 0, 0]
    scale: 1
    visibility:
      maxDistance: 64
      fadeFrom: 48
```

清单需要：

```yaml
features: [models]
```

独立场景放在 `plugins/SpectrumGraphics/model/*.yml`。Pack 中的旧 `models/` 名称会被验证器拒绝，必须迁移为单数 `model/`。

## Anchor

模型与 WorldCanvas 共用 Anchor 语义：

```yaml
anchor: { location: [10, 64, 10], face: center }
anchor: { position: [10.5, 64.0, 10.5] }
anchor: { entity: 550e8400-e29b-41d4-a716-446655440000, point: center }
anchor: { localPlayer: true, point: eyes }
anchor: { entityName: 任务使者 }
```

显示名正则：

```yaml
anchor:
  entityName:
    pattern: '^任务使者(?: · .+)?$'
    match: regex
    point: feet
    missing: last-known
```

非法正则在加载阶段拒绝。有多个匹配时选择最近实体并用 UUID 稳定打破平局。`replaceEntity: true` 只在锚定模型有效时隐藏选中的原版实体。

## 动作播放器

每个实例有独立 `ModelAnimationPlayer`：

- `play`、`pause`、`resume`、`stop`、`seek`；
- loop 或 once；
- 播放速度；
- cross-fade；
- 动作完成只发出一次；
- 旋转转为四元数并用最短路径 Slerp，避免欧拉角翻转。

管理指令暴露常用播放与停止，完整控制可通过 API 或 M5 Controller。

## M5 动作控制器

```yaml
controllers:
  locomotion:
    initial: idle
    parameters:
      moving: false
      speed: 0
      stance: normal
    states:
      idle: { animation: idle, loop: true }
      walk: { animation: walk, loop: true, speed: 1.0 }
      wave: { animation: wave, loop: false }
    transitions:
      - from: idle
        to: walk
        when: { moving: true }
        fade: 150
        priority: 10
      - from: walk
        to: idle
        conditions:
          - { parameter: speed, op: less-or-equal, value: 0 }
        fade: 150
      - from: wave
        to: idle
        on: completion
        fade: 100

instances:
  - id: guide
    asset: example:guide
    controller: locomotion
    anchor: { position: [0, 64, 0] }
```

参数只允许 boolean、number、string，并在加载和运行时检查类型。比较操作：`equals`、`not-equals`、`greater`、`greater-or-equal`、`less`、`less-or-equal`；boolean/string 只适合相等与不等。

一次求值最多执行一个迁移：优先选择 `priority` 较高者，相同优先级按目标状态 ID 稳定排序。`on: completion` 适合非循环动作完成后回到待机。

## 指令测试

```text
/sg model load
/sg model spawn example:guide
/sg model play example:guide guide walk
/sg model stop example:guide guide
```

控制台需要在 `spawn/play/stop` 最后指定在线玩家。`play` 指令使用 150 ms cross-fade 并播放一次。

修改 YAML 后再次 `/sg model load`：命令先原子校验，失败保留旧场景；成功后已经 spawn 且绑定仓库的场景会自动更新。

## API 驱动参数

```kotlin
SpectrumGraphics.api.models.setParameters(
    player,
    "example:guide",
    "guide",
    mapOf(
        "moving" to ModelParameterValue.BooleanValue(true),
        "speed" to ModelParameterValue.NumberValue(1.0),
    ),
)

val subscription = SpectrumGraphics.api.models.onEvent { target, event ->
    // 动作完成或控制器迁移事件
}
```

写操作必须在服务端主线程调用。关闭插件时应关闭 subscription。
