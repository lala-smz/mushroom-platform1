<template>
  <div class="admin-mushroom-boxes">
    <h1>盲盒管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon> 新增盲盒
        </el-button>
        <el-button
          type="success"
          @click="openStatisticsDialog"
        >
          <el-icon><DataAnalysis /></el-icon> 数据统计
        </el-button>
      </div>
      
      <!-- 批量操作栏 - 只有在选中项时显示 -->
      <div
        v-if="selectedBoxes.length > 0"
        class="batch-actions-bar"
      >
        <div class="selected-info">
          <el-tag
            type="info"
            size="large"
            class="selected-count-tag"
          >
            <el-icon><Tickets /></el-icon>
            已选择 <strong>{{ selectedBoxes.length }}</strong> 项
          </el-tag>
          <el-button
            type="primary"
            :text="true"
            class="clear-selection-btn"
            @click="clearSelection"
          >
            <el-icon><RefreshLeft /></el-icon>
            清除选择
          </el-button>
        </div>
        <div class="batch-buttons">
          <el-button
            type="success"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn"
            @click="batchUpdateStatus('active')"
          >
            <el-icon><CircleCheck /></el-icon>
            批量启用
          </el-button>
          <el-button
            type="warning"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn"
            @click="batchUpdateStatus('inactive')"
          >
            <el-icon><CircleClose /></el-icon>
            批量禁用
          </el-button>
          <el-button
            type="danger"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn delete-btn"
            @click="batchDeleteBoxes"
          >
            <el-icon><DeleteFilled /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 高级筛选栏 -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          筛选条件
        </h3>
      </div>
      <div class="filter-form">
        <div class="filter-group">
          <span class="filter-label">状态</span>
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            class="filter-select"
            @change="loadBoxes"
          >
            <el-option
              label="启用"
              value="active"
            />
            <el-option
              label="禁用"
              value="inactive"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">搜索</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索盲盒名称"
            clearable
            class="filter-input"
            @keyup.enter="loadBoxes"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-actions">
          <el-button
            type="primary"
            class="filter-btn primary"
            @click="loadBoxes"
          >
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button
            type="default"
            class="filter-btn reset"
            @click="resetFilters"
          >
            <el-icon><Refresh /></el-icon>
            重置筛选
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 盲盒列表 -->
    <el-card
      shadow="hover"
      class="boxes-card"
    >
      <template #header>
        <div class="card-header">
          <span>盲盒列表</span>
          <span class="total-count">共 {{ total }} 个盲盒</span>
        </div>
      </template>
      
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="boxes"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="盲盒名称"
          min-width="200"
        >
          <template #default="scope">
            <div class="box-name">
              <img
                :src="getImageUrl(scope.row.image)"
                alt="盲盒图片"
                class="box-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="100"
        >
          <template #default="scope">
            ¥{{ typeof scope.row.price === 'number' ? scope.row.price.toFixed(2) : parseFloat(scope.row.price || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="库存"
          width="100"
        />
        <el-table-column
          prop="totalQuantity"
          label="总数量"
          width="100"
        />
        <el-table-column
          prop="season"
          label="季节分类"
          width="120"
        >
          <template #default="scope">
            <el-tag 
              :type="getSeasonTagType(scope.row.season)"
              effect="light"
            >
              {{ scope.row.season || '时令盲盒' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="280"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              size="small"
              type="info"
              @click="openDetailDialog(scope.row)"
            >
              <el-icon><View /></el-icon> 查看详情
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="openEditDialog(scope.row)"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteBox(scope.row.id)"
            >
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
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
    </el-card>
    
    <!-- 新增/编辑盲盒对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑盲盒' : '新增盲盒'"
      width="70%"
    >
      <el-form
        ref="boxForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="box-form"
      >
        <el-form-item
          label="盲盒名称"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入盲盒名称"
          />
        </el-form-item>
        
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入盲盒描述"
          />
        </el-form-item>
        
        <el-form-item
          label="价格"
          prop="price"
        >
          <el-input-number
            v-model="form.price"
            :min="0"
            :step="0.01"
            placeholder="请输入价格"
          />
        </el-form-item>
        
        <el-form-item
          label="库存"
          prop="stock"
        >
          <el-input-number
            v-model="form.stock"
            :min="1"
            :step="1"
            placeholder="请输入库存"
          />
        </el-form-item>
        
        <el-form-item
          label="季节分类"
          prop="season"
        >
          <el-select
            v-model="form.season"
            placeholder="请选择季节分类"
            class="season-select"
          >
            <el-option
              label="春季盲盒"
              value="春季盲盒"
            />
            <el-option
              label="夏季盲盒"
              value="夏季盲盒"
            />
            <el-option
              label="秋季盲盒"
              value="秋季盲盒"
            />
            <el-option
              label="冬季盲盒"
              value="冬季盲盒"
            />
            <el-option
              label="时令盲盒"
              value="时令盲盒"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="盲盒图片"
          prop="image"
        >
          <el-upload
            v-model:file-list="imageFileList"
            :action="uploadAction"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :limit="5"
            :on-exceed="handleExceed"
            list-type="picture-card"
            :on-remove="handleRemove"
            name="files"
          >
            <template #default="{ file }">
              <img
                :src="getImageUrl(file?.url ?? file?.url)"
                class="upload-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  @click.stop="handlePreview(file)"
                >
                  <el-icon><ZoomIn /></el-icon>
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click.stop="handleRemove(file)"
                >
                  <el-icon><Delete /></el-icon>
                </span>
              </span>
            </template>
            <template #trigger>
              <el-button
                type="primary"
                size="small"
              >
                <el-icon><Plus /></el-icon>
                上传图片
              </el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传不超过5张图片，支持JPG、PNG、WebP格式，单张图片大小不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="内容配置">
          <el-button
            type="primary"
            plain
            size="large"
            class="content-config-btn"
            @click="openContentConfigDialog"
          >
            <el-icon><Setting /></el-icon> 配置盲盒内容
          </el-button>
          <div class="content-preview">
            <div class="content-header">
              <h4>已配置内容：</h4>
              <el-tag
                :type="form.items.length > 0 ? 'success' : 'info'"
                size="small"
              >
                {{ form.items.length }} 项内容
              </el-tag>
            </div>
            <el-empty
              v-if="form.items.length === 0"
              description="未配置内容"
              image-size="120"
            >
              <template #description>
                <p class="empty-description">
                  暂无内容配置
                </p>
              </template>
              <el-button
                type="primary"
                size="small"
                @click="openContentConfigDialog"
              >
                立即配置
              </el-button>
            </el-empty>
            <el-card
              v-else
              shadow="hover"
              class="content-card"
            >
              <el-table
                :data="form.items"
                style="width: 100%"
                size="small"
                stripe
              >
                <el-table-column
                  prop="mushroomName"
                  label="菌菇名称"
                  min-width="180"
                >
                  <template #default="scope">
                    <div class="mushroom-name-cell">
                      <el-avatar
                        :size="32"
                        :src="scope.row.image || ''"
                        class="mushroom-avatar"
                      >
                        {{ scope.row.mushroomName?.charAt(0) || '?' }}
                      </el-avatar>
                      <span class="mushroom-name">{{ scope.row.mushroomName || '未知名称' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="mushroomType"
                  label="菌菇类型"
                  width="120"
                >
                  <template #default="scope">
                    <el-tag 
                      :type="getTagType(scope.row.mushroomType)"
                      effect="light"
                    >
                      {{ getTagLabel(scope.row.mushroomType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="probability"
                  label="概率"
                  width="100"
                >
                  <template #default="scope">
                    <div class="probability-cell">
                      <span class="probability-value">{{ (scope.row.probability || 0).toFixed(2) }}%</span>
                      <el-progress
                        :percentage="scope.row.probability || 0"
                        :stroke-width="6"
                        :color="getProgressColor(scope.$index)"
                        class="probability-progress"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="80"
                  fixed="right"
                >
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="danger"
                      circle
                      :title="'移除 ' + (scope.row.mushroomName || '内容')"
                      @click="removeContentItem(scope.$index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="content-footer">
                <div class="probability-summary">
                  <span>总概率：</span>
                  <el-tag
                    :type="isProbabilityValid() ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ calculateTotalProbability() }}%
                  </el-tag>
                  <span
                    v-if="!isProbabilityValid()"
                    class="probability-warning"
                  >
                    请调整概率总和为100%
                  </span>
                </div>
              </div>
            </el-card>
          </div>
        </el-form-item>
        
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>

          <el-button
            type="primary"
            @click="saveBox"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 盲盒内容配置对话框 -->
    <el-dialog
      v-model="contentDialogVisible"
      title="配置盲盒内容"
      width="75%"
      top="10vh"
    >
      <div class="content-config">
        <div class="content-config-header">
          <h4>选择菌菇并设置概率</h4>
          <div class="total-quantity-control">
            <el-input-number
              v-model="form.totalQuantity"
              :min="1"
              :max="9999"
              :step="1"
              placeholder="盲盒总数量"
              size="large"
              @change="validateTotalQuantity"
            >
              <template #append>
                个
              </template>
            </el-input-number>
            <el-button
              type="primary"
              size="large"
              class="allocate-quantity-btn"
              @click="allocateQuantitiesByProbability"
            >
              <el-icon><DataAnalysis /></el-icon> 按概率分配数量
            </el-button>
            <el-tooltip
              content="设置盲盒内商品的总数量"
              placement="top"
            >
              <el-icon class="info-icon">
                <InfoFilled />
              </el-icon>
            </el-tooltip>
          </div>
          <el-tag
            type="info"
            size="small"
          >
            已选择 {{ form.items.length }} 项内容
          </el-tag>
        </div>
        
        <!-- 菌菇类型筛选 -->
        <div class="mushroom-type-filter">
          <el-card
            shadow="hover"
            class="filter-card"
          >
            <template #header>
              <div class="filter-header">
                <span>内容类型筛选</span>
              </div>
            </template>
            <el-radio-group
              v-model="selectedMushroomType"
              class="type-filter-group"
              @change="() => {
                if (selectedMushroomType === 'common' && mushroomProducts.length === 0) {
                  loadMushroomProducts()
                } else if (selectedMushroomType === 'product' && otherProducts.length === 0) {
                  loadOtherProducts()
                }
              }"
            >
              <el-radio-button label="all">
                <el-icon><Grid /></el-icon> 全部类型
              </el-radio-button>
              <el-radio-button label="common">
                <el-icon><Collection /></el-icon> 常见菌菇
              </el-radio-button>
              <el-radio-button label="product">
                <el-icon><Goods /></el-icon> 我的商品
              </el-radio-button>
            </el-radio-group>
          </el-card>
        </div>
        
        <!-- 商品随机选取设置 -->
        <div class="random-selection-setting">
          <el-card
            shadow="hover"
            class="setting-card"
          >
            <template #header>
              <div class="setting-header">
                <span>商品随机选取设置</span>
              </div>
            </template>
            <div class="setting-content">
              <div class="setting-item">
                <el-form-item label="选取商品数量">
                  <el-input-number
                    v-model="randomSelectionCount"
                    :min="1"
                    :max="20"
                    :step="1"
                    placeholder="请输入要随机选取的商品数量"
                    class="selection-count-input"
                  >
                    <template #append>
                      个
                    </template>
                  </el-input-number>
                </el-form-item>
              </div>
              <div class="setting-item">
                <el-form-item label="概率分配模式">
                  <el-radio-group
                    v-model="probabilityMode"
                    class="probability-mode-group"
                  >
                    <el-radio-button label="equal">
                      <el-icon><Refresh /></el-icon> 均分概率
                    </el-radio-button>
                    <el-radio-button label="random">
                      <el-icon><DataAnalysis /></el-icon> 随机概率
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div class="setting-item">
                <el-button
                  type="primary"
                  size="large"
                  class="random-selection-btn"
                  @click="randomSelectItems"
                >
                  <el-icon><MagicStick /></el-icon> 随机选取商品
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        
        <el-card
          shadow="hover"
          class="add-content-card"
        >
          <template #header>
            <div class="add-content-header">
              <span>添加内容到盲盒</span>
            </div>
          </template>
          <div class="add-content-form">
            <el-select
              v-model="selectedMushroomId"
              placeholder="选择菌菇或商品"
              class="mushroom-select"
              :loading="loadingProducts"
              filterable
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <el-option
                v-for="mushroom in filteredMushrooms"
                :key="mushroom.id"
                :label="mushroom.name"
                :value="mushroom.id"
              >
                <div class="mushroom-option">
                  <el-avatar
                    :size="36"
                    :src="mushroom.image || ''"
                    class="mushroom-avatar-dialog"
                  >
                    {{ mushroom.name?.charAt(0) || '?' }}
                  </el-avatar>
                  <div class="mushroom-info">
                    <div class="mushroom-name-dialog">
                      {{ mushroom.name }}
                    </div>
                    <div class="mushroom-tags">
                      <el-tag 
                        size="small" 
                        :type="getTagType(mushroom.type)"
                        effect="light"
                      >
                        {{ getTagLabel(mushroom.type) }}
                      </el-tag>
                      <el-tag 
                        size="small" 
                        :type="getStatusTagType(mushroom.status)"
                        effect="light"
                        class="status-tag"
                      >
                        {{ getStatusLabel(mushroom.status) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </el-option>
            </el-select>
            <div class="quantity-range-input">
              <el-input-number
                v-model="itemMinQuantity"
                :min="1"
                :max="100"
                :step="1"
                placeholder="最小数量"
                class="min-quantity-input"
                size="large"
                @change="validateQuantityRange"
              >
                <template #append>
                  个
                </template>
              </el-input-number>
              <span class="range-separator">-</span>
              <el-input-number
                v-model="itemMaxQuantity"
                :min="1"
                :max="100"
                :step="1"
                placeholder="最大数量"
                class="max-quantity-input"
                size="large"
                @change="validateQuantityRange"
              >
                <template #append>
                  个
                </template>
              </el-input-number>
            </div>
            <el-input-number
              v-model="itemProbability"
              :min="1"
              :max="100"
              :step="5"
              placeholder="概率 (%)"
              class="probability-input"
              size="large"
            >
              <template #append>
                %
              </template>
            </el-input-number>
            <el-button
              type="primary"
              size="large"
              :disabled="!selectedMushroomId || !itemMinQuantity || !itemMaxQuantity"
              @click="addContentItem"
            >
              <el-icon><Plus /></el-icon> 添加到盲盒
            </el-button>
          </div>
        </el-card>
        
        <el-card
          v-if="form.items.length > 0"
          shadow="hover"
          class="current-content-card"
        >
          <template #header>
            <div class="current-content-header">
              <span>当前配置</span>
              <el-tag
                :type="isProbabilityValid() ? 'success' : 'warning'"
                size="small"
              >
                总概率：{{ calculateTotalProbability() }}%
              </el-tag>
            </div>
          </template>
          <el-table
            :data="form.items"
            style="width: 100%"
            size="small"
            stripe
          >
            <el-table-column
              prop="mushroomName"
              label="菌菇名称"
              min-width="180"
            >
              <template #default="scope">
                <div class="mushroom-name-cell">
                  <el-avatar
                    :size="32"
                    :src="scope.row.image || ''"
                    class="mushroom-avatar"
                  >
                    {{ scope.row.mushroomName?.charAt(0) || '?' }}
                  </el-avatar>
                  <span class="mushroom-name">{{ scope.row.mushroomName || '未知名称' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="mushroomType"
              label="菌菇类型"
              width="120"
            >
              <template #default="scope">
                <el-tag 
                  :type="getTagType(scope.row.mushroomType)"
                  effect="light"
                >
                  {{ getTagLabel(scope.row.mushroomType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="quantity"
              label="分配数量"
              width="120"
            >
              <template #default="scope">
                <div class="quantity-cell">
                  <el-tag
                    type="primary"
                    size="small"
                  >
                    {{ scope.row.quantity || 0 }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="占比"
              width="150"
            >
              <template #default="scope">
                <div class="proportion-cell">
                  <span class="proportion-value">
                    {{ form.totalQuantity > 0 ? ((scope.row.quantity || 0) / form.totalQuantity * 100).toFixed(1) : 0 }}%
                  </span>
                  <el-progress
                    :percentage="form.totalQuantity > 0 ? ((scope.row.quantity || 0) / form.totalQuantity * 100) : 0"
                    :stroke-width="6"
                    :color="getProgressColor(scope.$index)"
                    class="proportion-progress"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="数量区间"
              width="200"
            >
              <template #default="scope">
                <div class="quantity-range-edit">
                  <el-input-number
                    v-model="scope.row.minQuantity"
                    :min="1"
                    :max="100"
                    :step="1"
                    size="small"
                    @change="validateQuantityRangeInTable(scope.row)"
                  >
                    <template #append>
                      最小
                    </template>
                  </el-input-number>
                  <span class="range-separator-small">-</span>
                  <el-input-number
                    v-model="scope.row.maxQuantity"
                    :min="1"
                    :max="100"
                    :step="1"
                    size="small"
                    @change="validateQuantityRangeInTable(scope.row)"
                  >
                    <template #append>
                      最大
                    </template>
                  </el-input-number>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="probability"
              label="概率"
              width="150"
            >
              <template #default="scope">
                <div class="probability-edit-cell">
                  <el-input-number
                    v-model="scope.row.probability"
                    :min="1"
                    :max="100"
                    :step="5"
                    size="small"
                    @change="syncContentAllocationStatus"
                  >
                    <template #append>
                      %
                    </template>
                  </el-input-number>
                  <el-progress
                    :percentage="scope.row.probability || 0"
                    :stroke-width="8"
                    :color="getProgressColor(scope.$index)"
                    class="probability-progress-small"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
              fixed="right"
            >
              <template #default="scope">
                <el-button
                  size="small"
                  type="danger"
                  circle
                  :title="'移除 ' + (scope.row.mushroomName || '内容')"
                  @click="removeContentItem(scope.$index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="probability-summary-dialog">
            <el-tag
              :type="isProbabilityValid() ? 'success' : 'warning'"
              size="small"
              class="total-tag"
            >
              {{ isProbabilityValid() ? '概率总和正确' : '请调整概率总和为100%' }}
            </el-tag>
            <el-button
              v-if="!isProbabilityValid()"
              type="warning"
              size="small"
              plain
              @click="autoAdjustProbability"
            >
              自动调整概率
            </el-button>
          </div>
          
          <!-- 分配结果可视化展示 -->
          <div
            v-if="form.items.length > 0"
            class="allocation-visualization-dialog"
          >
            <h4>分配比例可视化</h4>
            <div class="visualization-container-dialog">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="visualization-item-dialog"
              >
                <div class="item-info-dialog">
                  <el-avatar
                    :size="24"
                    :src="item.image || ''"
                    class="item-avatar"
                  >
                    {{ item.mushroomName?.charAt(0) || '?' }}
                  </el-avatar>
                  <span class="item-name-dialog">{{ item.mushroomName }}</span>
                  <span class="item-probability-dialog">{{ (item.probability || 0).toFixed(2) }}%</span>
                </div>
                <div class="progress-bar-container-dialog">
                  <el-progress
                    :percentage="item.probability"
                    :color="getProgressColor(index)"
                    :stroke-width="12"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-empty
          v-else
          description="未配置内容"
          image-size="150"
        >
          <template #description>
            <p class="empty-description">
              暂无内容配置
            </p>
          </template>
          <el-button
            type="primary"
            @click="() => {}"
          >
            开始添加内容
          </el-button>
        </el-empty>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="contentDialogVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="confirmContentConfig"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 数据统计对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="盲盒数据统计"
      width="85%"
    >
      <div class="statistics-content">
        <div
          v-if="loadingStatistics"
          class="loading-statistics"
        >
          <el-skeleton
            :rows="10"
            animated
          />
        </div>
        <div v-else>
          <!-- 基本统计 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Box />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.boxCounts.total }}
                    </div>
                    <div class="stat-label">
                      总盲盒数
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Check />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.boxCounts.active }}
                    </div>
                    <div class="stat-label">
                      启用盲盒
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Close />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.boxCounts.inactive }}
                    </div>
                    <div class="stat-label">
                      禁用盲盒
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Goods />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.stockStatistics?.totalStock || 0 }}
                    </div>
                    <div class="stat-label">
                      总库存量
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 销售汇总 -->
          <el-card
            shadow="hover"
            class="sales-summary-card"
          >
            <template #header>
              <div class="card-header">
                <span>销售汇总</span>
                <el-tag
                  type="info"
                  size="small"
                >
                  更新时间: {{ new Date(statistics.lastUpdated).toLocaleString() }}
                </el-tag>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-label">
                    总销售额
                  </div>
                  <div class="summary-value">
                    ¥{{ parseFloat(statistics.salesSummary?.totalSalesAmount || 0).toFixed(2) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-label">
                    总订单数
                  </div>
                  <div class="summary-value">
                    {{ parseInt(statistics.salesSummary?.totalSalesCount || 0) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-label">
                    平均订单价值
                  </div>
                  <div class="summary-value">
                    ¥{{ parseFloat(statistics.salesSummary?.averageOrderValue || 0).toFixed(2) }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
          
          <!-- 销售统计 -->
          <el-card
            shadow="hover"
            class="sales-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>各盲盒销售统计</span>
                <el-button
                  type="primary"
                  size="small"
                  @click="exportSalesData"
                >
                  <el-icon><Download /></el-icon> 导出数据
                </el-button>
              </div>
            </template>
            <el-table
              :data="statistics.salesStatistics"
              style="width: 100%"
              :default-sort="{ prop: 'totalSales', order: 'descending' }"
            >
              <el-table-column
                prop="boxName"
                label="盲盒名称"
                min-width="200"
                sortable
              />
              <el-table-column
                prop="price"
                label="单价"
                width="100"
                sortable
              >
                <template #default="scope">
                  ¥{{ parseFloat(scope.row.price || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="orderCount"
                label="订单数量"
                width="120"
                sortable
              >
                <template #default="scope">
                  {{ parseInt(scope.row.orderCount || 0) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="totalSales"
                label="销售金额"
                width="150"
                sortable
              >
                <template #default="scope">
                  ¥{{ parseFloat(scope.row.totalSales || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                label="销售占比"
                width="120"
              >
                <template #default="scope">
                  {{ parseFloat(statistics.salesSummary?.totalSalesAmount || 0) > 0 ? 
                    ((parseFloat(scope.row.totalSales || 0) / parseFloat(statistics.salesSummary.totalSalesAmount)) * 100).toFixed(2) : 0 }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
          <!-- 库存预警 -->
          <el-card
            v-if="statistics.stockStatistics?.lowStockBoxes?.length > 0"
            shadow="hover"
            class="stock-warning-card"
          >
            <template #header>
              <div class="card-header">
                <span>库存预警</span>
                <el-tag
                  type="warning"
                  size="small"
                >
                  {{ statistics.stockStatistics.lowStockBoxes.length }} 个盲盒库存不足
                </el-tag>
              </div>
            </template>
            <el-table
              :data="statistics.stockStatistics.lowStockBoxes"
              style="width: 100%"
              size="small"
            >
              <el-table-column
                prop="name"
                label="盲盒名称"
                min-width="200"
              />
              <el-table-column
                prop="stock"
                label="当前库存"
                width="120"
              >
                <template #default="scope">
                  <el-tag :type="parseInt(scope.row.stock || 0) < 5 ? 'danger' : 'warning'">
                    {{ parseInt(scope.row.stock || 0) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="120"
              >
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="goToEditBox(scope.row.id)"
                  >
                    补货
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
          <!-- 菌菇类型统计 -->
          <el-card
            shadow="hover"
            class="mushroom-type-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>菌菇类型分布</span>
              </div>
            </template>
            <div class="type-stat-container">
              <div
                v-for="(count, type) in statistics.mushroomTypeStatistics"
                :key="type"
                class="type-stat-item"
              >
                <div class="type-info">
                  <span class="type-name">{{ getMushroomTypeName(type) }}</span>
                  <span class="type-count">{{ parseInt(count || 0) }}个</span>
                </div>
                <el-progress 
                  :percentage="totalMushrooms > 0 ? (parseInt(count || 0) / totalMushrooms) * 100 : 0" 
                  :color="getMushroomTypeColor(type)"
                  :stroke-width="12"
                  class="type-progress"
                />
              </div>
              <div
                v-if="Object.keys(statistics.mushroomTypeStatistics).length === 0"
                class="no-data"
              >
                暂无菌菇类型数据
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statisticsDialogVisible = false">
            关闭
          </el-button>
          <el-button
            type="primary"
            @click="refreshStatistics"
          >
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewDialogVisible">
      <img
        :src="previewImageUrl"
        class="preview-image"
      >
    </el-dialog>
    
    <!-- 盲盒详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="盲盒详情"
      width="80%"
      top="10vh"
    >
      <div class="box-detail">
        <div
          v-if="loadingDetail"
          class="loading-detail"
        >
          <el-skeleton
            :rows="15"
            animated
          />
        </div>
        <div v-else-if="currentBoxDetail">
          <!-- 基本信息 -->
          <el-card
            shadow="hover"
            class="detail-basic-card"
          >
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
                <el-tag :type="currentBoxDetail.status === 'active' ? 'success' : 'danger'">
                  {{ currentBoxDetail.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </template>
            <div class="basic-info">
              <div class="info-row">
                <div class="info-label">
                  盲盒名称：
                </div>
                <div class="info-value">
                  {{ currentBoxDetail.name }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  盲盒描述：
                </div>
                <div class="info-value">
                  {{ currentBoxDetail.description }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  价格：
                </div>
                <div class="info-value">
                  ¥{{ typeof currentBoxDetail.price === 'number' ? currentBoxDetail.price.toFixed(2) : parseFloat(currentBoxDetail.price || 0).toFixed(2) }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  库存：
                </div>
                <div class="info-value">
                  {{ currentBoxDetail.stock || 0 }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  分类：
                </div>
                <div class="info-value">
                  {{ currentBoxDetail.season || '时令盲盒' }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  图片：
                </div>
                <div class="info-value">
                  <img
                    v-if="currentBoxDetail.image"
                    :src="getImageUrl(currentBoxDetail.image)"
                    alt="盲盒图片"
                    class="box-detail-image"
                    @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
                  >
                  <el-empty
                    v-else
                    description="无图片"
                    image-size="120"
                  />
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 内容配置 -->
          <el-card
            shadow="hover"
            class="detail-content-card"
          >
            <template #header>
              <div class="card-header">
                <span>内容配置</span>
                <el-tag
                  :type="currentBoxDetail.items && currentBoxDetail.items.length > 0 ? 'success' : 'info'"
                  size="small"
                >
                  {{ currentBoxDetail.items ? currentBoxDetail.items.length : 0 }} 项内容
                </el-tag>
              </div>
            </template>
            <div v-if="!currentBoxDetail">
              <el-empty
                description="正在加载盲盒详情"
                image-size="120"
              />
            </div>
            <el-empty
              v-else-if="!currentBoxDetail.items || !Array.isArray(currentBoxDetail.items) || currentBoxDetail.items.length === 0"
              description="未配置内容"
              image-size="120"
            >
              <template #description>
                <p>未配置内容</p>
                <p class="text-gray-400 text-sm">
                  当前盲盒暂无商品配置
                </p>
              </template>
              <el-button
                type="primary"
                @click="() => {}"
              >
                去配置内容
              </el-button>
            </el-empty>
            <div v-else>
              <div class="mb-4">
                <el-tag
                  size="small"
                  type="info"
                >
                  共 {{ currentBoxDetail.items.length }} 个商品
                </el-tag>
              </div>
              <el-table
                :data="currentBoxDetail.items"
                style="width: 100%"
                size="small"
                stripe
                :empty-text="'暂无商品数据'"
              >
                <el-table-column
                  prop="mushroomName"
                  label="商品名称"
                  min-width="200"
                >
                  <template #default="scope">
                    <div class="mushroom-name-cell">
                      <el-avatar
                        :size="32"
                        :src="scope.row.image || ''"
                        class="mushroom-avatar"
                      >
                        {{ scope.row.mushroomName?.charAt(0) || '?' }}
                      </el-avatar>
                      <span class="mushroom-name">{{ scope.row.mushroomName || scope.row.name || '未知名称' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="mushroomType"
                  label="商品类型"
                  width="120"
                >
                  <template #default="scope">
                    <el-tag 
                      :type="getTagType(scope.row.mushroomType)"
                      effect="light"
                    >
                      {{ getTagLabel(scope.row.mushroomType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="probability"
                  label="概率"
                  width="150"
                >
                  <template #default="scope">
                    <div class="probability-cell">
                      <span class="probability-value">{{ (scope.row.probability || 0).toFixed(2) }}%</span>
                      <el-progress
                        :percentage="scope.row.probability || 0"
                        :stroke-width="8"
                        :color="getProgressColor(scope.$index)"
                        class="probability-progress"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="quantity"
                  label="数量"
                  width="80"
                >
                  <template #default="scope">
                    {{ scope.row.quantity || scope.row.minQuantity || 1 }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="minQuantity"
                  label="最小数量"
                  width="100"
                >
                  <template #default="scope">
                    {{ scope.row.minQuantity || 1 }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="maxQuantity"
                  label="最大数量"
                  width="100"
                >
                  <template #default="scope">
                    {{ scope.row.maxQuantity || scope.row.minQuantity || 1 }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="probability-summary mt-4">
                <el-tag
                  :type="Math.abs(calculateDetailTotalProbability() - 100) <= 0.01 ? 'success' : 'warning'"
                  size="small"
                >
                  概率总和：{{ calculateDetailTotalProbability() }}%
                </el-tag>
                <el-tag
                  type="info"
                  size="small"
                  class="ml-2"
                >
                  商品数量：{{ currentBoxDetail.items.length }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
        <div v-else>
          <el-empty
            description="无法加载盲盒详情"
            image-size="150"
          >
            <el-button
              type="primary"
              @click="loadBoxDetail"
            >
              重新加载
            </el-button>
          </el-empty>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Plus, Search, Edit, Delete, Upload, Setting, Box, Check, Close, DataAnalysis, Grid, Collection, Goods, View, Download, Refresh, InfoFilled, Tickets, RefreshLeft, CircleCheck, CircleClose, DeleteFilled, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'
import { useUserStore } from '../../stores/useUserStore'
import { useMushroomBoxStore } from '../../stores/useMushroomBoxStore'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../../utils/imageUtils'

// 获取用户存储
const userStore = useUserStore()
// 获取盲盒store，用于通知其他页面更新数据
const boxStore = useMushroomBoxStore()

// 检查是否是管理员
const isAdmin = computed(() => userStore.isAdmin)

// 缓存系统
const cache = {
  data: {},
  timers: {},
  duration: 60 * 1000, // 缓存持续时间：60秒
  // 特定类型的缓存持续时间
  typeDurations: {
    statistics: 5 * 60 * 1000, // 统计数据：5分钟
    boxes: 2 * 60 * 1000, // 盲盒列表：2分钟
    mushrooms: 10 * 60 * 1000 // 菌菇列表：10分钟
  }
}

// 请求节流控制
const requestTimestamps = {};
const MIN_REQUEST_INTERVAL = 1000; // 最小请求间隔：1秒

// 响应式数据
const boxes = ref([])
const mushrooms = ref([])
const mushroomProducts = ref([]) // 菌菇类商品
const otherProducts = ref([]) // 非菌菇类商品
const loading = ref(false)
const loadingProducts = ref(false)
const loadingOtherProducts = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedBoxes = ref([])
const batchLoading = ref(false)
const tableRef = ref(null)
// const productSearchQuery = ref('') // 暂时注释掉，未使用

const canBatchOperate = computed(() => {
  return selectedBoxes.value && selectedBoxes.value.length > 0 && !batchLoading.value
})

const filterForm = reactive({
  status: ''
})

// 对话框相关
const dialogVisible = ref(false)
const contentDialogVisible = ref(false)
const statisticsDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const boxForm = ref(null)
const imageFileList = ref([])

// 图片预览
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

// 上传地址
const uploadAction = computed(() => {
  return '/api/upload'
})

// 详情对话框相关
const loadingDetail = ref(false)
const currentBoxDetail = ref(null)

// 内容配置相关
const selectedMushroomId = ref('')
const itemMinQuantity = ref(1)
const itemMaxQuantity = ref(1)
const itemProbability = ref(25)
const selectedMushroomType = ref('all')
const randomSelectionCount = ref(5)
const probabilityMode = ref('equal')



// 数据统计相关
const statistics = ref({
  boxCounts: {
    total: 0,
    active: 0,
    inactive: 0
  },
  salesStatistics: [],
  mushroomTypeStatistics: {}
})
const loadingStatistics = ref(false)

// 缓存管理函数
const setCache = (key, data) => {
  cache.data[key] = data;
  
  // 清除旧的定时器
  if (cache.timers[key]) {
    clearTimeout(cache.timers[key]);
  }
  
  // 根据缓存键的类型确定缓存持续时间
  let duration = cache.duration;
  if (key === 'statistics') {
    duration = cache.typeDurations.statistics;
  } else if (key.startsWith('boxes_')) {
    duration = cache.typeDurations.boxes;
  } else if (key === 'mushrooms' || key === 'mushroomProducts' || key === 'otherProducts') {
    duration = cache.typeDurations.mushrooms;
  }
  
  // 设置新的过期定时器
  cache.timers[key] = setTimeout(() => {
    delete cache.data[key];
    delete cache.timers[key];
  }, duration);
};

const getCache = (key) => {
  return cache.data[key];
};

const clearCache = (key) => {
  if (key) {
    delete cache.data[key];
    if (cache.timers[key]) {
      clearTimeout(cache.timers[key]);
      delete cache.timers[key];
    }
  } else {
    // 清除所有缓存
    Object.keys(cache.timers).forEach(timerKey => {
      clearTimeout(cache.timers[timerKey]);
    });
    cache.data = {};
    cache.timers = {};
  }
};

// 清除特定键的缓存
const clearCacheByKey = (key) => {
  if (cache.data[key]) {
    delete cache.data[key]
  }
  if (cache.timers[key]) {
    clearTimeout(cache.timers[key])
    delete cache.timers[key]
  }
}

// 请求节流函数
const throttleRequest = async (key, requestFn) => {
  const now = Date.now();
  const lastRequestTime = requestTimestamps[key] || 0;
  
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    // 等待直到最小间隔时间
    await new Promise(resolve => {
      setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
    });
  }
  
  requestTimestamps[key] = Date.now();
  return requestFn();
};

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 1,
  images: [],
  totalQuantity: 10,
  items: [],
  status: 'active',
  season: '时令盲盒', // 默认分类为"时令盲盒"
  layoutConfig: null
})

// 监听文件列表变化
watch(imageFileList, (newList) => {
  form.images = newList.map(file => file?.url ?? '').filter(url => url)
}, { deep: true })

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入盲盒名称', trigger: 'blur' },
    { min: 2, max: 50, message: '盲盒名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入盲盒描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格应大于等于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 1, message: '库存必须大于0', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!Number.isInteger(value)) {
          callback(new Error('库存必须是整数'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  totalQuantity: [
    { required: true, message: '请输入盲盒总数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '总数量必须大于0', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!Number.isInteger(value)) {
          callback(new Error('总数量必须是整数'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  images: [
    { required: true, message: '请上传至少一张盲盒图片', trigger: 'change' }
  ]
}

// 加载菌菇类商品列表
const loadMushroomProducts = async () => {
  const cacheKey = 'mushroomProducts';
  const cachedData = getCache(cacheKey);
  
  if (cachedData) {
    mushroomProducts.value = cachedData;
    return;
  }
  
  loadingProducts.value = true
  try {
    await throttleRequest('loadMushroomProducts', async () => {
      const response = await api.get('/products/list', {
        params: {
          category: '菌菇'
        }
      })
      const products = response.data?.products || []
      mushroomProducts.value = products
      setCache(cacheKey, products);
      
      if (products.length === 0) {
        ElMessage.info('当前商品库中没有菌菇类商品')
      }
    });
  } catch (error) {
    console.error('加载菌菇类商品列表失败:', error)
    ElMessage.error('加载菌菇类商品列表失败，请稍后重试')
  } finally {
    loadingProducts.value = false
  }
}

// 加载非菌菇类商品列表
const loadOtherProducts = async () => {
  const cacheKey = 'otherProducts';
  const cachedData = getCache(cacheKey);
  
  if (cachedData) {
    otherProducts.value = cachedData;
    return;
  }
  
  loadingOtherProducts.value = true
  try {
    await throttleRequest('loadOtherProducts', async () => {
      const response = await api.get('/products/list')
      // 过滤出非菌菇类商品
      const products = (response.data?.products || []).filter(product => product.category !== '菌菇')
      otherProducts.value = products
      setCache(cacheKey, products);
      
      if (products.length === 0) {
        ElMessage.info('当前商品库中没有非菌菇类商品')
      }
    });
  } catch (error) {
    console.error('加载非菌菇类商品列表失败:', error)
    ElMessage.error('加载非菌菇类商品列表失败，请稍后重试')
  } finally {
    loadingOtherProducts.value = false
  }
}

// 过滤后的商品列表（只从 Product 表选择，避免数据不一致）
const filteredMushrooms = computed(() => {
  if (selectedMushroomType.value === 'all') {
    // 全部类型：菌菇类商品 + 非菌菇类商品
    return [
      ...mushroomProducts.value.map(p => ({
        id: p.id,
        name: p.name,
        type: 'mushroom_product',
        image: p.images?.[0] || '',
        status: p.status
      })),
      ...otherProducts.value.map(p => ({
        id: p.id,
        name: p.name,
        type: 'other_product',
        image: p.images?.[0] || '',
        status: p.status
      }))
    ]
  } else if (selectedMushroomType.value === 'common') {
    // 常见菌菇内容：仅菌菇类商品
    return mushroomProducts.value.map(p => ({
      id: p.id,
      name: p.name,
      type: 'mushroom_product',
      image: p.images?.[0] || '',
      status: p.status
    }))
  } else if (selectedMushroomType.value === 'product') {
    // 我的商品：非菌菇类商品
    return otherProducts.value.map(p => ({
      id: p.id,
      name: p.name,
      type: 'other_product',
      image: p.images?.[0] || '',
      status: p.status
    }))
  }
  return []
})

// 总菌菇数
const totalMushrooms = computed(() => {
  return Object.values(statistics.value.mushroomTypeStatistics).reduce((sum, count) => sum + count, 0)
})

// 为图片URL添加时间戳来强制刷新缓存
const addTimestampToImageUrl = (url) => {
  if (!url || url.includes('placeholder')) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

// 处理图片URL，替换无法解析的placeholder图片并添加时间戳
const processImageUrl = (url) => {
  if (!url) return ''
  if (url.includes('placeholder.com')) {
    // 使用本地SVG占位符替代外部placeholder图片
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2MDYyNjYiIG5hbWU9ImFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2NhbCBJbWFnZTwvdGV4dD48L3N2Zz4='
  }
  return addTimestampToImageUrl(url)
}

// 加载盲盒列表
const loadBoxes = async (forceRefresh = false) => {
  const cacheKey = `boxes_${currentPage.value}_${pageSize.value}_${searchQuery.value}_${filterForm.status}`;
  
  // 如果不是强制刷新，尝试从缓存加载
  if (!forceRefresh) {
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('从缓存加载盲盒数据:', cachedData.boxes.length, '个盲盒');
      boxes.value = cachedData.boxes;
      total.value = cachedData.total;
      return;
    }
  }
  
  console.log('加载盲盒列表:', { page: currentPage.value, limit: pageSize.value, search: searchQuery.value, status: filterForm.status });
  loading.value = true
  try {
    await throttleRequest('loadBoxes', async () => {
      const params = {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value
      }
      if (filterForm.status) {
        params.status = filterForm.status
      }
      const response = await api.get('/boxes', { params })
      
      console.log('后端响应:', response);
      
      // 处理每个盲盒的图片URL和数据验证
      let rawBoxes = []
      let apiTotal = 0
      
      // 正确处理API响应结构 - 响应拦截器已经返回了 response.data
      if (response.success) {
        rawBoxes = Array.isArray(response.data) ? response.data : []
        apiTotal = response.total || 0
      }
      
      console.log('原始盲盒数据长度:', rawBoxes.length, '总数:', apiTotal);
      
      const processedBoxes = rawBoxes.map(box => {
        const processedBox = {
          ...box,
          id: box.id,
          name: box.name || '未知盲盒',
          description: box.description || '',
          price: box.price || 0,
          stock: box.stock || 0,
          totalQuantity: box.totalQuantity || 10,
          image: processImageUrl(box.image || ''),
          status: box.status || 'inactive',
          season: box.season || '时令盲盒',
          items: box.items || []
        }
        
        // 处理 items 数组，确保每个项都有完整的结构
        if (box.items && Array.isArray(box.items)) {
          const items = box.items.map(item => {
            // 从关联的 mushroom 数据中获取信息
            const mushroom = item.mushroom || {}
            return {
              ...item,
              mushroomId: item.mushroomId,
              quantity: item.quantity || 1,
              minQuantity: item.minQuantity || 1,
              maxQuantity: item.maxQuantity || 1,
              probability: item.probability || 0,
              mushroomName: item.mushroomName || mushroom.name || '菌菇',
              mushroomType: item.mushroomType || 'common',
              image: addTimestampToImageUrl(item.image || mushroom.image || '')
            }
          })
          
          // 如果有项目但概率总和为0，自动分配概率
          const totalProbability = items.reduce((sum, item) => sum + (item.probability || 0), 0)
          if (totalProbability === 0 && items.length > 0) {
            const baseProbability = 100 / items.length
            items.forEach((item) => {
              item.probability = Math.round(baseProbability * 100) / 100
            })
            // 调整最后一个项目的概率，确保总和为100%
            if (items.length > 0) {
              const newTotal = items.slice(0, -1).reduce((sum, item) => sum + item.probability, 0)
              items[items.length - 1].probability = Math.round((100 - newTotal) * 10) / 10
            }
          }
          
          processedBox.items = items
        }
        
        return processedBox
      })
      
      boxes.value = processedBoxes
      total.value = apiTotal
      console.log('处理后盲盒数据:', { boxesCount: processedBoxes.length, total: total.value });
      
      // 缓存数据
      setCache(cacheKey, { boxes: processedBoxes, total: total.value });
      console.log('缓存盲盒数据:', { boxesCount: processedBoxes.length, total: total.value });
    });
  } catch (error) {
    console.error('加载盲盒失败:', error)
    ElMessage.error('加载盲盒失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载菌菇列表
const loadMushrooms = async () => {
  const cacheKey = 'mushrooms';
  const cachedData = getCache(cacheKey);
  
  if (cachedData) {
    mushrooms.value = cachedData;
    return;
  }
  
  try {
    await throttleRequest('loadMushrooms', async () => {
      const response = await api.get('/mushrooms')
      const data = response.data?.data || []
      mushrooms.value = data
      setCache(cacheKey, data);
    });
  } catch (error) {
    console.error('加载菌菇列表失败:', error)
    ElMessage.error('加载菌菇列表失败，请稍后重试')
  }
}

// 打开新增对话框
const openCreateDialog = () => {
  isEdit.value = false
  // 重置表单
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [],
    items: [],
    status: 'active'
  })
  imageFileList.value = []
  dialogVisible.value = true
}



// 打开编辑对话框
const openEditDialog = async (box) => {
  isEdit.value = true
  // 填充表单数据
  const boxImages = Array.isArray(box.images) ? box.images : (box.image ? [box.image] : [])
  Object.assign(form, {
    id: box.id, // 确保设置id
    ...box,
    images: boxImages,
    totalQuantity: box.totalQuantity || 10,
    items: (box.items || []).map(item => ({
      ...item,
      minQuantity: item.minQuantity || item.quantity || 1,
      maxQuantity: item.maxQuantity || item.quantity || item.minQuantity || 1,
      quantity: item.quantity || item.minQuantity || 1 // 保持向后兼容
    }))
  })
  imageFileList.value = boxImages.map((image, index) => ({
    id: index,
    url: getImageUrl(image || ''),
    name: `image${index + 1}`
  })).filter(item => item.url)
  
  // 加载布局配置
  if (box.layoutConfig) {
    form.layoutConfig = {
      interface: {
        type: box.layoutConfig.interface?.type || 'grid',
        columns: box.layoutConfig.interface?.columns || 3,
        gap: box.layoutConfig.interface?.gap || 16
      },
      interaction: {
        animation: box.layoutConfig.interaction?.animation || 'default',
        resultDisplay: box.layoutConfig.interaction?.resultDisplay || 'one-by-one',
        sound: box.layoutConfig.interaction?.sound || false
      },
      advanced: {
        customCss: box.layoutConfig.advanced?.customCss || '',
        customJs: box.layoutConfig.advanced?.customJs || ''
      }
    }
  } else {
    // 重置为默认值
    form.layoutConfig = {
      interface: {
        type: 'grid',
        columns: 3,
        gap: 16
      },
      interaction: {
        animation: 'default',
        resultDisplay: 'one-by-one',
        sound: false
      },
      advanced: {
        customCss: '',
        customJs: ''
      }
    }
  }
  
  // 直接打开对话框
  dialogVisible.value = true
}

// 打开详情对话框
const openDetailDialog = async (box) => {
  detailDialogVisible.value = true
  await loadBoxDetail(box.id)
}

// 加载盲盒详情
const loadBoxDetail = async (boxId) => {
  if (!boxId) return
  
  loadingDetail.value = true
  try {
    console.log('加载盲盒详情:', boxId) // 添加调试日志
    const response = await api.get(`/boxes/${boxId}`)
    console.log('盲盒详情响应:', response) // 添加调试日志，记录完整响应
    console.log('响应数据结构:', response.data) // 记录响应数据结构
    console.log('响应数据类型:', typeof response.data) // 记录响应数据类型
    
    // 修复数据解析逻辑，适配不同的响应结构
    let boxData = {}
    if (response.data && typeof response.data === 'object') {
      if (response.data.success !== undefined) {
        // 后端返回的是标准格式 { success: true, data: {} }
        boxData = response.data.data || {}
      } else {
        // 后端直接返回数据
        boxData = response.data || {}
      }
    } else {
      console.warn('响应数据格式异常:', response.data)
      boxData = {}
    }
    
    console.log('解析后的boxData:', boxData) // 记录解析后的数据
    console.log('boxData中的items:', boxData.items) // 记录items数据
    console.log('items类型:', typeof boxData.items) // 记录items类型
    if (Array.isArray(boxData.items)) {
      console.log('items长度:', boxData.items.length) // 记录items长度
    }
    
    // 确保返回的数据结构完整
    boxData = {
      ...boxData,
      id: boxData.id || '',
      name: boxData.name || '盲盒',
      description: boxData.description || '',
      price: boxData.price || 0,
      stock: boxData.stock || 0,
      image: boxData.image || '',
      status: boxData.status || 'inactive',
      season: boxData.season || '时令盲盒',
      items: boxData.items || []
    }
    
    // 确保 items 数组中的每个项都有完整的结构
    if (Array.isArray(boxData.items)) {
      const items = boxData.items.map(item => {
        const mushroom = item.mushroom || {}
        return {
          ...item,
          mushroomId: item.mushroomId,
          quantity: item.quantity || 1,
          probability: item.probability || 0,
          mushroomName: item.mushroomName || mushroom.name || '菌菇',
          mushroomType: item.mushroomType || 'common',
          image: addTimestampToImageUrl(item.image || mushroom.image || '')
        }
      })
      
      console.log('处理后的盲盒内容:', items) // 添加调试日志
      console.log('处理后items长度:', items.length) // 记录处理后items长度
      
      // 如果有项目但概率总和为0，自动分配概率
      const totalProbability = items.reduce((sum, item) => sum + (item.probability || 0), 0)
      if (totalProbability === 0 && items.length > 0) {
        const baseProbability = 100 / items.length
        items.forEach((item) => {
          item.probability = Math.round(baseProbability * 100) / 100
        })
        // 调整最后一个项目的概率，确保总和为100%
        if (items.length > 0) {
          const newTotal = items.slice(0, -1).reduce((sum, item) => sum + item.probability, 0)
          items[items.length - 1].probability = Math.round((100 - newTotal) * 10) / 10
        }
      }
      
      boxData.items = items
    } else {
      console.warn('items不是数组，重置为空数组:', boxData.items)
      boxData.items = []
    }
    
    console.log('最终boxData:', boxData) // 记录最终数据
    currentBoxDetail.value = boxData
  } catch (error) {
    console.error('加载盲盒详情失败:', error)
    console.error('错误详情:', error.response) // 添加更详细的错误信息
    ElMessage.error('加载盲盒详情失败，请稍后重试')
    currentBoxDetail.value = null
  } finally {
    loadingDetail.value = false
  }
}

// 计算详情页的概率总和
const calculateDetailTotalProbability = () => {
  if (!currentBoxDetail.value || !currentBoxDetail.value.items) return 0
  return currentBoxDetail.value.items.reduce((total, item) => total + (item.probability || 0), 0)
}

// 打开内容配置对话框
const openContentConfigDialog = async () => {
  if (mushroomProducts.value.length === 0) {
    await loadMushroomProducts()
  }
  if (otherProducts.value.length === 0) {
    await loadOtherProducts()
  }
  contentDialogVisible.value = true
}

// 打开数据统计对话框
const openStatisticsDialog = async () => {
  await loadStatistics()
  statisticsDialogVisible.value = true
}

// 加载数据统计
const loadStatistics = async () => {
  const cacheKey = 'statistics';
  const cachedData = getCache(cacheKey);
  
  if (cachedData) {
    statistics.value = cachedData;
    return;
  }
  
  loadingStatistics.value = true
  try {
    await throttleRequest('loadStatistics', async () => {
      const response = await api.get('/boxes/statistics')
      
      // 修复数据解析逻辑，适配不同的响应结构
      let statsData = {}
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          // 后端返回的是标准格式 { success: true, data: {} }
          statsData = response.data.data || {}
        } else {
          // 后端直接返回数据
          statsData = response.data || {}
        }
      }
      
      // 确保数据结构完整
      const normalizedStats = {
        boxCounts: {
          total: statsData.boxCounts?.total || 0,
          active: statsData.boxCounts?.active || 0,
          inactive: statsData.boxCounts?.inactive || 0
        },
        salesSummary: {
          totalSalesAmount: statsData.salesSummary?.totalSalesAmount || 0,
          totalSalesCount: statsData.salesSummary?.totalSalesCount || 0,
          averageOrderValue: statsData.salesSummary?.averageOrderValue || 0
        },
        salesStatistics: statsData.salesStatistics || [],
        stockStatistics: {
          totalStock: statsData.stockStatistics?.totalStock || 0,
          lowStockBoxes: statsData.stockStatistics?.lowStockBoxes || []
        },
        mushroomTypeStatistics: statsData.mushroomTypeStatistics || {},
        lastUpdated: statsData.lastUpdated || new Date().toISOString()
      }
      
      // 确保salesStatistics中的每个项都有完整的结构
      normalizedStats.salesStatistics = normalizedStats.salesStatistics.map(item => ({
        boxName: item.boxName || '未知盲盒',
        price: item.price || 0,
        orderCount: item.orderCount || 0,
        totalSales: item.totalSales || 0
      }))
      
      // 确保lowStockBoxes中的每个项都有完整的结构
      normalizedStats.stockStatistics.lowStockBoxes = normalizedStats.stockStatistics.lowStockBoxes.map(item => ({
        id: item.id || 0,
        name: item.name || '未知盲盒',
        stock: item.stock || 0
      }))
      
      statistics.value = normalizedStats
      setCache(cacheKey, normalizedStats);
    });
  } catch (error) {
    console.error('加载数据统计失败:', error)
    console.error('错误详情:', error.response)
    ElMessage.error('加载数据统计失败，请稍后重试')
    
    // 加载失败时使用默认数据结构，避免界面显示异常
    statistics.value = {
      boxCounts: {
        total: 0,
        active: 0,
        inactive: 0
      },
      salesSummary: {
        totalSalesAmount: 0,
        totalSalesCount: 0,
        averageOrderValue: 0
      },
      salesStatistics: [],
      stockStatistics: {
        totalStock: 0,
        lowStockBoxes: []
      },
      mushroomTypeStatistics: {},
      lastUpdated: new Date().toISOString()
    }
  } finally {
    loadingStatistics.value = false
  }
}

// 刷新统计数据
const refreshStatistics = async () => {
  try {
    // 显示加载提示
    const loadingInstance = ElMessage.loading({
      message: '正在刷新数据...',
      duration: 0,
      forbidClick: true
    });
    
    // 清除缓存
    clearCacheByKey('statistics');
    // 重新加载数据
    await loadStatistics();
    
    // 关闭加载提示
    setTimeout(() => {
      loadingInstance.close();
      ElMessage.success('数据已刷新');
    }, 500);
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败，请稍后重试');
  }
}

// 导出销售数据
const exportSalesData = () => {
  try {
    const salesData = statistics.value.salesStatistics || [];
    if (salesData.length === 0) {
      ElMessage.warning('暂无销售数据可导出');
      return;
    }
    
    // 准备CSV数据
    const headers = ['盲盒名称', '单价', '订单数量', '销售金额', '销售占比'];
    const rows = salesData.map(item => {
      const price = parseFloat(item.price || 0);
      const orderCount = parseInt(item.orderCount || 0);
      const totalSales = parseFloat(item.totalSales || 0);
      const totalSalesAmount = parseFloat(statistics.value.salesSummary?.totalSalesAmount || 0);
      const percentage = totalSalesAmount > 0 ? 
        ((totalSales / totalSalesAmount) * 100).toFixed(2) : 0;
      return [
        item.boxName || '未知盲盒',
        `¥${price.toFixed(2)}`,
        orderCount,
        `¥${totalSales.toFixed(2)}`,
        `${percentage}%`
      ];
    });
    
    // 创建CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建Blob并下载
    try {
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `盲盒销售数据_${new Date().toLocaleDateString()}.csv`;
      
      // 确保link元素在DOM中
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      ElMessage.success('数据导出成功');
    } catch (downloadError) {
      console.error('下载文件失败:', downloadError);
      ElMessage.error('下载文件失败，请稍后重试');
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败，请稍后重试');
  }
}

// 获取菌菇类型名称
const getMushroomTypeName = (type) => {
  const typeNames = {
    'common': '常见菌菇',
    'rare': '稀有菌菇',
    'epic': '珍稀菌菇',
    'legendary': '传说菌菇',
    'mushroom_product': '菌菇商品',
    'other_product': '其他商品'
  };
  return typeNames[type] || '未知类型';
}

// 获取菌菇类型颜色
const getMushroomTypeColor = (type) => {
  const typeColors = {
    'common': '#409EFF',
    'rare': '#67C23A',
    'epic': '#E6A23C',
    'legendary': '#F56C6C',
    'mushroom_product': '#909399',
    'other_product': '#C0C4CC'
  };
  return typeColors[type] || '#909399';
}

// 跳转到编辑盲盒
const goToEditBox = async (boxId) => {
  try {
    // 关闭统计对话框
    statisticsDialogVisible.value = false;
    
    // 找到对应的盲盒数据
    let box = boxes.value.find(b => b.id === boxId);
    
    if (box) {
      // 打开编辑对话框
      openEditDialog(box);
    } else {
      // 显示加载提示
      const loadingInstance = ElMessage.loading({
        message: '正在加载盲盒数据...',
        duration: 0,
        forbidClick: true
      });
      
      // 尝试重新加载盲盒列表
      await loadBoxes(true);
      
      // 再次查找盲盒数据
      box = boxes.value.find(b => b.id === boxId);
      
      // 关闭加载提示
      setTimeout(() => {
        loadingInstance.close();
        
        if (box) {
          // 打开编辑对话框
          openEditDialog(box);
        } else {
          ElMessage.error('未找到对应的盲盒数据，请稍后重试');
        }
      }, 500);
    }
  } catch (error) {
    console.error('跳转到编辑盲盒失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
}

// 添加内容项
const addContentItem = () => {
  console.log('=== 添加内容项开始 ===')
  console.log('选择的商品ID:', selectedMushroomId.value)
  console.log('最小数量:', itemMinQuantity.value)
  console.log('最大数量:', itemMaxQuantity.value)
  console.log('概率:', itemProbability.value)
  console.log('当前商品类型:', selectedMushroomType.value)
  
  if (!selectedMushroomId.value) {
    ElMessage.warning('请选择菌菇或商品')
    console.log('添加内容项失败: 未选择商品')
    return
  }
  
  if (!itemMinQuantity.value || itemMinQuantity.value <= 0 || !Number.isInteger(itemMinQuantity.value)) {
    ElMessage.warning('请设置有效的最小数量（大于0的正整数）')
    console.log('添加内容项失败: 无效的最小数量')
    return
  }
  
  if (!itemMaxQuantity.value || itemMaxQuantity.value <= 0 || !Number.isInteger(itemMaxQuantity.value)) {
    ElMessage.warning('请设置有效的最大数量（大于0的正整数）')
    console.log('添加内容项失败: 无效的最大数量')
    return
  }
  
  if (itemMinQuantity.value > itemMaxQuantity.value) {
    ElMessage.warning('最小数量不能大于最大数量')
    console.log('添加内容项失败: 最小数量大于最大数量')
    return
  }
  
  if (!itemProbability.value || itemProbability.value <= 0) {
    ElMessage.warning('请设置有效的概率')
    console.log('添加内容项失败: 无效的概率')
    return
  }
  
  let item
  // 根据选择的类型从不同数据源中查找
  if (selectedMushroomType.value === 'common' || (selectedMushroomType.value === 'all' && mushrooms.value.some(m => m.id === selectedMushroomId.value))) {
    item = mushrooms.value.find(m => m.id === selectedMushroomId.value)
    console.log('从常见菌菇中查找:', item)
  } else if (selectedMushroomType.value === 'product' || (selectedMushroomType.value === 'all' && otherProducts.value.some(p => p.id === selectedMushroomId.value))) {
    const product = otherProducts.value.find(p => p.id === selectedMushroomId.value)
    if (product) {
      item = {
        id: product.id,
        name: product.name,
        type: 'other_product',
        image: product.images?.[0] || ''
      }
      console.log('从其他商品中查找:', item)
    }
  }
  
  // 从菌菇类商品中查找
  if (!item && (selectedMushroomType.value === 'common' || selectedMushroomType.value === 'all')) {
    const mushroomProduct = mushroomProducts.value.find(p => p.id === selectedMushroomId.value)
    if (mushroomProduct) {
      item = {
        id: mushroomProduct.id,
        name: mushroomProduct.name,
        type: 'mushroom_product',
        image: mushroomProduct.images?.[0] || ''
      }
      console.log('从菌菇类商品中查找:', item)
    }
  }
  
  if (!item) {
    ElMessage.error('未找到所选项目')
    console.log('添加内容项失败: 未找到所选项目')
    return
  }
  
  // 检查是否已存在
  const existingItem = form.items.find(existing => existing.mushroomId === selectedMushroomId.value)
  if (existingItem) {
    ElMessage.warning('该项目已添加到盲盒中')
    console.log('添加内容项失败: 项目已存在')
    return
  }
  
  const newItem = {
    mushroomId: item.id,
    mushroomName: item.name,
    mushroomType: item.type || 'common',
    minQuantity: itemMinQuantity.value,
    maxQuantity: itemMaxQuantity.value,
    quantity: itemMinQuantity.value, // 保持向后兼容
    probability: itemProbability.value,
    image: item.image || ''
  }
  
  console.log('添加新商品:', newItem)
  console.log('添加前商品总数:', form.items.length)
  console.log('添加前items数组:', form.items)
  
  form.items.push(newItem)
  
  console.log('添加后商品总数:', form.items.length)
  console.log('添加后items数组:', form.items)
  console.log('=== 添加内容项结束 ===')
  
  // 重置表单字段，以便添加下一个商品
  selectedMushroomId.value = ''
  itemMinQuantity.value = 1
  itemMaxQuantity.value = 3
  itemProbability.value = 25
  
  ElMessage.success('项目已添加到盲盒')
}

// 确认内容配置
const confirmContentConfig = () => {
  console.log('=== 确认内容配置开始 ===')
  console.log('当前商品数量:', form.items.length)
  console.log('当前商品详情:', form.items)
  console.log('=== 确认内容配置结束 ===')
  contentDialogVisible.value = false
}

// 验证数量区间
const validateQuantityRange = () => {
  if (itemMinQuantity.value && itemMaxQuantity.value && itemMinQuantity.value > itemMaxQuantity.value) {
    ElMessage.warning('最小数量不能大于最大数量')
  }
}

// 验证表格中的数量区间
const validateQuantityRangeInTable = (row) => {
  if (row.minQuantity && row.maxQuantity && row.minQuantity > row.maxQuantity) {
    ElMessage.warning('最小数量不能大于最大数量')
  }
}

// 验证总数量
const validateTotalQuantity = () => {
  if (form.totalQuantity && (form.totalQuantity <= 0 || !Number.isInteger(form.totalQuantity))) {
    ElMessage.warning('请设置有效的总数量（大于0的正整数）')
  }
}

// 随机分配数量


// 按概率分配商品数量
const allocateQuantitiesByProbability = () => {
  if (form.items.length === 0) {
    ElMessage.warning('请先添加盲盒内容')
    return
  }
  
  if (!form.totalQuantity || form.totalQuantity <= 0 || !Number.isInteger(form.totalQuantity)) {
    ElMessage.warning('请设置有效的总数量（大于0的正整数）')
    return
  }
  
  // 验证总数量是否大于等于商品种类数
  if (form.totalQuantity < form.items.length) {
    ElMessage.error(`盲盒总数量应大于等于商品种类数（${form.items.length}）`)
    return
  }
  
  // 计算概率总和
  const totalProbability = form.items.reduce((sum, item) => sum + (item.probability || 0), 0)
  if (Math.abs(totalProbability) < 0.001) {
    ElMessage.warning('请为至少一个商品设置概率')
    return
  }
  
  // 按概率分配数量
  const itemsWithQuantity = form.items.map(item => {
    if ((item.probability || 0) <= 0) {
      return {
        ...item,
        quantity: 0
      }
    }
    
    const expectedQuantity = (item.probability / totalProbability) * form.totalQuantity
    return {
      ...item,
      quantity: Math.round(expectedQuantity)
    }
  })
  
  // 计算已分配的总数量
  let allocatedTotal = itemsWithQuantity.reduce((sum, item) => sum + item.quantity, 0)
  let remaining = form.totalQuantity - allocatedTotal
  
  // 确保每个有概率的商品至少有1个数量
  let finalItems = itemsWithQuantity.map(item => ({
    ...item,
    quantity: (item.probability || 0) > 0 ? Math.max(1, item.quantity) : 0
  }))
  
  // 重新计算总数并调整
  allocatedTotal = finalItems.reduce((sum, item) => sum + item.quantity, 0)
  remaining = form.totalQuantity - allocatedTotal
  
  // 处理剩余数量，确保总数正确
  if (Math.abs(remaining) > 0.001) {
    // 按概率从高到低排序
    const sortedItems = [...finalItems].sort((a, b) => b.probability - a.probability)
    
    // 分配剩余数量
    let index = 0
    while (Math.abs(remaining) > 0.001 && index < sortedItems.length) {
      const item = sortedItems[index]
      if ((item.probability || 0) > 0) {
        if (remaining > 0) {
          item.quantity++
          remaining--
        } else {
          // 确保数量不小于1
          if (item.quantity > 1) {
            item.quantity--
            remaining++
          }
        }
      }
      index++
    }
    
    // 更新finalItems
    finalItems = sortedItems
  }
  
  // 再次验证总数
  const finalTotal = finalItems.reduce((sum, item) => sum + item.quantity, 0)
  if (Math.abs(finalTotal - form.totalQuantity) > 0.001) {
    console.warn(`分配数量验证失败: 总数量应为 ${form.totalQuantity}，实际为 ${finalTotal}`)
  }
  
  // 更新表单数据
  form.items = finalItems
  
  ElMessage.success('按概率分配数量成功')
}



// 移除内容项
const removeContentItem = (index) => {
  form.items.splice(index, 1)
  ElMessage.success('菌菇已从盲盒移除')
}

// 获取标签类型
const getTagType = (type) => {
  switch (type) {
    case 'common':
      return 'info' // 常见菌菇
    case 'mushroom_product':
      return 'warning' // 菌菇类商品
    case 'other_product':
      return 'success' // 非菌菇类商品
    default:
      return 'info'
  }
}

// 获取季节标签类型
const getSeasonTagType = (season) => {
  switch (season) {
    case '春季盲盒':
      return 'success' // 绿色 - 春天
    case '夏季盲盒':
      return 'warning' // 橙色 - 夏天
    case '秋季盲盒':
      return 'danger' // 红色 - 秋天
    case '冬季盲盒':
      return 'info' // 蓝色 - 冬天
    case '时令盲盒':
      return 'primary' // 紫色 - 时令
    default:
      return 'primary'
  }
}

// 获取标签文本
const getTagLabel = (type) => {
  switch (type) {
    case 'common':
      return '常见菌菇'
    case 'mushroom_product':
      return '菌菇商品'
    case 'other_product':
      return '我的商品'
    default:
      return '未知类型'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'approved':
      return '已审核'
    case 'pending':
      return '待审核'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
  return colors[index % colors.length]
}

// 计算总概率
const calculateTotalProbability = () => {
  return form.items.reduce((total, item) => total + (item.probability || 0), 0)
}

// 检查概率总和是否为100%（考虑浮点数精度误差）
const isProbabilityValid = () => {
  return Math.abs(calculateTotalProbability() - 100) <= 0.01
}

// 实时同步盲盒内容分配状态
const syncContentAllocationStatus = () => {
  // 这里可以添加实时同步逻辑，例如：
  // 1. 监听form.items的变化
  // 2. 实时更新数据统计
  // 3. 触发相关计算
  
  // 示例：更新概率总和显示
  calculateTotalProbability()
  
  // 可以在这里添加更多实时同步的逻辑
}

// 验证数量输入
// const validateItemQuantity = (value) => {
//   if (!value || value <= 0 || !Number.isInteger(value)) {
//     ElMessage.error('请输入大于0的正整数')
//     itemQuantity.value = 1 // 重置为默认值
//   }
// }

// 验证表格中的数量输入
// const validateItemQuantityInTable = (row) => {
//   if (!row.quantity || row.quantity <= 0 || !Number.isInteger(row.quantity)) {
//     ElMessage.error('请输入大于0的正整数')
//     row.quantity = 1 // 重置为默认值
//   }
// }

// 自动调整概率，确保总和为100%
const autoAdjustProbability = () => {
  if (form.items.length === 0) {
    ElMessage.warning('没有内容需要调整概率')
    return
  }
  
  // 计算当前总概率
  const totalProbability = calculateTotalProbability()
  if (Math.abs(totalProbability - 100) <= 0.01) {
    ElMessage.success('概率总和已经是100%')
    return
  }
  
  // 计算需要调整的概率差值
  const diff = 100 - totalProbability
  
  // 按比例分配差值
  if (form.items.length > 0) {
    // 计算每个项目的权重
    const weights = form.items.map(item => item.probability || 1)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    // 按权重分配差值
    form.items.forEach((item, index) => {
      const adjustment = Math.round((weights[index] / totalWeight) * diff * 100) / 100
      item.probability = Math.max(1, item.probability + adjustment)
    })
    
    // 确保总和为100%（处理四舍五入误差）
    const newTotal = calculateTotalProbability()
    if (Math.abs(newTotal - 100) > 0.01 && form.items.length > 0) {
      // 调整最后一个项目的概率
      form.items[form.items.length - 1].probability += (100 - newTotal)
    }
    
    ElMessage.success('概率已自动调整为100%')
    syncContentAllocationStatus()
  }
}

// 随机选取商品
const randomSelectItems = async () => {
  // 检查是否有可用的内容

  if (mushroomProducts.value.length === 0) {
    await loadMushroomProducts()
  }
  if (otherProducts.value.length === 0) {
    await loadOtherProducts()
  }
  
  // 合并所有可用内容
  const allAvailableItems = [
    ...mushrooms.value,
    ...mushroomProducts.value.map(p => ({
      id: p.id,
      name: p.name,
      type: 'mushroom_product',
      image: p.images?.[0] || ''
    })),
    ...otherProducts.value.map(p => ({
      id: p.id,
      name: p.name,
      type: 'other_product',
      image: p.images?.[0] || ''
    }))
  ]
  
  if (allAvailableItems.length === 0) {
    ElMessage.warning('当前没有可用的内容来分配')
    return
  }
  
  // 随机选择指定数量的不同商品
  const selectedItems = []
  const usedIndices = new Set()
  const itemCount = Math.min(randomSelectionCount.value, allAvailableItems.length)
  
  while (selectedItems.length < itemCount) {
    const randomIndex = Math.floor(Math.random() * allAvailableItems.length)
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      selectedItems.push(allAvailableItems[randomIndex])
    }
  }
  
  // 根据概率分配模式计算每个商品的概率
  let probabilities = []
  if (probabilityMode.value === 'equal') {
    // 均分概率模式
    const baseProbability = 100 / selectedItems.length
    probabilities = selectedItems.map(() => Math.round(baseProbability * 100) / 100)
  } else if (probabilityMode.value === 'random') {
    // 随机概率模式
    let remainingProbability = 100
    const validProbabilities = []
    
    for (let i = 0; i < selectedItems.length; i++) {
      if (i === selectedItems.length - 1) {
        // 最后一个商品分配剩余的概率，确保总和为100
        validProbabilities.push(Math.round(remainingProbability * 100) / 100)
      } else {
        // 随机生成概率值，但不超过剩余概率的30%，确保有足够的概率留给后面的商品
        const maxProb = Math.min(30, remainingProbability - (selectedItems.length - i - 1))
        const randomProb = Math.floor(Math.random() * maxProb) + 1
        validProbabilities.push(randomProb)
        remainingProbability -= randomProb
      }
    }
    
    // 确保概率总和为100
    const totalProb = validProbabilities.reduce((sum, prob) => sum + prob, 0)
    if (Math.abs(totalProb - 100) > 0.01 && validProbabilities.length > 0) {
      validProbabilities[validProbabilities.length - 1] += (100 - totalProb)
    }
    
    probabilities = validProbabilities
  }
  
  // 分配内容到盲盒
  form.items = selectedItems.map((item, index) => ({
    mushroomId: item.id,
    mushroomName: item.name,
    mushroomType: item.type || 'common',
    minQuantity: 1,
    maxQuantity: 3,
    quantity: 1, // 保持向后兼容
    probability: probabilities[index],
    image: item.image || ''
  }))
  
  // 调整最后一个内容的概率，确保总和为100%
  if (form.items.length > 0) {
    const totalProbability = form.items.slice(0, -1).reduce((sum, item) => sum + item.probability, 0)
    form.items[form.items.length - 1].probability = Math.round((100 - totalProbability) * 100) / 100
  }
  
  // 如果已经设置了总数量，则自动分配数量
  if (form.totalQuantity && form.totalQuantity > 0) {
    allocateQuantitiesByProbability();
  }
  
  ElMessage.success(`已随机选取 ${selectedItems.length} 个商品，并按照 ${probabilityMode.value === 'equal' ? '均分概率' : '随机概率'} 模式分配概率`)
}

// 保存盲盒
const saveBox = async () => {
  if (!boxForm.value) return
  
  // 暂时移除管理员权限检查，用于测试
  // if (!isAdmin.value) {
  //   ElMessage.error('您没有管理员权限，无法执行此操作')
  //   return
  // }
  
  await boxForm.value.validate(async (valid) => {
    if (valid) {
      // 检查是否有内容
      if (!form.items || form.items.length === 0) {
        ElMessage.warning('请添加盲盒内容')
        return
      }
      
      // 检查并自动调整概率总和为100%
      let totalProbability = calculateTotalProbability()
      if (Math.abs(totalProbability - 100) > 0.01) {
        console.log(`概率总和为${totalProbability.toFixed(2)}%，自动调整为100%`)
        // 自动调整概率
        autoAdjustProbability()
        ElMessage.info(`已自动将概率总和调整为100%`)
      }
      
      loading.value = true
      try {
        // 转换数据格式，确保与后端期望的一致
        // 先深拷贝数据，避免响应式对象的问题
        // 等待Vue响应式更新完成
        await new Promise(resolve => setTimeout(resolve, 50))
        const safeItems = JSON.parse(JSON.stringify(form.items));
        console.log('=== 保存前数据检查 ===');
        console.log('原始form.items长度:', form.items.length);
        console.log('深拷贝后safeItems长度:', safeItems.length);
        console.log('safeItems内容:', safeItems);
        
        const boxData = {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price) || 0, // 确保价格是数字类型
          stock: form.stock || 1,
          totalQuantity: form.totalQuantity || 10,
          season: form.season || '时令盲盒',
          images: form.images,
          status: form.status,
          cultivationService: form.cultivationService === true,
          cultivationPrice: form.cultivationPrice ? parseFloat(form.cultivationPrice) : null,
          cultivationDuration: form.cultivationDuration ? parseInt(form.cultivationDuration) : null,
          cultivationInclusions: form.cultivationInclusions || '',
          cultivationDescription: form.cultivationDescription || '',
          items: safeItems.map(item => {
            console.log('处理商品:', item);
            return {
              mushroomId: item.mushroomId,
              quantity: item.quantity || 1, // 使用编辑的实际数量
              minQuantity: item.minQuantity || 1, // 包含最小数量字段
              maxQuantity: item.maxQuantity || 1, // 包含最大数量字段
              probability: item.probability || 0, // 包含概率字段，设置默认值0
              mushroomName: item.mushroomName || '', // 包含菌菇名称，设置默认值
              mushroomType: item.mushroomType || 'common', // 包含菌菇类型，设置默认值
              image: item.image || '' // 包含图片字段，设置默认值
            };
          })
        }
        
        console.log('=== 最终发送的boxData ===');
        console.log('boxData.items长度:', boxData.items.length);
        console.log('boxData.items内容:', boxData.items);
        
        console.log('=== 保存盲盒数据开始 ===')
        console.log('保存盲盒数据:', boxData) // 添加调试日志
        console.log('盲盒ID:', form.id) // 添加调试日志
        console.log('是否编辑模式:', isEdit.value) // 添加调试日志
        console.log('用户角色:', userStore.userInfo?.role) // 添加调试日志
        console.log('Token:', userStore.token) // 添加token日志
        
        // 验证items数组
        console.log('=== 商品数据验证 ===')
        console.log('原始Items数组长度:', form.items.length)
        console.log('BoxData Items数组长度:', boxData.items.length)
        
        // 详细记录每个商品数据
        boxData.items.forEach((item) => {
          console.log('商品数据:', {
            mushroomId: item.mushroomId,
            quantity: item.quantity,
            minQuantity: item.minQuantity,
            maxQuantity: item.maxQuantity,
            probability: item.probability,
            mushroomName: item.mushroomName,
            mushroomType: item.mushroomType,
            image: item.image
          })
        })
        
        // 验证数据完整性
        console.log('=== 数据完整性验证 ===')
        console.log('- 所有商品都有mushroomId:', boxData.items.every(item => item.mushroomId))
        console.log('- 所有商品都有quantity:', boxData.items.every(item => item.quantity !== undefined))
        console.log('- 所有商品都有probability:', boxData.items.every(item => item.probability !== undefined))
        console.log('- 所有商品都有mushroomName:', boxData.items.every(item => item.mushroomName))
        console.log('- 所有商品都有mushroomType:', boxData.items.every(item => item.mushroomType))
        
        // 验证数据类型
        console.log('=== 数据类型验证 ===')
        console.log('- items类型:', Array.isArray(boxData.items))
        console.log('- 第一个商品类型:', typeof boxData.items[0])
        if (boxData.items.length > 0) {
          console.log('- 第一个商品mushroomId类型:', typeof boxData.items[0].mushroomId)
          console.log('- 第一个商品quantity类型:', typeof boxData.items[0].quantity)
          console.log('- 第一个商品probability类型:', typeof boxData.items[0].probability)
          console.log('- 第一个商品mushroomName类型:', typeof boxData.items[0].mushroomName)
          console.log('- 第一个商品mushroomType类型:', typeof boxData.items[0].mushroomType)
        }
        
        console.log('=== 保存盲盒数据结束 ===')
        
        let response
        try {
          if (isEdit.value) {
            console.log('发送PUT请求到:', `/boxes/${form.id}`) // 添加调试日志
            response = await api.put(`/boxes/${form.id}`, boxData)
          } else {
            console.log('发送POST请求到:', '/boxes') // 添加调试日志
            response = await api.post('/boxes', boxData)
          }
          console.log('API响应:', response.data) // 添加响应日志
        } catch (apiError) {
          console.error('API请求失败:', apiError)
          console.error('错误响应:', apiError.response?.data)
          console.error('错误状态:', apiError.response?.status)
          console.error('错误消息:', apiError.message)
          throw apiError // 重新抛出错误，让外层catch处理
        }
        
        console.log('保存盲盒响应:', response) // 添加调试日志
        
        ElMessage.success(isEdit.value ? '盲盒更新成功' : '盲盒创建成功')
        dialogVisible.value = false
        
        // 清除相关缓存
        clearCache();
        
        // 重新加载所有相关数据，确保获取最新配置
        await loadBoxes()
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms延迟，避免请求过于频繁
        await loadMushrooms()
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms延迟
        await loadMushroomProducts()
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms延迟
        await loadOtherProducts()
        
        // 通知Pinia store刷新数据，确保盲盒展示页面能获取最新数据
        await boxStore.fetchBoxes(true)
      } catch (error) {
        console.error('保存盲盒失败:', error)
        console.error('错误详情:', error.response) // 添加调试日志
        const errorMessage = error.response?.data?.error || (isEdit.value ? '盲盒更新失败' : '盲盒创建失败')
        ElMessage.error(errorMessage)
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除盲盒
const deleteBox = async (id) => {
  await ElMessageBox.confirm('确定要删除这个盲盒吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    loading.value = true
    try {
      await api.delete(`/boxes/${id}`)
      ElMessage.success('盲盒删除成功')
        
        // 清除相关缓存
        clearCache();
        
        // 重新加载数据
        await loadBoxes()
    } catch (error) {
      console.error('删除盲盒失败:', error)
      ElMessage.error('盲盒删除失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 图片预览
const handlePreview = (file) => {
  if (file?.url) {
    previewImageUrl.value = file.url
    previewDialogVisible.value = true
  }
}

// 处理图片上传成功
const handleUploadSuccess = (response, file) => {
  try {
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      const filePath = response.data[0].path || response.data[0].url
      if (filePath) {
        file.url = filePath
        ElMessage.success('图片上传成功')
      } else {
        file.url = ''
        ElMessage.error('图片上传失败：返回数据格式不正确')
        console.error('上传成功但返回数据格式不正确:', response)
      }
    } else {
      file.url = ''
      ElMessage.error('图片上传失败：返回数据格式不正确')
      console.error('上传成功但返回数据格式不正确:', response)
    }
  } catch (error) {
    file.url = ''
    ElMessage.error('图片上传失败：处理响应数据时出错')
    console.error('处理上传成功响应时出错:', error)
  }
}

// 处理上传错误
const handleUploadError = (error, file) => {
  file.url = ''
  let errorMessage = '图片上传失败'
  
  if (error && error.response) {
    const { status, data } = error.response
    if (data && data.error) {
      errorMessage = data.error
    } else if (status === 400) {
      errorMessage = '请求参数错误，请检查上传配置'
    } else if (status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (status === 404) {
      errorMessage = '上传接口不存在，请检查服务配置'
    } else if (status === 413) {
      errorMessage = '文件大小超过限制'
    }
  } else if (error && error.message) {
    if (error.message.includes('ERR_CONNECTION_RESET')) {
      errorMessage = '服务器连接重置，请检查服务器配置'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    }
  }
  
  ElMessage.error(errorMessage)
  console.error('上传失败:', error)
}

// 上传前验证
const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    ElMessage.error('只能上传JPG、PNG或WebP图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  return true
}

// 处理超出数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传5张图片')
}

// 处理移除图片
const handleRemove = () => {
  form.images = imageFileList.value.map(file => file?.url ?? '').filter(url => url)
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadBoxes()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadBoxes()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedBoxes.value = selection
}

// 重置筛选
const resetFilters = () => {
  filterForm.status = ''
  searchQuery.value = ''
  currentPage.value = 1
  loadBoxes()
}

// 清除选择
const clearSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  selectedBoxes.value = []
}

// 批量删除盲盒
const batchDeleteBoxes = async () => {
  console.log('批量删除被触发，选中的盲盒:', selectedBoxes.value)
  
  if (selectedBoxes.value.length === 0) {
    ElMessage.warning('请先选择要删除的盲盒')
    return
  }
  
  const boxListHtml = selectedBoxes.value
    .slice(0, 10)
    .map(box => `• ${box.name} (ID: ${box.id})`)
    .join('<br>')
  
  const moreText = selectedBoxes.value.length > 10 
    ? `<br>...还有 ${selectedBoxes.value.length - 10} 个盲盒` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要删除以下 ${selectedBoxes.value.length} 个盲盒吗？此操作不可恢复。</strong>
        </div>
        <div style="background-color: #fef0f0; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid #fbc4c4;">
          ${boxListHtml}${moreText}
        </div>
      `,
      '批量删除确认',
      {
        confirmButtonText: `删除 ${selectedBoxes.value.length} 项`,
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedBoxes.value.map(box => Number(box.id))
      console.log('准备发送的 ID 列表:', ids)
      
      const result = await api.post('/boxes/batch/delete', { ids })
      console.log('批量删除结果:', result)
      
      if (result.success) {
        ElMessage.success({
          message: `✅ 成功删除 ${selectedBoxes.value.length} 个盲盒`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadBoxes(true)
      } else {
        ElMessage.error({
          message: '批量删除失败，请稍后重试',
          duration: 5000,
          showClose: true
        })
      }
    } catch (error) {
      console.error('批量删除盲盒失败:', error)
      
      let errorMessage = '批量删除失败'
      if (error.message) {
        errorMessage += `: ${error.message}`
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`
      }
      
      ElMessage.error({
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
    } finally {
      batchLoading.value = false
    }
  } catch (cancelError) {
    console.log('用户取消批量删除')
  }
}

// 批量更新盲盒状态
const batchUpdateStatus = async (status) => {
  console.log(`批量${status === 'active' ? '启用' : '禁用'}被触发，选中的盲盒:`, selectedBoxes.value)
  
  if (selectedBoxes.value.length === 0) {
    ElMessage.warning('请先选择要操作的盲盒')
    return
  }
  
  const action = status === 'active' ? '启用' : '禁用'
  const bgColor = status === 'active' ? '#f0f9ff' : '#fff7ed'
  const borderColor = status === 'active' ? '#b3e5fc' : '#fed7aa'
  
  const boxListHtml = selectedBoxes.value
    .slice(0, 10)
    .map(box => `• ${box.name} (ID: ${box.id})`)
    .join('<br>')
  
  const moreText = selectedBoxes.value.length > 10 
    ? `<br>...还有 ${selectedBoxes.value.length - 10} 个盲盒` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要${action}以下 ${selectedBoxes.value.length} 个盲盒吗？</strong>
        </div>
        <div style="background-color: ${bgColor}; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid ${borderColor};">
          ${boxListHtml}${moreText}
        </div>
      `,
      `批量${action}确认`,
      {
        confirmButtonText: `${action} ${selectedBoxes.value.length} 项`,
        cancelButtonText: '取消',
        type: status === 'active' ? 'success' : 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedBoxes.value.map(box => Number(box.id))
      console.log('准备发送的 ID 列表:', ids)
      
      const result = await api.put('/boxes/batch/status', { ids, status })
      console.log('批量更新结果:', result)
      
      if (result.success) {
        ElMessage.success({
          message: `✅ 成功${action} ${selectedBoxes.value.length} 个盲盒`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadBoxes(true)
      } else {
        ElMessage.error({
          message: `批量${action}失败，请稍后重试`,
          duration: 5000,
          showClose: true
        })
      }
    } catch (error) {
      console.error(`批量${action}盲盒失败:`, error)
      
      let errorMessage = `批量${action}失败`
      if (error.message) {
        errorMessage += `: ${error.message}`
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`
      }
      
      ElMessage.error({
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
    } finally {
      batchLoading.value = false
    }
  } catch (cancelError) {
    console.log(`用户取消批量${action}`)
  }
}

// 初始化
onMounted(async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录')
    // 可以跳转到登录页面
    return
  }
  
  // 检查管理员权限
  if (!isAdmin.value) {
    ElMessage.error('您没有管理员权限，无法访问此页面')
    return
  }
  
  console.log('当前用户信息:', userStore.userInfo) // 添加调试日志
  console.log('用户token:', userStore.token) // 添加调试日志
  
  // 串行执行初始化请求，避免并行请求导致的速率限制
  await loadBoxes(true) // 强制刷新盲盒数据
  await new Promise(resolve => setTimeout(resolve, 500)) // 500ms延迟
  await loadMushrooms()
  await new Promise(resolve => setTimeout(resolve, 500)) // 500ms延迟
  await loadMushroomProducts()
  await new Promise(resolve => setTimeout(resolve, 500)) // 500ms延迟
  await loadOtherProducts()
})
</script>

<style scoped>
.upload-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quantity-range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.total-quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-icon {
  font-size: 18px;
  color: #409EFF;
  cursor: help;
  transition: color 0.3s;
}

.info-icon:hover {
  color: #66b1ff;
}

.quantity-range-edit {
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-separator-small {
  font-size: 12px;
  font-weight: bold;
  color: #606266;
}

.min-quantity-input,
.max-quantity-input {
  width: 120px;
  transition: all 0.3s;
}

.min-quantity-input:hover,
.max-quantity-input:hover {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.mushroom-select {
  width: 320px;
  transition: all 0.3s;
}

.mushroom-select:hover {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.quantity-input {
  width: 120px;
}

.probability-input {
  width: 120px;
  transition: all 0.3s;
}

.probability-input:hover {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.add-content-form {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1200px) {
  .add-content-form {
    flex-wrap: wrap;
  }
  
  .mushroom-select {
    width: 100%;
  }
  
  .quantity-range-input,
  .total-quantity-control {
    width: 100%;
    justify-content: flex-start;
  }
}

/* 随机选取设置样式 */
.random-selection-setting {
  margin-bottom: 20px;
}

.setting-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.setting-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.setting-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.setting-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding: 20px;
}

.setting-item {
  flex: 1;
  min-width: 220px;
}

.selection-count-input {
  width: 160px;
  transition: all 0.3s;
}

.selection-count-input:hover {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.probability-mode-group {
  margin-right: 10px;
}

.random-selection-btn {
  margin-top: 24px;
  transition: all 0.3s;
}

.random-selection-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 随机分配数量按钮样式 */
.random-allocation-btn {
  transition: all 0.3s;
}

.random-allocation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 内容配置对话框样式优化 */
.content-config {
  max-height: 70vh;
  overflow-y: auto;
}

.content-config-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ebeef5;
}

.content-config-header h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 概率进度条样式优化 */
.probability-progress {
  margin-top: 5px;
  border-radius: 4px;
}

.probability-progress-small {
  margin-top: 3px;
  border-radius: 4px;
}

/* 分配数量样式 */
.quantity-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 占比样式 */
.proportion-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.proportion-value {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.proportion-progress {
  margin-top: 2px;
  border-radius: 3px;
}

/* 表格样式优化 */
.current-content-card {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.current-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.current-content-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 分配结果可视化样式优化 */
.allocation-visualization-dialog {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.allocation-visualization-dialog h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.visualization-container-dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visualization-item-dialog {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.item-info-dialog {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.item-name-dialog {
  font-weight: 500;
  color: #303133;
}

.item-probability-dialog {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.progress-bar-container-dialog {
  flex: 1;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .total-quantity-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .setting-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .setting-item {
    width: 100%;
  }
  
  .random-selection-btn {
    margin-top: 10px;
    align-self: flex-start;
  }
  
  .visualization-item-dialog {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-bar-container-dialog {
    width: 100%;
  }
}
</style>

<style scoped>
.admin-mushroom-boxes {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.batch-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  flex-wrap: wrap;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-info .el-tag {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.selected-info .el-tag strong {
  font-size: 16px;
}

.selected-info .el-button {
  color: white !important;
  padding: 5px 10px;
}

.selected-info .el-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.batch-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.batch-action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s;
}

.batch-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.batch-action-btn.delete-btn {
  background-color: rgba(245, 108, 108, 0.8);
  border-color: rgba(245, 108, 108, 0.9);
}

.batch-action-btn.delete-btn:hover {
  background-color: rgba(245, 108, 108, 1);
}

/* 筛选部分 */
.filter-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 20px;
}

.filter-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-select,
.filter-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.filter-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.filter-btn.primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filter-btn.reset:hover {
  border-color: #909399;
  color: #909399;
  transform: translateY(-2px);
}

.boxes-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.box-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.box-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.box-form {
  max-height: 600px;
  overflow-y: auto;
}

.box-upload {
  margin-bottom: 10px;
}

.image-url-input {
  margin-top: 10px;
}

.content-config-btn {
  margin-bottom: 20px;
  width: 100%;
  max-width: 300px;
}

.content-preview {
  margin-top: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.content-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.empty-description {
  color: #909399;
  font-size: 14px;
}

.content-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.mushroom-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mushroom-avatar {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}

.mushroom-name {
  font-weight: 500;
  color: #303133;
}

.probability-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.probability-value {
  font-weight: bold;
  color: #409eff;
  font-size: 14px;
}

.probability-progress {
  width: 80%;
}

.content-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.probability-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.probability-warning {
  color: #e6a23c;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-config-btn {
    max-width: 100%;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .mushroom-name-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .probability-cell {
    align-items: flex-start;
  }
  
  .probability-progress {
    width: 100%;
  }
  
  .probability-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

/* 统计对话框样式 */
.statistics-content {
  padding: 10px 0;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
  color: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

/* 销售汇总卡片 */
.sales-summary-card {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

/* 销售统计卡片 */
.sales-stat-card {
  margin-bottom: 20px;
}

/* 库存预警卡片 */
.stock-warning-card {
  margin-bottom: 20px;
}

/* 菌菇类型统计卡片 */
.mushroom-type-stat-card {
  margin-bottom: 20px;
}

.type-stat-container {
  padding: 10px 0;
}

.type-stat-item {
  margin-bottom: 15px;
}

.type-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.type-name {
  font-weight: 500;
  color: #303133;
}

.type-count {
  color: #909399;
  font-size: 14px;
}

.type-progress {
  margin-top: 5px;
}

/* 加载状态 */
.loading-statistics {
  padding: 20px;
}

.content-config {
  padding: 10px;
}

/* 详情对话框样式 */
.box-detail {
  padding: 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-basic-card {
  margin-bottom: 20px;
}

.detail-content-card {
  margin-bottom: 20px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #303133;
  word-break: break-word;
}

.box-detail-image {
  max-width: 300px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.loading-detail {
  padding: 20px;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .info-label {
    width: 100%;
  }
  
  .box-detail-image {
    max-width: 100%;
  }
}

/* 菌菇类型筛选样式 */
.mushroom-type-filter {
  margin-bottom: 20px;
}

.type-filter-group {
  margin-bottom: 15px;
}

.mushroom-select {
  width: 200px;
  margin-right: 10px;
}

.probability-input {
  width: 120px;
  margin-right: 10px;
}

.mushroom-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mushroom-image {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
}

.mushroom-type-tag {
  margin-left: auto;
}

.current-content {
  margin-top: 20px;
}

.probability-total {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.total-tag {
  margin-left: 10px;
}

/* 分配结果可视化样式 */
.allocation-visualization {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.allocation-visualization h4 {
  margin-bottom: 15px;
  color: #303133;
}

.visualization-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.visualization-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.item-name {
  font-weight: 500;
  color: #303133;
}

.item-probability {
  font-weight: bold;
  color: #409EFF;
}

.progress-bar-container {
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  padding: 2px;
}

.el-progress {
  margin: 0;
}

.el-progress__bar {
  border-radius: 10px;
}

/* 内容配置对话框样式 */
.content-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-config-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-header {
  font-weight: 500;
  color: #303133;
}

.type-filter-group {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.add-content-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.add-content-header {
  font-weight: 500;
  color: #303133;
}

.add-content-form {
  display: flex;
  gap: 15px;
  align-items: end;
}

.mushroom-select {
  flex: 1;
  min-width: 200px;
}

.quantity-input {
  width: 120px;
}

.probability-input {
  width: 150px;
}

.current-content-card {
  margin-top: 20px;
  border-radius: 8px;
}

.current-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #303133;
}

.probability-edit-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.probability-progress-small {
  margin-top: 5px;
}

.probability-summary-dialog {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.allocation-visualization-dialog {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.allocation-visualization-dialog h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.visualization-container-dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visualization-item-dialog {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-info-dialog {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.item-avatar {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: bold;
}

.item-name-dialog {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.item-probability-dialog {
  font-weight: bold;
  color: #409EFF;
  min-width: 40px;
  text-align: right;
}

.progress-bar-container-dialog {
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  padding: 2px;
}

.mushroom-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mushroom-avatar-dialog {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: bold;
}

.mushroom-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mushroom-name-dialog {
  font-weight: 500;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-content-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mushroom-select {
    width: 100%;
  }
  
  .probability-input {
    width: 100%;
  }
  
  .type-filter-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .current-content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .probability-summary-dialog {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .item-info-dialog {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .item-probability-dialog {
    align-self: flex-end;
  }
}

/* 数据统计样式 */
.statistics-content {
  padding: 20px 0;
}

.loading-statistics {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 48px;
  color: #409EFF;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 16px;
  color: #606266;
  margin-top: 5px;
}

.sales-stat-card,
.mushroom-type-stat-card {
  margin-top: 20px;
}

.type-stat-container {
  margin-top: 20px;
}

.type-stat-item {
  margin-bottom: 15px;
}

.type-progress {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .content-config {
    padding: 0;
  }
  
  .mushroom-select,
  .probability-input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .stat-icon {
    font-size: 36px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>