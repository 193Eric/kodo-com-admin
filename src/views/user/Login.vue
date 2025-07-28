<template>
  <div class="login-container">
    <!-- 左侧图片区域 -->
    <div class="login-left">
      <div class="brand-section">
        <!-- <div class="brand-logo">
          <span class="brand-text">Trustpay</span>
          <span class="brand-icon">✱</span>
        </div> -->
      </div>
      <div class="background-shapes">
        <!-- 装饰性形状 -->
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="login-header">
          <h1 class="login-title">Welcome to Trustpay</h1>
        </div>

        <a-form
          :form="form"
          @submit="handleSubmit"
          class="login-form"
        >
          <!-- 邮箱/账户名输入 -->
          <div class="form-group">
            <label class="form-label">Email</label>
            <a-form-item>
              <a-input
                v-decorator="[
                  'email',
                  {
                    rules: [
                      { required: true, message: 'Please input your email!' }
                    ]
                  }
                ]"
                size="large"
                placeholder="Enter your email"
                class="login-input"
              />
            </a-form-item>
          </div>

          <!-- 密码输入 -->
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
                        { min: 6, message: 'Password must be at least 6 characters!' }
                      ]
                    }
                  ]"
                  :type="showPassword ? 'text' : 'password'"
                  size="large"
                  placeholder="Enter your password"
                  class="login-input password-input"
                  v-model="passwordValue"
                />
                <div class="password-actions">
                  <!-- 清除按钮 -->
                  <a-icon
                    v-if="passwordValue"
                    type="close-circle"
                    class="password-action-icon clear-icon"
                    @click="clearPassword"
                  />
                  <!-- 显示/隐藏密码按钮 -->
                  <a-icon
                    :type="showPassword ? 'eye-invisible' : 'eye'"
                    class="password-action-icon toggle-icon"
                    @click="togglePasswordVisibility"
                  />
                </div>
              </div>
            </a-form-item>
          </div>

          <a-form-item class="login-button-item">
            <a-button
              type="primary"
              htmlType="submit"
              size="large"
              block
              class="login-button"
              :loading="loading"
            >
              Login
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 忘记密码链接 -->
        <div class="forgot-password">
          <a href="#" class="forgot-password-link" @click="handleForgotPassword">
            Forgot password?
          </a>
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
import { request } from '@/api/_service'
import { timeFix } from '@/utils/util'

export default {
  name: 'LoginPage',
  data () {
    return {
      loading: false,
      showPassword: false,
      passwordValue: '',
      isLoginError: false,
      errorMessage: ''
    }
  },

  beforeCreate () {
    this.form = this.$form.createForm(this)
  },

  methods: {
    handleForgotPassword () {
      // 忘记密码逻辑
      console.log('Forgot password clicked')
    },

    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true
          this.isLoginError = false

          try {
            console.log('Login attempt:', values)

            // 调用登录接口
            const res = await request({
              url: '/admin/login',
              method: 'POST',
              data: {
                email: values.email,
                password: values.password
              }
            })

            this.loading = false

            // 判断登录是否成功 - 根据实际返回格式调整
            if (res.code === 200) {
              this.loginSuccess(res)
            } else {
              // 登录失败
              this.requestFailed({
                response: {
                  data: {
                    message: res.message || 'Login failed'
                  }
                }
              })
            }
          } catch (error) {
            this.loading = false
            this.requestFailed(error)
          }
        } else {
          setTimeout(() => {
            this.loading = false
          }, 600)
        }
      })
    },

    loginSuccess (res) {
      console.log('Login success:', res)

      // 保存token和用户信息 - 根据实际返回数据结构调整
      if (res.data) {
        // 保存token
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('Access-Token', res.data.token)
        }

        // 保存用户信息
        if (res.data.admin) {
          localStorage.setItem('userInfo', JSON.stringify(res.data.admin))
        }
      }

      // 跳转到首页
      this.$router.push({ path: '/overview' })

      // 延迟显示欢迎信息
      setTimeout(() => {
        const userName = res.data?.user?.admin || res.data?.user?.admin || 'User'
        this.$notification.success({
          message: 'Welcome',
          description: `${timeFix()}, welcome back ${userName}!`
        })
      }, 1000)

      this.isLoginError = false
    },

    requestFailed (err) {
      console.error('Login failed:', err)
      this.isLoginError = true
      this.errorMessage = ((err.response || {}).data || {}).message || 'Login failed, please try again'

      this.$notification['error']({
        message: 'Error',
        description: this.errorMessage,
        duration: 4
      })
    },

    togglePasswordVisibility () {
      this.showPassword = !this.showPassword
    },

    clearPassword () {
      this.passwordValue = ''
      this.form.setFieldsValue({ password: '' })
    }
  },

  watch: {
    passwordValue (newVal) {
      // 同步表单值
      this.form.setFieldsValue({ password: newVal })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: url('./../../assets/Login_page.png') no-repeat;
  background-size: cover;
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

.login-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;

  .login-form-container {
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .login-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      line-height: 1.2;
    }
  }

  .login-form {
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

    .login-input {
      height: 48px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 16px;

      &:focus,
      &:hover {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
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

    .login-button-item {
      margin-bottom: 24px;
      margin-top: 32px;

      /deep/ .ant-form-item-control {
        line-height: normal;
      }
    }

    .login-button {
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
    }
  }

  .forgot-password {
    text-align: center;
    margin-bottom: 40px;

    .forgot-password-link {
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

  .language-selector {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #9ca3af;
    font-size: 14px;
    cursor: pointer;

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
  .login-container {
    flex-direction: column;
  }

  .login-left {
    min-height: 200px;
    flex: none;

    .brand-section {
      padding: 20px 30px;
    }
  }

  .login-right {
    padding: 20px;

    .login-header .login-title {
      font-size: 24px;
    }
  }
}
</style>
