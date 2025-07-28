<template>
  <div class="signup-container">
    <!-- 左侧图片区域 -->
    <div class="signup-left">
      <div class="brand-section">
        <div class="brand-logo">
          <span class="brand-text">Trustpay</span>
          <span class="brand-icon">✱</span>
        </div>
      </div>
      <div class="background-shapes">
        <!-- 装饰性形状 -->
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 右侧注册表单区域 -->
    <div class="signup-right">
      <div class="signup-form-container">
        <!-- 步骤1: 创建账户 - 邮箱输入 -->
        <div v-if="currentStep === 1">
          <div class="signup-header">
            <h1 class="signup-title">Create an Account</h1>
          </div>

          <a-form :form="form" @submit="handleSubmit" class="signup-form">
            <div class="form-group">
              <label class="form-label">Phone number/Email</label>
              <a-form-item>
                <a-input
                  v-decorator="[
                    'email',
                    {
                      rules: [
                        { required: true, message: 'Please input your phone number or email!' },
                        { type: 'email', message: 'Please enter a valid email address!' }
                      ]
                    }
                  ]"
                  size="large"
                  placeholder="Phone number/Email(without country code)"
                  class="signup-input"
                />
              </a-form-item>
            </div>

            <!-- 服务条款勾选 -->
            <div class="terms-section">
              <a-form-item>
                <a-checkbox
                  v-decorator="[
                    'agreeTerms',
                    {
                      rules: [{ required: true, message: 'Please agree to the terms!' }],
                      valuePropName: 'checked'
                    }
                  ]"
                  class="terms-checkbox"
                >
                  <span class="terms-text">
                    By creating an account, I agree to Trustpay's
                    <a href="#" class="terms-link">Terms of Service</a>
                    and
                    <a href="#" class="terms-link">Privacy Notice</a>.
                  </span>
                </a-checkbox>
              </a-form-item>
            </div>

            <a-form-item class="signup-button-item">
              <a-button
                type="primary"
                htmlType="submit"
                size="large"
                block
                class="signup-button"
                :loading="loading"
              >
                Next
              </a-button>
            </a-form-item>
          </a-form>

          <div class="signup-footer">
            <span class="footer-text">Already have an account? </span>
            <a href="#" class="login-link" @click="goToLogin">Log in</a>
          </div>
        </div>

        <!-- 步骤2: 邮箱验证错误（如果有的话）-->
        <div v-if="currentStep === 2">
          <div class="signup-header">
            <h1 class="signup-title">Create an Account</h1>
          </div>

          <a-form :form="form" @submit="handleSubmit" class="signup-form">
            <div class="form-group">
              <label class="form-label">Phone number/Email</label>
              <a-form-item :validate-status="emailError ? 'error' : ''" :help="emailError">
                <a-input
                  v-model="userEmail"
                  size="large"
                  class="signup-input error-input"
                  readonly
                />
                <div v-if="emailError" class="error-icon">
                  <a-icon type="close-circle" />
                </div>
              </a-form-item>
              <div v-if="emailError" class="error-message">
                {{ emailError }}
              </div>
            </div>

            <!-- 服务条款勾选 -->
            <div class="terms-section">
              <a-checkbox checked disabled class="terms-checkbox">
                <span class="terms-text">
                  By creating an account, I agree to Trustpay's
                  <a href="#" class="terms-link">Terms of Service</a>
                  and
                  <a href="#" class="terms-link">Privacy Notice</a>.
                </span>
              </a-checkbox>
            </div>

            <a-form-item class="signup-button-item">
              <a-button
                type="primary"
                htmlType="submit"
                size="large"
                block
                class="signup-button"
                :loading="loading"
              >
                Next
              </a-button>
            </a-form-item>
          </a-form>

          <div class="signup-footer">
            <span class="footer-text">Already have an account? </span>
            <a href="#" class="login-link" @click="goToLogin">Log in</a>
          </div>
        </div>

        <!-- 步骤3: 邮箱验证 -->
        <div v-if="currentStep === 3">
          <div class="signup-header">
            <h1 class="signup-title">verify your email</h1>
            <p class="verification-description">
              A 6-digit code has been sent to {{ maskedEmail }}.<br/>
              Please enter it within the next 30 minutes.
            </p>
          </div>

          <a-form :form="form" @submit="handleSubmit" class="signup-form">
            <div class="form-group">
              <label class="form-label">Verification code</label>
              <a-form-item>
                <div class="verification-input-wrapper">
                  <a-input
                    v-decorator="[
                      'verificationCode',
                      {
                        rules: [
                          { required: true, message: 'Please input verification code!' },
                          { len: 6, message: 'Verification code must be 6 digits!' }
                        ]
                      }
                    ]"
                    size="large"
                    placeholder="Enter 6-digit code"
                    class="signup-input verification-input"
                    maxLength="6"
                  />
                  <div class="code-sent-indicator">
                    <span class="code-sent-text">Code Sent</span>
                    <a-icon type="info-circle" class="info-icon" />
                  </div>
                </div>
              </a-form-item>
            </div>

            <a-form-item class="signup-button-item">
              <a-button
                type="primary"
                htmlType="submit"
                size="large"
                block
                class="signup-button"
                :loading="loading"
              >
                Next
              </a-button>
            </a-form-item>
          </a-form>

          <div class="resend-section">
            <a href="#" class="resend-link" @click="resendCode">
              Didn't receive the code?
            </a>
          </div>
        </div>

        <!-- 步骤4: 创建密码 -->
        <div v-if="currentStep === 4">
          <div class="signup-header">
            <h1 class="signup-title">Create an Password</h1>
          </div>

          <a-form :form="form" @submit="handleSubmit" class="signup-form">
            <div class="form-group">
              <label class="form-label">Password</label>
              <a-form-item>
                <div class="password-input-wrapper">
                  <a-input
                    v-decorator="[
                      'password',
                      {
                        rules: [
                          { required: true, message: 'Please input your password!' },
                          { min: 8, message: 'Password must be at least 8 characters!' },
                          { max: 128, message: 'Password must be less than 128 characters!' }
                        ]
                      }
                    ]"
                    :type="showPassword ? 'text' : 'password'"
                    size="large"
                    placeholder="Create your password"
                    class="signup-input password-input"
                    v-model="passwordValue"
                    @input="checkPasswordRequirements"
                  />
                  <div class="password-actions">
                    <a-icon
                      v-if="passwordValue"
                      type="close-circle"
                      class="password-action-icon clear-icon"
                      @click="clearPassword"
                    />
                    <a-icon
                      :type="showPassword ? 'eye-invisible' : 'eye'"
                      class="password-action-icon toggle-icon"
                      @click="togglePasswordVisibility"
                    />
                  </div>
                </div>
              </a-form-item>
            </div>

            <!-- 密码要求检查 -->
            <div class="password-requirements">
              <div class="requirement-item" :class="{ 'requirement-met': requirements.length }">
                <a-icon :type="requirements.length ? 'check' : 'close'" />
                <span>8 to 128 characters</span>
              </div>
              <div class="requirement-item" :class="{ 'requirement-met': requirements.number }">
                <a-icon :type="requirements.number ? 'check' : 'close'" />
                <span>At least 1 number</span>
              </div>
              <div class="requirement-item" :class="{ 'requirement-met': requirements.uppercase }">
                <a-icon :type="requirements.uppercase ? 'check' : 'close'" />
                <span>At least 1 upper case letter</span>
              </div>
            </div>

            <a-form-item class="signup-button-item">
              <a-button
                type="primary"
                htmlType="submit"
                size="large"
                block
                class="signup-button"
                :loading="loading"
                :disabled="!allRequirementsMet"
              >
                Next
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 步骤5: 欢迎页面 -->
        <div v-if="currentStep === 5">
          <div class="welcome-section">
            <div class="success-icon">
              <div class="success-circle">
                <a-icon type="check" />
              </div>
            </div>
            <h1 class="welcome-title">Welcome aboard!</h1>
            <p class="welcome-description">
              You account has been created and linked to<br/>
              referral ID {{ referralId }}.
            </p>
            <a-button
              type="primary"
              size="large"
              block
              class="welcome-button"
              @click="goToApp"
            >
              Next
            </a-button>
          </div>
        </div>

        <!-- 语言选择 -->
        <div class="language-selector">
          <a-icon type="global" />
          <span>English</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignUpPage',
  data () {
    return {
      loading: false,
      currentStep: 1, // 1-5: 注册步骤
      userEmail: '',
      emailError: '',
      showPassword: false,
      passwordValue: '',
      requirements: {
        length: false,
        number: false,
        uppercase: false
      },
      referralId: '009872839'
    }
  },

  computed: {
    maskedEmail () {
      if (!this.userEmail) return ''
      const [local, domain] = this.userEmail.split('@')
      const maskedLocal = local.substring(0, 4) + '****'
      return `${maskedLocal}@${domain}`
    },

    allRequirementsMet () {
      return this.requirements.length && this.requirements.number && this.requirements.uppercase
    }
  },

  beforeCreate () {
    this.form = this.$form.createForm(this)
  },

  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true

          if (this.currentStep === 1) {
            // 第一步：邮箱和条款验证
            console.log('Step 1 - Email: ', values.email)
            this.userEmail = values.email

            // 模拟邮箱验证
            setTimeout(() => {
              this.loading = false
              // 模拟邮箱格式错误（演示步骤2）
              if (Math.random() > 0.7) {
                this.emailError = 'Please enter a valid email or phone number. Spaces or special characters not allowed for phone numbers.'
                this.currentStep = 2
              } else {
                this.currentStep = 3
                this.form.resetFields()
              }
            }, 1000)
          } else if (this.currentStep === 2) {
            // 第二步：修正邮箱后继续
            this.loading = false
            this.emailError = ''
            this.currentStep = 3
            this.form.resetFields()
          } else if (this.currentStep === 3) {
            // 第三步：验证码验证
            console.log('Step 3 - Verification Code: ', values.verificationCode)

            setTimeout(() => {
              this.loading = false
              this.currentStep = 4
              this.form.resetFields()
            }, 1500)
          } else if (this.currentStep === 4) {
            // 第四步：密码设置
            console.log('Step 4 - Password: ', values.password)

            setTimeout(() => {
              this.loading = false
              this.currentStep = 5
            }, 1500)
          }
        }
      })
    },

    goToLogin () {
      this.$router.push('/login')
    },

    togglePasswordVisibility () {
      this.showPassword = !this.showPassword
    },

    clearPassword () {
      this.passwordValue = ''
      this.form.setFieldsValue({ password: '' })
      this.checkPasswordRequirements()
    },

    checkPasswordRequirements () {
      const password = this.passwordValue
      this.requirements = {
        length: password.length >= 8 && password.length <= 128,
        number: /\d/.test(password),
        uppercase: /[A-Z]/.test(password)
      }
    },

    resendCode () {
      console.log('Resend verification code')
      this.$message.info('Verification code sent!')
    },

    goToApp () {
      console.log('Go to main app')
      this.$router.push('/dashboard')
    }
  },

  watch: {
    passwordValue (newVal) {
      this.form.setFieldsValue({ password: newVal })
    }
  }
}
</script>

