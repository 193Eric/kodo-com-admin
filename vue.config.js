const path = require('path')
const webpack = require('webpack')
const packageJson = require('./package.json')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const createThemeColorReplacerPlugin = require('./config/plugin.config')

function resolve (dir) {
  return path.join(__dirname, dir)
}

// check Git
function getGitHash () {
  try {
    return GitRevision.version()
  } catch (e) {}
  return 'unknown'
}

const isProd = process.env.NODE_ENV === 'production'

const assetsCDN = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios'
  },
  css: [],
  js: [
    '//cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
    '//cdn.jsdelivr.net/npm/vue-router@3.5.1/dist/vue-router.min.js',
    '//cdn.jsdelivr.net/npm/vuex@3.1.1/dist/vuex.min.js',
    '//cdn.jsdelivr.net/npm/axios@0.21.1/dist/axios.min.js'
  ]
}

// vue.config.js
const vueConfig = {
  publicPath: '/dist',
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js
      // new webpack.IgnorePlugin({
      //   contextRegExp: /^\.\/locale$/,
      //   resourceRegExp: /moment$/
      // }),
      // new webpack.DefinePlugin({
      //   APP_VERSION: `"${packageJson.version}"`,
      //   GIT_HASH: JSON.stringify(getGitHash()),
      //   BUILD_DATE: buildDate
      // })
    ]
    // 移除可能导致冲突的 externals 配置
    // externals: isProd ? assetsCDN.externals : {}
  },

  chainWebpack: config => {
    config.resolve.alias.set('@$', resolve('src'))

    // fixed svg-loader
    const svgRule = config.module.rule('svg')
    config.module.rules.delete('svg')

    config.module.rule('svg')
      .oneOf('svg_as_component')
        .resourceQuery(/inline/)
        .test(/\.(svg)(\?.*)?$/)
        .use('babel-loader')
          .loader('babel-loader')
          .end()
        .use('vue-svg-loader')
          .loader('vue-svg-loader')
          .options({
            svgo: {
              plugins: [
              ]
            }
          })
          .end()
        .end()
      .oneOf('svg_as_regular')
        .merge(svgRule.toConfig())
        .end()
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'primary-color': '#11253e',
            'info-color': '#11253e',
            'link-color': '#11253e',
            'font-size-base': '12px',
            'border-radius-base': '6px',

            // 相关衍生色彩
            'primary-1': '#EEF2F6', // 对应 colorPrimaryBg
            'primary-2': '#D6E1EA',
            'primary-3': '#BED2DF',
            'primary-4': '#A6C3D4',
            'primary-5': '#8EB4C9',
            'primary-6': '#76A5BE',
            'primary-7': '#5E96B3',

            // 其他主题色
            'success-color': '#52c41a',
            'warning-color': '#faad14',
            'error-color': '#f5222d',
            // 🔘 按钮相关样式
            'btn-font-weight': '500',
            'btn-border-radius-base': '6px',
            'btn-border-radius-sm': '4px',
            'btn-border-radius-lg': '8px',
            'btn-primary-bg': '#11253e',
            'btn-primary-border': '#11253e',
            'btn-default-border': '#d9d9d9',
            'btn-default-bg': '#ffffff',
            'btn-height-base': '32px',
            'btn-height-lg': '40px',
            'btn-height-sm': '24px',
            'btn-padding-horizontal-base': '16px',
            'btn-padding-horizontal-lg': '24px',
            'btn-padding-horizontal-sm': '8px',

            // 文字和背景
            'text-color': '#333333',
            'text-color-secondary': '#666666',
            'heading-color': '#11253e',
            'border-color-base': '#d9d9d9',
            'component-background': '#ffffff',
            'body-background': '#f0f2f5',

            // 布局相关
            'layout-body-background': '#f0f2f5',
            'layout-header-background': '#ffffff',
            'layout-sider-background': '#f8fafc',

            // 菜单相关
            'menu-bg': '#f8fafc',
            'menu-item-color': '#4b5563',
            'menu-highlight-color': '#11253e',
            'menu-item-active-bg': '#EEF2F6',
            'menu-item-selected-bg': '#EEF2F6'
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 8000
  },

  productionSourceMap: false,
  lintOnSave: false,
  transpileDependencies: []
}

// preview.pro.loacg.com only do not use in your production;
if (process.env.VUE_APP_PREVIEW === 'true') {
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
}

module.exports = vueConfig
