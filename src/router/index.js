import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login'
// import Home from '../components/Home'
// import Welcome from '../components/Welcome'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

// import Users from '../components/user/Users'
// import Rights from '../components/power/Rights'
// import Roles from '../components/power/Roles'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

// import Cate from '../components/goods/Cate'
// import Params from '../components/goods/Params'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params')

// import List from '../components/goods/List'
// import Add from '../components/goods/Add'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add')

// import Order from '../components/order/Order'
// import Report from '../components/report/Report'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]
const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  // console.log(token)
  if (!token) return next('/login')
  next()
})

export default router
