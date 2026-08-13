# 目录与配置

首次启动后的主要目录如下：

```text
plugins/SpectrumGraphics/
├─ config.yml
├─ assets.key
├─ packs/                 # 推荐：完整 Spectrum Pack
├─ ui/                    # 兼容：独立旧式 UI
├─ world/                 # 兼容：独立 WorldCanvas 场景
├─ model/                 # 独立模型场景 YAML
├─ resource/              # 独立加密客户端资源的原始文件
├─ releases/              # 已构建的不可变加密发布
└─ schemas/               # /sg schema 生成的 JSON Schema
```

客户端资源目录：

```text
.minecraft/resourcepacks/SpectrumGraphics/resource/
```

手动分发的发布 ZIP 直接放在该目录；客户端会计算哈希并激活与服务端当前发布完全匹配的文件。

## config.yml

当前全局配置负责独立资源分发：

```yaml
assets:
  delivery:
    # manual：自行分发 releases/<id>/*.zip
    # auto：通过 HTTPS 反向代理自动下载
    mode: manual
    public-base-url: ''
    bind-address: 127.0.0.1
    bind-port: 8765
```

| 字段 | 说明 |
| --- | --- |
| `mode` | `manual` 或 `auto` |
| `public-base-url` | 玩家能访问的 HTTPS 外部地址，不要以本机回环地址代替 |
| `bind-address` | 内置下载监听器绑定地址，推荐保持 `127.0.0.1` 并放在反向代理后 |
| `bind-port` | 内置下载监听端口，默认 `8765` |

修改后执行 `/sg assets reload`。如果新监听器启动失败，旧配置保持生效，不会把在线资源服务切到损坏状态。

执行`/sg assets build` **打包 `resource/`**。

## 推荐的生产目录策略

- 所有新 UI、WorldCanvas、模型场景和 Behavior 放进 Pack；
- 图片、GIF、声音、字体、`.sgmodel` 等客户端资源放进 `resource/` 并发布；
- 独立 `ui/`、`world/`、`model/` 只用于兼容或快速实验。

## ID 与文件规则

- Pack、UI、场景、模型资源、Action 和 Capability 使用小写 `namespace:path`；
- Pack 内 UI/World/Model 的命名空间必须与 Pack 一致；
- 远程图片仅允许 HTTPS 公共主机；
