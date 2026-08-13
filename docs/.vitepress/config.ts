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
          text: '开始使用',
          items: [
            { text: '概览', link: '/spectrumgraphics/' },
            { text: '安装与第一个界面', link: '/spectrumgraphics/getting-started' },
            { text: '目录与配置', link: '/spectrumgraphics/configuration' },
            { text: 'Spectrum Pack', link: '/spectrumgraphics/pack' },
          ],
        },
        {
          text: '界面系统',
          items: [
            { text: 'UI 基础', link: '/spectrumgraphics/ui-basics' },
            { text: '状态、表达式与 Flow', link: '/spectrumgraphics/state-flow' },
            { text: '组件、响应式与动画', link: '/spectrumgraphics/components-animation' },
            { text: '原版界面与容器', link: '/spectrumgraphics/mount-container' },
          ],
        },
        {
          text: '视觉与业务能力',
          items: [
            { text: '资源与加密发布', link: '/spectrumgraphics/assets' },
            { text: 'WorldCanvas', link: '/spectrumgraphics/world-canvas' },
            { text: '3D 模型与动作', link: '/spectrumgraphics/models' },
            { text: 'Behavior 与 Capability', link: '/spectrumgraphics/behaviors' },
          ],
        },
        {
          text: '开发与运维',
          items: [
            { text: '开发 API', link: '/spectrumgraphics/api' },
            { text: '管理指令', link: '/spectrumgraphics/commands' },
            { text: 'Spectrum Studio', link: '/spectrumgraphics/studio' },
            { text: '验证、排错与限制', link: '/spectrumgraphics/operations' },
            { text: '快速参考', link: '/spectrumgraphics/reference' },
          ],
        },
      ],
    },
  },
})
