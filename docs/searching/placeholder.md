# Searching Placeholder

Searching 注册的 Placeholder 标识符是：

```text
searching
```

Placeholder 格式：

```text
%searching_<参数>%
```

## 打开统计

| Placeholder | 说明 |
| --- | --- |
| `%searching_total_open_chest_<nodeType>%` | 玩家累计打开指定搜刮箱类型的次数 |
| `%searching_daily_open_chest_<nodeType>%` | 玩家今日打开指定搜刮箱类型的次数 |
| `%searching_total_total_open_chest%` | 玩家累计打开所有搜刮箱次数 |
| `%searching_daily_total_open_chest%` | 玩家今日打开所有搜刮箱次数 |

示例：

```text
%searching_total_open_chest_示例搜索箱%
%searching_daily_open_chest_矿洞搜索箱%
%searching_total_total_open_chest%
```

`nodeType` 必须和 `node_types.yml` 中的 ID 完全一致。

## 搜索统计

| Placeholder | 说明 |
| --- | --- |
| `%searching_total_search_<tier>%` | 玩家累计揭示指定品质物品的次数 |
| `%searching_daily_search_<tier>%` | 玩家今日揭示指定品质物品的次数 |

示例：

```text
%searching_total_search_普通%
%searching_daily_search_稀有%
```

`tier` 必须和 `tiers.yml` 中的品质 ID 完全一致。

## 等级与经验

| Placeholder | 说明 |
| --- | --- |
| `%searching_level%` | 玩家当前等级 |
| `%searching_exp%` | 玩家当前累计经验 |
| `%searching_exp_total%` | 升到下一等级所需总经验 |
| `%searching_exp_need%` | 距离下一等级还需要的经验 |

等级计算使用 `config.yml` 中的：

```yaml
progress:
  level-expression: 'calc "1 + exp / 100"'
```

Kether 脚本可使用：

| 变量 | 说明 |
| --- | --- |
| `level` | 当前等级 |
| `currentLevel` | 当前等级 |
| `exp` | 累计经验 |
| `totalExp` | 累计经验 |

## 日期范围

`daily_*` 统计按 UTC 日期归档。跨时区服务器如果需要展示本地日榜，需要在计分板或展示侧注意日期边界。
