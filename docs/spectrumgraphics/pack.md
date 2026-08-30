# Spectrum Pack

Pack 把相关声明、依赖和业务能力作为一个可校验、可依赖、可原子启停的内容单元。新项目应使用 Pack，而不是把所有文件散放在插件根目录。

## 推荐结构

```text
packs/shop/
├─ spectrum.yml
├─ ui/
│  ├─ components.yml
│  └─ shop.yml
├─ tooltip/
│  └─ item.yml
├─ world/
├─ model/
├─ camera/
├─ key/
├─ avatar/
├─ text/
├─ item/
└─ behaviors/
   ├─ purchase.behavior.yml
   └─ purchase.js
```

模型、字体、图片和粒子等源资源统一放在 `plugins/SpectrumGraphics/resource/`，不是 Pack 声明目录的一部分。

## spectrum.yml

```yaml
schema: spectrumgraphics/pack/v1
id: shop:main
version: 1.2.0
name: Server Shop
description: 商店界面和购买行为
enabledByDefault: true

features:
  - ui
  - world-canvas
  - models
  - camera
  - key
  - behaviors
  - placeholders
  - container-proxy

dependencies:
  - id: core:items
    version: ^1.2.0
  - id: shop:optional-theme
    version: ^1.0.0
    optional: true

actions: [shop:purchase]
capabilities: [spectrumgraphics:economy, spectrumgraphics:inventory]
```

### ID 规则

不要把所有 ID 混为同一种规则：

- Pack ID、依赖、业务 Action 和 Capability 必须是小写 ASCII `namespace:path`；
- UI、World、Model、Camera、Key、Avatar、Item 等内容 ID 可为纯文本、数字、Unicode、路径式或 namespaced ID；
- 所有启用内容的最终文档 ID 必须全局唯一；
- 未显式写 ID 时，部分目录会按相对路径和 Pack 命名空间推导 ID，具体以 Schema 和验证结果为准。

### Feature 声明

Feature 表示 Pack 获准加载或使用的能力。常见值：

| Feature | 内容 |
| --- | --- |
| `ui` | `ui/` 与 `tooltip/` |
| `world-canvas` | `world/` |
| `models` | `model/` |
| `camera` | `camera/` |
| `key` | `key/` |
| `behaviors` | Behavior 描述与脚本 |
| `assets` | Pack 内 `assets/` 内容与资源声明 |
| `placeholders` | Placeholder 数据源 |
| `container-proxy` | 原版容器 Slot 代理 |

`text/`、`avatar/` 和 `item/` 是 Pack 内建发现目录，不要为它们编造不存在的 feature。使用了需要声明的能力却遗漏 feature 时，候选 Pack 会被拒绝。

Pack `assets/` 会进入 Pack 的内容 hash，并要求 `assets` feature，适合随 Pack 保存供 Studio 或普通资源包工程复用的文件；它不是加密发布的源目录。当前 `/sg assets build` 仍从全局 `plugins/SpectrumGraphics/resource/` 构建运行时资源。

### 依赖与版本

必需依赖必须存在、版本匹配并先于当前 Pack 启用。`optional: true` 允许依赖缺失，但依赖一旦存在仍需满足版本范围。支持精确版本、`^1.2.0` 和 `~1.2.0` 等 SemVer 范围；循环依赖会拒绝整个候选。

## 原子重载

`/sg validate` 只构造候选，不改变在线内容。`/sg reload` 会先验证所有 Pack 和独立内容；全部成功后才一次切换，并同步已打开文档和自动挂载内容。任何错误都会让上一份有效快照继续运行。

```text
/sg pack enable shop:main
/sg pack disable shop:main
/sg pack unload shop:main
```

- `enable`：启用已加载 Pack 并发布自动内容；
- `disable`：保留定义但停止使用，关闭不再可用的在线文档；
- `unload`：从当前仓库快照移除；
- 反向依赖会阻止造成不一致的停用或卸载。

## 独立内容与覆盖

根目录下的 `ui/`、`world/`、`text/` 等仍受支持。独立 Text、Avatar 等仓库在同 ID 冲突时可能具有明确覆盖规则，但新项目不要依赖隐式覆盖来组织主题；把同一功能放在一个 Pack 内更容易审查和回滚。

下一步：[作者工作流](./authoring-workflow.md) · [Behavior 与 Capability](./behaviors.md)
