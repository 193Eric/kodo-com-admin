<template>
  <div class="withdrawal-fiat">
    <!-- 返回按钮 -->
    <a-button
      v-if="currentStep !== 1"
      type="text"
      class="back-button"
      @click="goBack"
    >
      <a-icon type="left" />
      Back
    </a-button>

    <!-- 第一步：选择和输入 -->
    <div v-if="currentStep === 1" class="withdrawal-form">
      <div class="form-content">
        <div class="left-section">
          <!-- 选择货币 -->
          <div class="section">
            <div class="section-header">
              <a-icon type="dollar" />
              <span class="section-title">Select Currency to Withdraw</span>
            </div>
            <p class="section-desc">Choose the fiat currency you want to withdraw from your available balances</p>

            <div class="currency-selector">
              <div class="currency-item" :class="{ active: selectedCurrency.symbol === 'USD' }" @click="selectCurrency('USD')">
                <div class="currency-info">
                  <div class="currency-icon">
                    <img src="https://flagcdn.com/w20/us.png" alt="USD" />
                  </div>
                  <div class="currency-details">
                    <div class="currency-name">USD</div>
                  </div>
                </div>
                <div class="currency-balance">
                  <div class="balance-amount">2,030.8 <span class="currency">USD</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入提现金额 -->
          <div class="section">
            <div class="section-header">
              <a-icon type="calculator" />
              <span class="section-title">Enter Withdrawal Amount</span>
            </div>

            <div class="amount-input">
              <a-input
                v-model="withdrawalAmount"
                size="large"
                placeholder="1,000"
                @input="calculateAmount"
              />
              <a-button type="link" @click="setMaxAmount" class="max-btn">MAX</a-button>
            </div>

            <div class="quick-select">
              <span class="quick-label">Quick Select</span>
              <div class="percentage-buttons">
                <a-button
                  v-for="percent in [25, 50, 75, 100]"
                  :key="percent"
                  @click="setPercentage(percent)"
                  :class="{ active: selectedPercentage === percent }"
                >
                  {{ percent }}%
                </a-button>
              </div>
            </div>

            <div class="amount-info">
              <div class="info-item">
                <span>Transaction fee：5 USD</span>
              </div>
              <div class="info-item">
                <span>Minimum withdrawal amount：1,000 USD</span>
              </div>
              <div class="info-item">
                <span>Estimated time for funds to arrive: approximately 5 minutes</span>
              </div>
            </div>
          </div>

          <!-- 目标地址 -->
          <div class="section">
            <div class="section-header">
              <a-icon type="bank" />
              <span class="section-title">Destination Address</span>
            </div>
            <p class="section-desc">Enter the wallet address where you want to receive your money</p>

            <div class="address-form">
              <div class="form-item">
                <label>Select an Account</label>
                <a-select
                  v-model="selectedAccount"
                  placeholder="Select an Account"
                  style="width: 100%"
                  @change="handleAccountChange"
                >
                  <a-select-option
                    v-for="account in availableAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    <div class="account-option">
                      <div class="account-name">{{ account.name }}</div>
                      <div class="account-number">{{ account.number }}</div>
                    </div>
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a-button type="primary" size="large" @click="proceedToConfirm" :disabled="!canProceed">
              Next
            </a-button>
            <div class="support-link">
              Need help? Contact our <a href="#">support team</a>
            </div>
          </div>
        </div>

        <!-- 右侧FAQ -->
        <div class="right-section">
          <div class="faq-section">
            <h3>FAQ</h3>
            <div class="faq-list">
              <div class="faq-item">
                <div class="faq-question">
                  1. Under what circumstances might my withdrawal of digital currency not arrive as expected?
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  2. How long is it expected to take for the cryptocurrency withdrawal to arrive?
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  3. How is the withdrawal fee calculated?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二步：确认订单 -->
    <div v-if="currentStep === 2" class="confirm-container">
      <h1 class="page-title">Confirm Order</h1>

      <div class="confirm-content">
        <!-- 交易摘要 -->
        <div class="transaction-summary">
          <div class="summary-row spend-receive">
            <div class="spend-section">
              <div class="label-with-icon">
                <img src="https://flagcdn.com/w20/us.png" style="width: 20px;" />
                <span class="label">Spend</span>
              </div>
              <div class="amount">{{ withdrawalAmount }} USD</div>
            </div>

            <div class="arrow-section">
              <a-icon type="arrow-right" />
            </div>

            <div class="receive-section" style="text-align:right">
              <div class="label-with-icon" style="justify-content:right">
                <img src="https://flagcdn.com/w20/us.png" style="width: 20px;" />
                <span class="label">Receive</span>
              </div>
              <div class="amount">{{ withdrawalAmount }} USD</div>
            </div>
          </div>

          <div class="summary-row">
            <span class="label">Receiving Account</span>
            <span class="value">{{ selectedAccountInfo.number }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Recipient Name</span>
            <span class="value">{{ selectedAccountInfo.name }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Transaction Fee</span>
            <span class="value">5 USD</span>
          </div>

          <div class="summary-row total-row">
            <span class="label">Total</span>
            <span class="value">{{ totalAmount }} USD</span>
          </div>
        </div>

        <div class="note">
          * Note: This transaction cannot be reversed once confirmed. Please verify the destination address and network are correct.
        </div>

        <!-- 按钮组 -->
        <div class="confirm-buttons">
          <a-button size="large" class="cancel-button" @click="goBack">
            Cancel
          </a-button>
          <a-button type="primary" size="large" class="confirm-button" @click="showPasswordModal">
            Confirm
          </a-button>
        </div>
      </div>
    </div>

    <!-- 第三步：成功页面 -->
    <div v-if="currentStep === 3" class="result-container success">
      <div class="result-icon">
        <a-icon type="check-circle" />
      </div>
      <h2 class="result-title">Success</h2>
      <p class="result-message">
        Your withdrawal has been processed successfully!<br>
        The funds will be transferred to your account shortly.
      </p>

      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">Transaction ID</span>
          <span class="detail-value">TXNMIYA9HUZF</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Receiving Account</span>
          <span class="detail-value address">
            {{ selectedAccountInfo.number }}
            <a-icon type="copy" @click="copyToClipboard(selectedAccountInfo.number)" />
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Recipient Name</span>
          <span class="detail-value">{{ selectedAccountInfo.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction Fee</span>
          <span class="detail-value">5 USD</span>
        </div>
        <div class="detail-row total">
          <span class="detail-label">Total</span>
          <span class="detail-value">{{ totalAmount }} USD</span>
        </div>
      </div>

      <div class="result-buttons">
        <a-button class="result-btn" size="large" @click="makeAnotherWithdrawal">
          Make Another Withdrawal
        </a-button>
        <a-button type="link" class="contact-link" @click="viewWithdrawalHistory">
          Withdrawal History
        </a-button>
      </div>
    </div>

    <!-- 密码输入弹窗 -->
    <a-modal
      v-model="passwordModalVisible"
      title="Enter Your Password"
      :footer="null"
      :closable="true"
      centered
      width="400px"
      @cancel="onPasswordModalCancel"
    >
      <div class="password-modal">
        <PasswordInput
          ref="passwordInput"
          v-model="password"
          :length="6"
          @change="onPasswordChange"
        />

        <a-button
          type="primary"
          size="large"
          block
          class="confirm-password-button"
          :loading="passwordLoading"
          :disabled="!isPasswordComplete"
          @click="confirmWithdrawal"
        >
          Confirm
        </a-button>

        <div class="password-footer">
          <span class="forgot-link">Forgot password?</span>
          <a-button type="link" class="reset-link">Reset password</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
// 导入密码输入组件
import PasswordInput from '@/components/PasswordInput'

export default {
  name: 'WithdrawalFiat',
  components: {
    PasswordInput
  },
  data () {
    return {
      currentStep: 1,
      selectedCurrency: {
        symbol: 'USD',
        balance: 2030.8
      },
      withdrawalAmount: '',
      selectedPercentage: null,
      selectedAccount: undefined,
      passwordModalVisible: false,
      passwordLoading: false,
      password: '',
      isPasswordComplete: false,
      availableAccounts: [
        {
          id: 1,
          name: 'Global Trade Partners',
          number: '4327 1281 1231 2261'
        },
        {
          id: 2,
          name: 'CryptoVendor Ltd',
          number: '4327 1281 1231 2762'
        },
        {
          id: 3,
          name: 'Business Account',
          number: '4327 1281 1231 2888'
        }
      ]
    }
  },

  computed: {
    canProceed () {
      return this.withdrawalAmount &&
             this.selectedAccount &&
             parseFloat(this.withdrawalAmount) >= 1000
    },

    totalAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      return amount // 法币提现不加手续费到总额
    },

    selectedAccountInfo () {
      return this.availableAccounts.find(account => account.id === this.selectedAccount) || {}
    }
  },

  methods: {
    selectCurrency (symbol) {
      this.selectedCurrency.symbol = symbol
    },

    setPercentage (percent) {
      this.selectedPercentage = percent
      const amount = (this.selectedCurrency.balance * percent / 100).toFixed(1)
      this.withdrawalAmount = amount
    },

    setMaxAmount () {
      this.selectedPercentage = 100
      this.withdrawalAmount = this.selectedCurrency.balance.toString()
    },

    calculateAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      const percentage = Math.round((amount / this.selectedCurrency.balance) * 100)
      this.selectedPercentage = [25, 50, 75, 100].includes(percentage) ? percentage : null
    },

    handleAccountChange (accountId) {
      this.selectedAccount = accountId
    },

    proceedToConfirm () {
      if (this.canProceed) {
        this.currentStep = 2
      }
    },

    goBack () {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    // 密码相关
    showPasswordModal () {
      this.passwordModalVisible = true
      this.password = ''
      this.isPasswordComplete = false
      this.$nextTick(() => {
        if (this.$refs.passwordInput) {
          this.$refs.passwordInput.focus()
        }
      })
    },

    onPasswordModalCancel () {
      this.password = ''
      this.isPasswordComplete = false
    },

    onPasswordChange (password, isComplete) {
      this.password = password
      this.isPasswordComplete = isComplete
    },

    confirmWithdrawal () {
      if (!this.isPasswordComplete) {
        this.$message.error('Please enter complete password')
        return
      }

      this.passwordLoading = true

      // 模拟密码验证
      setTimeout(() => {
        this.passwordLoading = false

        if (this.password === '123456') {
          this.passwordModalVisible = false
          this.currentStep = 3
          this.$message.success('Withdrawal confirmed successfully')
        } else {
          this.$message.error('Invalid password, please try again')
          this.password = ''
          this.isPasswordComplete = false
          if (this.$refs.passwordInput) {
            this.$refs.passwordInput.clear()
          }
        }
      }, 1000)
    },

    makeAnotherWithdrawal () {
      this.currentStep = 1
      this.withdrawalAmount = ''
      this.selectedAccount = undefined
      this.selectedPercentage = null
      this.password = ''
      this.isPasswordComplete = false
    },

    viewWithdrawalHistory () {
      this.$message.info('跳转到提现历史页面')
    },

    copyToClipboard (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    }
  }
}
</script>

<style scoped>
.withdrawal-fiat {
  min-height: calc(100vh - 64px);
  position: relative;
}

.back-button {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 100;
  font-size: 16px;
  color: #262626;
  border: none;
  background: transparent;
}

.back-button:hover {
  color: #40a9ff;
}

/* 表单页面样式 */
.withdrawal-form {
  min-height: 600px;
  padding: 24px;
}

.form-content {
  display: flex;
  gap: 40px;
}

.left-section {
  flex: 2;
}

.right-section {
  flex: 1;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
  color: #262626;
}

.section-desc {
  color: #8c8c8c;
  margin-bottom: 20px;
}

/* 货币选择器 */
.currency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.currency-item:hover,
.currency-item.active {
  border-color: #11253E;
  background: #f6ffff;
}

.currency-info {
  display: flex;
  align-items: center;
}

.currency-icon {
  margin-right: 12px;
}

.currency-icon img {
  width: 32px;
  height: 24px;
}

.currency-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  text-align: right;
}

/* 金额输入 */
.amount-input {
  position: relative;
  margin-bottom: 20px;
}

.amount-input .ant-input {
  font-size: 24px;
  height: 60px;
  padding-right: 60px;
}

.max-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #11253E;
  font-weight: 600;
}

.quick-select {
  margin-bottom: 20px;
}

.quick-label {
  display: block;
  margin-bottom: 8px;
  color: #262626;
  font-weight: 500;
}

.percentage-buttons {
  display: flex;
  gap: 8px;
}

.percentage-buttons .ant-btn {
  flex: 1;
  height: 40px;
}

.percentage-buttons .ant-btn.active {
  background: #11253E;
  color: white;
  border-color: #11253E;
}

.amount-info {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.info-item {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

/* 地址表单 */
.address-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #262626;
  font-weight: 500;
}

.account-option {
  padding: 4px 0;
}

.account-name {
  font-weight: 600;
  color: #262626;
}

.account-number {
  font-size: 12px;
  color: #8c8c8c;
  font-family: 'Courier New', monospace;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

.form-actions .ant-btn {
  width: 200px;
  height: 45px;
  font-size: 16px;
}

.support-link {
  margin-top: 16px;
  color: #8c8c8c;
  font-size: 14px;
}

/* FAQ样式 */
.faq-section {
  background: #f9f9f9;
  padding: 24px;
  border-radius: 8px;
  height: fit-content;
}

.faq-section h3 {
  margin: 0 0 20px 0;
  color: #262626;
  font-weight: 600;
}

.faq-item {
  margin-bottom: 16px;
}

.faq-question {
  color: #262626;
  font-size: 14px;
  line-height: 1.5;
}

/* 确认订单页面样式 - 统一样式 */
.confirm-container {
  background: white;
  border-radius: 12px;
  padding: 20px 32px;
  margin: 0 auto;
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  text-align: left;
  margin-bottom: 32px;
}

.confirm-content {
  .transaction-summary {
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;

      &.spend-receive {
        display: flex;
        align-items: center;
        padding: 24px 0;

        .spend-section, .receive-section {
          flex: 1;
          text-align: left;

          .label-with-icon {
            display: flex;
            align-items: center;
            justify-content: left;
            gap: 8px;
            margin-bottom: 8px;

            .label {
              font-size: 14px;
              color: #666;
            }
          }

          .amount {
            font-size: 18px;
            font-weight: 600;
            color: #262626;
          }
        }

        .arrow-section {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 20px;

          .anticon {
            font-size: 20px;
            color: #bfbfbf;
          }
        }
      }

      &.total-row {
        border-bottom: none;
        font-weight: 600;
        font-size: 16px;
      }

      .label {
        color: #666;
        font-size: 14px;
      }

      .value {
        color: #262626;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .note {
    color: #8c8c8c;
    font-size: 12px;
    margin: 24px 0;
    text-align: left;
  }

  .confirm-buttons {
    display: flex;
    gap: 16px;
    margin-top: 32px;

    .cancel-button, .confirm-button {
      flex: 1;
      height: 48px;
      border-radius: 8px;
      font-size: 16px;
    }

    .cancel-button {
      background: #f5f5f5;
      border: none;
      color: #666;

      &:hover {
        background: #e8e8e8;
        color: #666;
      }
    }

    .confirm-button {
      background: #1f2937;
      border: none;

      &:hover {
        background: #374151;
      }
    }
  }
}

/* 成功页面样式 */
.result-container {
  text-align: center;
  padding: 60px 32px;
  margin: 0 auto;
  max-width: 600px;

  .result-icon {
    margin-bottom: 24px;

    .anticon {
      font-size: 64px;
      color: #52c41a;
    }
  }

  .result-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #262626;
  }

  .result-message {
    color: #666;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .result-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    .result-btn {
      width: 100%;
    }

    .contact-link {
      color: #11253E;
      padding: 0;
    }
  }
}

.transaction-details {
  text-align: left;
  margin-bottom: 32px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row.total {
  border-bottom: none;
  font-weight: 600;
  font-size: 16px;
}

.detail-label {
  color: #8c8c8c;
}

.detail-value {
  color: #262626;
}

.detail-value.address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.detail-value .anticon {
  cursor: pointer;
  color: #11253E;
  margin-left: 8px;
}

/* 密码弹窗样式 */
.password-modal {
  text-align: center;
  padding: 24px 0;

  .confirm-password-button {
    height: 48px;
    border-radius: 8px;
    background: #1f2937;
    border: none;
    margin: 24px 0;

    &:hover {
      background: #374151;
    }

    &:disabled {
      background: #bfbfbf;
      cursor: not-allowed;
    }
  }

  .password-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;

    .forgot-link {
      color: #8c8c8c;
      font-size: 14px;
    }

    .reset-link {
      color: #11253E;
      padding: 0;

      &:hover {
        color: #40a9ff;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-content {
    flex-direction: column;
  }

  .confirm-buttons {
    flex-direction: column;
  }
}
</style>
