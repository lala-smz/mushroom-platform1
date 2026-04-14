<template>
  <div class="user-container">
    <div class="container">
      <h2>个人中心</h2>
      
      <el-tabs v-model="activeTab">
        <!-- 个人信息 -->
        <el-tab-pane
          label="个人信息"
          name="info"
        >
          <div class="user-info-card">
            <!-- 快捷入口 -->
            <div class="quick-links">
              <el-card
                shadow="hover"
                class="quick-link-card"
                @click="$router.push('/message-center')"
              >
                <template #header>
                  <div class="card-header">
                    <span>消息中心</span>
                  </div>
                </template>
                <div class="card-content">
                  <p>查看和回复您的消息</p>
                </div>
              </el-card>
              
              <el-card
                shadow="hover"
                class="quick-link-card order-card"
                @click="$router.push('/orders')"
              >
                <template #header>
                  <div class="card-header">
                    <span>我的订单</span>
                  </div>
                </template>
                <div class="card-content">
                  <p>查看订单列表和详情</p>
                </div>
              </el-card>
            </div>
            
            <el-form
              ref="userFormRef"
              :model="userForm"
              :rules="userRules"
              label-width="100px"
            >
              <el-form-item label="用户名">
                <el-input
                  v-model="userForm.username"
                  disabled
                  size="large"
                />
              </el-form-item>
              <el-form-item
                label="邮箱"
                prop="email"
              >
                <el-input
                  v-model="userForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                />
              </el-form-item>
              <el-form-item
                label="手机号"
                prop="phone"
              >
                <el-input
                  v-model="userForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="角色">
                <el-tag :type="getRoleType(userForm.role)">
                  {{ getRoleText(userForm.role) }}
                </el-tag>
              </el-form-item>
              <el-form-item label="注册时间">
                <el-input
                  v-model="userForm.createdAt"
                  disabled
                  size="large"
                />
              </el-form-item>
              <el-form-item label="最后登录">
                <el-input
                  v-model="userForm.lastLoginAt"
                  disabled
                  size="large"
                />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="userStore.loading" 
                  @click="updateUserInfo"
                >
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 修改密码 -->
        <el-tab-pane
          label="修改密码"
          name="password"
        >
          <div class="password-card">
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
            >
              <el-form-item
                label="旧密码"
                prop="oldPassword"
              >
                <el-input 
                  v-model="passwordForm.oldPassword" 
                  type="password" 
                  placeholder="请输入旧密码" 
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item
                label="新密码"
                prop="newPassword"
              >
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码" 
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item
                label="确认密码"
                prop="confirmPassword"
              >
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请确认新密码" 
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="userStore.loading" 
                  @click="changePassword"
                >
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/useUserStore'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('info')
const userFormRef = ref()
const passwordFormRef = ref()

// 用户信息表单
const userForm = reactive({
  username: '',
  email: '',
  phone: '',
  role: '',
  createdAt: '',
  lastLoginAt: ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const userRules = {
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const result = await userStore.fetchUserInfo()
    if (result.success) {
      const userInfo = result.data
      userForm.username = userInfo.username
      userForm.email = userInfo.email
      userForm.phone = userInfo.phone
      userForm.role = userInfo.role
      userForm.createdAt = userInfo.createdAt ? dayjs(userInfo.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''
      userForm.lastLoginAt = userInfo.lastLoginAt ? dayjs(userInfo.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : ''
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 更新用户信息
const updateUserInfo = async () => {
  if (!userFormRef.value) return
  
  const valid = await userFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const result = await userStore.updateUserInfo({
      email: userForm.email,
      phone: userForm.phone
    })
    
    if (result.success) {
      ElMessage.success('个人信息更新成功')
    }
  } catch (error) {
    console.error('更新个人信息失败：', error)
    ElMessage.error(error.message || '更新个人信息失败')
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const result = await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      ElMessage.success('密码修改成功')
      // 清空表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (error) {
    console.error('修改密码失败：', error)
    ElMessage.error(error.message || '修改密码失败')
  }
}

// 获取角色类型
const getRoleType = (role) => {
  switch (role) {
    case 'admin': return 'danger'
    case 'seller': return 'warning'
    case 'user': return 'primary'
    default: return 'info'
  }
}

// 获取角色文本
const getRoleText = (role) => {
  switch (role) {
    case 'admin': return '管理员'
    case 'seller': return '卖家'
    case 'user': return '普通用户'
    default: return role
  }
}

onMounted(() => {
  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 获取用户信息
  fetchUserInfo()
})
</script>

<style scoped>
.user-container {
  padding: 20px 0;
}

.user-container h2 {
  margin-bottom: 20px;
  color: #333;
}

.user-info-card,
.password-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.el-tabs {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.quick-links {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.quick-link-card {
  flex: 1;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* 订单卡片样式 */
.order-card {
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-card:focus-within {
  outline: 2px solid rgba(144, 147, 153, 0.5);
  outline-offset: 2px;
}

/* 确保触摸目标大小 */
@media (hover: none) and (pointer: coarse) {
  .quick-link-card {
    min-width: 120px;
    min-height: 120px;
  }
}

@media (max-width: 768px) {
  .user-info-card,
  .password-card {
    padding: 15px;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .quick-links {
    flex-direction: column;
  }
  
  .quick-link-card {
    min-width: auto;
  }
}
</style>