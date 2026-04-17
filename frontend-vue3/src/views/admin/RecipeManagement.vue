<template>
  <div class="recipe-management">
    <h1>食谱管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon> 新增食谱
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
        v-if="selectedRecipes.length > 0"
        class="batch-actions-bar"
      >
        <div class="selected-info">
          <el-tag
            type="info"
            size="large"
            class="selected-count-tag"
          >
            <el-icon><Tickets /></el-icon>
            已选择 <strong>{{ selectedRecipes.length }}</strong> 项
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
            @click="batchDeleteRecipes"
          >
            <el-icon><DeleteFilled /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 高级筛选栏 -->
    <div class="filter-bar">
      <el-form
        :inline="true"
        :model="filterForm"
        class="filter-form"
      >
        <el-form-item label="难度">
          <el-select
            v-model="filterForm.difficulty"
            placeholder="全部难度"
            clearable
            @change="loadRecipes"
          >
            <el-option
              label="简单"
              value="beginner"
            />
            <el-option
              label="中等"
              value="intermediate"
            />
            <el-option
              label="困难"
              value="advanced"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            @change="loadRecipes"
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
        </el-form-item>
        <el-form-item label="菜系">
          <el-select
            v-model="filterForm.cuisine"
            placeholder="全部菜系"
            clearable
            @change="loadRecipes"
          >
            <el-option
              v-for="option in CUISINE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="resetFilters"
          >
            <el-icon><Refresh /></el-icon> 重置筛选
          </el-button>
        </el-form-item>
      </el-form>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索食谱名称或描述"
          clearable
          class="search-input"
          @keyup.enter="loadRecipes"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 食谱列表 -->
    <el-card
      shadow="hover"
      class="recipes-card"
    >
      <template #header>
        <div class="card-header">
          <span>食谱列表</span>
          <span class="total-count">共 {{ total }} 个食谱</span>
        </div>
      </template>
      
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="recipes"
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
          label="食谱名称"
          min-width="200"
        >
          <template #default="scope">
            <div class="recipe-name">
              <img
                :key="`${scope.row.id}-${imageRefreshKey}`"
                :src="getImageUrl(scope.row.image, imageRefreshKey > 0)"
                alt="食谱图片"
                class="recipe-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="difficulty"
          label="难度"
          width="100"
        >
          <template #default="scope">
            {{ getDifficultyText(scope.row.difficulty) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalTime"
          label="烹饪时间"
          width="120"
        >
          <template #default="scope">
            {{ formatCookTime(scope.row.totalTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="cuisine"
          label="菜系"
          width="100"
        />
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
          width="180"
          fixed="right"
        >
          <template #default="scope">
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
              @click="deleteRecipe(scope.row.id)"
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
    
    <!-- 新增/编辑食谱对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑食谱' : '新增食谱'"
      width="70%"
    >
      <el-form
        ref="recipeForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="recipe-form"
      >
        <el-form-item
          label="食谱名称"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入食谱名称"
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
            placeholder="请输入食谱描述"
          />
        </el-form-item>
        
        <el-form-item
          label="难度"
          prop="difficulty"
        >
          <el-select
            v-model="form.difficulty"
            placeholder="请选择难度"
          >
            <el-option
              label="简单"
              value="beginner"
            />
            <el-option
              label="中等"
              value="intermediate"
            />
            <el-option
              label="困难"
              value="advanced"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="烹饪时间"
          prop="totalTime"
        >
          <el-input-number
            v-model="form.totalTime"
            :min="1"
            :max="360"
            :step="5"
            placeholder="请输入烹饪时间（分钟）"
          />
        </el-form-item>
        
        <el-form-item
          label="食材"
          prop="ingredients"
        >
          <div class="ingredients-container">
            <div 
              v-for="(ingredient, index) in form.ingredients" 
              :key="index"
              class="ingredient-item"
            >
              <el-input
                v-model="ingredient.name"
                placeholder="食材名称"
                style="width: 200px; margin-right: 10px;"
              />
              <el-input-number
                v-model="ingredient.quantity"
                :min="0"
                :step="0.1"
                placeholder="数量"
                style="width: 120px; margin-right: 10px;"
              />
              <el-input
                v-model="ingredient.unit"
                placeholder="单位"
                style="width: 100px; margin-right: 10px;"
              />
              <el-button
                type="danger"
                size="small"
                @click="removeIngredient(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button
              type="primary"
              size="small"
              style="margin-top: 10px;"
              @click="addIngredient"
            >
              <el-icon><Plus /></el-icon> 添加食材
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item
          label="口味"
          prop="flavorProfile"
        >
          <el-select
            v-model="form.flavorProfile"
            placeholder="请选择口味"
            class="flavor-select"
          >
            <el-option
              v-for="option in FLAVOR_PROFILE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div
            v-if="form.flavorProfile === '其他'"
            class="custom-input-container"
          >
            <el-input
              v-model="customFlavor"
              placeholder="请输入具体口味（例如：甜辣）"
              class="custom-input"
              @input="updateCustomFlavor"
            />
          </div>
        </el-form-item>
        
        <el-form-item
          label="菜系"
          prop="cuisine"
        >
          <el-select
            v-model="form.cuisine"
            placeholder="请选择菜系"
            class="cuisine-select"
          >
            <el-option
              v-for="option in CUISINE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div
            v-if="form.cuisine === '其他'"
            class="custom-input-container"
          >
            <el-input
              v-model="customCuisine"
              placeholder="请输入具体菜系（例如：川菜）"
              class="custom-input"
              @input="updateCustomCuisine"
            />
          </div>
        </el-form-item>
        
        <el-form-item
          label="图片"
          prop="image"
        >
          <el-upload
            v-model:file-list="imageFileList"
            class="recipe-upload"
            :action="uploadUrl"
            :on-success="handleImageUpload"
            :on-error="handleUploadError"
            :limit="1"
            list-type="picture-card"
            accept="image/*"
            name="files"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon> 上传图片（可选）
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传JPG、PNG格式的图片，大小不超过5MB（可选）
              </div>
            </template>
          </el-upload>
          <el-input
            v-model="form.image"
            placeholder="或输入图片URL（可选）"
            class="image-url-input"
          />
        </el-form-item>
        
        <el-form-item
          label="烹饪步骤"
          prop="steps"
        >
          <div class="steps-container">
            <div 
              v-for="(step, index) in form.steps" 
              :key="index"
              class="step-item"
            >
              <div class="step-header">
                <span class="step-number">步骤 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeStep(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-input
                v-model="step.description"
                type="textarea"
                rows="3"
                placeholder="请输入步骤描述"
                style="margin-top: 10px;"
              />
              <el-input
                v-model="step.image"
                placeholder="步骤图片URL（可选）"
                style="margin-top: 5px;"
              />
            </div>
            <el-button
              type="primary"
              size="small"
              style="margin-top: 10px;"
              @click="addStep"
            >
              <el-icon><Plus /></el-icon> 添加步骤
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item
          label="营养信息"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="蛋白质"
                prop="nutritionalInfo.protein"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.protein"
                  :min="0"
                  :step="0.1"
                  placeholder="蛋白质（g）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="脂肪"
                prop="nutritionalInfo.fat"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.fat"
                  :min="0"
                  :step="0.1"
                  placeholder="脂肪（g）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="碳水化合物"
                prop="nutritionalInfo.carbs"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.carbs"
                  :min="0"
                  :step="0.1"
                  placeholder="碳水化合物（g）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="纤维"
                prop="nutritionalInfo.fiber"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.fiber"
                  :min="0"
                  :step="0.1"
                  placeholder="纤维（g）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="卡路里"
                prop="nutritionalInfo.calories"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.calories"
                  :min="0"
                  :step="1"
                  placeholder="卡路里（千卡）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="钠"
                prop="nutritionalInfo.sodium"
              >
                <el-input-number
                  v-model="form.nutritionalInfo.sodium"
                  :min="0"
                  :step="1"
                  placeholder="钠（mg）"
                />
              </el-form-item>
            </el-col>
          </el-row>
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
            :loading="loading"
            @click="saveRecipe"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 数据统计对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="食谱数据统计"
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
                    <Document />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.recipeCounts.total }}
                    </div>
                    <div class="stat-label">
                      总食谱数
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
                      {{ statistics.recipeCounts.active }}
                    </div>
                    <div class="stat-label">
                      启用食谱
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
                      {{ statistics.recipeCounts.inactive }}
                    </div>
                    <div class="stat-label">
                      禁用食谱
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
                    <Food />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.ingredientStats?.totalIngredients || 0 }}
                    </div>
                    <div class="stat-label">
                      总食材数
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 食材步骤汇总 -->
          <el-card
            shadow="hover"
            class="ingredient-summary-card"
          >
            <template #header>
              <div class="card-header">
                <span>食材步骤汇总</span>
                <el-tag
                  type="info"
                  size="small"
                >
                  更新时间: {{ new Date(statistics.lastUpdated).toLocaleString() }}
                </el-tag>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">
                    总食材数
                  </div>
                  <div class="summary-value">
                    {{ statistics.ingredientStats?.totalIngredients || 0 }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">
                    总步骤数
                  </div>
                  <div class="summary-value">
                    {{ statistics.ingredientStats?.totalSteps || 0 }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">
                    平均每食谱食材
                  </div>
                  <div class="summary-value">
                    {{ statistics.ingredientStats?.avgIngredientsPerRecipe || 0 }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">
                    平均每食谱步骤
                  </div>
                  <div class="summary-value">
                    {{ statistics.ingredientStats?.avgStepsPerRecipe || 0 }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
          
          <!-- 难度分布 -->
          <el-card
            shadow="hover"
            class="difficulty-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>难度分布</span>
              </div>
            </template>
            <div class="difficulty-stat-container">
              <div
                v-for="(count, difficulty) in statistics.difficultyDistribution"
                :key="difficulty"
                class="difficulty-stat-item"
              >
                <div class="difficulty-info">
                  <span class="difficulty-name">{{ getDifficultyText(difficulty) }}</span>
                  <span class="difficulty-count">{{ parseInt(count || 0) }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.recipeCounts.total > 0 ? (parseInt(count || 0) / statistics.recipeCounts.total) * 100 : 0" 
                  :color="getProgressColor(Object.keys(statistics.difficultyDistribution).indexOf(difficulty))"
                  :stroke-width="12"
                  class="difficulty-progress"
                />
              </div>
              <div
                v-if="Object.keys(statistics.difficultyDistribution).length === 0"
                class="no-data"
              >
                暂无难度数据
              </div>
            </div>
          </el-card>
          
          <!-- 菜系分布 -->
          <el-card
            shadow="hover"
            class="cuisine-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>菜系分布</span>
              </div>
            </template>
            <div class="cuisine-stat-container">
              <div
                v-for="(count, cuisine) in statistics.cuisineDistribution"
                :key="cuisine"
                class="cuisine-stat-item"
              >
                <div class="cuisine-info">
                  <span class="cuisine-name">{{ cuisine }}</span>
                  <span class="cuisine-count">{{ parseInt(count || 0) }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.recipeCounts.total > 0 ? (parseInt(count || 0) / statistics.recipeCounts.total) * 100 : 0" 
                  :color="getProgressColor(Object.keys(statistics.cuisineDistribution).indexOf(cuisine))"
                  :stroke-width="12"
                  class="cuisine-progress"
                />
              </div>
              <div
                v-if="Object.keys(statistics.cuisineDistribution).length === 0"
                class="no-data"
              >
                暂无菜系数据
              </div>
            </div>
          </el-card>
          
          <!-- 口味分布 -->
          <el-card
            shadow="hover"
            class="flavor-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>口味分布</span>
              </div>
            </template>
            <div class="flavor-stat-container">
              <div
                v-for="(count, flavor) in statistics.flavorDistribution"
                :key="flavor"
                class="flavor-stat-item"
              >
                <div class="flavor-info">
                  <span class="flavor-name">{{ flavor }}</span>
                  <span class="flavor-count">{{ parseInt(count || 0) }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.recipeCounts.total > 0 ? (parseInt(count || 0) / statistics.recipeCounts.total) * 100 : 0" 
                  :color="getProgressColor(Object.keys(statistics.flavorDistribution).indexOf(flavor))"
                  :stroke-width="12"
                  class="flavor-progress"
                />
              </div>
              <div
                v-if="Object.keys(statistics.flavorDistribution).length === 0"
                class="no-data"
              >
                暂无口味数据
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Plus, Search, Edit, Delete, Upload, Check, Close, Refresh, Tickets, RefreshLeft, CircleCheck, CircleClose, DeleteFilled, DataAnalysis, Download, Document, Food } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRecipeStore } from '../../stores/useRecipeStore'
import { processIngredients, processCustomOption, buildCustomOption } from '../../utils/recipeUtils'
import api from '../../api'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL, getUploadUrl } from '../../utils/imageUtils'
import {
  DIFFICULTY_OPTIONS,
  CUISINE_OPTIONS,
  FLAVOR_PROFILE_OPTIONS,
  getDifficultyText
} from '../../utils/recipeOptions'

const recipeStore = useRecipeStore()
const recipes = ref([])
const loading = computed(() => recipeStore.loading)
const total = computed(() => recipeStore.total)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedRecipes = ref([])
const batchLoading = ref(false)
const tableRef = ref(null)
const imageRefreshKey = ref(0)

const canBatchOperate = computed(() => {
  return selectedRecipes.value && selectedRecipes.value.length > 0 && !batchLoading.value
})

// 数据统计相关
const statisticsDialogVisible = ref(false)
const loadingStatistics = ref(false)
const statistics = ref({
  recipeCounts: {
    total: 0,
    active: 0,
    inactive: 0
  },
  difficultyDistribution: {},
  cuisineDistribution: {},
  flavorDistribution: {},
  ingredientStats: {
    totalIngredients: 0,
    totalSteps: 0,
    avgIngredientsPerRecipe: 0,
    avgStepsPerRecipe: 0
  },
  lastUpdated: new Date().toISOString()
})

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#00CED1', '#FF69B4', '#9370DB']
  return colors[index % colors.length]
}

// 格式化烹饪时间显示
const formatCookTime = (minutes) => {
  if (!minutes || minutes <= 0) {
    return '未知'
  }
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} 小时`
  }
  return `${hours} 小时 ${mins} 分钟`
}

// 打开统计对话框
const openStatisticsDialog = async () => {
  statisticsDialogVisible.value = true
  await loadStatistics()
}

// 加载统计数据
const loadStatistics = async () => {
  loadingStatistics.value = true
  try {
    const response = await api.get('/recipes/statistics')
    if (response.success && response.data) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败，请稍后重试')
  } finally {
    loadingStatistics.value = false
  }
}

// 刷新统计数据
const refreshStatistics = async () => {
  await loadStatistics()
  ElMessage.success('统计数据已刷新')
}

const filterForm = reactive({
  difficulty: '',
  status: '',
  cuisine: ''
})

const customFlavor = ref('')
const customCuisine = ref('')

const uploadUrl = getUploadUrl()
const dialogVisible = ref(false)
const isEdit = ref(false)
const recipeForm = ref(null)
const imageFileList = ref([])

// 监听文件列表变化
watch(imageFileList, (newList) => {
  form.image = newList.map(file => file?.url ?? '').filter(url => url)[0] || ''
}, { deep: true })

const form = reactive({
  name: '',
  description: '',
  difficulty: 'beginner',
  totalTime: 30,
  ingredients: [],
  steps: [],
  flavorProfile: '',
  cuisine: '',
  image: '',
  nutritionalInfo: {
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    calories: 0,
    sodium: 0
  },
  status: 'active'
})

const rules = {
  name: [
    { required: true, message: '请输入食谱名称', trigger: 'blur' },
    { min: 2, max: 50, message: '食谱名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入食谱描述', trigger: 'blur' },
    { min: 10, max: 500, message: '食谱描述长度应在10-500个字符之间', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  totalTime: [
    { required: true, message: '请输入烹饪时间', trigger: 'blur' },
    { type: 'number', min: 1, message: '烹饪时间应大于0', trigger: 'blur' }
  ],
  ingredients: [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个食材'))
        } else {
          const hasEmpty = value.some(ing => !ing.name || ing.name.trim() === '')
          if (hasEmpty) {
            callback(new Error('请填写所有食材的名称'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  steps: [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个烹饪步骤'))
        } else {
          const hasEmpty = value.some(step => !step.description || step.description.trim() === '')
          if (hasEmpty) {
            callback(new Error('请填写所有步骤的描述'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  flavorProfile: [
    { required: true, message: '请选择口味', trigger: 'change' }
  ],
  cuisine: [
    { required: true, message: '请选择菜系', trigger: 'change' }
  ],
  image: []
}

const loadRecipes = async () => {
  try {
    await recipeStore.loadRecipes({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value,
      difficulty: filterForm.difficulty,
      status: filterForm.status,
      cuisineType: filterForm.cuisine
    })
    recipes.value = [...recipeStore.recipes]
    console.log('食谱列表已加载:', recipes.value)
  } catch (error) {
    console.error('加载食谱失败:', error)
    ElMessage.error('加载食谱失败，请稍后重试')
  }
}

const resetFilters = () => {
  filterForm.difficulty = ''
  filterForm.status = ''
  filterForm.cuisine = ''
  searchQuery.value = ''
  currentPage.value = 1
  loadRecipes()
}

const addIngredient = () => {
  form.ingredients.push({
    name: '',
    quantity: 1,
    unit: ''
  })
}

const removeIngredient = (index) => {
  form.ingredients.splice(index, 1)
}

const addStep = () => {
  form.steps.push({
    description: '',
    image: ''
  })
}

const removeStep = (index) => {
  form.steps.splice(index, 1)
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    name: '',
    description: '',
    difficulty: 'beginner',
    totalTime: 30,
    ingredients: [{ name: '', quantity: 1, unit: '' }],
    steps: [{ description: '', image: '' }],
    flavorProfile: '',
    cuisine: '',
    image: '',
    nutritionalInfo: {
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      calories: 0,
      sodium: 0
    },
    status: 'active'
  })
  customFlavor.value = ''
  customCuisine.value = ''
  imageFileList.value = []
  dialogVisible.value = true
}

const openEditDialog = async (recipe) => {
  isEdit.value = true
  
  try {
    const fullRecipe = await recipeStore.getRecipeDetail(recipe.id)
    
    if (!fullRecipe) {
      ElMessage.error('获取食谱详情失败')
      return
    }
    
    console.log('获取到的食谱详情:', fullRecipe)
    
    const flavorResult = processCustomOption(fullRecipe.flavorProfile || '')
    const cuisineResult = processCustomOption(fullRecipe.cuisine || fullRecipe.cuisineType || '')
    
    let ingredientsData = []
    if (Array.isArray(fullRecipe.ingredients)) {
      ingredientsData = fullRecipe.ingredients.map(ing => {
        if (typeof ing === 'object' && ing !== null) {
          return {
            name: String(ing.name || ing.ingredientName || ''),
            quantity: Number(ing.quantity) || 1,
            unit: String(ing.unit || '')
          }
        } else if (typeof ing === 'string') {
          return {
            name: ing.trim(),
            quantity: 1,
            unit: ''
          }
        }
        return { name: '', quantity: 1, unit: '' }
      }).filter(ing => ing.name)
    } else if (typeof fullRecipe.ingredients === 'string') {
      ingredientsData = fullRecipe.ingredients.split(',').map(item => ({
        name: item.trim(),
        quantity: 1,
        unit: ''
      })).filter(ing => ing.name)
    }
    
    if (ingredientsData.length === 0) {
      ingredientsData = [{ name: '', quantity: 1, unit: '' }]
    }
    
    let stepsData = []
    if (Array.isArray(fullRecipe.steps)) {
      stepsData = fullRecipe.steps.map(step => {
        if (typeof step === 'object' && step !== null) {
          return {
            description: String(step.description || ''),
            image: String(step.image || step.imageUrl || '')
          }
        } else if (typeof step === 'string') {
          return {
            description: step,
            image: ''
          }
        }
        return { description: '', image: '' }
      }).filter(step => step.description)
    }
    
    if (stepsData.length === 0) {
      stepsData = [{ description: '', image: '' }]
    }
    
    const nutritionalInfo = fullRecipe.nutritionalInfo || fullRecipe.nutritionalAnalysis || {}
    
    Object.assign(form, {
      id: fullRecipe.id,
      name: String(fullRecipe.name || ''),
      description: String(fullRecipe.description || ''),
      difficulty: String(fullRecipe.difficulty || 'beginner'),
      totalTime: Number(fullRecipe.totalTime) || 30,
      flavorProfile: flavorResult.type,
      cuisine: cuisineResult.type,
      image: String(fullRecipe.image || ''),
      status: String(fullRecipe.status || 'active'),
      ingredients: ingredientsData,
      steps: stepsData,
      nutritionalInfo: {
        protein: Number(nutritionalInfo.protein) || 0,
        fat: Number(nutritionalInfo.fat) || 0,
        carbs: Number(nutritionalInfo.carbs) || 0,
        fiber: Number(nutritionalInfo.fiber) || 0,
        calories: Number(nutritionalInfo.calories) || 0,
        sodium: Number(nutritionalInfo.sodium) || 0
      }
    })
    
    customFlavor.value = flavorResult.customValue
    customCuisine.value = cuisineResult.customValue
    
    imageFileList.value = fullRecipe.image ? [{ url: getImageUrl(fullRecipe.image) }] : []
    dialogVisible.value = true
  } catch (error) {
    console.error('打开编辑对话框失败:', error)
    ElMessage.error('获取食谱详情失败，请稍后重试: ' + (error.message || '未知错误'))
  }
}

const saveRecipe = async () => {
  if (!recipeForm.value) return
  
  if (!validateUserPermission()) return
  
  await recipeForm.value.validate(async (valid) => {
    if (valid) {
      try {
        let flavorValue = form.flavorProfile
        if (form.flavorProfile === '其他' && customFlavor.value) {
          flavorValue = buildCustomOption('其他', customFlavor.value)
        }
        
        let cuisineValue = form.cuisine
        if (form.cuisine === '其他' && customCuisine.value) {
          cuisineValue = buildCustomOption('其他', customCuisine.value)
        }
        
        const recipeData = {
          name: form.name,
          description: form.description,
          difficulty: form.difficulty,
          totalTime: form.totalTime,
          prepTime: Math.floor(form.totalTime * 0.3) || 5,
          cookTime: Math.ceil(form.totalTime * 0.7) || 5,
          servings: 2,
          image: form.image,
          videoUrl: null,
          flavorProfile: flavorValue,
          cuisine: cuisineValue,
          cuisineType: cuisineValue,
          nutritionalInfo: form.nutritionalInfo,
          nutritionalAnalysis: form.nutritionalInfo,
          status: form.status,
          ingredients: form.ingredients,
          steps: form.steps
        }
        
        console.log('发送到后端的食谱数据:', recipeData)
        
        let result
        if (isEdit.value) {
          result = await recipeStore.updateRecipe(form.id, recipeData)
        } else {
          result = await recipeStore.createRecipe(recipeData)
        }
        
        if (result) {
          ElMessage.success(isEdit.value ? '食谱更新成功' : '食谱创建成功')
          dialogVisible.value = false
          imageRefreshKey.value++
          
          // 如果是编辑操作，立即更新本地食谱列表，确保封面图片立即更新
          if (isEdit.value && form.id) {
            const recipeIndex = recipes.value.findIndex(recipe => recipe.id === form.id)
            if (recipeIndex !== -1) {
              recipes.value[recipeIndex] = {
                ...recipes.value[recipeIndex],
                ...recipeData
              }
              console.log('本地食谱列表已更新')
            }
          }
          
          // 延迟重新获取食谱列表，确保数据一致性
          setTimeout(async () => {
            await loadRecipes()
          }, 500)
        } else {
          ElMessage.error(isEdit.value ? '食谱更新失败' : '食谱创建失败')
        }
      } catch (error) {
        console.error('保存食谱失败:', error)
        ElMessage.error({
          message: isEdit.value ? '食谱更新失败' : '食谱创建失败',
          duration: 5000,
          showClose: true
        })
        if (error.message) {
          ElMessage.warning({
            message: '错误原因: ' + error.message,
            duration: 5000,
            showClose: true
          })
        }
      }
    }
  })
}

const deleteRecipe = async (id) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return
  }
  
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return
  }
  
  const parsedUserInfo = JSON.parse(userInfo)
  if (parsedUserInfo.role !== 'admin') {
    ElMessage.error('需要管理员权限才能操作')
    return
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    if (Date.now() > exp) {
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return
    }
  } catch (error) {
    console.error('验证token失败:', error)
    ElMessage.error('登录状态异常，请重新登录')
    window.location.href = '/login'
    return
  }
  
  await ElMessageBox.confirm('确定要删除这个食谱吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      console.log('开始删除食谱，ID:', id)
      const result = await recipeStore.deleteRecipe(id)
      console.log('删除食谱结果:', result)
      if (result) {
        ElMessage.success('食谱删除成功')
        loadRecipes()
      } else {
        ElMessage.error('食谱删除失败')
      }
    } catch (error) {
      console.error('删除食谱失败:', error)
      const errorMsg = error.message || '食谱删除失败'
      ElMessage.error({
        message: errorMsg,
        duration: 5000,
        showClose: true
      })
    }
  }).catch(() => {
  })
}

const handleImageUpload = (response, file) => {
  try {
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      // 从响应中获取文件路径，优先使用path，其次使用url
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

const updateCustomFlavor = () => {
  if (form.flavorProfile === '其他') {
    form.flavorProfile = buildCustomOption('其他', customFlavor.value)
  }
}

const updateCustomCuisine = () => {
  if (form.cuisine === '其他') {
    form.cuisine = buildCustomOption('其他', customCuisine.value)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadRecipes()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadRecipes()
}

const validateUserPermission = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return false
  }
  
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return false
  }
  
  const parsedUserInfo = JSON.parse(userInfo)
  if (parsedUserInfo.role !== 'admin') {
    ElMessage.error('需要管理员权限才能操作')
    return false
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    if (Date.now() > exp) {
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return false
    }
  } catch (error) {
    console.error('验证token失败:', error)
    ElMessage.error('登录状态异常，请重新登录')
    window.location.href = '/login'
    return false
  }
  
  return true
}

const batchDeleteRecipes = async () => {
  console.log('批量删除被触发，选中的食谱:', selectedRecipes.value)
  
  if (selectedRecipes.value.length === 0) {
    ElMessage.warning('请先选择要删除的食谱')
    return
  }
  
  if (!validateUserPermission()) return
  
  const recipeListHtml = selectedRecipes.value
    .slice(0, 10)
    .map(recipe => `• ${recipe.name} (ID: ${recipe.id})`)
    .join('<br>')
  
  const moreText = selectedRecipes.value.length > 10 
    ? `<br>...还有 ${selectedRecipes.value.length - 10} 个食谱` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要删除以下 ${selectedRecipes.value.length} 个食谱吗？此操作不可恢复。</strong>
        </div>
        <div style="background-color: #fef0f0; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid #fbc4c4;">
          ${recipeListHtml}${moreText}
        </div>
      `,
      '批量删除确认',
      {
        confirmButtonText: `删除 ${selectedRecipes.value.length} 项`,
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedRecipes.value.map(recipe => Number(recipe.id))
      console.log('准备发送的 ID 列表:', ids)
      
      const result = await recipeStore.batchDeleteRecipes(ids)
      console.log('批量删除结果:', result)
      
      if (result) {
        ElMessage.success({
          message: `✅ 成功删除 ${selectedRecipes.value.length} 个食谱`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadRecipes()
      } else {
        ElMessage.error({
          message: '批量删除失败，请稍后重试',
          duration: 5000,
          showClose: true
        })
      }
    } catch (error) {
      console.error('批量删除食谱失败:', error)
      
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

const batchUpdateStatus = async (status) => {
  console.log(`批量${status === 'active' ? '启用' : '禁用'}被触发，选中的食谱:`, selectedRecipes.value)
  
  if (selectedRecipes.value.length === 0) {
    ElMessage.warning('请先选择要操作的食谱')
    return
  }
  
  if (!validateUserPermission()) return
  
  const action = status === 'active' ? '启用' : '禁用'
  const bgColor = status === 'active' ? '#f0f9ff' : '#fff7ed'
  const borderColor = status === 'active' ? '#b3e5fc' : '#fed7aa'
  
  const recipeListHtml = selectedRecipes.value
    .slice(0, 10)
    .map(recipe => `• ${recipe.name} (ID: ${recipe.id})`)
    .join('<br>')
  
  const moreText = selectedRecipes.value.length > 10 
    ? `<br>...还有 ${selectedRecipes.value.length - 10} 个食谱` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要${action}以下 ${selectedRecipes.value.length} 个食谱吗？</strong>
        </div>
        <div style="background-color: ${bgColor}; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid ${borderColor};">
          ${recipeListHtml}${moreText}
        </div>
      `,
      `批量${action}确认`,
      {
        confirmButtonText: `${action} ${selectedRecipes.value.length} 项`,
        cancelButtonText: '取消',
        type: status === 'active' ? 'success' : 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedRecipes.value.map(recipe => Number(recipe.id))
      console.log('准备发送的 ID 列表:', ids)
      
      const result = await recipeStore.batchUpdateRecipeStatus(ids, status)
      console.log('批量更新结果:', result)
      
      if (result) {
        ElMessage.success({
          message: `✅ 成功${action} ${selectedRecipes.value.length} 个食谱`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadRecipes()
      } else {
        ElMessage.error({
          message: `批量${action}失败，请稍后重试`,
          duration: 5000,
          showClose: true
        })
      }
    } catch (error) {
      console.error(`批量${action}食谱失败:`, error)
      
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

const handleSelectionChange = (selection) => {
  selectedRecipes.value = selection
}

const handleSelectAll = (selection) => {
  console.log('全选触发，选中数量:', selection.length)
}

const toggleSelection = (row) => {
  if (!tableRef.value) return
  tableRef.value.toggleRowSelection(row)
}

const selectAllCurrentPage = () => {
  if (!tableRef.value) return
  recipes.value.forEach(row => {
    tableRef.value.toggleRowSelection(row, true)
  })
}

const clearSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  selectedRecipes.value = []
}

onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
.recipe-management {
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.recipes-card {
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

.recipe-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recipe-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

:deep(.el-table__body tr.is-selected > td) {
  background-color: #e6f7ff !important;
}

:deep(.el-table__body tr.is-selected:hover > td) {
  background-color: #d1edff !important;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.recipe-form {
  max-height: 600px;
  overflow-y: auto;
}

.recipe-upload {
  margin-bottom: 10px;
}

.image-url-input {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ingredients-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.ingredient-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.ingredient-item:last-child {
  margin-bottom: 0;
}

.steps-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.step-item {
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-number {
  font-weight: bold;
  color: #409eff;
}

.flavor-select,
.cuisine-select {
  width: 300px;
}

.custom-input-container {
  margin-top: 10px;
}

.custom-input {
  width: 300px;
}

@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-actions {
    justify-content: center;
    margin-bottom: 10px;
  }
  
  .right-actions {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
  
  .ingredient-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .ingredient-item .el-input,
  .ingredient-item .el-input-number {
    width: 100% !important;
  }
  
  .flavor-select,
  .cuisine-select,
  .custom-input {
    width: 100%;
  }
  
  .recipe-form {
    max-height: 500px;
  }
}

/* 数据统计相关样式 */
.statistics-content {
  max-height: 70vh;
  overflow-y: auto;
}

.loading-statistics {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.stat-icon {
  font-size: 40px;
  color: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.ingredient-summary-card,
.difficulty-stat-card,
.cuisine-stat-card,
.flavor-stat-card {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.difficulty-stat-container,
.cuisine-stat-container,
.flavor-stat-container {
  padding: 10px 0;
}

.difficulty-stat-item,
.cuisine-stat-item,
.flavor-stat-item {
  margin-bottom: 20px;
}

.difficulty-stat-item:last-child,
.cuisine-stat-item:last-child,
.flavor-stat-item:last-child {
  margin-bottom: 0;
}

.difficulty-info,
.cuisine-info,
.flavor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.difficulty-name,
.cuisine-name,
.flavor-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.difficulty-count,
.cuisine-count,
.flavor-count {
  font-size: 14px;
  color: #909399;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 14px;
}
</style>
