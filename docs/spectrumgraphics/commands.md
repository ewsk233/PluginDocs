# 管理指令

主指令是 `/spectrumgraphics`，别名 `/sg`。权限：`spectrumgraphics.admin`，默认仅 OP。

## 总表

| 指令 | 作用 |
| --- | --- |
| `/sg open <template> [player]` | 为自己或在线玩家打开模板 |
| `/sg validate` | 校验全部 Pack、旧式 UI、WorldCanvas 和模型，不改变在线快照 |
| `/sg reload` | 重载资源分发配置，预检并原子重载所有内容 |
| `/sg schema` | 在 `plugins/SpectrumGraphics/schemas/` 生成 v1 JSON Schema |
| `/sg stats` | 查看脚本 worker、队列、超时、fallback 和每 Action 延迟 |
| `/sg pack enable <pack>` | 启用已加载 Pack |
| `/sg pack disable <pack>` | 停用 Pack 并关闭不再可用的文档 |
| `/sg pack unload <pack>` | 从当前仓库卸载 Pack |
| `/sg model load` | 校验并重载独立模型与含模型的 Pack |
| `/sg model spawn <scene> [player]` | 为玩家生成并绑定一个模型场景 |
| `/sg model play <scene> <instance> <animation> [player]` | 播放一次动作，默认 150 ms cross-fade |
| `/sg model stop <scene> <instance> [player]` | 停止实例动作 |
| `/sg assets reload` | 仅热重载资源交付配置并刷新客户端 offer |
| `/sg assets build [release]` | 异步构建加密发布；默认 ID 为 `production` |
| `/sg assets publish <release>` | 原子发布已经构建的资源版本 |
| `/sg assets status` | 查看当前发布、哈希、交付模式与客户端状态 |

## open

玩家给自己打开：

```text
/sg open example:shop
```

给指定玩家打开：

```text
/sg open example:shop Steve
```

控制台必须提供玩家名。模板 ID 和在线玩家名支持补全。目标玩家必须安装兼容客户端 Mod。

## validate 与 reload

推荐修改循环：

```text
/sg validate
/sg reload
```

`validate` 只创建候选并输出来源文件、YAML path、节点或 Pack 诊断。`reload` 只有在 Pack、UI、WorldCanvas 和模型全部预检成功时才切换；失败保留之前的可用快照。

`reload` 还会读取 `assets.delivery` 并向在线客户端刷新当前资源 offer，但不会自动构建新资源归档。

## Pack

```text
/sg pack enable shop:main
/sg pack disable shop:main
/sg pack unload shop:main
```

命令输出打开和关闭的文档数量。未找到 ID、状态无变化或依赖关系不允许时不会伪装为成功。

## 模型

玩家自己：

```text
/sg model load
/sg model spawn example:guide
/sg model play example:guide guide wave
/sg model stop example:guide guide
```

控制台或指定目标：

```text
/sg model spawn example:guide Steve
/sg model play example:guide guide wave Steve
/sg model stop example:guide guide Steve
```

`load` 会校验独立 `model/` 以及 Pack；失败时旧模型快照继续生效。`play/stop` 只对玩家已经 spawn 的 scene/instance 生效。

## 资源

```text
/sg assets build release-2026-08
/sg assets publish release-2026-08
/sg assets status
```

`build` 在后台线程执行，完成后输出文件数、字节和绝对路径。只有 build 完成的 release 才能 publish。发布时再次校验归档哈希。

修改 `config.yml` 后：

```text
/sg assets reload
```

如果 auto 监听绑定失败，旧配置继续生效。

## stats

```text
/sg stats
```

输出：

- 活跃工作线程、排队数和完成数；
- 每 Action 调用、成功、失败、超时、拒绝、fallback；
- 平均微秒和最大微秒。

它用于定位服务端 Behavior，不代替客户端 `F8` UI 性能面板。
