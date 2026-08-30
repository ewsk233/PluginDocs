# 聊天界面与消息层

SpectrumGraphics 提供三种不同层级的聊天能力。先按目标选择节点，不要把它们混在同一个用途里。

| 目标 | 使用方式 |
| --- | --- |
| 游戏 HUD 中移动近期聊天 | `chat-overlay` |
| 完全重做打开后的 ChatScreen | replace mount + `chat-history` + `chat-input-proxy` |
| 给原版聊天增加表情或按钮 | decorate mount + `onClick.chat` |

## 游戏中的 chat-overlay

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: example:chat_overlay
presentation: hud

body:
  recentChat:
    type: chat-overlay
    messageLimit: 100
    lineSpacing: 1.1
    scale: 1
    fade: true
    font: 主界面
    textColor: '#FFF1F6FA'
    backgroundColor: '#70081018'
    style:
      anchor: bottom-left
      x: 2vw
      y: -8vh
      width: 44vw
      height: 38vh
      minWidth: 260
      maxWidth: 520
      minHeight: 100
      maxHeight: 180
      padding: 4
      cornerRadius: 5
      clip: true
      pointerEvents: none
```

它保留 Minecraft Component 的颜色和格式，按节点宽度换行，并在 `fade: true` 时使用原版式消息年龄淡出。节点非交互，只在没有 Screen 打开时绘制。原版游戏聊天只会在存在可布局、非空的 chat-overlay 时被抑制；配置失效会回退原版。

`messageLimit` 是保留的消息数量，不是可见行数。实际可见行由节点高度、字号和换行决定，滚动历史不会因视口只够五行而被截断。

## 完全自定义 ChatScreen

```yaml
schema: spectrumgraphics/ui/authoring-v1
id: example:custom_chat
presentation: menu

mount:
  activation: automatic
  mode: replace
  priority: 600
  preserveNativeLogic: true
  targets:
    - screen: { exact: minecraft:chat }

body:
  shell:
    type: panel
    style: { anchor: bottom-left, x: 8, y: -8, width: 680, height: 244 }
    children:
      history:
        type: chat-history
        messageLimit: 200
        lineSpacing: 1.15
        fade: false
        font: 主界面
        backgroundColor: '#00000000'
        scrollbar: { visible: auto, width: 4, gap: 3, overlay: true }
        style: { x: 10, y: 30, width: 660, height: 166, clip: true }
      input:
        type: chat-input-proxy
        placeholder: 输入消息；Enter 发送，↑/↓ 历史，Tab 补全
        maxLength: 256
        font: 主界面
        renderSuggestions: true
        style: { x: 10, y: 204, width: 570, height: 24 }
      send:
        type: pressable
        onClick: { chat: { submit: true } }
        style: { x: 590, y: 204, width: 70, height: 24 }
```

`preserveNativeLogic: true` 是关键。它保留：

- 原版 Component hover/click；
- 光标、选择、剪贴板和输入草稿；
- 已发送历史的上下键导航；
- 命令与玩家 Tab 补全，包括鼠标点击和滚轮；
- Enter 发送与 Escape 关闭；
- 窗口缩放后正在输入的内容。

`chat-history` 与 `chat-input-proxy` 都支持 `font`；省略时可继承 Text 注册表中的 `vanilla.font`。命令建议和 Component hover 会在 Screen 的上层阶段绘制，不会被聊天面板裁掉。

## 频道按钮

聊天插件不是硬依赖。用 Placeholder 表示当前频道，用玩家命令切换：

```yaml
state:
  currentChannel:
    placeholder: '%trchat_channel%'
    default: Normal
    refresh: { onMount: true, whileMounted: 10t, afterAction: true }

body:
  normal:
    type: pressable
    selected: "= $currentChannel == 'Normal'"
    onClick:
      command: { executor: player, command: 'channel join Normal' }
    style: { width: 56, height: 20, cornerRadius: 8 }
    states:
      selected:
        backgroundColor: '#E05DBDDE'
        style: { border: { width: 1, color: '#FFD7F5FF' } }
```

切换 TrChat、其他聊天插件或自研频道，只需替换 Placeholder 和命令。基础样式中保留圆角，状态只覆盖颜色与边框，避免第一次打开和点击后形状不一致。

## 表情面板

decorate mount 可以保留原版 ChatScreen，并用按钮插入文字或 Spectrum Text 图标：

```yaml
mount:
  activation: automatic
  mode: decorate
  targets:
    - screen: { exact: minecraft:chat }

body:
  coin:
    type: pressable
    onClick: { chat: { icon: 金币 } }
```

还可使用 `chat: { insert: '/msg ' }`。输入代理与表情面板发生区域重叠时，命中测试按实际 Screen 层级和最高交互节点处理，不应由一个透明输入代理吞掉上方按钮。

下一步：[字体、富文本与图标](./text.md) · [原版 Screen 与容器](./mount-container.md)
