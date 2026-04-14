<template>
  <div class="address-manage-container">
    <h2>地址管理</h2>
    
    <!-- 地址列表 -->
    <el-card
      class="address-list-card"
      shadow="hover"
    >
      <template #header>
        <div class="card-header">
          <span>我的收货地址</span>
          <el-button
            type="primary"
            @click="showAddAddress = true"
          >
            添加地址
          </el-button>
        </div>
      </template>
      
      <!-- 地址列表 -->
      <div class="address-list">
        <div 
          v-for="address in addresses" 
          :key="address.id" 
          class="address-item"
          :class="{ 
            'default-address': address.isDefault,
            'selected-address': selectedAddressId === address.id
          }"
        >
          <div class="address-info">
            <div class="address-header">
              <span class="receiver">{{ address.receiver }}</span>
              <span class="phone">{{ address.phone }}</span>
              <el-tag
                v-if="address.isDefault"
                type="primary"
                size="small"
              >
                默认
              </el-tag>
            </div>
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
              <span
                v-if="address.postalCode"
                class="postal-code"
              >({{ address.postalCode }})</span>
            </div>
          </div>
          
          <div class="address-actions">
            <el-button 
              type="primary"
              size="small"
              @click="useThisAddress(address)"
            >
              使用此地址
            </el-button>
            <el-button 
              v-if="!address.isDefault" 
              type="text" 
              @click="setDefaultAddress(address.id)"
            >
              设置默认
            </el-button>
            <el-button
              type="text"
              @click="editAddress(address)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              danger
              @click="confirmDelete(address.id)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div
          v-if="!addresses.length"
          class="empty-addresses"
        >
          <el-empty description="暂无收货地址">
            <el-button
              type="primary"
              @click="showAddAddress = true"
            >
              添加地址
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-card>
    
    <!-- 添加地址弹窗 -->
    <el-dialog
      v-model="showAddAddress"
      title="添加收货地址"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addAddressForm"
        :model="newAddress"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item
          label="收件人"
          prop="receiver"
        >
          <el-input
            v-model="newAddress.receiver"
            placeholder="请输入收件人姓名"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input
            v-model="newAddress.phone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
        <el-form-item
          label="省份"
          prop="province"
        >
          <el-input
            v-model="newAddress.province"
            placeholder="请输入省份"
          />
        </el-form-item>
        <el-form-item
          label="城市"
          prop="city"
        >
          <el-input
            v-model="newAddress.city"
            placeholder="请输入城市"
          />
        </el-form-item>
        <el-form-item
          label="区县"
          prop="district"
        >
          <el-input
            v-model="newAddress.district"
            placeholder="请输入区县"
          />
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="detail"
        >
          <el-input 
            v-model="newAddress.detail" 
            type="textarea" 
            placeholder="请输入详细地址"
            rows="3"
          />
        </el-form-item>
        <el-form-item
          label="邮政编码"
          prop="postalCode"
        >
          <el-input
            v-model="newAddress.postalCode"
            placeholder="请输入邮政编码"
          />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="newAddress.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddAddress = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="addAddress"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑地址弹窗 -->
    <el-dialog
      v-model="showEditAddress"
      title="编辑收货地址"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editAddressForm"
        :model="editingAddress"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item
          label="收件人"
          prop="receiver"
        >
          <el-input
            v-model="editingAddress.receiver"
            placeholder="请输入收件人姓名"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input
            v-model="editingAddress.phone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
        <el-form-item
          label="省份"
          prop="province"
        >
          <el-input
            v-model="editingAddress.province"
            placeholder="请输入省份"
          />
        </el-form-item>
        <el-form-item
          label="城市"
          prop="city"
        >
          <el-input
            v-model="editingAddress.city"
            placeholder="请输入城市"
          />
        </el-form-item>
        <el-form-item
          label="区县"
          prop="district"
        >
          <el-input
            v-model="editingAddress.district"
            placeholder="请输入区县"
          />
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="detail"
        >
          <el-input 
            v-model="editingAddress.detail" 
            type="textarea" 
            placeholder="请输入详细地址"
            rows="3"
          />
        </el-form-item>
        <el-form-item
          label="邮政编码"
          prop="postalCode"
        >
          <el-input
            v-model="editingAddress.postalCode"
            placeholder="请输入邮政编码"
          />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="editingAddress.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditAddress = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="updateAddress"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="300px"
      :close-on-click-modal="false"
    >
      <span>确定要删除这个收货地址吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDeleteDialog = false">
            取消
          </el-button>
          <el-button
            type="danger"
            @click="deleteAddress"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '../stores/useAddressStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const addressStore = useAddressStore()

// 地址列表
const addresses = computed(() => addressStore.addresses)

// 显示添加地址弹窗
const showAddAddress = ref(false)
// 显示编辑地址弹窗
const showEditAddress = ref(false)
// 显示删除确认对话框
const showDeleteDialog = ref(false)
// 删除的地址ID
const deletingAddressId = ref(null)

