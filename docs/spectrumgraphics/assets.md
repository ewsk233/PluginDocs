# 资源与加密发布

SpectrumGraphics 提供独立于 Pack 生命周期的客户端资源发布系统。它使用自有 `sgar-aes-256-gcm-v1` 格式：先生成确定性 ZIP payload，再用 AES-256-GCM 认证加密。文件后缀虽然是 `.zip`，但不是普通压缩包，也不与其他插件格式兼容。

## 准备资源

只把客户端需要的原始文件放进：

```text
plugins/SpectrumGraphics/resource/
├─ textures/
│  └─ gui/logo.png
├─ models/
│  └─ guide.sgmodel
├─ sounds/
└─ fonts/
```

UI YAML、WorldCanvas、模型场景 YAML、Behavior、Pack 清单和服务端配置不要放在这里，也不会被打包。

## 构建与发布

```text
/sg assets build production
/sg assets publish production
/sg assets status
```

不提供 ID 时，`build` 默认使用 `production`：

```text
/sg assets build
```

构建结果位于：

```text
plugins/SpectrumGraphics/releases/<release-id>/
```

发布前会重新检查归档存在且 SHA-256 与元数据一致。`publish` 原子替换当前发布，并立即向已连接客户端发送新 offer。

## 手动分发

默认配置：

```yaml
assets:
  delivery:
    mode: manual
```

把构建命令输出的精确归档交给玩家，直接放进：

```text
.minecraft/resourcepacks/SpectrumGraphics/resource/xxx.zip
```

客户端连接后会扫描 ZIP、计算哈希并激活与服务端 offer 匹配的发布。文件名可以变化，但内容哈希必须完全一致。

## HTTPS 自动分发

```yaml
assets:
  delivery:
    mode: auto
    public-base-url: https://cdn.example.com
    bind-address: 127.0.0.1
    bind-port: 8765
```

将公网 HTTPS 的 `/spectrum-assets/` 反向代理到 `127.0.0.1:8765/spectrum-assets/`，或把按内容寻址的归档镜像到 CDN。然后执行：

```text
/sg assets reload
```

自动模式强制 `public-base-url` 使用 HTTPS。协议只发送 release ID、大小、SHA-256、下载 URL 和本会话所需的加密信息；归档字节走 HTTPS。

## 客户端下载保证

1. 下载到 `.part` 临时文件；
2. 限制下载大小；
3. 检查归档 SHA-256；
4. 认证并解密 SGAR；
5. 成功后原子重命名并切换活动发布。

失败候选不会覆盖当前可用资源。`/sg assets status` 会显示已发布哈希、交付模式和客户端状态计数。

## 在 UI 与模型中引用

UI namespaced 资源：

```yaml
type: image
source: example:textures/gui/logo.png
```

相对本地资源：

```yaml
type: image
source: textures/gui/logo.png
```

模型场景引用资源包内路径：

```yaml
assets:
  example:guide:
    source: models/guide.sgmodel
```

可选 `sha256` 可把场景绑定到特定模型字节：

```yaml
assets:
  example:guide:
    source: models/guide.sgmodel
    sha256: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## 动态图片限制

- 单张动态图片最大 4 MiB；
- 最大尺寸 4096×4096；
- 最大 16,777,216 像素；
- GIF 最多 120 帧、33,554,432 解码像素；
- 远程图片只允许 HTTPS 公共主机；
- 缓存最多保留 128 个源和 256 个 GPU 纹理；
- Java 17 / Minecraft 1.20.1 解码器不支持 WebP。

`loop: false` 的 GIF 播放到最后一帧停止；Flow 可用 `spectrumgraphics:image-animation-play/pause/restart/seek` 控制已加载动画。

## 密钥与备份

- 首次启动自动生成 `assets.key`；
- 不要公开或提交此文件；
- 已有 published release 时丢失密钥，插件会要求恢复原密钥或重新构建并发布；
- 备份应同时包含 `assets.key`、`releases/` 和当前 `published.properties`；
- 轮换密钥意味着所有客户端发布都需要重新构建和分发。
