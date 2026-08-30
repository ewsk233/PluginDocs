# Bedrock 粒子

SpectrumGraphics 编译常用 Bedrock/Snowstorm 粒子 JSON 为 `.sgparticle`。服务端只决定播放对象和观众；MoLang、发射、运动、碰撞、UV、事件链和逐帧渲染在客户端执行。

## 资源布局

```text
plugins/SpectrumGraphics/resource/particle/
├─ magic.particle.json
└─ magic.png
```

最小示例：

```json
{
  "format_version": "1.10.0",
  "particle_effect": {
    "description": {
      "identifier": "spectrum:magic",
      "basic_render_parameters": {
        "material": "particles_add",
        "texture": "textures/particle/magic"
      }
    },
    "components": {
      "minecraft:emitter_rate_instant": { "num_particles": 18 },
      "minecraft:emitter_lifetime_once": { "active_time": 0.1 },
      "minecraft:emitter_shape_sphere": { "radius": 0.7, "surface_only": true },
      "minecraft:particle_lifetime_expression": { "max_lifetime": 1.2 },
      "minecraft:particle_initial_speed": 1.5,
      "minecraft:particle_motion_dynamic": {
        "linear_acceleration": [0, -0.8, 0],
        "linear_drag_coefficient": 0.15
      },
      "minecraft:particle_appearance_billboard": {
        "size": [0.18, 0.18],
        "facing_camera_mode": "lookat_xyz"
      },
      "minecraft:particle_appearance_tinting": { "color": "#66DDFFFF" }
    }
  }
}
```

## 纹理解析

构建器依次尝试：

1. 与 JSON 同名的兄弟 `<name>.png`；
2. `resource/` 下 `description.basic_render_parameters.texture` 对应的 PNG；
3. 将该值作为 Minecraft/资源包 ResourceLocation。

因此 `texture: textures/particle/particles` 是 Bedrock 默认粒子图集路径，不强制要求 `loading.png`。若当前 Java 资源包不提供这张图集，应放置 `resource/textures/particle/particles.png`。

## 已实现组件

- emitter 初始化、instant/steady rate、once/looping/expression lifetime、local space；
- point、box、sphere、disc、entity AABB shape；
- particle lifetime、初速度、parametric position、加速度、drag、spin、方块碰撞；
- billboard size/facing/UV/flipbook、颜色/渐变、lighting；
- linear curve 和 emitter/particle 创建、过期、timeline 事件；
- 有界 MoLang 算术、比较、条件、赋值、return、`query.*`、`variable.*`、`temp.*` 与常用 `math.*`。

影响结果的未支持组件会产生诊断，不会静默替换成原版粒子。

## 播放

```text
/sg particle play magic [player]
/sg particle stop <handle>
```

MythicMobs：

```yaml
- bedrockParticle{id=magic;scale=1;range=64} @self
```

`duration=40` 同步 40 ticks，`duration=-1` 持续播放，`action=stop;key=<key>` 停止持久 emitter。

API `SpectrumGraphics.api.particles` 支持 Entity、固定位置、模型 Locator 和 Camera 锚点，并返回可停止的稳定 handle。模型 Locator 在客户端采样最终动画姿势，不需要服务器逐 Tick 发坐标。

下一步：[资源构建与发布](./assets.md) · [3D 模型与动作](./models.md)
