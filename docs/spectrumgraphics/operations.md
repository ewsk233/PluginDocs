# 常见问题与限制

## 常见问题

### 指令成功但客户端没有 UI

检查：

- 玩家是否安装 Fabric 1.20.1 客户端 Mod；
- Plugin 与 Mod 是否同一构建；
- Pack 是否启用；
- UI ID 是否完整且命名空间正确；
- 客户端日志是否完成握手；
- automatic mount 是否真的匹配当前 Screen/Menu ID。

### `/sg reload` 失败

先运行 `/sg validate`，按诊断中的文件、YAML path 和节点定位。常见原因：

- schema 写错或仍使用早期字段；
- `root/children` 写成列表或添加内联 `id`；
- Pack feature 未声明；
- Pack 内 ID 命名空间不一致；
- import、component、Flow、Action、资源或模型引用不存在；
- 依赖缺失、版本不兼容或形成循环；
- 正则表达式非法；
- 超过文件、节点、深度或资源预算。

失败不会替换当前运行快照，先修复候选再重试。

### 图片或模型缺失

检查：

- 原始文件是否放在独立 `resource/`；
- 是否重新 `/sg assets build` 并 `/sg assets publish`；
- 客户端是否显示匹配 release hash 的状态；
- source 是资源包内路径，而不是服务端磁盘绝对路径；
- `.sgmodel` 的 asset ID 和场景引用是否一致；
- 若写了 `sha256`，它是否匹配实际文件。

### auto 下载失败

- `public-base-url` 必须为玩家可访问的 HTTPS；
- 反向代理路径必须包含 `/spectrum-assets/`；
- 防火墙允许反代访问 `bind-address:bind-port`；
- 不要把 `127.0.0.1` 当作公网 URL；
- 用 `/sg assets status` 检查发布和客户端状态；
- 检查代理是否改变了按哈希定位的归档字节。

### 原版容器 Slot 与点击位置错位

- 使用 `menu-slot`/`menu-slot-grid`，不要用普通 `slot`；
- replace 时设置 `preserveContainer: true`；
- 核对 `containerLayout`；
- 在多个 GUI Scale 和窗口尺寸测试 breakpoint；
- 确认 target 匹配的是正确 MenuType；
- 检查节点 bounds 与自定义 image/hoverImage 尺寸。

### 模型不播放

- 先 `/sg model spawn`，再 `play`；
- scene 和 instance ID 必须正确；
- animation 必须存在于编译后的 `.sgmodel`；
- 客户端必须已激活包含模型的资源发布；
- Controller 参数名称和类型必须与 YAML 声明一致；
- 非循环动作才适合 `on: completion` 迁移。

## 观察工具

客户端 `F8`：

- 布局、绘制与缓存；
- 网络、patch 和 state；
- ACK/NACK 与 resync；
- 帧预算和降级。

服务端 `/sg stats`：

- Behavior worker 和队列；
- 每 Action 调用/失败/超时/拒绝/fallback；
- 平均与最大耗时。

## 默认协议限制

| 限制 | 默认值 |
| --- | ---: |
| 单网络包 | 32,256 bytes |
| 解压后单包 | 2 MiB |
| 文档节点 | 4,096 |
| 树深 | 64 |
| 文本字符 / 字符串 UTF-8 | 16,384 / 16,384 bytes |
| 文档或状态 patch 操作 | 1,024 |
| 客户端缓存文档 | 32 |
| 状态键 / 总值 / 深度 | 2,048 / 8,192 / 16 |
| 事件 payload 条目 | 64 |
| 控件条目 | 2,048 |
| binding | 4,096 |
| 客户端 feature | 128 |
| UI 事件 | 40/s，burst 12 |

完整文档、patch 后结果、状态、事件和 UTF-8 编码都会再次验证，不能用差量或压缩绕过累计限制。

## Pack 与文件限制

| 限制 | 默认值 |
| --- | ---: |
| Pack 数 | 128 |
| 单 Pack 文件数 | 1,024 |
| 单 Pack 文件 | 8 MiB |
| 单 Pack 总量 | 64 MiB |
| 独立 UI 文件数 | 256 |
| 单独立 UI 文件 | 1 MiB |
| YAML 深度 / 值数 | 96 / 25,000 |
| automatic mount | 32 |

## 模型编译限制

| 限制 | 默认值 |
| --- | ---: |
| `.bbmodel` 源文件 | 16 MiB |
| 骨骼 | 512 |
| 顶点 | 1,000,000 |
| 三角形 | 500,000 |
| 动画 | 256 |
| 关键帧 | 500,000 |

这些是拒绝异常输入的硬边界，不是推荐把每个生产模型做到上限。
