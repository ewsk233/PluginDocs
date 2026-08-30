# 额外槽位

额外槽位直接嵌入任意 Spectrum UI，不需要单独的打开指令。服务端保存完整 ItemStack 并执行光标事务；客户端只显示当前玩家的只读镜像。

## 定义槽位

在 `plugins/SpectrumGraphics/slot/*.yml` 中声明：

```yaml
schema: spectrumgraphics/slot/v1
slots:
  头饰:
    maxStack: 1
    accept: 'material:PLAYER_HEAD'
    permission: server.slot.头饰
    world: world
    death: keep
  护符: 'material:NETHER_STAR'
```

| 字段 | 说明 |
| --- | --- |
| `maxStack` | 此槽位允许的最大堆叠数 |
| `accept` | Arim Item Match 表达式；省略表示接受任意物品 |
| `permission` | 可选 Bukkit 权限 |
| `world` | 可选 Bukkit 世界名或 UUID |
| `death` | `keep`、`drop`、`clear` |

## 放进 UI

```yaml
equipmentSlots:
  type: extra-slot-grid
  slots: [头饰, 项链, 戒指一, 戒指二, 护符]
  columns: 5
  slotWidth: 34
  slotHeight: 34
  columnGap: 8
  backgroundColor: '#B8293446'
  image: example:textures/gui/slot.png
  hoverImage: example:textures/gui/slot_hover.png
  showHighlight: true
  itemScale: 0.72
  showCount: true
  showDecorations: true
  font: 主界面
  style: { width: 202, height: 34 }
```

单格使用 `type: extra-slot` 和 `slot: 头饰`。`showHighlight` 控制原版式 hover 高亮，默认 `true`；可用 `hoverImage` 自定义悬停图。

点击时服务端根据真实光标物品处理拿取、放入、合并和右键拆分，并再次检查 accept、权限、世界和堆叠限制。客户端不能伪造槽位内容。正常的重复/拒绝路径不会刷 WARN；真正的非法数据包才应进入安全日志。

## 数据库

默认 SQLite 文件是 `plugins/SpectrumGraphics/player-data.db`，只为额外槽位使用独立表 `spectrumgraphics_extra_slots`。可在 `config.yml` 启用 MySQL：

```yaml
database:
  enable: true
  tables:
    extra-slots: spectrumgraphics_extra_slots
  host: localhost
  port: 3306
  user: root
  password: password
  database: minecraft
  sync-ticks: 80
```

完整 ItemStack 会压缩并分块写入；更新先写备用代，完整成功后才切换活动代。旧版 `extra-slots.yml` 会导入并保留备份；检测到旧混合表时只复制额外槽位数据，不自动删除旧表。

修改数据库连接或表名需要重启，`/sg reload` 只重载槽位定义。

## API 与事件

```kotlin
val item = SpectrumGraphics.api.slots.get(player.uniqueId, "护符")
val snapshot = SpectrumGraphics.api.slots.snapshot(player.uniqueId)
SpectrumGraphics.api.slots.set(proxyPlayer, "护符", itemStack)
SpectrumGraphics.api.slots.clear(proxyPlayer, "护符")
```

附属还可实现 `SpectrumExtraSlotStore`，并监听 `SpectrumExtraSlotPreChangeEvent` 与 `SpectrumExtraSlotChangeEvent`。写操作在服务端主线程执行。

下一步：[原版 Screen 与容器](./mount-container.md) · [公共 API](./api.md)
