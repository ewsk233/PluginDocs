# Camera

Camera v1 描述第三人称 preset 和有限时长的电影镜头。逐帧姿势、碰撞、插值、震动和 FOV 在客户端完成，服务端只发送文档和控制命令。

## Preset 与自动切换

```yaml
schema: spectrumgraphics/camera/authoring-v1
id: example:camera

default: 肩后视角
presets:
  肩后视角:
    follow: player
    offset: { right: 0.65, up: 1.55, back: 4.2 }
    lookAt: player.eyes
    collision: true
    transition: 300ms
  疾跑视角:
    follow: player
    offset: { right: 0.9, up: 1.45, back: 5.3 }
    lookAt: player.eyes
    fov: 82
    collision: true
    transition: 180ms

auto:
  default: 肩后视角
  sprinting: 疾跑视角
```

自动选择读取客户端本地玩家状态，不需要服务器 Tick。还可区分 sneaking、swimming、flying、aiming。

## Rig

| Rig | 用途 |
| --- | --- |
| `follow` | 跟随玩家或运行时 binding |
| `fixed` | 固定世界位置与 yaw/pitch/roll |
| `orbit` | 绕目标旋转 |
| `spline` | 2–256 点 Catmull–Rom 路径 |

`lookAt` 可指向 `player`、`focus`、`focus.eyes`、实体 UUID 或固定位置。实体锚点后缀为 `feet`、`center`、`eyes`、`head`。

常用选项：offset、fov、perspective、freeLook、collision、collisionRadius、hidePlayer、hideHead、lockInput、allowMovement。

## 电影场景

```yaml
scenes:
  boss-intro:
    cinematic: true
    interruption: replace
    skippable: true
    restore: 500ms
    shots:
      - orbit:
          target: focus.feet
          radius: 5.5
          height: 1.6
          angle: 0
          turns: 0.5
        lookAt: focus.eyes
        fov: 64
        collision: true
        duration: 2s
        hold: 250ms
        ease: ease-out
        modifiers:
          - shake: { amplitude: 0.10, frequency: 9, duration: 500ms }
    markers:
      350ms: { sound: example:boss/appear }
      700ms:
        modelAnimation: powerup
        arguments: { scene: boss:him, instance: him, fade: '150' }
      1200ms: { particle: minecraft:portal }
      1500ms: { ui: example:boss-title }
```

Marker 时间相对整个 scene。Sound、模型动画和简单粒子可由客户端直接执行；UI 与 callback 会作为有序事件交给权威服务端。

`cinematic: true` 默认隐藏第一人称手、本地玩家和 gameplay HUD，并锁定输入；聊天和字幕保留。需要更细控制时使用 mapping：

```yaml
cinematic:
  hideHand: true
  hidePlayer: true
  hideHud: true
  hideSpectrumHud: false
  keepChat: true
  keepSubtitles: true
  lockInput: true
  allowMovement: false
```

## 无障碍与玩家设置

```yaml
accessibility:
  respectReducedMotion: true
  maxShake: 0.6
  minFov: 35
  maxFov: 100
```

玩家设置保存在 `.minecraft/config/spectrumgraphics-camera.json`，包含 reducedMotion、shakeIntensity、maxFov。跳过镜头是 Minecraft 可重映射按键，默认 Backspace，服务端 YAML 不能覆盖。

## 指令

```text
/sg camera load
/sg camera play <document> <scene> [player] [focus-entity-uuid]
/sg camera stop <document> [player]
/sg camera preset <document> <preset> [player]
/sg camera modifier shake <amplitude> <durationMillis>
/sg camera modifier recoil <yaw> <pitch> <durationMillis>
/sg camera modifier zoom <fov> <durationMillis>
/sg camera editor start <document>
/sg camera editor point|remove|save|cancel
```

下一步：[3D 模型与动作](./models.md) · [自定义按键](./keys.md)
