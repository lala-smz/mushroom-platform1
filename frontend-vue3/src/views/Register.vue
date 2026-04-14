<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
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
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirmPassword"
        >
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            prefix-icon="Check"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input 
            v-model="form.email" 
            type="email" 
            placeholder="请输入邮箱" 
            prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号" 
            prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        <el-form-item
          label="身份选择"
          prop="role"
        >
          <el-radio-group
            v-model="form.role"
            size="large"
          >
            <el-radio
              label="user"
              border
            >
              客户
            </el-radio>
            <el-radio
              label="seller"
              border
            >
              卖家
            </el-radio>
          </el-radio-group>
          <div class="role-description">
            请选择您的身份，不同身份将拥有不同的功能权限
          </div>
        </el-form-item>
        <el-form-item
          prop="agreement"
          class="agreement-form-item"
        >
          <el-checkbox
            v-model="form.agreement"
            class="agreement-checkbox"
          />
          <span class="agreement-text">
            我已阅读并同意
            <el-link
              type="primary"
              @click="showAgreement('user')"
            >《客户注册协议》</el-link>
            <template v-if="form.role === 'seller'">
              <span class="link-separator">和</span>
              <el-link
                type="primary"
                @click="showAgreement('seller')"
              >《卖家注册协议》</el-link>
            </template>
          </span>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="userStore.loading" 
            style="width: 100%"
            :disabled="!form.agreement"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <p class="login-link">
        已有账号？
        <router-link to="/login">
          立即登录
        </router-link>
      </p>
    </div>
    
    <!-- 协议查看对话框 -->
    <el-dialog
      v-model="agreementDialogVisible"
      :title="currentAgreementTitle"
      width="80%"
      :close-on-click-modal="false"
      class="agreement-dialog"
    >
      <div class="agreement-content">
        <div v-if="currentAgreementType === 'user'">
          <h3>蘑菇网客户注册协议</h3>
          <div class="agreement-section">
            <h4>一、总则</h4>
            <p>1.1 本协议是您与蘑菇网平台（以下简称"本平台"）之间关于您使用本平台服务所订立的协议。</p>
            <p>1.2 本协议具有合同效力，您一旦使用本平台服务，即表示您已同意并接受本协议的所有条款。</p>
          </div>
          
          <div class="agreement-section">
            <h4>二、服务内容</h4>
            <p>2.1 本平台为客户提供菌菇类商品的浏览、购买、订单管理等服务。</p>
            <p>2.2 客户可以通过平台查看商品信息、下单购买、评价商品等。</p>
          </div>
          
          <div class="agreement-section">
            <h4>三、用户权利与义务</h4>
            <p>3.1 您有权使用本平台提供的商品浏览、购买等服务。</p>
            <p>3.2 您应当保证提供的注册信息真实、准确、完整。</p>
            <p>3.3 您应当妥善保管账户信息，不得将账户出借或转让给他人使用。</p>
            <p>3.4 您在使用本平台服务时，应当遵守国家法律法规，不得利用本平台从事违法活动。</p>
          </div>
          
          <div class="agreement-section">
            <h4>四、隐私保护</h4>
            <p>4.1 本平台将严格保护您的个人信息安全，不会向任何第三方泄露您的个人信息，法律法规另有规定的除外。</p>
            <p>4.2 本平台可能会使用您的个人信息向您提供服务或发送相关通知。</p>
          </div>
          
          <div class="agreement-section">
            <h4>五、免责声明</h4>
            <p>5.1 本平台不对因不可抗力导致的服务中断或数据丢失承担责任。</p>
            <p>5.2 本平台不对用户之间的交易纠纷承担责任，但会提供必要的协助。</p>
          </div>
          
          <div class="agreement-section">
            <h4>六、协议变更与终止</h4>
            <p>6.1 本平台有权根据需要修改本协议内容，修改后的协议一旦公布即生效。</p>
            <p>6.2 如您不同意修改后的协议，您有权停止使用本平台服务。</p>
          </div>
        </div>
        
        <div v-if="currentAgreementType === 'seller'">
          <h3>蘑菇网卖家注册协议</h3>
          <div class="agreement-section">
            <h4>一、总则</h4>
            <p>1.1 本协议是您与蘑菇网平台（以下简称"本平台"）之间关于您作为卖家使用本平台服务所订立的协议。</p>
            <p>1.2 本协议具有合同效力，您一旦使用本平台卖家服务，即表示您已同意并接受本协议的所有条款。</p>
          </div>
          
          <div class="agreement-section">
            <h4>二、服务内容</h4>
            <p>2.1 本平台为卖家提供菌菇类商品的展示、销售、订单管理等服务。</p>
            <p>2.2 卖家可以通过平台发布商品信息、管理订单、处理售后等。</p>
          </div>
          
          <div class="agreement-section">
            <h4>三、卖家权利与义务</h4>
            <p>3.1 您有权使用本平台提供的商品发布、销售、订单管理等服务。</p>
            <p>3.2 您应当保证提供的注册信息真实、准确、完整，并具备合法的经营资质。</p>
            <p>3.3 您应当保证所售商品符合国家法律法规和平台规则的要求。</p>
            <p>3.4 您应当妥善保管账户信息，不得将账户出借或转让给他人使用。</p>
            <p>3.5 您应当诚信经营，不得进行虚假宣传、欺诈销售等违法违规行为。</p>
          </div>
          
          <div class="agreement-section">
            <h4>四、商品管理</h4>
            <p>4.1 您发布的商品信息应当真实、准确，不得含有虚假或误导性内容。</p>
            <p>4.2 您应当保证所售商品的质量，提供符合描述的商品。</p>
            <p>4.3 您应当按照约定时间发货，并保证商品在运输过程中的安全。</p>
          </div>
          
          <div class="agreement-section">
            <h4>五、交易管理</h4>
            <p>5.1 您应当按照平台规则处理订单，及时响应客户的咨询和投诉。</p>
            <p>5.2 您应当按照国家相关规定提供售后服务，保障消费者的合法权益。</p>
          </div>
          
          <div class="agreement-section">
            <h4>六、费用结算</h4>
            <p>6.1 本平台可能会向卖家收取一定的服务费用，具体收费标准以平台公布为准。</p>
            <p>6.2 您应当按照平台规定的结算方式进行结算。</p>
          </div>
          
          <div class="agreement-section">
            <h4>七、隐私保护</h4>
            <p>7.1 本平台将严格保护您的个人信息安全，不会向任何第三方泄露您的个人信息，法律法规另有规定的除外。</p>
            <p>7.2 本平台可能会使用您的个人信息向您提供服务或发送相关通知。</p>
          </div>
          
          <div class="agreement-section">
            <h4>八、免责声明</h4>
            <p>8.1 本平台不对因不可抗力导致的服务中断或数据丢失承担责任。</p>
            <p>8.2 本平台不对用户之间的交易纠纷承担责任，但会提供必要的协助。</p>
          </div>
          
          <div class="agreement-section">
            <h4>九、协议变更与终止</h4>
            <p>9.1 本平台有权根据需要修改本协议内容，修改后的协议一旦公布即生效。</p>
            <p>9.2 如您不同意修改后的协议，您有权停止使用本平台服务。</p>
            <p>9.3 如您违反本协议，本平台有权终止向您提供服务，并保留追究法律责任的权利。</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="agreementDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  role: 'user', // 添加角色字段，默认值为'user'（客户）
  agreement: false // 添加协议勾选字段
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度在 3-30 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择您的身份', trigger: 'change' }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请勾选同意相关协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const handleRegister = async () => {
  // 验证表单
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  // 检查是否勾选协议
  if (!form.agreement) {
    ElMessage.warning('请先勾选同意相关协议')
    return
  }

  try {
    const result = await userStore.register({
      username: form.username,
      password: form.password,
      email: form.email,
      phone: form.phone,
      role: form.role
    })
    
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      // 跳转到登录页
      router.push('/login')
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    console.error('注册错误：', error)
    ElMessage.error(error.message || '注册失败')
  }
}

