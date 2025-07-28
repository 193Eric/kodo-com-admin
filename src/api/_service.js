import { message } from 'ant-design-vue'
import axios from 'axios'
import Adapter from 'axios-mock-adapter'
import { get, isEmpty, merge } from 'lodash'
import qs from 'qs'
import util from '@/libs/util'
import store from '@/store'

/**
 * @description 记录和显示错误
 * @param {Error} error 错误对象
 */
function handleError (error) {
  // 添加到日志
  store.dispatch('d2admin/log/push', {
    message: '数据请求异常',
    type: 'danger',
    meta: {
      error
    }
  })
  // 打印到控制台
  if (process.env.NODE_ENV === 'development') {
    util.log.danger('>>>>>> Error >>>>>>')
    console.log(error)
  }
  // 显示提示 - 改为Ant Design Vue的message
  if (typeof window !== 'undefined' && message) {
    message.error(error.message || '请求失败')
  }
}

/**
 * @description 创建请求实例
 */
function createService () {
  // 创建一个 axios 实例
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    config => config,
    error => {
      // 发送失败
      console.log(error)
      return Promise.reject(error)
    }
  )
  // 响应拦截
  service.interceptors.response.use(
    response => {
      // http 状态码 200 情况
      // 添加响应数据验证
      if (!response || !response.data) {
        console.error('响应数据为空:', response)
        return {
          code: 500,
          message: '响应数据为空',
          data: null
        }
      }

      // 没有 code 视为非项目接口不作处理
      if (response.data.code === undefined) {
        return response.data
      }

      // 有 code 判断为项目接口请求
      switch (response.data.code) {
        // 返回响应内容
        case 200:
          return response.data
        // 例如在 code 401 情况下退回到登录页面
        case 403:
          if (typeof window !== 'undefined' && message) {
            message.error('登录已过期，请重新登录')
          }
          store.dispatch('Logout')
          return Promise.reject(new Error('登录已过期'))
        // 其他错误码处理
        default:
          if (response.data.message) {
            if (typeof window !== 'undefined' && message) {
              message.error(response.data.message)
            }
          }
          return response.data
      }
    },
    error => {
      const status = get(error, 'response.status')

      // 网络错误或者没有响应
      if (!error.response) {
        error.message = '网络连接失败，请检查网络'
        handleError(error)
        return Promise.reject(error)
      }

      switch (status) {
        case 400: error.message = '请求错误'; break
        case 401:
          error.message = '未授权，请登录'
          store.dispatch('d2admin/account/logout')
          break
        case 403:
          error.message = '拒绝访问'
          store.dispatch('d2admin/account/logout')
          break
        case 404: error.message = `请求地址出错: ${error.response.config.url}`; break
        case 408: error.message = '请求超时'; break
        case 500: error.message = '服务器内部错误'; break
        case 501: error.message = '服务未实现'; break
        case 502: error.message = '网关错误'; break
        case 503: error.message = '服务不可用'; break
        case 504: error.message = '网关超时'; break
        case 505: error.message = 'HTTP版本不受支持'; break
        default:
          error.message = '请求失败'
          break
      }

      handleError(error)
      return Promise.reject(error)
    }
  )
  return service
}

function stringify (data) {
  return qs.stringify(data, { allowDots: true, encode: false })
}

/**
 * @description 创建请求方法
 * @param {Object} service axios 实例
 */
function createRequest (service) {
  let baseURL = ''
  if (window.location.hostname.includes('pay.kodo.finance')) {
    baseURL = 'https://pay-api.kodo.finance'
  }

  // if (window.location.hostname.includes('pay-white.kodo.finance')) {
  //   baseURL = 'https://pay-api-white.kodo.finance'
  // }

  if (!baseURL) {
    baseURL = 'https://pay-api-test.kodo.finance'
    // baseURL = 'https://kodo-api.1tools.vip'
  }

  return function (config) {
    const token = localStorage.getItem('token')
    const configDefault = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': get(config, 'headers.Content-Type', 'application/json')
      },
      timeout: 10000, // 增加超时时间
      // 通过当前访问的域名判断 baseURL
      baseURL: baseURL,
      data: {}
    }
    const option = merge(configDefault, config)

    // 处理 get 请求的参数
    if (!isEmpty(option.params)) {
      option.url = option.url + '?' + stringify(option.params)
      option.params = {}
    }

    // 当需要以 form 形式发送时 处理发送的数据
    if (!isEmpty(option.data) && option.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      option.data = stringify(option.data)
    }

    // 返回包装后的Promise，确保错误处理
    return service(option).catch(error => {
      console.error('API请求失败:', error)
      // 返回一个默认的错误响应结构
      return {
        code: 500,
        message: error.message || '请求失败',
        data: null
      }
    })
  }
}

// 用于真实网络请求的实例和请求方法
export const service = createService()
export const request = createRequest(service)

// 用于模拟网络请求的实例和请求方法
export const serviceForMock = createService()
export const requestForMock = createRequest(serviceForMock)

// 网络请求数据模拟工具
export const mock = new Adapter(serviceForMock)
