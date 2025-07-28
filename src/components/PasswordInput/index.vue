<template>
  <div class="password-input-component">
    <div class="password-inputs">
      <div
        v-for="(digit, index) in digits"
        :key="index"
        class="password-digit-container"
        :class="{
          'focused': focusedIndex === index,
          'filled': digit !== ''
        }"
        @click="focusInput(index)"
      >
        <!-- 隐藏的真实输入框 -->
        <input
          :ref="'passwordInput' + index"
          v-model="digits[index]"
          class="password-digit-input"
          type="text"
          maxlength="1"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @focus="onFocus(index)"
          @blur="onBlur"
          @paste="onPaste"
        />

        <!-- 显示的圆点 -->
        <div class="password-dot" v-if="digit !== ''"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordInput',
  props: {
    length: {
      type: Number,
      default: 6
    },
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      digits: [],
      focusedIndex: -1
    }
  },
  computed: {
    password () {
      return this.digits.join('')
    },
    isComplete () {
      return this.digits.every(digit => digit !== '')
    }
  },
  watch: {
    length: {
      immediate: true,
      handler (newLength) {
        this.digits = new Array(newLength).fill('')
      }
    },
    value: {
      immediate: true,
      handler (newValue) {
        if (newValue && newValue !== this.password) {
          this.setPassword(newValue)
        }
      }
    },
    password (newPassword) {
      this.$emit('input', newPassword)
      this.$emit('change', newPassword, this.isComplete)
    }
  },
  mounted () {
    this.focusInput(0)
  },
  methods: {
    onInput (index, event) {
      const value = event.target.value

      // 只允许数字
      if (!/^\d*$/.test(value)) {
        this.$set(this.digits, index, '')
        return
      }

      this.$set(this.digits, index, value)

      // 自动跳转到下一个输入框
      if (value && index < this.length - 1) {
        this.focusInput(index + 1)
      }
    },

    onKeydown (index, event) {
      if (event.key === 'Backspace') {
        if (!this.digits[index] && index > 0) {
          // 回退到上一个输入框
          this.focusInput(index - 1)
        } else {
          // 清空当前框
          this.$set(this.digits, index, '')
        }
      } else if (event.key === 'ArrowLeft' && index > 0) {
        this.focusInput(index - 1)
      } else if (event.key === 'ArrowRight' && index < this.length - 1) {
        this.focusInput(index + 1)
      }
    },

    onFocus (index) {
      this.focusedIndex = index
    },

    onBlur () {
      this.focusedIndex = -1
    },

    onPaste (event) {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')

      // 只处理数字
      const numbers = pastedData.replace(/\D/g, '')
      if (numbers) {
        this.setPassword(numbers.slice(0, this.length))
      }
    },

    focusInput (index) {
      if (index >= 0 && index < this.length) {
        this.$nextTick(() => {
          const input = this.$refs[`passwordInput${index}`]
          if (input && input[0]) {
            input[0].focus()
          } else if (input) {
            input.focus()
          }
        })
      }
    },

    setPassword (password) {
      const passwordArray = password.split('')
      for (let i = 0; i < this.length; i++) {
        this.$set(this.digits, i, passwordArray[i] || '')
      }

      // 聚焦到下一个空白位置
      const nextEmptyIndex = this.digits.findIndex(digit => digit === '')
      if (nextEmptyIndex !== -1) {
        this.focusInput(nextEmptyIndex)
      }
    },

    clear () {
      this.digits = new Array(this.length).fill('')
      this.focusInput(0)
    },

    focus () {
      this.focusInput(0)
    }
  }
}
</script>

<style scoped>
.password-input-component {
  display: inline-block;
}

.password-inputs {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.password-digit-container {
  position: relative;
  width: 40px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.password-digit-container.focused {
  border-color: #11253E;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.password-digit-input {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: transparent; /* 隐藏输入的数字 */
  caret-color: transparent; /* 隐藏光标 */
}

.password-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #262626;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* 不阻挡点击事件 */
}
</style>
