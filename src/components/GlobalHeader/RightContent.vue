<template>
  <div :class="wrpCls" class="trustpay-header-right">
    <!-- 通知按钮 -->
    <a-tooltip title="通知">
      <a-button
        type="text"
        :class="[prefixCls, 'header-action-btn', 'notification-btn']"
        @click="handleNotificationClick"
      >
        <!-- <a-badge :count="3" size="small"> -->
        <a-icon type="bell" />
        <!-- </a-badge> -->
      </a-button>
    </a-tooltip>

    <!-- 帮助按钮 -->
    <!-- <a-tooltip title="帮助">
      <a-button
        type="text"
        :class="[prefixCls, 'header-action-btn', 'help-btn']"
        @click="handleHelpClick"
      >
        <a-icon type="question-circle" />
      </a-button>
    </a-tooltip> -->

    <!-- 语言选择 - 使用现有组件但应用新样式 -->
    <select-lang
      :class="[prefixCls, 'trustpay-lang-select']"
    />

    <!-- 用户下拉菜单 - 使用现有组件但应用新样式 -->
    <avatar-dropdown
      :menu="showMenu"
      :current-user="currentUser"
      :class="[prefixCls, 'trustpay-user-dropdown']"
    />
  </div>
</template>

<script>
import AvatarDropdown from './AvatarDropdown'
import SelectLang from '@/components/SelectLang'

export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLang
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      showMenu: true,
      currentUser: {
        name: 'lian****@example.com',
        avatar: 'L' // 使用字母作为头像
      }
    }
  },
  computed: {
    wrpCls () {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-light`]: true // 强制使用 light 主题
      }
    }
  },
  mounted () {
    // 模拟获取用户信息
    setTimeout(() => {
      this.currentUser = { name: JSON.parse(localStorage.getItem('userInfo')).email }
    }, 100)
  },
  methods: {
    handleNotificationClick () {
      this.$message.info('查看通知')
      // 这里可以添加打开通知面板的逻辑
    },

    handleHelpClick () {
      this.$message.info('打开帮助')
      // 这里可以添加打开帮助文档的逻辑
    }
  }
}
</script>

<style lang="less" scoped>
.trustpay-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 300px;
  height: 64px;

  // 通用操作按钮样式
  .header-action-btn {
    color: #4b5563 !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: none !important;
    background: transparent !important;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover,
    &:focus {
      color: #11253e !important;
      background: #f9fafb !important;
    }

    .anticon {
      font-size: 14px;
    }
  }

  // 语言选择器样式
  :deep(.trustpay-lang-select) {
    flex-shrink: 0;
    min-width: 100px;

    .ant-select {
      .ant-select-selector {
        border: none !important;
        background: transparent !important;
        color: #4b5563 !important;
        padding: 4px 8px !important;
        height: 32px !important;
        border-radius: 6px !important;

        .ant-select-selection-item {
          color: #4b5563 !important;
          padding: 0;
          font-size: 13px;
        }

        .ant-select-arrow {
          color: #4b5563 !important;
        }
      }

      &:hover .ant-select-selector {
        color: #11253e !important;
        background: #f9fafb !important;
      }

      &.ant-select-focused .ant-select-selector {
        border: none !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
      }
    }
  }

  // 用户下拉菜单样式
  :deep(.trustpay-user-dropdown) {
    flex-shrink: 0;
    min-width: 160px;

    .ant-dropdown-trigger {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 4px 8px !important;
      border-radius: 6px !important;
      transition: all 0.2s ease !important;
      color: #4b5563 !important;

      &:hover {
        background: #f9fafb !important;
      }
    }

    .ant-avatar {
      background-color: #11253e !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      width: 28px !important;
      height: 28px !important;
      font-size: 13px !important;
      flex-shrink: 0;
    }

    .ant-dropdown-trigger-text {
      color: #4b5563 !important;
      font-size: 13px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 120px !important;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .trustpay-header-right {
    gap: 8px;
    min-width: 280px;

    :deep(.trustpay-lang-select) {
      min-width: 80px;
    }

    :deep(.trustpay-user-dropdown) {
      min-width: 140px;

      .ant-dropdown-trigger-text {
        max-width: 100px !important;
      }
    }
  }
}

@media (max-width: 992px) {
  .trustpay-header-right {
    gap: 6px;
    min-width: 240px;

    :deep(.trustpay-lang-select) {
      min-width: 70px;

      .ant-select-selection-item {
        font-size: 12px !important;
      }
    }

    :deep(.trustpay-user-dropdown) {
      min-width: 120px;

      .ant-dropdown-trigger-text {
        max-width: 80px !important;
        font-size: 12px !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .trustpay-header-right {
    gap: 4px;
    min-width: 180px;

    :deep(.trustpay-user-dropdown) {
      .ant-dropdown-trigger-text {
        display: none !important;
      }
    }
  }
}

@media (max-width: 576px) {
  .trustpay-header-right {
    gap: 4px;
    min-width: 120px;

    .header-action-btn {
      width: 28px !important;
      height: 28px !important;

      .anticon {
        font-size: 12px !important;
      }
    }

    :deep(.trustpay-user-dropdown) {
      .ant-avatar {
        width: 24px !important;
        height: 24px !important;
        font-size: 12px !important;
      }
    }
  }
}
</style>