// 协议对话框相关变量
const agreementDialogVisible = ref(false)
const currentAgreementType = ref('user')
const currentAgreementTitle = ref('蘑菇网客户注册协议')

// 显示协议对话框
const showAgreement = (type) => {
  currentAgreementType.value = type
  currentAgreementTitle.value = type === 'user' ? '蘑菇网客户注册协议' : '蘑菇网卖家注册协议'
  agreementDialogVisible.value = true
}

onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 450px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-form {
    padding: 20px;
  }
}

/* 身份选择样式 */
.role-description {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

:deep(.el-radio) {
  margin-right: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
}

:deep(.el-radio__label) {
  margin-left: 5px;
}

/* 协议勾选样式 */
.agreement-form-item {
  margin-bottom: 20px;
}

:deep(.agreement-form-item .el-form-item__content) {
  display: flex;
  align-items: flex-start;
  margin-left: 0 !important;
}

:deep(.agreement-checkbox) {
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 3px;
}

.agreement-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  flex: 1;
  word-break: break-word;
}

.agreement-text .el-link {
  margin: 0 4px;
  font-size: 14px;
  padding: 0;
  vertical-align: baseline;
}

.link-separator {
  margin: 0 4px;
  color: #606266;
  font-size: 14px;
}

/* 协议对话框样式 */
.agreement-dialog .agreement-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.agreement-content h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.agreement-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #409eff;
  font-size: 16px;
}

.agreement-content p {
  margin: 8px 0;
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
  text-align: justify;
}

.agreement-section {
  margin-bottom: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px;
  border-top: 1px solid #ebeef5;
}
</style>