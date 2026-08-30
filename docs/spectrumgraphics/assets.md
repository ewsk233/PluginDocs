# 资源构建与发布

SpectrumGraphics 的资源发布独立于普通 YAML 重载。源资源先被编译、归一化和打包，再以 `sgar-aes-256-gcm-v1` 格式认证加密。生成文件虽使用 `.zip` 后缀，但不是普通 ZIP，也不兼容其他插件的资源格式。

## 源资源目录

```text
plugins/SpectrumGraphics/resource/
├─ font/                         # TTF / OTF
├─ icon/                         # Text 图标
├─ textures/                     # UI 与通用纹理
├─ models/                       # .bbmodel / .geo.json / animation JSON / .sgmodel
├─ particle/                     # *.particle.json 与纹理
├─ sounds/
└─ server/items/                 # PNG / GIF / png.mcmeta 等物品源
```

构建器会：

- 把 BBModel 或 Bedrock GEO/Animation 编译为 `.sgmodel`；
- 把 `*.particle.json` 编译为 `.sgparticle`；
- 把 PNG/GIF/PNG mcmeta/SGModel 与 Item 规则编译为 `.sgitem`；
- 校验 Text 注册表引用的字体和图标；
- 只把运行时需要的结果与普通资源放入 staging，再加密归档。

UI、World、Camera、Slot、Pack 清单和 Behavior 不属于二进制资源，不要放在 `resource/`。

## 构建与发布

```text
/sg assets build production
/sg assets publish production
/sg assets status
```

省略 build ID 时默认为 `production`。结果位于：

```text
plugins/SpectrumGraphics/releases/<release-id>/
```

`build` 在后台执行并输出模型、物品、粒子、字体、图标的编译统计与诊断。`publish` 会再次验证归档存在且 SHA-256 与元数据一致，再原子切换当前发布并通知在线客户端。

只修改 YAML 时不需要重新构建资源；只有源字节变化或资源引用新增时才 build/publish。

## 手动分发

```yaml
assets:
  delivery:
    mode: manual
```

把构建命令输出的精确归档交给玩家，放入：

```text
.minecraft/resourcepacks/SpectrumGraphics/resource/
```

客户端按内容计算哈希，并只激活与服务端 offer 完全匹配的发布。文件名可以不同，字节和 hash 不能改变。

## HTTPS 自动分发

```yaml
assets:
  delivery:
    mode: auto
    public-base-url: https://cdn.example.com
    bind-address: 127.0.0.1
    bind-port: 8765
```

将公网 HTTPS 的 `/spectrum-assets/` 反向代理到 `127.0.0.1:8765/spectrum-assets/`，或把按 hash 命名的归档镜像到 CDN。然后执行 `/sg assets reload`。

客户端流程：

1. 下载到 `.part`；
2. 检查大小上限和 SHA-256；
3. 认证并解密 SGAR；
4. 成功后原子重命名并切换活动发布。

失败候选不会覆盖当前可用资源。

## 本地快速测试

开发客户端可以直接读取：

```text
.minecraft/resourcepacks/SpectrumGraphics/resource/
```

修改后按 `F7` 或 `F3+T`。普通 `/sg reload` 不要求服务端存在这些测试字节；但正式 `/sg assets build` 会严格要求服务端 `resource/` 中存在所有被声明引用的文件。

## 资源引用

```yaml
source: example:textures/gui/logo.png  # Minecraft namespaced 资源
source: textures/gui/logo.png          # Spectrum resource 根相对路径
```

禁止服务端磁盘绝对路径和 `..` 逃逸。远程图片只允许公共 HTTPS 主机。

动态图片限制包括 4 MiB、4096×4096、最多 120 GIF 帧和有界解码像素；Java 17/Minecraft 1.20.1 路径不支持 WebP。资源缺失或损坏时，节点或物品按各自 fallback 安全降级。

## 密钥与备份

`assets.key` 首次启动生成。不要公开或提交它。备份应同时包含：

```text
assets.key
releases/
releases/published.properties
```

丢失密钥后，旧发布无法继续由该服务端认证使用；需要恢复原密钥或重新构建并分发全部资源。

下一步：[物品外观与额外渲染](./item-appearance.md) · [Bedrock 粒子](./particles.md)
