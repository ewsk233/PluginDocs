# 物品外观与额外渲染

Item Appearance v1 同时描述“替换物品视觉”和“叠加额外渲染层”。服务端配置负责匹配和权威绑定，客户端资源负责实际图像或模型。

## 目录与 ID

```text
plugins/SpectrumGraphics/item/boss/crystal_blade.yml
plugins/SpectrumGraphics/packs/shop/item/crystal_blade.yml
plugins/SpectrumGraphics/resource/boss/items/crystal_blade.png
```

独立文件未写 `id` 时按受控相对路径推导；Pack 文件默认使用 Pack 命名空间。Item Appearance ID 可为安全 Unicode 或 namespaced 文本，例如 `测试武器`、`boss:crystal_blade`。ID 与资源路径相互独立，不要求同名。

## 替换外观

```yaml
schema: spectrumgraphics/item-appearance/v1
id: boss:crystal_blade

visual:
  texture: boss/items/crystal_blade.png
  profile: handheld

render:
  tint: '#FFFFFFFF'
  emissive: 0
  glint: inherit

contexts:
  gui: { scale: 1 }
  first_person_right:
    rotation: [0, 8, -4]
    translation: [1, -1, 0]
    scale: 1

fallback: vanilla
```

`visual` 只能选 `texture` 或 `model`。Texture 支持 PNG/GIF；Model 使用 SGModel ID并可声明循环动作。Profile 为 `generated` 或 `handheld`。

上下文：`gui`、`ground`、`fixed`、`head`、`first_person_left/right`、`third_person_left/right`。`fallback: vanilla` 在资源缺失时保留原物品，生产环境优先使用它。

## 额外渲染层

```yaml
schema: spectrumgraphics/item-appearance/v1
id: 传说边框
match:
  arim: 'material:DIAMOND'
priority: 100
exclusiveGroup: rarity

layers:
  - image: item/effects/legendary_border.png
    phase: after-decorations
    contexts: [gui]
    x: -1
    y: -1
    width: 18
    height: 18
    tint: '#FFFFFFFF'
    opacity: 1
    emissive: 0
    blend: normal
```

| phase | 合成位置 |
| --- | --- |
| `before-item` | 原版/替换物品之前 |
| `after-item` | 物品之后、数量与耐久装饰之前 |
| `after-decorations` | GUI 的数量/耐久装饰之后 |

`after-decorations` 仅支持 GUI、Image 和 normal blend，以维持稳定的 GuiGraphics 合成。每层选一个 Image 或 Model；可设置动画、上下文、位置、大小、旋转、缩放、tint、opacity、emissive 和 blend。

同一 `exclusiveGroup` 中高 priority 胜出，不同组可以叠加。服务端执行 Arim 匹配，只把最终效果 ID 写入 ItemStack PDC，并同步不含图片字节的描述。

## 动画

PNG 可以邻接 `<texture>.png.mcmeta` 使用原版帧动画；GIF 保留毫秒级帧延迟、透明度和 disposal。两者都可声明：

```yaml
playback:
  loop: true
  speed: 1
  autoplay: true
  startFrame: 0
```

GIF 时间不舍入到 20 TPS。构建后的 `.sgitem` 自包含合成图集和时间线，不再依赖源 GIF。

## 零配置本地测试

```text
resource/测试武器.png
resource/测试武器.handheld.gif
resource/传说边框.overlay.png
```

客户端按 `F7` 后会本地生成相应 `.sgitem`。手持物品后测试：

```text
/sg item set 测试武器
/sg item effect add 传说边框
```

确认后再把源资源移到服务端，建立正式规则并 build/publish。

## 指令与 API

```text
/sg item list
/sg item set <appearance> [player]
/sg item inspect
/sg item clear [player]
/sg item apply <appearance> <Arim matcher>
/sg item effect add|remove|refresh|inspect
```

附属使用 `SpectrumGraphics.api.items` 的 `setAppearance`、`clearAppearance`、`appearance`、`applyAppearance`、`addEffect`、`removeEffect`、`effects` 和 `refreshEffects`。

下一步：[资源构建与发布](./assets.md) · [物品 Tooltip](./tooltips.md)
