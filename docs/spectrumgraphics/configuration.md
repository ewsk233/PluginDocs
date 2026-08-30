# 目录与配置

SpectrumGraphics 把“声明文件”“源资源”和“已构建发布”分开保存。新项目优先使用 Pack；根目录下的各内容目录适合全局定义、快速实验或兼容旧配置。

## 服务端目录

```text
plugins/SpectrumGraphics/
├─ config.yml
├─ assets.key
├─ packs/<pack>/       # 推荐：原子内容包
├─ ui/                 # 独立 UI、HUD、Tooltip、World Popup
├─ world/              # 独立 WorldCanvas
├─ model/              # 模型场景 YAML
├─ camera/             # Camera 文档
├─ key/                # 自定义按键文档
├─ avatar/             # Avatar Profile 与 Cosmetic
├─ text/               # 字体和图标注册表
├─ slot/               # 额外槽位定义
├─ item/               # 物品外观和额外渲染规则
├─ resource/           # 字体、纹理、模型、粒子等源资源
├─ releases/           # 已构建的加密发布
├─ player-data.db      # 默认 SQLite 玩家数据
└─ avatar-loadouts.yml # 默认 Avatar 装扮存档
```

常见放置错误：

- UI/Camera/Slot 等 YAML 不是客户端资源，不要放进 `resource/`；
- TTF、PNG、GIF、BBModel、Bedrock 粒子 JSON 等二进制或源资源放进 `resource/`；
- Pack 内的 `text/`、`item/`、`avatar/` 是声明目录，相关源资源仍由全局 `resource/` 构建发布；
- 不要建立 `packs/ui/` 或 `packs/item/`，`packs` 的直接子目录必须先是具体 Pack。

## 客户端本地资源

服主快速测试时，可以把尚未发布的资源放在：

```text
.minecraft/resourcepacks/SpectrumGraphics/resource/
```

修改后按 `F7` 或执行原版 `F3+T` 重载资源。正式服应使用 `/sg assets build` 和 `/sg assets publish`，详见[资源构建与发布](./assets.md)。

## config.yml

默认配置只有资源交付与玩家数据库：

```yaml
assets:
  delivery:
    mode: manual
    public-base-url: ''
    bind-address: 127.0.0.1
    bind-port: 8765

database:
  enable: false
  file: player-data.db
  tables:
    extra-slots: spectrumgraphics_extra_slots
  host: localhost
  port: 3306
  user: root
  password: ''
  database: minecraft
  flags: []
  clear-flags: false
  ssl: ''
  sync-ticks: 80
```

### 资源交付

| 字段 | 说明 |
| --- | --- |
| `mode` | `manual` 手动分发，或 `auto` 由客户端 HTTPS 下载 |
| `public-base-url` | 玩家可访问的 HTTPS 地址；`auto` 模式必填 |
| `bind-address` | 内置下载服务绑定地址，推荐保持 `127.0.0.1` 并由反向代理暴露 |
| `bind-port` | 内置下载端口，默认 `8765` |

资源交付配置可用 `/sg assets reload` 热更新；新监听器启动失败时旧配置继续生效。

### 玩家数据库

`database.enable: false` 使用插件目录内的 SQLite；`true` 使用 MySQL。每一种玩家数据拥有独立表，当前内建持久化只有 `extra-slots`。

连接方式和表名在插件启动时建立，修改后需要重启服务器。`sync-ticks` 控制 MySQL 跨服缓存刷新间隔；同一玩家在多服同时修改采用最后写入者生效，不提供分布式事务锁。

## 哪些修改如何生效

| 修改内容 | 操作 |
| --- | --- |
| Pack、UI、World、Model、Camera、Key、Avatar、Text、Slot、Item 规则 | `/sg validate` 后 `/sg reload` |
| `assets.delivery` | `/sg assets reload`，或统一 `/sg reload` |
| `resource/` 源资源 | `/sg assets build`，再 `/sg assets publish` |
| 客户端本地测试资源 | `F7` 或 `F3+T` |
| 数据库类型、连接参数、表名 | 重启服务端 |

下一步：[Spectrum Pack](./pack.md) · [资源构建与发布](./assets.md)
