import Vue from 'vue'
import VueI18n from 'vue-i18n'

export default function createI18n (locale, messages = {}) {
  if (typeof locale === 'object') {
    messages = locale
    locale = undefined
  }

  if (!locale) {
    locale = checkLang()
  }

  const i18n = new VueI18n({
    locale,
    messages
  })

  const vue = new Vue({
    i18n
  })

  return function (...args) {
    return vue.$t.call(vue, ...args)
  }
}

export function checkLang () {
  const LANGS = ['cn', 'en']

  if (LANGS.some(lang => lang === _dealLocalStorage('lang'))) {
    return _dealLocalStorage('lang')
  }

  let locale = _dealLocalStorage('lang') || 'cn'

  if (locale.includes('zh-') || locale.includes('cn')) {
    locale = 'cn'
  } else if (locale.includes('en')) {
    locale = 'en'
  } else if (locale.includes('ko')) {
    locale = 'ko'
  } else {
    locale = 'en'
  }

  _dealLocalStorage('lang', locale)
  return locale
}

function _dealLocalStorage (name, value) {
  const localStorage = window.localStorage || null
  if (localStorage && value) {
    window.localStorage.setItem(name, value)
  } else if (localStorage) {
    return localStorage.getItem(name) || ''
  }
  return ''
}
