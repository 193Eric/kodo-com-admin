<template>
  <div class="withdrawal-crypto">
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
          <!-- 选择币种 -->
          <div class="section">
            <div class="section-header">
              <a-icon type="dollar" />
              <span class="section-title">Select Coin</span>
            </div>
            <p class="section-desc">Choose the coin you want to withdraw from your available balances</p>

            <div class="coin-selector">
              <div class="coin-item" :class="{ active: selectedCoin.symbol === 'USDT' }" @click="selectCoin('USDT')">
                <div class="coin-info">
                  <div class="coin-icon">
                    <div class="usdt-icon">T</div>
                  </div>
                  <div class="coin-details">
                    <div class="coin-name">USDT</div>
                    <div class="coin-network">TRC-20</div>
                  </div>
                </div>
                <div class="coin-balance">
                  <div class="balance-amount">21,030.8 <span class="currency">USDT</span></div>
                  <div class="balance-usd">≈ $1,030.8 <span class="currency">USD</span></div>
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
                <span>Transaction fee：5 USDT</span>
              </div>
              <div class="info-item">
                <span>Minimum withdrawal amount：1,000 USDT</span>
              </div>
              <div class="info-item">
                <span>Estimated time for funds to arrive: approximately 5 minutes</span>
              </div>
            </div>
          </div>

          <!-- 目标地址 -->
          <div class="section">
            <div class="section-header">
              <a-icon type="environment" />
              <span class="section-title">Destination Address</span>
            </div>
            <p class="section-desc">Enter the wallet address where you want to receive your money</p>

            <div class="address-form">
              <div class="form-item">
                <label>Network</label>
                <a-select v-model="selectedNetwork" placeholder="Select a Network" style="width: 100%">
                  <a-select-option value="TRC-20">TRC-20</a-select-option>
                  <a-select-option value="ERC-20">ERC-20</a-select-option>
                  <a-select-option value="Bitcoin">Bitcoin</a-select-option>
                </a-select>
              </div>

              <div class="form-item">
                <label>Destination Address</label>
                <a-input
                  v-model="destinationAddress"
                  placeholder="Enter destination address"
                  style="width: 100%"
                />
              </div>
            </div>

            <div class="warning-message">
              <a-icon type="exclamation-circle" />
              <span>
                <strong>Important:</strong> Double-check the address and network.
                <br />
                Sending to wrong address or network will result in permanent loss of funds.
              </span>
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
                <div class="usdt-icon-small">T</div>
                <span class="label">Spend</span>
              </div>
              <div class="amount">{{ withdrawalAmount }} USDT</div>
            </div>

            <div class="arrow-section">
              <a-icon type="arrow-right" />
            </div>

            <div class="receive-section" style="text-align:right">
              <div class="label-with-icon" style="justify-content:right">
                <div class="usdt-icon-small">T</div>
                <span class="label">Receive</span>
              </div>
              <div class="amount">≈{{ withdrawalAmount }} USDT</div>
            </div>
          </div>

          <div class="summary-row">
            <span class="label">Network</span>
            <span class="value">{{ selectedNetwork }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Destination Address</span>
            <span class="value address">{{ destinationAddress }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Transaction Fee</span>
            <span class="value">5 USDT</span>
          </div>

          <div class="summary-row total-row">
            <span class="label">Total</span>
            <span class="value">{{ totalAmount }} USDT</span>
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
        Your withdrawal has been submitted to the blockchain!<br>
        The funds will be transferred to your destination address shortly.
      </p>

      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">Transaction ID</span>
          <span class="detail-value">TXNMIYA9HUZF</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Blockchain TX</span>
          <span class="detail-value address">
            0x18d9518PA02LVRYYDS4E518C518PA02L1
            <a-icon type="copy" @click="copyToClipboard('0x18d9518PA02LVRYYDS4E518C518PA02L1')" />
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Destination</span>
          <span class="detail-value address">
            {{ destinationAddress }}
            <a-icon type="copy" @click="copyToClipboard(destinationAddress)" />
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Network</span>
          <span class="detail-value">{{ selectedNetwork }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction Fee</span>
          <span class="detail-value">5 USDT</span>
        </div>
        <div class="detail-row total">
          <span class="detail-label">Total</span>
          <span class="detail-value">
            {{ totalAmount }} USDT
            <br />
            <small>≈{{ totalAmount }} USD</small>
          </span>
        </div>
      </div>

      <div class="next-steps">
        <h4>What's Next?</h4>
        <ul>
          <li>Your funds will arrive at the destination address within 5-15 minutes</li>
          <li>You can track the transaction on the blockchain explorer</li>
          <li>A confirmation email has been sent to your registered email</li>
        </ul>
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
  name: 'WithdrawalCrypto',
  components: {
    PasswordInput
  },
  data () {
    return {
      currentStep: 1,
      selectedCoin: {
        symbol: 'USDT',
        balance: 21030.8,
        network: 'TRC-20'
      },
      withdrawalAmount: '',
      selectedPercentage: null,
      selectedNetwork: '',
      destinationAddress: '',
      passwordModalVisible: false,
      passwordLoading: false,
      password: '',
      isPasswordComplete: false
    }
  },

  computed: {
    canProceed () {
      return this.withdrawalAmount &&
             this.selectedNetwork &&
             this.destinationAddress &&
             parseFloat(this.withdrawalAmount) >= 1000
    },

    totalAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      return amount + 5 // 加上手续费
    }
  },

  methods: {
    selectCoin (symbol) {
      this.selectedCoin.symbol = symbol
    },

    setPercentage (percent) {
      this.selectedPercentage = percent
      const amount = (this.selectedCoin.balance * percent / 100).toFixed(1)
      this.withdrawalAmount = amount
    },

    setMaxAmount () {
      this.selectedPercentage = 100
      this.withdrawalAmount = this.selectedCoin.balance.toString()
    },

    calculateAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      const percentage = Math.round((amount / this.selectedCoin.balance) * 100)
      this.selectedPercentage = [25, 50, 75, 100].includes(percentage) ? percentage : null
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
      this.selectedNetwork = ''
      this.destinationAddress = ''
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
.withdrawal-crypto {
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

/* 币种选择器 */
.coin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.coin-item:hover,
.coin-item.active {
  border-color: #11253E;
  background: #f6ffff;
}

.coin-info {
  display: flex;
  align-items: center;
}

.coin-icon {
  margin-right: 12px;
}

.usdt-icon {
  width: 40px;
  height: 40px;
  background: #26a17b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.usdt-icon-small {
  width: 20px;
  height: 20px;
  background: #26a17b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.coin-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.coin-network {
  font-size: 12px;
  color: #8c8c8c;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  text-align: right;
}

.balance-usd {
  font-size: 12px;
  color: #8c8c8c;
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

.warning-message {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  color: #ad6800;
  font-size: 14px;
}

.warning-message .anticon {
  margin-right: 8px;
  margin-top: 2px;
  color: #fa8c16;
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

      .address {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
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

.next-steps {
  text-align: left;
  margin-bottom: 32px;
  padding: 20px;
  background: #f6ffed;
  border-radius: 8px;
}

.next-steps h4 {
  margin: 0 0 12px 0;
  color: #262626;
}

.next-steps ul {
  margin: 0;
  padding-left: 20px;
  color: #52c41a;
}

.next-steps li {
  margin-bottom: 8px;
  color: #262626;
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
