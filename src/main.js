import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/global.css'
import ZkTable from 'vue-table-with-tree-grid'

// 配置axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 按照接口文档要求在headers下添加一个Authorization属性
  // 其值为token
  config.headers.Authorization = sessionStorage.getItem('token')
  // console.log(config)
  return config
})

Vue.prototype.$http = axios

Vue.component('tree-table', ZkTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
