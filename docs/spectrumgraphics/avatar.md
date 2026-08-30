# Avatar 与时装

Avatar 用 SGModel 替换或增强玩家外观，并统一描述第一人称手、语义动作和附着式时装。定义可放在全局 `avatar/` 或 Pack `avatar/`；模型和纹理源仍在全局 `resource/`。

## Profile 与 Cosmetic

```yaml
schema: spectrumgraphics/avatar/v1

profiles:
  示例玩家:
    model: example:avatar/player
    mode: replace
    skin: player
    animations: auto
    firstPerson:
      model: example:avatar/player_arms
      skin: player
      animations: auto
      hideVanillaHands: true
      hideVanillaItems: false

cosmetics:
  示例帽子:
    model: example:avatar/hat
    type: rigid
    slot: head
    attach: head
```

Profile 决定基础玩家模型、替换模式、皮肤和第一人称表现；Cosmetic 决定独立模型怎样附着到骨骼或槽位。Pack 的 Avatar 是内建发现内容，不需要在 manifest 添加虚构的 `avatars` feature。

## 装备与动作

```text
/sg avatar load
/sg avatar list
/sg avatar set <profile> [player]
/sg avatar clear [player]
/sg avatar equip <cosmetic> [player]
/sg avatar unequip <slot-or-cosmetic> [player]
/sg avatar play <action> [player]
```

`animations: auto` 让客户端根据移动、跳跃、攻击等语义选择动作；API 也可显式播放语义 action。第一人称模型可以独立决定是否隐藏原版手与手持物品。

## 存储与扩展

默认 loadout 存储为 `plugins/SpectrumGraphics/avatar-loadouts.yml`。附属可通过：

- `registerCatalogProvider` 提供 Profile/Cosmetic；
- `registerEntitlementProvider` 决定玩家能否使用；
- `registerLoadoutStore` 替换持久化；
- `set`、`clear`、`equip`、`unequip` 和 `playAction` 控制玩家。

注册返回 `AutoCloseable`，附属卸载时必须关闭。服务端保存最终装扮权威，客户端只渲染已经授权和同步的 appearance。

## 资源与回退

模型源经 `/sg assets build` 编译和发布。资源缺失、模型损坏或客户端不支持时应回退原版玩家，而不是隐藏玩家实体。Avatar、模型、时装和第一人称效果必须在多人、旁观、重连和不同视角下验收。

下一步：[资源构建与发布](./assets.md) · [3D 模型与动作](./models.md)
