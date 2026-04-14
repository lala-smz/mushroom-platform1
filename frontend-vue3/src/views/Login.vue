<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">
            记住密码
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="userStore.loading" 
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="register-link">
        还没有账号？
        <router-link to="/register">
          立即注册
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度在3-30个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  // 验证表单
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const result = await userStore.login(form)
    if (result.success) {
      ElMessage.success('登录成功')
      
      // 跳转到之前的页面或首页
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    console.error('登录错误：', error)
    ElMessage.error(error.message || '登录失败')
  }
}

onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-form {
    padding: 20px;
  }
}
</style>