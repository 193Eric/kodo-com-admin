<template>
  <div class="account-settings">
    <div class="page-header">
      <h1 class="page-title">Account Settings</h1>
    </div>

    <!-- Tab Navigation -->
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <a-tab-pane key="digital" tab="Digital currency address management">
        <digital-currency-tab />
      </a-tab-pane>
      <a-tab-pane key="fiat" tab="Fiat currency account management">
        <FiatCurrencyTab />
      </a-tab-pane>
      <a-tab-pane key="withdrawal-address" tab="Withdrawal address management">
        <withdrawal-address-tab />
      </a-tab-pane>
      <a-tab-pane key="recharge" tab="Deposit management">
        <RechargeManagementTab />
      </a-tab-pane>
      <a-tab-pane key="withdrawal" tab="Withdrawal management">
        <WithdrawalManagementTab />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import WithdrawalAddressTab from './accountSettingsPgae/WithdrawalAddressTab.vue'
import RechargeManagementTab from './accountSettingsPgae/RechargeManagementTab.vue'
import WithdrawalManagementTab from './accountSettingsPgae/WithdrawalManagementTab.vue'

import FiatCurrencyTab from './accountSettingsPgae/FiatCurrencyTab.vue'
import DigitalCurrencyTab from './accountSettingsPgae/DigitalCurrencyTab.vue'

export default {
  name: 'AccountSettings',
  components: {
    DigitalCurrencyTab,
    RechargeManagementTab,
    WithdrawalAddressTab,
    WithdrawalManagementTab,
    FiatCurrencyTab
  },
  data () {
    return {
      activeTab: 'digital'
    }
  },
  methods: {
    handleTabChange (key) {
      console.log('Tab changed to:', key)
      // 可以在这里添加切换tab时的逻辑
      // 比如重置某些状态、记录用户行为等
    }
  }
}
</script>

<style scoped>
.account-settings {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.ant-tabs {
  background: #fff;
}

.ant-tabs-tab {
  padding: 12px 16px;
  font-size: 14px;
  color: #595959;
}

.ant-tabs-tab:hover {
  color: #1890ff;
}

.ant-tabs-tab-active {
  color: #1890ff;
  font-weight: 500;
}

.ant-tabs-content-holder {
  padding-top: 16px;
}

.placeholder-content {
  background: #fff;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ant-empty-description {
  color: #8c8c8c;
  font-size: 14px;
}
</style>
