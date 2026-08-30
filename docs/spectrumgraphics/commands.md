# 管理指令

主指令 `/spectrumgraphics`，别名 `/sg`。默认权限 `spectrumgraphics.admin`，仅 OP 拥有。

## 核心与 Pack

| 指令 | 作用 |
| --- | --- |
| `/sg open <template> [player]` | 为自己或在线玩家打开 UI 模板 |
| `/sg validate` | 校验全部候选内容，不改变运行快照 |
| `/sg reload` | 预检并原子重载全部内容，同时刷新资源 offer |
| `/sg stats` | Behavior、模型和伤害显示统计 |
| `/sg pack enable <id>` | 启用 Pack |
| `/sg pack disable <id>` | 停用 Pack |
| `/sg pack unload <id>` | 从当前快照卸载 Pack |

当前构建没有注册 `/sg schema`；JSON Schema 随 Contract/作者工具提供，URN `$id` 不是下载 URL。

## World Popup、模型和粒子

```text
/sg damage test [template] [amount]

/sg model load
/sg model inspect <scene>
/sg model spawn <scene> [player]
/sg model play <scene> <instance> <animation> [player]
/sg model stop <scene> <instance> [player]

/sg particle play <id> [player]
/sg particle stop <handle>
```

`model spawn` 将仓库场景绑定到玩家，后续重载会同步；`play` 默认一次播放并使用 150ms cross-fade。控制台使用涉及玩家的命令时必须给出 player。

## Camera

```text
/sg camera load
/sg camera play <document> <scene> [player] [focus-entity-uuid]
/sg camera stop <document> [player]
/sg camera preset <document> <preset> [player]
/sg camera modifier shake <amplitude> <durationMillis>
/sg camera modifier recoil <yaw> <pitch> <durationMillis>
/sg camera modifier zoom <fov> <durationMillis>
/sg camera editor start <document>
/sg camera editor point
/sg camera editor remove
/sg camera editor save [durationMillis]
/sg camera editor cancel
```

Editor 记录玩家眼睛位置，绘制仅编辑者可见的路径采样；保存、取消、重启或退出都会清理粒子任务。

## Avatar 与 Key

```text
/sg avatar load
/sg avatar list
/sg avatar set <profile> [player]
/sg avatar clear [player]
/sg avatar equip <cosmetic> [player]
/sg avatar unequip <slot-or-cosmetic> [player]
/sg avatar play <action> [player]

/sg key load
/sg key list
/sg key debug [player]
/sg key group <document> <group> <true|false> [player]
```

## 物品

```text
/sg item list
/sg item set <appearance> [player]
/sg item inspect
/sg item clear [player]
/sg item apply <appearance> <Arim matcher>
/sg item effect add <effect>
/sg item effect remove <effect>
/sg item effect refresh
/sg item effect inspect
```

`set/clear/inspect/effect` 默认操作执行者手持物品；`apply` 用 Arim 匹配玩家物品并批量设置外观。

## 资源

```text
/sg assets reload
/sg assets build [release]
/sg assets publish <release>
/sg assets status
```

- `reload` 只重读 delivery 配置；绑定失败保留旧监听器；
- `build` 异步编译和加密源资源，默认 release ID 为 `production`；
- `publish` 只接受已经完成并通过 hash 校验的 release；
- `status` 显示当前发布、hash、交付模式和客户端状态计数。

## 推荐修改循环

```text
/sg validate
/sg reload
```

先修复诊断再重载。候选失败不会替换上一份运行快照，也不需要通过反复重启服务器来测试普通内容。

下一步：[验证与故障排查](./operations.md) · [资源构建与发布](./assets.md)