// 当前正在使用的地址ID（用于样式区分）
const selectedAddressId = ref(null)

// 添加地址表单
const addAddressForm = ref(null)
// 编辑地址表单
const editAddressForm = ref(null)

// 新地址表单数据
const newAddress = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  postalCode: '',
  isDefault: false
})

// 编辑地址表单数据
const editingAddress = ref({
  id: '',
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  postalCode: '',
  isDefault: false
})

// 地址表单验证规则
const addressRules = {
  receiver: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '收件人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请输入省份', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请输入城市', trigger: 'blur' }
  ],
  district: [
    { required: true, message: '请输入区县', trigger: 'blur' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '详细地址长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  postalCode: [
    { pattern: /^\d{6}$/, message: '请输入正确的邮政编码', trigger: 'blur' }
  ]
}

// 获取地址列表
const getAddressList = async () => {
  try {
    await addressStore.getAddressList()
  } catch (error) {
    ElMessage.error('获取地址列表失败: ' + (error.message || '未知错误'))
  }
}

// 打开编辑地址弹窗
const editAddress = (address) => {
  editingAddress.value = { ...address }
  showEditAddress.value = true
}

// 打开删除确认对话框
const confirmDelete = (id) => {
  deletingAddressId.value = id
  showDeleteDialog.value = true
}

// 添加地址
const addAddress = async () => {
  await addAddressForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await addressStore.addAddress(newAddress.value)
        ElMessage.success('添加地址成功')
        showAddAddress.value = false
        // 重置表单
        resetAddForm()
        // 重新获取地址列表以确保显示最新状态
        await getAddressList()
      } catch (error) {
        ElMessage.error('添加地址失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 更新地址
const updateAddress = async () => {
  await editAddressForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await addressStore.updateAddress(editingAddress.value.id, editingAddress.value)
        ElMessage.success('更新地址成功')
        showEditAddress.value = false
        // 重新获取地址列表以确保显示最新状态
        await getAddressList()
      } catch (error) {
        ElMessage.error('更新地址失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 删除地址
const deleteAddress = async () => {
  try {
    await addressStore.deleteAddress(deletingAddressId.value)
    ElMessage.success('删除地址成功')
    showDeleteDialog.value = false
    // 重新获取地址列表以确保显示最新状态
    await getAddressList()
  } catch (error) {
    ElMessage.error('删除地址失败: ' + (error.message || '未知错误'))
  }
}

// 设置默认地址
const setDefaultAddress = async (id) => {
  try {
    await addressStore.setDefaultAddress(id)
    ElMessage.success('设置默认地址成功')
  } catch (error) {
    ElMessage.error('设置默认地址失败: ' + (error.message || '未知错误'))
  }
}

// 使用此地址进行结算
const useThisAddress = (address) => {
  selectedAddressId.value = address.id
  router.push({
    path: '/checkout',
    query: { selectedAddressId: address.id }
  })
}

// 重置添加表单
const resetAddForm = () => {
  newAddress.value = {
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    postalCode: '',
    isDefault: false
  }
}

// 组件挂载时获取地址列表
onMounted(() => {
  getAddressList()
})
</script>

<style scoped>
.address-manage-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-list {
  margin-top: 20px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  transition: all 0.3s;
}

.address-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.default-address {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.default-address::before {
  content: '默认';
  position: absolute;
  top: 0;
  left: 0;
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 8px 0 8px 0;
}



.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.receiver {
  font-weight: bold;
  margin-right: 15px;
}

.phone {
  color: #666;
  margin-right: 15px;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.postal-code {
  color: #999;
  font-size: 12px;
  margin-left: 5px;
}

.address-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 100px;
}

.address-actions .el-button--primary {
  margin-bottom: 5px;
}

.empty-addresses {
  padding: 50px 0;
  text-align: center;
}

.address-item.selected-address {
  border: 4px solid #67c23a !important;
  border-color: #67c23a !important;
  background: linear-gradient(135deg, #f0fff4 0%, #e6f7e6 100%) !important;
  box-shadow: 0 8px 24px rgba(103, 194, 58, 0.5) !important;
  transform: scale(1.04) !important;
  animation: pulse-green 2s ease-in-out infinite;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(103, 194, 58, 0.15);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

.address-item.selected-address::before {
  content: '✓ 使用中' !important;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%) !important;
  color: white !important;
  padding: 4px 12px !important;
  font-size: 13px !important;
  border-radius: 8px 0 12px 0 !important;
  font-weight: 600 !important;
  z-index: 10 !important;
}

.address-item.selected-address::after {
  content: '' !important;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px !important;
  background: linear-gradient(90deg, #67c23a, #85ce61, #67c23a) !important;
  border-radius: 12px 12px 0 0 !important;
}
</style>