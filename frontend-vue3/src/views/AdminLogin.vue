<template>
  <div class="admin-login-container">
    <div class="login-form-wrapper">
      <h1 class="login-title">
        管理员登录
      </h1>
      <p class="login-subtitle">
        请输入您的管理员账号和密码
      </p>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="管理员账号"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              记住密码
            </el-checkbox>
            <el-link
              type="primary"
              class="forgot-password"
              @click="goToForgotPassword"
            >
              忘记密码？
            </el-link>
          </div>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© 2026 智能食谱应用管理系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = reactive({
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度应在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度应在 6 到 32 个字符之间', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 模拟管理员登录
    // 实际项目中应该调用后端API
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      // 保存登录状态
      userStore.login({
        id: 1,
        username: 'admin',
        role: 'admin',
        token: 'admin-token-' + Date.now()
      })
      
      ElMessage.success('登录成功！')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('账号或密码错误')
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  } finally {
    loading.value = false
  }
}

const goToForgotPassword = () => {
  // 实际项目中应该跳转到忘记密码页面
  ElMessage.info('忘记密码功能暂未实现')
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-title {
  font-size: 2rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.login-subtitle {
  color: #666;
  margin: 0 0 30px 0;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 15px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 0.9rem;
}

.login-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form-wrapper {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 1.8rem;
  }
}
</style>