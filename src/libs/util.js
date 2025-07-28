import cookies from './util.cookies'
import log from './util.log'

const util = {
  cookies,
  log
}

/**
 * @description 更新标题
 * @param {String} title 标题
 */
util.title = function (titleText) {
  const processTitle = process.env.VUE_APP_TITLE || 'D2Admin'
  window.document.title = `${processTitle}${titleText ? ` | ${titleText}` : ''}`
}

/**
 * @description 打开新页面
 * @param {String} url 地址
 */
util.open = function (url) {
  var a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  a.setAttribute('id', 'd2admin-link-temp')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(document.getElementById('d2admin-link-temp'))
}

/**
 * @description 设置 localStorage
 * @param {String} key 键
 * @param {any} value 值
 */
util.setLocalStorage = function (key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value) // 如果值是对象，转换为字符串
  }
  window.localStorage.setItem(key, value)
}

/**
 * @description 获取 localStorage
 * @param {String} key 键
 * @returns {any} 值
 */
util.getLocalStorage = function (key) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.parse(value) // 尝试解析为对象
  } catch (e) {
    return value // 如果解析失败，返回原始值
  }
}

/**
 * @description 移除 localStorage
 * @param {String} key 键
 */
util.removeLocalStorage = function (key) {
  window.localStorage.removeItem(key)
}

export default util
