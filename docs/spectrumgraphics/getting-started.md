# 安装与第一个界面

## 环境要求

| 位置 | 要求 |
| --- | --- |
| 服务端 | Paper或其他实现了Bukkit的服务端，运行 Java 17 或更高版本 |
| 客户端 | Fabric Loader、Fabric API、Fabric Language Kotlin |

PlaceholderAPI 是可选软依赖；安装后可解析更多占位符。使用内置经济 Capability 时需要 Vault 和一个可用的经济实现。

## 创建第一个 Pack

在 `plugins/SpectrumGraphics/packs/hello/` 中创建：

```text
hello/
├─ spectrum.yml
└─ ui/
   └─ welcome.yml
```

`spectrum.yml`：

```yaml
schema: spectrumgraphics/pack/v1
id: hello:main
version: 1.0.0
name: Hello Pack
enabledByDefault: true
features: [ui]
```

`ui/welcome.yml`：

```yaml
schema: spectrumgraphics/ui/v1
id: hello:welcome
presentation: menu

root:
  card:
    type: panel
    backgroundColor: "#E0182030"
    style:
      width: 240
      height: 100
      anchor: center
      padding: 12
      cornerRadius: 8
    children:
      title:
        type: text
        text: 欢迎使用 SpectrumGraphics
        color: "#FFFFFFFF"
        fontSize: 13
```

依次执行：

```text
/sg validate
/sg reload
/sg open hello:welcome
```

控制台打开时需要指定在线玩家：

```text
/sg open hello:welcome Steve
```

## 验证是否正常

- `/sg validate` 返回 0 个错误；
- 客户端已安装 Mod，且服务端没有版本不兼容提示；
- `/sg open hello:welcome` 后屏幕中央出现卡片；
- 修改文字后执行 `/sg reload`，已经按模板打开的文档自动更新；
- 客户端按 `F8` 可以显示性能面板。

如果指令成功但没有画面，优先检查：客户端 Mod 是否加载、Plugin 与 Mod 是否同版本、Pack 是否启用、模板 ID 是否带正确命名空间。详见[验证、排错与限制](./operations.md)。
