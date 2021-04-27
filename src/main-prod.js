import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// import './plugins/element.js'
import './assets/global.css'
import ZkTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  Nprogress.start()
  // 按照接口文档要求在headers下添加一个Authorization属性
  // 其值为token
  config.headers.Authorization = sessionStorage.getItem('token')
  // console.log(config)
  return config
})
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})

Vue.prototype.$http = axios

Vue.component('tree-table', ZkTable)

Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.filter('formatDate', function (date) {
  const newDate = new Date(date)

  const y = newDate.getFullYear()
  const m = (newDate.getMonth() + 1).toString().padStart(2, '0')
  const d = newDate.getDay().toString().padStart(2, '0')

  const hh = newDate.getHours().toString().padStart(2, '0')
  const mm = newDate.getMinutes().toString().padStart(2, '0')
  const ss = newDate.getSeconds().toString().padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
