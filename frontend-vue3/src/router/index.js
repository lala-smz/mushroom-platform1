import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/useUserStore'
import { ElMessage } from 'element-plus'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', requiresGuest: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { title: '结算', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'AddressManage',
    component: () => import('../views/AddressManage.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  // 菌菇盲盒相关路由
  {
    path: '/mushroom-boxes',
    name: 'MushroomBoxes',
    component: () => import('../views/MushroomBoxes.vue'),
    meta: { title: '时令菌菇盲盒' }
  },
  {
    path: '/mushroom-boxes/:id',
    name: 'MushroomBoxDetail',
    component: () => import('../views/MushroomBoxDetail.vue'),
    meta: { title: '盲盒详情' }
  },
  {
    path: '/box-orders/:id',
    name: 'BoxOrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { title: '盲盒订单详情', requiresAuth: true }
  },
  // 代培服务进度跟踪
  {
    path: '/cultivation-progress/:orderId',
    name: 'CultivationProgress',
    component: () => import('../views/CultivationProgress.vue'),
    meta: { title: '菌菇代培进度', requiresAuth: true }
  },
  // 食谱相关路由
  {
    path: '/recipes',
    name: 'Recipes',
    component: () => import('../views/Recipes.vue'),
    meta: { title: '智能食谱推荐' }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetail.vue'),
    meta: { title: '食谱详情' }
  },
  // 智能匹配结果页面
  {
    path: '/smart-match-results',
    name: 'SmartMatchResults',
    component: () => import('../views/SmartMatchResults.vue'),
    meta: { title: '智能食谱匹配结果' }
  },
  // 用户口味偏好设置页面
  {
    path: '/preference-settings',
    name: 'PreferenceSettings',
    component: () => import('../views/PreferenceSettings.vue'),
    meta: { title: '口味偏好设置' }
  },
  // 盲盒抽取路由
  {
    path: '/mushroom-box-draw',
    name: 'MushroomBoxDraw',
    component: () => import('../components/MushroomBoxDraw.vue'),
    meta: { title: '菌菇盲盒抽取', requiresAuth: true }
  },
  // 管理后台路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { title: '管理后台', requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/ProductManage.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/OrderManage.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'product/upload',
        name: 'ProductUpload',
        component: () => import('../views/admin/ProductUpload.vue'),
        meta: { title: '商品上传' }
      },
      {
        path: 'score-config',
        name: 'AdminScoreConfig',
        component: () => import('../views/AdminScoreConfig.vue'),
        meta: { title: '评分权重配置' }
      },
      {
        path: 'content-management',
        name: 'AdminContentManagement',
        component: () => import('../views/admin/ContentManagement.vue'),
        meta: { title: '内容管理' }
      },
      {
        path: 'recipes',
        name: 'AdminRecipes',
        component: () => import('../views/admin/RecipeManagement.vue'),
        meta: { title: '食谱管理' }
      },
      {
        path: 'videos',
        name: 'AdminVideos',
        component: () => import('../views/admin/VideoManage.vue'),
        meta: { title: '视频管理' }
      },
      {
        path: 'boxes',
        name: 'AdminBoxes',
        component: () => import('../views/admin/MushroomBoxManage.vue'),
        meta: { title: '盲盒管理' }
      },
      {
        path: 'box-videos',
        name: 'AdminBoxVideos',
        component: () => import('../views/admin/BoxVideoUpload.vue'),
        meta: { title: '盲盒视频上传' }
      },
      {
        path: 'product-categories',
        name: 'AdminProductCategories',
        component: () => import('../views/admin/ProductCategoryManagement.vue'),
        meta: { title: '商品分类管理' }
      }
    ]
  },
  // 消息中心
  {
    path: '/message-center',
    name: 'MessageCenter',
    component: () => import('../views/MessageCenter.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  // 通知设置
  {
    path: '/notification-settings',
    name: 'NotificationSettings',
    component: () => import('../views/NotificationSettings.vue'),
    meta: { title: '通知设置', requiresAuth: true }
  },
  
  // 卖家商品管理
  {
    path: '/seller/products',
    name: 'SellerProducts',
    component: () => import('../views/SellerProducts.vue'),
    meta: { title: '我的商品管理', requiresAuth: true }
  },
  
  // 我的菌菇厨房 - UGC社区平台
  {
    path: '/mushroom-kitchen',
    name: 'MushroomKitchen',
    component: () => import('../views/MushroomKitchen.vue'),
    meta: { title: '我的菌菇厨房' }
  },
  {
    path: '/mushroom-kitchen/upload',
    name: 'MushroomKitchenUpload',
    component: () => import('../views/MushroomKitchenUpload.vue'),
    meta: { title: '上传作品', requiresAuth: true }
  },
  {
    path: '/mushroom-kitchen/work/:id',
    name: 'MushroomKitchenWorkDetail',
    component: () => import('../views/MushroomKitchenWorkDetail.vue'),
    meta: { title: '作品详情' }
  },
  {
    path: '/mushroom-kitchen/ranking',
    name: 'MushroomKitchenRanking',
    component: () => import('../views/MushroomKitchenRanking.vue'),
    meta: { title: '菌菇美食榜' }
  },
  {
    path: '/mushroom-kitchen/user/:userId',
    name: 'MushroomKitchenUserWorks',
    component: () => import('../views/MushroomKitchenUserWorks.vue'),
    meta: { title: '用户作品集' }
  },
  
  // 智能匹配演示页面
  {
    path: '/smart-matching-demo',
    name: 'SmartMatchingDemo',
    component: () => import('../views/SmartMatchingDemo.vue'),
    meta: { title: '智能匹配演示' }
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由加载错误处理
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局路由错误处理
router.onError((error) => {
  console.error('路由加载错误:', error)
  if (error.name === 'ChunkLoadError') {
    // 处理动态导入失败的情况
    console.error('动态导入失败，可能是网络问题或文件不存在')
    // 添加用户提示
    ElMessage.error('页面加载失败，请刷新页面重试')
    // 重定向到首页
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch dynamically imported module')) {
    // 处理动态导入模块失败的情况
    console.error('动态导入模块失败:', error.message)
    ElMessage.error('模块加载失败，请检查网络连接')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    // 处理其他路由错误
    console.error('其他路由错误:', error)
    ElMessage.error('路由错误，请稍后重试')
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 蘑菇网` : '蘑菇网'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 保存当前路径，登录后重定向
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 检查是否需要访客状态
  if (to.meta.requiresGuest && userStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    // 显示权限不足提示
    if (userStore.isLoggedIn) {
      ElMessage.error('需要管理员权限才能访问此页面')
    }
    next({ name: 'Home' })
    return
  }
  
  // 检查token是否有效但已过期
  if (userStore.isLoggedIn && !userStore.tokenValid) {
    // 显示登录过期提示，但不阻止访问
    // 使用try-catch确保即使ElMessage不可用也不会崩溃
    try {
      ElMessage.warning('登录已过期，请重新登录以获得完整功能')
    } catch (error) {
      console.warn('显示消息失败:', error)
    }
    // 继续访问，但标记需要重新登录
    next()
    return
  }
  
  next()
})

export default router