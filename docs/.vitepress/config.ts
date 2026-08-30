import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: '/PluginDocs/',
  title: 'PluginDocs',
  description: 'Minecraft plugin documentation',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
    sidebar: {
      '/searching/': [
        {
          text: 'Searching',
          items: [
            { text: '概览', link: '/searching/' },
            { text: '配置文件', link: '/searching/config' },
            { text: 'Placeholder', link: '/searching/placeholder' },
            { text: 'API', link: '/searching/api' },
          ],
        },
      ],
      '/searchingsafebox/': [
        {
          text: 'SearchingSafeBox',
          items: [
            { text: '概览', link: '/searchingsafebox/' },
            { text: '配置文件', link: '/searchingsafebox/config' },
            { text: '开发 API', link: '/searchingsafebox/api' },
          ],
        },
      ],
      '/searchingkeycard/':[
        {
          text: 'SearchingKeycard',
          items: [
            { text: '概览', link: '/searchingkeycard/' },
            { text: '配置文件', link: '/searchingkeycard/config' }
          ]
        }
      ],
      '/spectrumgraphics/': [
        {
          text: '入门',
          items: [
            { text: '概览', link: '/spectrumgraphics/' },
            { text: '安装与快速开始', link: '/spectrumgraphics/getting-started' },
            { text: '目录与配置', link: '/spectrumgraphics/configuration' },
            { text: 'Spectrum Pack', link: '/spectrumgraphics/pack' },
            { text: '架构与运行边界', link: '/spectrumgraphics/architecture' },
            { text: '作者工作流', link: '/spectrumgraphics/authoring-workflow' },
          ],
        },
        {
          text: 'UI 作者指南',
          items: [
            { text: '文档与节点', link: '/spectrumgraphics/ui-basics' },
            { text: '布局与响应式', link: '/spectrumgraphics/layout-responsive' },
            { text: '状态、表达式与 Flow', link: '/spectrumgraphics/state-flow' },
            { text: '组件、响应式与动画', link: '/spectrumgraphics/components-animation' },
            { text: '字体、富文本与图标', link: '/spectrumgraphics/text' },
            { text: 'HUD 与原版 HUD', link: '/spectrumgraphics/hud' },
          ],
        },
        {
          text: 'Minecraft 界面集成',
          items: [
            { text: '原版 Screen 与容器', link: '/spectrumgraphics/mount-container' },
            { text: '聊天界面与消息层', link: '/spectrumgraphics/chat' },
            { text: '物品 Tooltip', link: '/spectrumgraphics/tooltips' },
            { text: '额外槽位', link: '/spectrumgraphics/extra-slots' },
            { text: '临时 HUD Feed', link: '/spectrumgraphics/transient-feeds' },
          ],
        },
        {
          text: '世界与视觉资源',
          items: [
            { text: '资源构建与发布', link: '/spectrumgraphics/assets' },
            { text: '物品外观与额外渲染', link: '/spectrumgraphics/item-appearance' },
            { text: 'WorldCanvas', link: '/spectrumgraphics/world-canvas' },
            { text: '伤害数字与世界弹出层', link: '/spectrumgraphics/world-popups' },
            { text: '3D 模型与动作', link: '/spectrumgraphics/models' },
            { text: 'Bedrock 粒子', link: '/spectrumgraphics/particles' },
            { text: 'Camera', link: '/spectrumgraphics/camera' },
            { text: 'Avatar 与时装', link: '/spectrumgraphics/avatar' },
            { text: '自定义按键', link: '/spectrumgraphics/keys' },
          ],
        },
        {
          text: '附属开发',
          items: [
            { text: '公共 API', link: '/spectrumgraphics/api' },
            { text: 'Behavior 与 Capability', link: '/spectrumgraphics/behaviors' },
          ],
        },
        {
          text: '运维与参考',
          items: [
            { text: '管理指令', link: '/spectrumgraphics/commands' },
            { text: 'Spectrum Studio', link: '/spectrumgraphics/studio' },
            { text: '验证与故障排查', link: '/spectrumgraphics/operations' },
            { text: '快速参考', link: '/spectrumgraphics/reference' },
          ],
        },
      ],
    },
  },
})
