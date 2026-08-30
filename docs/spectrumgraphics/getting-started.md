# 安装与快速开始

这篇教程完成最小闭环：服务端加载插件、客户端完成握手、创建一个 Pack，并在游戏中打开第一个界面。

## 1. 准备环境

| 位置 | 必需内容 |
| --- | --- |
| 服务端 | Paper 或兼容 Bukkit 的 1.20.1 服务端、Java 17+、SpectrumGraphics 插件 |
| 客户端 | Minecraft 1.20.1、Fabric Loader 0.19.3+、Fabric API、Fabric Language Kotlin、SpectrumGraphics Mod |

PlaceholderAPI、Vault、MythicMobs 都是可选集成，不是启动前置。

将服务端插件放入 `plugins/`，将客户端 Mod 及 Fabric 依赖放入客户端 `mods/`。第一次启动后确认服务端出现 `plugins/SpectrumGraphics/`，并在客户端日志中看到 SpectrumGraphics 完成初始化。

> 不要混用不同构建的 Plugin 与 Mod。项目仍在发布前开发阶段，协议版本相同也不代表任意两个构建可以互通。

## 2. 创建第一个 Pack

建立目录：

```text
plugins/SpectrumGraphics/packs/hello/
├─ spectrum.yml
└─ ui/
   └─ welcome.yml
```

`spectrum.yml`：

```yaml
schema: spectrumgraphics/pack/v1
id: hello:main
version: 1.0.0
name: Hello
enabledByDefault: true
features: [ui]
```

`ui/welcome.yml` 使用推荐的人类作者格式：

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: hello:welcome
presentation: menu

layer:
  name: hello
  order: 100
  input: capture

body:
  card:
    type: panel
    backgroundColor: '#E0182030'
    style:
      width: 280
      height: 110
      anchor: center
      padding: 14
      cornerRadius: 10
      border: { width: 1, color: '#8068BDE8' }
    children:
      title:
        type: text
        text: 欢迎使用 SpectrumGraphics
        color: '#FFFFFFFF'
        fontSize: 14
      hint:
        type: text
        text: 这是由服务端 YAML 描述的界面
        color: '#FF9EB0BF'
        fontSize: 9
        style: { y: 28 }
```

`body` 和每个 `children` 都是“稳定节点 ID → 节点声明”的映射。`card`、`title`、`hint` 是节点 ID，不是显示文字。

## 3. 验证、重载和打开

在服务端执行：

```text
/sg validate
/sg reload
```

玩家在游戏内执行：

```text
/sg open hello:welcome
```

控制台需要指定在线玩家：

```text
/sg open hello:welcome Steve
```

## 4. 判断是否成功

- `/sg validate` 没有错误；
- 客户端日志已完成 SpectrumGraphics 握手；
- `/sg open` 后显示居中的半透明卡片；
- 修改文字并 `/sg reload` 后，按模板打开的文档自动更新；
- 客户端按 `F8` 可以查看 SpectrumGraphics 性能面板。

若指令成功但没有画面，先核对 Mod 是否加载、Plugin/Mod 是否同一构建、Pack 是否启用以及文档 ID 是否正确，再阅读[验证与故障排查](./operations.md)。

下一步：[目录与配置](./configuration.md) · [作者工作流](./authoring-workflow.md)
