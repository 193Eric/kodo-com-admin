<template>
  <pro-layout
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="i18nRender"
    :trigger="null"
    v-bind="settings"
    class="trustpay-layout"
  >
    <!-- 1.0.0+ 版本 pro-layout 提供 API，
          我们推荐使用这种方式进行 LOGO 和 title 自定义
    -->
    <template #menuHeaderRender>
      <div class="trustpay-logo">
        <span class="logo-text" >KODO</span>
        <!-- <span class="logo-star">⭐</span> -->
      </div>
    </template>

    <!-- 在侧边栏底部添加商户切换器 -->
    <template #menuExtraRender>
      <div class="sider-bottom">
        <MerchantSwitcher />
      </div>
    </template>

    <!-- 1.0.0+ 版本 pro-layout 提供 API,
          增加 Header 左侧内容区自定义
    -->
    <template #headerContentRender>
      <div class="header-left-content">
        <!-- 可以在这里添加左侧内容，比如面包屑 -->
      </div>
    </template>

    <template #rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>

    <router-view />
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapState } from 'vuex'
import MerchantSwitcher from '@/components/MerchantSwitcher'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import Ads from '@/components/Other/CarbonAds'

export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent,
    GlobalFooter,
    MerchantSwitcher,
    Ads
  },
  data () {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end
      isDev: process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',

      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: 'Trustpay',
      selectedLanguage: 'en',
      settings: {
        // 布局类型
        layout: 'sidemenu', // 强制使用侧边栏布局
        // CONTENT_WIDTH_TYPE
        contentWidth: CONTENT_WIDTH_TYPE.Fluid,
        // 主题 'dark' | 'light'
        theme: 'light', // 使用浅色主题
        // 主色调
        primaryColor: '#11253e',
        fixedHeader: true,
        fixSiderbar: true,
        colorWeak: false,

        // Trustpay 特定设置
        navTheme: 'light',
        headerTheme: 'light',

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters
    })
  },
  created () {
    const routes = this.mainMenu.find(item => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
      updateTheme(this.settings.primaryColor)
    }
  },
  methods: {
    i18nRender,
    handleMediaQuery (val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse (val) {
      this.collapsed = val
    },
    handleSettingChange ({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fixed
          }
          break
      }
    }
  }
}
</script>

<style lang="less">
@import "./BasicLayout.less";

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #000;
}

