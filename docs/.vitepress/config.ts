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
    },
  },
})
