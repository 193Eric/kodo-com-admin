<template>
  <div class="blank-layout">
    <!-- 顶部导航栏 -->
    <div class="blank-header">
      <div class="header-content">
        <!-- 左侧品牌区域 -->
        <div class="brand-section">
          <div class="brand-name">
            <span class="trustpay-text">Trustpay</span>
            <span class="star-icon">✦</span>
          </div>
          <div class="verification-tag">
            Business Verification
          </div>
        </div>

        <!-- 右侧关闭按钮 -->
        <div class="close-section">
          <a-button
            type="text"
            class="close-btn"
            @click="handleClose"
          >
            <a-icon type="close" />
          </a-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 这里渲染子路由 -->
    <div class="blank-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlankLayout',
  methods: {
    handleClose () {
      // 关闭窗口或返回上一页
      if (window.opener) {
        // 如果是从其他窗口打开的，关闭当前窗口
        window.close()
      } else {
        // 否则返回上一页或跳转到首页
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.blank-layout {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.blank-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧品牌区域 */
.brand-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 600;
}

.trustpay-text {
  color: #1f2937;
}

.star-icon {
  color: #6366f1;
  font-size: 18px;
}

.verification-tag {
  color: #000;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
}

/* 右侧关闭按钮 */
.close-section {
  display: flex;
  align-items: center;
}

.close-btn {
  width: 32px;
  height: 32px;
  border:none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.close-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* 主要内容区域 */
.blank-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }

  .brand-name {
    font-size: 18px;
  }

  .verification-tag {
    font-size: 12px;
    padding: 3px 8px;
  }

  .brand-section {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .verification-tag {
    display: none;
  }
}
</style>
