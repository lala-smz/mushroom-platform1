<template>
  <div class="user-manage-container">
    <h2>用户管理</h2>
    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form
        :inline="true"
        :model="filterForm"
        class="filter-form"
      >
        <el-form-item label="角色">
          <el-select
            v-model="filterForm.role"
            placeholder="请选择角色"
            size="large"
          >
            <el-option
              value=""
              label="全部角色"
            />
            <el-option
              value="admin"
              label="管理员"
            />
            <el-option
              value="seller"
              label="卖家"
            />
            <el-option
              value="user"
              label="普通用户"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            size="large"
          >
            <el-option
              value=""
              label="全部状态"
            />
            <el-option
              :value="true"
              label="正常"
            />
            <el-option
              :value="false"
              label="禁用"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="fetchUsers"
          >
            筛选
          </el-button>
          <el-button
            size="large"
            @click="resetFilter"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list">
      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="用户ID"
          width="80"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="180"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          width="150"
        />
        <el-table-column
          prop="role"
          label="角色"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :disabled="scope.row.role === 'admin'"
              @change="updateUserStatus(scope.row.id, scope.row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="lastLoginAt"
          label="最后登录"
        />
        <el-table-column
          prop="createdAt"
          label="注册时间"
        />
        <el-table-column
          label="操作"
          width="200"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="editUser(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="scope.row.role === 'admin'"
              @click="deleteUser(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div
        v-if="total > 0"
        class="pagination"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="editForm.username"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select
            v-model="editForm.role"
            placeholder="请选择角色"
          >
            <el-option
              value="admin"
              label="管理员"
            />
            <el-option
              value="seller"
              label="卖家"
            />
            <el-option
              value="user"
              label="普通用户"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch v-model="editForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveUser"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../../api'
import { message } from '../../utils/message'

// 筛选表单
const filterForm = ref({
  role: '',
  status: ''
})

// 用户列表
const users = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑对话框
const dialogVisible = ref(false)
const editForm = ref({})
const editFormRef = ref()

// 编辑表单验证规则
const editRules = {
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await apiClient.admin.getUsers({
      page: currentPage.value,
      limit: pageSize.value,
      role: filterForm.value.role,
      status: filterForm.value.status
    })
    users.value = response.data.users
    total.value = response.data.total
  } catch (error) {
    message.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    role: '',
    status: ''
  }
  currentPage.value = 1
  fetchUsers()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchUsers()
}

// 当前页变化
const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchUsers()
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

// 更新用户状态
const updateUserStatus = async (id, status) => {
  try {
    await apiClient.admin.updateUserStatus(id, { status })
    message.success('状态更新成功')
  } catch (error) {
    message.error(error.message || '状态更新失败')
    // 恢复原状态
    const user = users.value.find(u => u.id === id)
    if (user) {
      user.status = !status
    }
  }
}

// 编辑用户
const editUser = (user) => {
  editForm.value = { ...user }
  dialogVisible.value = true
}

// 保存用户
const saveUser = async () => {
  if (!editFormRef.value) return
  
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    // 更新用户基本信息和状态
    await apiClient.admin.updateUserInfo(editForm.value.id, {
      email: editForm.value.email,
      phone: editForm.value.phone,
      status: editForm.value.status
    })
    
    // 更新角色
    if (editForm.value.role) {
      await apiClient.admin.updateUserRole(editForm.value.id, { role: editForm.value.role })
    }
    
    message.success('用户信息更新成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    message.error(error.message || '更新失败')
  }
}

// 删除用户
const deleteUser = async (id) => {
  try {
    // 调用管理员删除用户API
    await apiClient.admin.deleteUser(id)
    message.success('用户删除成功')
    fetchUsers()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-manage-container {
  padding: 20px 0;
}

.user-manage-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 筛选部分 */
.filter-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

/* 用户列表 */
.user-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-list {
    padding: 15px;
  }
}
</style>