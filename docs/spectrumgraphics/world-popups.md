# 伤害数字与世界弹出层

伤害数字不是硬编码的特殊渲染器，而是 `presentation: world-popup` 的短暂 UI。它可以由 Bukkit 伤害/治疗事件、MythicMobs 或附属 API 触发。

## 最小配置

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: myserver:damage
presentation: world-popup

event:
  damage:
    amount: final
    viewers: [attacker]
    ignoreCancelled: true
    includeEnvironmental: false

popup:
  randomOffset: [0.22, 0.12, 0.22]
  lifetime: 900
  mergeWindow: 100
  lanes: 4
  maxPerEntity: 8
  maxGlobal: 128

display:
  text: '=state.damageText'
  decimals: 0
  color: '#FFFF5555'
  outline: '#FF3A0000'
  fontSize: 14
```

`viewers` 可用 `attacker`、`victim`、`participants`、`tracking`、`nearby`、`world`。还可按 critical、blocked、healing、damage cause、最小/最大值和零值筛选。

`followEntity` 决定弹出层是否继续跟随实体；`throughBlocks` 决定遮挡；`mergeWindow` 合并短时间连续数值；lanes 与单实体/全局上限避免重叠和刷屏。

## 图片数字

```yaml
digits:
  type: sprite-number
  source: damage/{glyph}.png
  value: '=state.damageText'
  glyphWidth: 8
  spacing: 1
  alignment: center
  style: { width: 96, height: 16 }
```

准备 `0.png`–`9.png`，可选 `minus.png`、`plus.png`、`dot.png`、`comma.png`。也可以不用 display 简写，直接在 body 中组合普通 Text、Image、NineSlice 和组件。

## 测试与触发

```text
/sg damage test
/sg damage test myserver:damage 12.5
```

MythicMobs：

```yaml
- damagedisplay{template=myserver:damage;amount=12.5;viewer=trigger;decimals=1}
```

不声明 `event` 的 world-popup 只由 API/MythicMobs 触发。附属使用 `SpectrumGraphics.api.world.showPopup(...)` 或 `showPopupToWorld(...)`。

## 玩家侧偏好

客户端资源包根目录可配置：

```yaml
damageDisplay:
  enabled: true
  reducedMotion: false
  scale: 1.0
  maxCount: 128
  showHealing: true
  showZero: false
```

配置可位于 `config.yml` 或 `config/*.yml`，按文件顺序合并；按 `F7`/`F3+T` 重载。

下一步：[WorldCanvas](./world-canvas.md) · [Bedrock 粒子](./particles.md)
