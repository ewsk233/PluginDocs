# 字体、富文本与图标

Spectrum Text 管理 TTF/OTF 字体、原版字体覆盖和行内图片图标。声明可放在全局 `text/` 或 Pack 的 `text/`；二进制资源放在全局 `resource/`。

## 目录

```text
plugins/SpectrumGraphics/
├─ text/common.yml
├─ packs/example/text/theme.yml
└─ resource/
   ├─ font/ui.ttf
   └─ icon/common/金币.png
```

独立 Text 对相同 ID 的 Pack Text 具有覆盖优先级。多个文件原子合并，重复 ID 和 fallback 循环会使重载失败。

## 注册字体和图标

```yaml
schema: spectrumgraphics/text/v1

fonts:
  主界面:
    source: font/ui.ttf
    renderer: auto
    fallback: [minecraft:default]
    msdf: { emSize: 48, distanceRange: 8, atlasSize: 2048, dynamicGlyphs: true }
    metrics: { scale: 1, baseline: 0, lineHeight: 1 }

icons:
  金币:
    source: icon/common/金币.png
    height: 0.85em
    width: auto
    baseline: 0.08
    spacing: { left: 0.05, right: 0.08 }
    tint: original
    fallbackText: '[金币]'
```

图标源可为 PNG/JPG/GIF。GIF 可增加 `animation: { loop: true, speed: 1, autoplay: true }`。

## 在 UI 中使用

```yaml
balance:
  type: text
  font: 主界面
  text: '<icon:金币> <gradient:#FFE36E:#FF9F1C>12,500</gradient>'
  fontSize: 12
  outline: { width: 1, color: '#B0000000' }
  shadow: { offsetX: 0.5, offsetY: 0.5, color: '#59000000' }
```

RichText 支持 `icon`、`font`、`color`、`bold`、`italic`、`underline`、`strike`、`outline`、`shadow`、`gradient`、`shimmer`、`mark`、`reset` 和 `br` 等只读标签。标签不会执行命令、Flow 或服务端 Action。

## 覆盖 Minecraft 原版字体

```yaml
vanilla:
  font: 主界面
  size: auto
  weight: 500
  sharpness: 0.15
  hinting: auto
  pixelSnap: true
  shadow: { enabled: true, opacity: 0.35, offset: 0.5 }
```

覆盖范围包括聊天、TAB、BossBar、计分板、物品 Tooltip、菜单、实体名称、TextDisplay 和使用原版 FontSet 的全息插件。缺失字符回退到 Minecraft 字体。删除 `vanilla` 可保留原版字体。

- `size: auto` 适配原版 8 GUI 单位行盒；
- `weight` 为 100–900；
- `sharpness` 为 0–1；
- `hinting` 为 `auto`、`none`、`grayscale`、`gasp`；
- `pixelSnap` 建议在聊天、计分板和 Tooltip 中保持开启；
- `shadow: false` 完全关闭阴影，`true` 使用柔和默认值，mapping 可调透明度和偏移。

`renderer: native` 适合小字号清晰文本；`msdf` 适合较大展示字；`auto` 在 18 逻辑像素附近自动选择。MSDF 路径最终上传普通 Minecraft 纹理，不要求自定义 OpenGL Shader；超过 atlas 预算会安全回退 native。

## 原版文字中的图标

玩家和配置使用公开标签 `<icon:金币>`。服务端会把已知标签降低为内部私用字形，客户端注入 Minecraft FontSet。不要把私用字符复制进配置。

安装 PlaceholderAPI 后，第三方插件可使用：

```text
%spectrum_icon_金币%
%spectrum_<icon:金币>%
```

附属插件可调用 `SpectrumGraphics.api.text.iconGlyph(id)` 和 `expandIcons(text)`。

## 生效与发布

- 修改 YAML：`/sg validate`、`/sg reload`；
- 服主本地测试字体/图片：放入客户端 `resource/` 后按 `F7`；
- 正式发布：源文件放入服务端 `resource/`，执行 `/sg assets build` 与 `publish`。

下一步：[聊天界面与消息层](./chat.md) · [物品 Tooltip](./tooltips.md)
