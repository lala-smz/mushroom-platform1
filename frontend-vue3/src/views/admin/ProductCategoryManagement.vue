<template>
  <div class="product-category-management">
    <div class="page-header">
      <div class="header-left">
        <h1>商品分类管理</h1>
        <p class="subtitle">
          管理商品的三级分类层级结构
        </p>
      </div>
      <div class="header-right">
        <div
          v-if="stats"
          class="stats-bar"
        >
          <span class="stat-item">
            <span class="stat-value">{{ stats.level1 }}</span>
            <span class="stat-label">一级分类</span>
          </span>
          <span class="stat-divider" />
          <span class="stat-item">
            <span class="stat-value">{{ stats.level2 }}</span>
            <span class="stat-label">二级分类</span>
          </span>
          <span class="stat-divider" />
          <span class="stat-item">
            <span class="stat-value">{{ stats.level3 }}</span>
            <span class="stat-label">三级分类</span>
          </span>
        </div>
        <el-button
          type="primary"
          size="default"
          :loading="loading"
          class="add-btn"
          @click="handleAddLevel1"
        >
          <el-icon><Plus /></el-icon> 新增一级分类
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 分类树 -->
      <div class="category-tree-panel">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon class="tree-icon">
              <FolderOpened />
            </el-icon>
            <span>分类层级结构</span>
          </div>
          <div class="panel-actions">
            <el-button
              size="small"
              :loading="loading"
              class="refresh-btn"
              @click="refreshTree"
            >
              <el-icon><Refresh :class="{ 'rotate': isRefreshing }" /></el-icon> 刷新
            </el-button>
            <el-button
              size="small"
              :loading="loading"
              class="cache-btn"
              @click="clearLocalCache"
            >
              <el-icon><DeleteIcon /></el-icon> 清除缓存
            </el-button>
          </div>
        </div>

        <div
          v-if="loading && !categoryTree.length"
          class="skeleton-container"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="skeleton-item"
          >
            <div
              class="skeleton-line"
              :style="{ marginLeft: `${(i % 3) * 16}px` }"
            />
          </div>
        </div>

        <el-tree
          v-else
          :key="treeKey"
          :data="categoryTree"
          :props="treeProps"
          :expand-on-click-node="false"
          :highlight-current="true"
          :default-expand-all="false"
          class="category-tree"
          @node-click="handleNodeClick"
          @expand-change="handleExpandChange"
        >
          <template #default="{ data }">
            <div
              class="tree-node-content"
              :class="{ 'is-selected': selectedCategory?.id === data.id }"
            >
              <div class="node-left">
                <el-icon
                  v-if="data.level === 1"
                  class="level-icon level-1"
                >
                  <Box />
                </el-icon>
                <el-icon
                  v-else-if="data.level === 2"
                  class="level-icon level-2"
                >
                  <Folder />
                </el-icon>
                <el-icon
                  v-else
                  class="level-icon level-3"
                >
                  <FolderOpened />
                </el-icon>
                <span class="node-label">{{ data.label }}</span>
                <span
                  v-if="data.children?.length"
                  class="children-count"
                >{{ data.children.length }}</span>
              </div>
              <div class="node-actions">
                <el-button
                  v-if="data.level === 1"
                  size="mini"
                  title="添加二级分类"
                  class="action-btn add"
                  @click.stop="handleAddLevel2(data)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  v-if="data.level === 2"
                  size="mini"
                  title="添加三级分类"
                  class="action-btn add"
                  @click.stop="handleAddLevel3(data)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  size="mini"
                  title="编辑"
                  class="action-btn edit"
                  @click.stop="handleEdit(data)"
                >
                  <el-icon><EditIcon /></el-icon>
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  title="删除"
                  class="action-btn delete"
                  @click.stop="handleDelete(data)"
                >
                  <el-icon><DeleteIcon /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>

        <div
          v-if="!loading && categoryTree.length === 0"
          class="empty-state"
        >
          <el-icon class="empty-icon">
            <FolderOpened />
          </el-icon>
          <p>暂无分类数据</p>
          <el-button
            type="primary"
            @click="handleAddLevel1"
          >
            创建第一个分类
          </el-button>
        </div>
      </div>

      <!-- 分类详情 -->
      <div
        v-if="selectedCategory"
        class="detail-panel"
      >
        <div class="panel-header">
          <div class="panel-title">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ getLevelName(selectedCategory.level) }} - {{ selectedCategory.label }}</span>
          </div>
          <el-button
            size="small"
            class="close-btn"
            @click="selectedCategory = null"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <el-form
          :model="selectedCategory"
          label-width="100px"
          class="detail-form"
        >
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="分类ID">
                <el-input
                  :value="selectedCategory.id"
                  disabled
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分类编码">
                <el-input
                  :value="selectedCategory.key || '-'"
                  disabled
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="分类名称">
            <el-input
              :value="selectedCategory.label"
              disabled
              class="readonly-input"
            />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              :value="selectedCategory.description || '-'"
              disabled
              class="readonly-textarea"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="层级">
                <el-input
                  :value="getLevelName(selectedCategory.level)"
                  disabled
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-tag :type="selectedCategory.status === 'active' ? 'success' : 'warning'">
                  {{ selectedCategory.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input
                  :value="formatDate(selectedCategory.createdAt)"
                  disabled
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <el-input
                  :value="formatDate(selectedCategory.updatedAt)"
                  disabled
                  class="readonly-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item
            v-if="selectedCategory.parentKey"
            label="父分类"
          >
            <el-input
              :value="getParentLabel(selectedCategory.parentKey)"
              disabled
              class="readonly-input"
            />
          </el-form-item>
        </el-form>

        <div class="detail-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(selectedCategory)"
          >
            <el-icon><EditIcon /></el-icon> 编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(selectedCategory)"
          >
            <el-icon><DeleteIcon /></el-icon> 删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
    >
      <div
        v-if="loading"
        class="dialog-loading"
      >
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <template v-else>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="validationRules"
          label-width="120px"
          class="dialog-form"
        >
          <el-form-item
            label="分类名称"
            prop="label"
          >
            <el-input
              v-model="formData.label"
              placeholder="请输入分类名称（1-50个字符）"
              class="form-input"
              :maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="描述（可选）">
            <el-input
              v-model="formData.description"
              type="textarea"
              rows="3"
              placeholder="请输入分类描述"
              class="form-textarea"
              :maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="排序顺序（可选）">
            <el-input-number
              v-model="formData.sortOrder"
              :min="0"
              :max="9999"
              placeholder="排序顺序"
              class="form-input"
            />
          </el-form-item>
          <el-form-item
            v-if="!isEdit && parentCategory"
            label="父分类"
          >
            <el-input
              :value="parentCategory.label"
              disabled
              class="readonly-input"
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!formData.label"
            @click="handleSave"
          >
            {{ isEdit ? '保存修改' : '确认创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 错误提示弹窗 -->
    <el-dialog
      v-model="errorDialogVisible"
      title="操作失败"
      width="400px"
    >
      <div class="error-content">
        <el-icon class="error-icon">
          <WarningFilled />
        </el-icon>
        <p>{{ errorMessage }}</p>
      </div>
      <template #footer>
        <el-button @click="errorDialogVisible = false">
          确定
        </el-button>
        <el-button
          v-if="retryAction"
          type="primary"
          :loading="retrying"
          @click="handleRetry"
        >
          重试
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted, watch } from 'vue';
import { Plus, Edit as EditIcon, Delete as DeleteIcon, Refresh, Close, FolderOpened, Folder, Box, InfoFilled, WarningFilled, Loading } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../../api/index';
const CACHE_KEY = 'product_category_tree';
const CACHE_EXPIRY = 3600000;
const categoryTree = ref([]);
const selectedCategory = ref(null);
const dialogVisible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const saving = ref(false);
const retrying = ref(false);
const formRef = ref(null);
const currentCategory = ref(null);
const parentCategory = ref(null);
const treeKey = ref(0);
const isRefreshing = ref(false);
const stats = ref(null);
const errorDialogVisible = ref(false);
const errorMessage = ref('');
const retryAction = ref(null);
const formData = reactive({
 label: '',
 description: '',
 sortOrder: 0
});
const validationRules = {
 label: [
 { required: true, message: '请输入分类名称', trigger: 'blur' },
 { min: 1, max: 50, message: '分类名称长度应在1-50个字符之间', trigger: 'blur' },
 { pattern: /^[^\s]+$/, message: '分类名称不能包含空格', trigger: 'blur' }
 ]
};
const treeProps = {
 children: 'children',
 label: 'label',
 value: 'id'
};
const dialogTitle = computed(() => {
 if (isEdit.value)
 return `编辑${getLevelName(currentCategory.value?.level || 1)}`;
 if (!parentCategory.value)
 return '新增一级分类';
 if (parentCategory.value.level === 1)
 return `新增二级分类（父分类：${parentCategory.value.label}）`;
 if (parentCategory.value.level === 2)
 return `新增三级分类（父分类：${parentCategory.value.label}）`;
 return '新增分类';
});
const getLevelName = (level) => {
 const names = ['', '一级分类', '二级分类', '三级分类'];
 return names[level] || '未知层级';
};
const formatDate = (dateStr) => {
 if (!dateStr)
 return '-';
 const date = new Date(dateStr);
 if (isNaN(date.getTime()))
 return '-';
 return date.toLocaleString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit'
 });
};
const getParentLabel = (parentKey) => {
 const findParent = (nodes) => {
 for (const node of nodes) {
 if (node.key === parentKey)
 return node.label;
 if (node.children) {
 const found = findParent(node.children);
 if (found)
 return found;
 }
 }
 return '未知';
 };
 return findParent(categoryTree.value) || '未知';
};
const getCachedTree = () => {
 try {
 const cached = localStorage.getItem(CACHE_KEY);
 if (cached) {
 const data = JSON.parse(cached);
 if (data.expiry && data.expiry > Date.now()) {
 console.log('使用本地缓存的分类树');
 return data.tree;
 }
 }
 }
 catch (e) {
 console.error('读取缓存失败:', e);
 }
 return null;
};
const setCachedTree = (tree) => {
 try {
 localStorage.setItem(CACHE_KEY, JSON.stringify({
 tree,
 expiry: Date.now() + CACHE_EXPIRY
 }));
 }
 catch (e) {
 console.error('写入缓存失败:', e);
 }
};
const clearLocalCache = () => {
 localStorage.removeItem(CACHE_KEY);
 ElMessage.success('缓存已清除');
};
const loadCategoryTree = async (forceRefresh = false) => {
 loading.value = true;
 try {
 const cachedTree = !forceRefresh ? getCachedTree() : null;
 if (cachedTree && !forceRefresh) {
 console.log('[加载] 使用localStorage缓存');
 categoryTree.value = cachedTree;
 treeKey.value++;
 await loadStats();
 return;
 }
 console.log('[加载] 从服务器获取数据，forceRefresh:', forceRefresh);
 const url = forceRefresh ? `/products/categories/tree?refresh=true&_=${Date.now()}` : '/products/categories/tree';
 const response = await api.get(url);
 if (response.success && response.data) {
 categoryTree.value = JSON.parse(JSON.stringify(response.data));
 treeKey.value++;
 if (!forceRefresh) {
 setCachedTree(categoryTree.value);
 }
 console.log('[加载] 成功加载分类树，一级分类数:', categoryTree.value.length);
 }
 else {
 console.error('加载分类树失败:', response);
 }
 await loadStats();
 }
 catch (error) {
 console.error('加载分类树异常:', error);
 const cachedTree = getCachedTree();
 if (cachedTree) {
 ElMessage.warning('网络异常，显示缓存数据');
 categoryTree.value = cachedTree;
 treeKey.value++;
 }
 else {
 showError('加载分类树失败，请检查网络连接后重试', () => loadCategoryTree());
 }
 }
 finally {
 loading.value = false;
 }
};
const loadStats = async () => {
 try {
 const response = await api.get('/products/categories/stats');
 if (response.success && response.data) {
 stats.value = response.data;
 }
 }
 catch (error) {
 console.error('加载统计数据失败:', error);
 }
};
const refreshTree = () => {
 isRefreshing.value = true;
 setTimeout(() => {
 loadCategoryTree(true);
 setTimeout(() => {
 isRefreshing.value = false;
 }, 300);
 }, 100);
};
const handleNodeClick = (data) => {
 selectedCategory.value = { ...data };
};
const handleExpandChange = (data, expanded) => {
 console.log('节点展开/折叠:', data.label, expanded);
};
const handleAddLevel1 = () => {
 isEdit.value = false;
 currentCategory.value = null;
 parentCategory.value = null;
 resetForm();
 dialogVisible.value = true;
};
const handleAddLevel2 = (parent) => {
 isEdit.value = false;
 currentCategory.value = null;
 parentCategory.value = { ...parent };
 resetForm();
 dialogVisible.value = true;
};
const handleAddLevel3 = (parent) => {
 isEdit.value = false;
 currentCategory.value = null;
 parentCategory.value = { ...parent };
 resetForm();
 dialogVisible.value = true;
};
const handleEdit = (data) => {
 isEdit.value = true;
 currentCategory.value = { ...data };
 parentCategory.value = null;
 formData.label = data.label;
 formData.description = data.description || '';
 formData.sortOrder = data.sortOrder || 0;
 dialogVisible.value = true;
};
const handleDelete = async (data) => {
 try {
 await ElMessageBox.confirm(`确定要删除「${data.label}」吗？此操作不可恢复。`, '删除确认', {
 confirmButtonText: '确定删除',
 cancelButtonText: '取消',
 type: 'danger',
 confirmButtonClass: 'el-button--danger'
 });
 loading.value = true;
 console.log(`[删除] 准备删除分类: level=${data.level}, key=${data.key}, id=${data.id}`);
 const response = await api.delete(`/products/categories/level${data.level}/${data.key}`);
 console.log(`[删除] API响应:`, response);
 if (response.success) {
 ElMessage.success('删除成功');
 removeCategoryFromTree(data.level, data.id);
 selectedCategory.value = null;
 localStorage.removeItem(CACHE_KEY);
 console.log(`[删除] 已清除localStorage缓存`);
 await loadCategoryTree(true);
 console.log(`[删除] 已重新加载分类树`);
 }
 else {
 const errorMsg = response.error || response.data || '删除失败';
 ElMessage.error(errorMsg);
 }
 }
 catch (error) {
 if (error !== 'cancel') {
 console.error('删除失败:', error);
 if (error.response && error.response.status === 404) {
 ElMessage.warning('该分类已不存在，正在刷新列表');
 removeCategoryFromTree(data.level, data.id);
 selectedCategory.value = null;
 localStorage.removeItem(CACHE_KEY);
 await loadCategoryTree(true);
 }
 else {
 showError('删除失败，请稍后重试', () => handleDelete(data));
 }
 }
 }
 finally {
 loading.value = false;
 }
};
const removeCategoryFromTree = (level, id) => {
 if (level === 1) {
 categoryTree.value = categoryTree.value.filter(cat => cat.id !== id);
 }
 else if (level === 2) {
 categoryTree.value = categoryTree.value.map(level1 => ({
 ...level1,
 children: level1.children ? level1.children.filter(cat => cat.id !== id) : []
 }));
 }
 else if (level === 3) {
 categoryTree.value = categoryTree.value.map(level1 => ({
 ...level1,
 children: level1.children ? level1.children.map(level2 => ({
 ...level2,
 children: level2.children ? level2.children.filter(cat => cat.id !== id) : []
 })) : []
 }));
 }
 treeKey.value++;
 loadStats();
};
const resetForm = () => {
 formData.label = '';
 formData.description = '';
 formData.sortOrder = 0;
 if (formRef.value) {
 formRef.value.resetFields();
 }
};
const closeDialog = () => {
 dialogVisible.value = false;
 resetForm();
};
const handleDialogClose = () => {
 closeDialog();
};
const handleSave = async () => {
 if (!formRef.value)
 return;
 try {
 const valid = await formRef.value.validate();
 if (!valid)
 return;
 saving.value = true;
 let response = null;
 if (isEdit.value) {
 response = await api.put(`/products/categories/level${currentCategory.value.level}/${currentCategory.value.key}`, {
 label: formData.label,
 description: formData.description,
 sortOrder: formData.sortOrder
 });
 }
 else {
 if (!parentCategory.value) {
 response = await api.post('/products/categories/level1', {
 label: formData.label,
 description: formData.description,
 sortOrder: formData.sortOrder
 });
 }
 else if (parentCategory.value.level === 1) {
 response = await api.post(`/products/categories/level2/${parentCategory.value.key}`, {
 label: formData.label,
 description: formData.description,
 sortOrder: formData.sortOrder
 });
 }
 else {
 response = await api.post(`/products/categories/level3/${parentCategory.value.key}`, {
 label: formData.label,
 description: formData.description,
 sortOrder: formData.sortOrder
 });
 }
 }
 if (response && response.success) {
 ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
 closeDialog();
 loadCategoryTree(true);
 }
 else {
 const msg = response?.error || (isEdit.value ? '更新失败' : '创建失败');
 showError(msg, () => handleSave());
 }
 }
 catch (error) {
 console.error('保存失败:', error);
 const msg = error.response?.data?.error || '保存失败';
 showError(msg, () => handleSave());
 }
 finally {
 saving.value = false;
 }
};
const showError = (message, retry) => {
 errorMessage.value = message;
 retryAction.value = retry;
 errorDialogVisible.value = true;
};
const handleRetry = () => {
 if (retryAction.value) {
 retrying.value = true;
 errorDialogVisible.value = false;
 setTimeout(() => {
 retryAction.value();
 retrying.value = false;
 }, 300);
 }
};
watch(selectedCategory, (newVal) => {
 console.log('选中分类:', newVal?.label);
});
onMounted(() => {
 const urlParams = new URLSearchParams(window.location.search);
 const forceRefresh = urlParams.get('refresh') === 'true';
 loadCategoryTree(forceRefresh);
});
</script>

<style scoped>
.product-category-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.header-left .subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-bar {
  display: flex;
  align-items: center;
  background: #f9fafb;
  padding: 8px 20px;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

.add-btn {
  padding: 10px 20px;
  font-weight: 500;
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 180px);
}

.category-tree-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-panel {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f5;
  background: #fafbfc;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
}

.tree-icon {
  color: #3b82f6;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn, .cache-btn {
  padding: 6px 12px;
}

.refresh-btn .rotate {
  animation: rotate 0.5s linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.skeleton-container {
  padding: 20px;
}

.skeleton-item {
  margin-bottom: 12px;
}

.skeleton-line {
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.category-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.category-tree :deep(.el-tree) {
  padding-left: 0;
}

.category-tree :deep(.el-tree-node) {
  position: relative;
  white-space: nowrap;
}

.category-tree :deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.category-tree :deep(.el-tree-node__content):hover {
  background-color: #f3f4f6;
}

.category-tree :deep(.el-tree-node__content.is-current) {
  background-color: #dbeafe;
}

.category-tree :deep(.el-tree-node__children) {
  padding-left: 16px;
}

.category-tree :deep(.el-tree-node__expand-icon) {
  font-size: 16px;
  margin-right: 8px;
  color: #9ca3af;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 8px;
}

.tree-node-content.is-selected {
  background-color: #dbeafe;
  border-radius: 6px;
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.level-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.level-icon.level-1 {
  color: #3b82f6;
}

.level-icon.level-2 {
  color: #10b981;
}

.level-icon.level-3 {
  color: #f59e0b;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #374151;
}

.children-count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.category-tree :deep(.el-tree-node):hover .node-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn.add:hover {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.edit:hover {
  background: #dbeafe;
  color: #3b82f6;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  padding: 60px 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #d1d5db;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 14px;
}

.detail-form {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.detail-actions {
  padding: 16px 20px;
  border-top: 1px solid #f0f1f5;
  display: flex;
  gap: 12px;
}

.readonly-input, .readonly-textarea {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.readonly-textarea {
  resize: none;
}

.dialog-form {
  padding: 16px 0;
}

.form-input, .form-textarea {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
}

.error-content p {
  text-align: center;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }
  
  .detail-panel {
    width: 100%;
    min-height: 300px;
  }
  
  .stats-bar {
    display: none;
  }
}

@media (max-width: 768px) {
  .product-category-management {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .panel-header {
    padding: 12px 16px;
  }
  
  .panel-title span {
    font-size: 14px;
  }
  
  .tree-node-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .node-actions {
    opacity: 1;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
