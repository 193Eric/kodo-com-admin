<template>
  <div class="login-container">
    <!-- 居中的登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-form-container">
        <div class="login-header">
          <h1 class="login-title">Welcome To KODO</h1>
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
        <!-- <div class="forgot-password">
          <a href="#" class="forgot-password-link" @click="handleForgotPassword">
            Forgot password?
          </a>
        </div> -->
      </div>
    </div>

    <!-- 语言选择 -->
    <div class="language-selector">
      <a-icon type="global" />
      <span>English</span>
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
        const userName = res.data?.user?.admin || res.data?.user?.email || 'User'
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
  min-height: 100vh;
  background: url('./../../assets/Login_page.png') no-repeat center center;
  background-size: cover;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  // 添加半透明遮罩，让表单更突出
  // &::before {
  //   content: '';
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   background: rgba(0, 0, 0, 0.2);
  //   z-index: 1;
  // }
}

.login-form-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 620px;
  padding: 20px;
}

.login-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
    background: rgba(255, 255, 255, 0.9);

    &:focus,
    &:hover {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
      background: rgba(255, 255, 255, 1);
    }

    /deep/ .ant-input {
      border: none;
      box-shadow: none;
      font-size: 16px;
      background: transparent;

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
  margin-bottom: 0;

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
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(17, 37, 62, 1);
  font-size: 14px;
  cursor: pointer;
  z-index: 2;

  .anticon {
    font-size: 16px;
  }

  &:hover {
    color: rgba(255, 255, 255, 1);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .login-form-wrapper {
    max-width: 90%;
  }

  .login-form-container {
    padding: 32px 24px;
    border-radius: 12px;
  }

  .login-header .login-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 24px 20px;
  }

  .login-header {
    margin-bottom: 32px;

    .login-title {
      font-size: 20px;
    }
  }
}
</style>