<style lang="less" scoped>
.signup-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.signup-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  display: flex;
  flex-direction: column;

  .brand-section {
    padding: 40px 50px;
    z-index: 10;
    position: relative;

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .brand-text {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: -0.5px;
      }

      .brand-icon {
        font-size: 24px;
        color: #8b5cf6;
        font-weight: bold;
      }
    }
  }

  .background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.2);
      top: 20%;
      left: -10%;
      animation: float 6s ease-in-out infinite;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.15);
      top: 60%;
      right: -5%;
      animation: float 8s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      bottom: 10%;
      left: 30%;
      animation: float 10s ease-in-out infinite;
    }
  }
}

.signup-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .signup-form-container {
    width: 100%;
    max-width: 400px;
  }

  .signup-header {
    text-align: center;
    margin-bottom: 40px;

    .signup-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      line-height: 1.2;
    }

    .verification-description {
      font-size: 14px;
      color: #9ca3af;
      margin: 12px 0 0 0;
      line-height: 1.5;
    }
  }

  .signup-form {
    .form-group {
      margin-bottom: 24px;

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }

    .signup-input {
      height: 48px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 16px;

      &:focus,
      &:hover {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
      }

      &.error-input {
        border-color: #ef4444;

        &:focus,
        &:hover {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
        }
      }

      /deep/ .ant-input {
        border: none;
        box-shadow: none;
        font-size: 16px;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    // 错误状态样式
    .error-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #ef4444;
      font-size: 16px;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.4;
    }

    // 服务条款勾选
    .terms-section {
      margin-bottom: 32px;

      .terms-checkbox {
        /deep/ .ant-checkbox-wrapper {
          align-items: flex-start;
        }

        .terms-text {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .terms-link {
          color: #3b82f6;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    // 验证码输入
    .verification-input-wrapper {
      position: relative;

      .code-sent-indicator {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 4px;
        color: #6b7280;
        font-size: 12px;

        .info-icon {
          font-size: 14px;
        }
      }

      .verification-input {
        padding-right: 100px;
      }
    }

    // 密码输入框样式
    .password-input-wrapper {
      position: relative;

      .password-input {
        padding-right: 60px;
      }

      .password-actions {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10;

        .password-action-icon {
          font-size: 16px;
          color: #9ca3af;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;

          &:hover {
            color: #6b7280;
          }

          &.clear-icon:hover {
            color: #ef4444;
          }
        }
      }
    }

    // 密码要求检查
    .password-requirements {
      margin-bottom: 24px;

      .requirement-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9ca3af;
        margin-bottom: 6px;

        .anticon {
          font-size: 12px;
          color: #d1d5db;
        }

        &.requirement-met {
          color: #10b981;

          .anticon {
            color: #10b981;
          }
        }
      }
    }

    .signup-button-item {
      margin-bottom: 24px;

      /deep/ .ant-form-item-control {
        line-height: normal;
      }
    }

    .signup-button {
      height: 48px;
      border-radius: 8px;
      background: #1f2937;
      border: none;
      font-size: 16px;
      font-weight: 500;

      &:hover,
      &:focus {
        background: #374151;
      }

      &:active {
        background: #111827;
      }

      &:disabled {
        background: #d1d5db;
        color: #9ca3af;
      }
    }
  }

  .resend-section {
    text-align: center;
    margin-bottom: 40px;

    .resend-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        color: #2563eb;
        text-decoration: underline;
      }
    }
  }

  .signup-footer {
    text-align: center;
    margin-bottom: 40px;

    .footer-text {
      color: #6b7280;
      font-size: 14px;
    }

    .login-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        color: #2563eb;
        text-decoration: underline;
      }
    }
  }

  // 欢迎页面样式
  .welcome-section {
    text-align: center;

    .success-icon {
      margin-bottom: 32px;

      .success-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px dashed #10b981;
          border-radius: 50%;
          opacity: 0.3;
        }

        .anticon {
          font-size: 32px;
          color: white;
        }
      }
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }

    .welcome-description {
      font-size: 14px;
      color: #9ca3af;
      margin: 0 0 40px 0;
      line-height: 1.5;
    }

    .welcome-button {
      height: 48px;
      border-radius: 8px;
      background: #1f2937;
      border: none;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 40px;

      &:hover,
      &:focus {
        background: #374151;
      }
    }
  }

  .language-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #9ca3af;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: #6b7280;
    }

    .anticon {
      font-size: 16px;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .signup-container {
    flex-direction: column;
  }

  .signup-left {
    min-height: 200px;
    flex: none;

    .brand-section {
      padding: 20px 30px;
    }
  }

  .signup-right {
    padding: 20px;

    .signup-header .signup-title {
      font-size: 24px;
    }
  }
}
</style>
