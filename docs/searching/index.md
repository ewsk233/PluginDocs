# Searching 搜刮系统

Searching 是一个基于 Kotlin + TabooLib 的搜刮箱插件。它把“搜刮点”“奖励表”“物品池”“搜索动画”“刷新策略”“统计数据”和 “API 事件”拆成独立模块，适合直接作为服务器搜刮系统使用，也适合作为其他插件的底层搜刮能力。

## 基本流程

1. 管理员在配置中定义搜刮箱类型、奖励表、物品池、物品品质和刷新策略。
2. 管理员使用 `/searching node create <nodeType>` 在目标方块位置创建搜刮点。
3. 玩家右键搜刮点方块。
4. 插件先触发 `SearchingPreOpenEvent`，附属插件可以在这里取消原始打开流程。
5. 未被取消时，Searching 打开搜刮界面。
6. 界面中的物品会按 `reveal-ticks` 逐个揭示。
7. 玩家点击已揭示物品后，物品进入背包，背包满时掉落在玩家附近。
8. 搜刮箱根据刷新策略进入下一次刷新等待。

## 核心概念

### 搜刮点 Node

搜刮点是世界中的一个可交互位置。当前实现会用 `world:x:y:z` 作为静态搜刮点 ID，因此同一位置不能重复创建搜刮点。

搜刮点状态：

| 状态 | 含义 |
| --- | --- |
| `Unsearched` | 已刷新，等待第一次打开 |
| `Generated` | 已生成奖励，仍有隐藏或可领取内容 |
| `Revealed` | 奖励已全部揭示 |
| `Expired` | 过期节点，通常用于临时节点扩展 |

### 搜刮箱类型 NodeType

NodeType 定义一个搜刮箱使用哪个奖励表、显示名、槽位数量、刷新策略和悬浮字模板。创建搜刮点时使用的 `<nodeType>` 就是 `node_types.yml` 中的键名。

### 奖励表 Table 和物品池 Pool

Table 决定从哪个根物品池抽取，以及抽取次数 `rolls`。Pool 是带权重的条目列表，条目可以指向具体物品，也可以继续指向另一个子物品池。

`rolls` 支持从 0 开始，例如 `0-4`。当随机到 0 次时，本次刷新可以生成空搜刮箱。

Table、Pool 和单个条目都可以配置动态权重脚本，用于实现 VIP 权限、高品质物品加权、特定世界或坐标范围加权等动态爆率规则。

### 搜索动画

打开搜刮 UI 后，未搜索的格子会显示 `hidden-item`。正在搜索的格子会按 `frames` 逐帧变化。每个物品的搜索时间来自物品自己的 `reveal-ticks`，如果物品配置为 0，则继承品质的 `reveal-ticks`。

### 刷新与统计

第一次打开已刷新搜刮箱时，会触发打开事件并计入玩家打开统计。物品揭示后会计入品质搜索统计和经验。刷新策略当前推荐使用 `cooldown` 或 `never`。

## 命令

主命令：

```text
/searching
/search
```

常用命令：

```text
/searching reload
/searching node type
/searching node type <nodeType>
/searching node create <nodeType>
/searching node create <nodeType> <x> <y> <z>
/searching node remove <nodeType>
/searching node remove <nodeType> <x> <y> <z>
/searching node list <worldName> [nodeType]
/searching node clear <worldName> [nodeType]
/searching node open <world> <x> <y> <z>
/searching editor [main|nodes|items|pools|tiers|refresh]
```

说明：

- `create` 和 `remove` 不写坐标时，会使用玩家视线 6 格内的目标方块。
- `list` 会打开节点管理面板。
- `clear <worldName>` 会清空该世界内所有搜刮点。
- `clear <worldName> <nodeType>` 只清空指定类型的搜刮点。
- `editor` 是内置配置编辑器，保存后会写回拆分配置文件。

## 权限

| 权限 | 用途 |
| --- | --- |
| `searching.command` | 使用 `/searching` 主命令 |
| `searching.command.reload` | 执行 `/searching reload` |

`searching.command` 默认 OP 拥有。

## 可选依赖

Searching 会尝试接入服务器已有的物品与展示插件。包括：

- DecentHolograms
- MythicMobs
- ItemsAdder
- NeigeItems
- MMOItems
- Oraxen
- Zaphkiel
- SX-Item
- CraftEngine
- SpectrumItem
- AzureFlow
- PxRpg

悬浮字功能需要 `refresh.yml` 中启用 `hologram.enabled`，并安装对应 Provider，例如 DecentHolograms。

## 文档导航

- [配置文件](./config.md)
- [Placeholder](./placeholder.md)
- [开发 API](./api.md)