// Trustpay 主题样式覆盖
.trustpay-layout {

  // 侧边栏样式
  .ant-pro-sider {
    background: #f8fafc !important;
    border-right: 1px solid #e5e7eb !important;

    .ant-pro-sider-logo {
      background: #f8fafc !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding: 20px 24px !important;

        .logo-star {
          font-size: 16px;
        }
    }

    // 菜单样式
    .ant-menu {
      background: transparent !important;
      border-right: none !important;
      padding: 16px 12px;

      .ant-menu-item {
        color: #4b5563 !important;
        font-weight: 500;
        margin: 4px 0 !important;
        border-radius: 8px !important;
        height: 40px;
        line-height: 40px;

        &:hover {
          color: #11253e !important;
          background-color: #eff6ff !important;
        }

        &.ant-menu-item-selected {
          background-color: #eff6ff !important;
          color: #11253e !important;

          &::after {
            display: none !important;
          }
        }

        .anticon {
          font-size: 16px;
          margin-right: 12px;
        }
      }

      .ant-menu-submenu {
        .ant-menu-submenu-title {
          color: #4b5563 !important;
          font-weight: 500;
          margin: 4px 0 !important;
          border-radius: 8px !important;
          height: 40px;
          line-height: 40px;

          &:hover {
            color: #11253e !important;
            background-color: #eff6ff !important;
          }
        }

        &.ant-menu-submenu-open,
        &.ant-menu-submenu-selected {
          .ant-menu-submenu-title {
            color: #11253e !important;
            background-color: #eff6ff !important;
          }
        }
      }

      // 子菜单样式
      .ant-menu-sub {
        background: transparent !important;

        .ant-menu-item {
          padding-left: 48px !important;
          color: #6b7280 !important;

          &:hover {
            color: #11253e !important;
            background-color: #eff6ff !important;
          }

          &.ant-menu-item-selected {
            background-color: #eff6ff !important;
            color: #11253e !important;
          }
        }
      }
    }
  }

  // 顶部Header样式
  .ant-pro-global-header {
    background: #ffffff !important;
    border-bottom: 1px solid #e5e7eb !important;
    box-shadow: none !important;

    .ant-pro-global-header-trigger {
      color: #4b5563 !important;

      &:hover {
        color: #11253e !important;
        background: #f9fafb !important;
      }
    }

    // 确保右侧内容区域有足够空间
    .ant-pro-global-header-right {
      flex-shrink: 0 !important;
      margin-left: auto !important;
    }
  }

  // 主内容区域
  .ant-pro-basicLayout-content {
    background: #f9fafb !important;
    min-height: calc(100vh - 64px);
  }

  // 右侧内容区样式
  .trustpay-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 300px;

    .header-action-btn {
      color: #4b5563;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      flex-shrink: 0;

      &:hover {
        color: #11253e;
        background: #f9fafb;
      }

      .anticon {
        font-size: 14px;
      }
    }

    .language-select {
      flex-shrink: 0;
      min-width: 100px;

      .ant-select-selector {
        border: none !important;
        background: transparent !important;
        color: #4b5563;
        padding: 0 8px !important;

        .ant-select-selection-item {
          color: #4b5563;

          .language-option {
            font-size: 13px;
          }
        }
      }

      &:hover .ant-select-selector {
        color: #11253e;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      min-width: 160px;

      .user-avatar {
        background-color: #11253e;
        color: #ffffff;
        font-weight: 600;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }

      .user-email {
        color: #4b5563;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

// 商户切换器底部定位样式
.sider-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

// 确保侧边栏有足够的底部空间
.ant-pro-sider {
  .ant-layout-sider-children {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    position: relative !important;

    .ant-menu {
      flex: 1 !important;
      overflow-y: auto !important;
      margin-bottom: 80px !important; // 为商户切换器留出空间
    }
  }
}

// 收起状态下的商户切换器样式
.ant-pro-sider.ant-pro-sider-collapsed {
  .sider-bottom {
    .merchant-switcher {
      .merchant-current {
        justify-content: center;

        .merchant-info {
          .merchant-details {
            display: none;
          }
        }

        .merchant-arrow {
          display: none;
        }
      }
    }
  }
}

// 其余样式保持不变...
// 全局样式调整
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

// 页面容器样式
.ant-pro-basicLayout {
  .ant-layout {
    background: #f9fafb;
  }
}

// 响应式处理
@media (max-width: 768px) {
  .trustpay-layout {
    .trustpay-header-right {
      gap: 8px;

      .user-email {
        display: none;
      }

      .language-select {
        .language-option {
          font-size: 12px;
        }
      }
    }
  }
}

// 收起状态下的样式
.trustpay-layout.ant-pro-basicLayout-has-sider {
  .ant-pro-sider.ant-pro-sider-collapsed {
    .ant-pro-sider-logo {
      .trustpay-logo {
        justify-content: center;

        .logo-text {
          display: none;
        }

        .logo-star {
          font-size: 20px;
        }
      }
    }
  }
}

// 修复一些pro-layout的默认样式
.ant-pro-basicLayout-content {
  .ant-layout-content {
    margin: 0;
    padding: 0;
  }
}

// Trustpay特色的卡片样式
.ant-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .ant-card-head {
    border-bottom: 1px solid #e5e7eb;

    .ant-card-head-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
  }
}

// 表格样式增强
.ant-table {
  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #374151;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f9fafb;
  }
}

// 按钮样式增强
.ant-btn {
  border-radius: 8px;
  font-weight: 500;

  &.ant-btn-primary {
    background: #11253e;
    border-color: #11253e;

    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
}

// 输入框样式增强
.ant-input {
  border-radius: 8px;
  border: 1px solid #d1d5db;

  &:focus {
    border-color: #11253e;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  }
}

// 选择器样式增强
.ant-select {
  .ant-select-selector {
    border-radius: 8px;
    border: 1px solid #d1d5db;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: #11253e;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  }
}
</style>
