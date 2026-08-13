# Spectrum Pack

Spectrum Pack 把清单、UI、WorldCanvas、模型、Behavior 和 Pack 资源作为一个可验证、可依赖、可原子切换的发布单元。

## 标准结构

```text
packs/shop/
├─ spectrum.yml
├─ ui/
│  ├─ shop.yml
│  └─ components.yml
├─ world/
│  └─ marker.yml
├─ models/
│  └─ guide.yml
├─ behaviors/
│  ├─ purchase.behavior.yml
│  └─ purchase.js
└─ assets/
   └─ shop/
      └─ textures/
```

## spectrum.yml

```yaml
schema: spectrumgraphics/pack/v1
id: shop:main
version: 1.2.0
name: Shop
description: 服务器商店视觉与业务 Pack
enabledByDefault: true

features:
  - ui
  - world-canvas
  - models
  - behaviors
  - assets
  - placeholders
  - container-proxy

dependencies:
  - id: core:items
    version: ^1.2.0
  - id: shop:optional-theme
    version: ^1.0.0
    optional: true

capabilities:
  - spectrumgraphics:economy
  - spectrumgraphics:inventory

actions:
  - shop:purchase
```

### features

| 值 | 允许的内容或能力 |
| --- | --- |
| `ui` | `ui/` 下的 UI 文档 |
| `world-canvas` | `world/` 下的世界空间场景 |
| `models` | `models/` 下的模型场景 |
| `behaviors` | Behavior 描述与脚本 |
| `assets` | Pack 资源声明与使用 |
| `placeholders` | 占位符状态源 |
| `container-proxy` | 原版容器 Slot 代理 |

不要通过遗漏 feature 绕过声明。使用了某项能力但未声明时，验证应失败。

### dependencies

依赖使用 SemVer 约束。必需依赖会先启用；缺失、版本不兼容或循环依赖都会拒绝候选快照。`optional: true` 表示缺失时允许 Pack 继续启用，但如果存在仍需满足版本范围。

常见范围：

```yaml
version: 1.2.3   # 精确版本
version: ^1.2.0  # 兼容的 1.x 更新
version: ~1.2.0  # 兼容的 1.2.x 更新
```

### actions 与 capabilities

- `actions` 是该 Pack 允许暴露给客户端 Flow 的服务端业务入口；
- `capabilities` 是 Behavior 可以请求的外部能力；
- 先声明，再由脚本、Kotlin API 或 Capability Provider 实现；
- 客户端不能调用未由当前文档和 Pack 声明的 Action。

## 原子重载

`/sg validate` 只构建候选，不改变当前在线状态。`/sg reload` 会：

1. 读取所有 Pack、独立 UI、WorldCanvas 与模型；
2. 验证 schema、命名空间、依赖和跨文件引用；
3. 编译变更内容，复用未变化的不可变快照；
4. 全部成功后一次切换；
5. 同步已打开文档、自动挂载场景和已 spawn 的模型。

任一候选失败时，完整旧快照继续生效。被删除或变为不可用的已绑定文档会在成功切换后关闭。

## 生命周期指令

```text
/sg pack enable <namespace:path>
/sg pack disable <namespace:path>
/sg pack unload <namespace:path>
```

- `enable`：启用已加载 Pack，并同步其自动挂载；
- `disable`：保留已加载定义但停用，并关闭不再可用的文档；
- `unload`：从当前仓库快照卸载；
- 反向依赖关系会阻止产生不一致的启停状态。

## 最佳实践

- 一个 Pack 只使用一个稳定命名空间；
- 将共享组件放进单独组件文件并显式 import；
- 将业务 Action、错误码和 Capability 一并纳入版本控制；
- 每次提交先执行 `/sg validate` 和自动验证脚本；
