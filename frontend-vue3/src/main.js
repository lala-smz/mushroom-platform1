// 引入 polyfills 解决 util._extend 弃用警告
import './polyfills.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueLazyLoad from 'vue-lazyload'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import { useUserStore } from './stores/useUserStore'
import { DEFAULT_PLACEHOLDER_URL } from './utils/imageUtils'

// 先创建 Pinia 和 应用实例
const pinia = createPinia()
const app = createApp(App)

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(VueLazyLoad, {
  preLoad: 1.3,
  error: DEFAULT_PLACEHOLDER_URL,
  loading: DEFAULT_PLACEHOLDER_URL,
  attempt: 1,
  lazyComponent: true
})

// 初始化用户状态
const userStore = useUserStore()
userStore.init()

// 挂载应用
app.mount('#app')