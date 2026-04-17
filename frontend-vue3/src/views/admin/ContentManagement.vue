<template>
  <div class="content-management-container">
    <h1>内容管理</h1>
    
    <!-- 标签页 -->
    <el-tabs
      v-model="activeTab"
      class="content-tabs"
    >
      <el-tab-pane
        label="菌菇资料"
        name="mushroom"
      >
        <div class="tab-content">
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              @click="openMushroomDialog"
            >
              上传菌菇资料
            </el-button>
            <el-input
              v-model="mushroomSearch"
              placeholder="搜索菌菇名称"
              style="width: 300px; margin-left: 20px;"
              prefix-icon="Search"
            />
          </div>
          
          <!-- 菌菇列表 -->
          <div class="content-grid">
            <div 
              v-for="mushroom in filteredMushrooms" 
              :key="mushroom.id" 
              class="content-card"
            >
              <div class="content-image">
                <img
                  :src="mushroom.image || getPlaceholderImage('300')"
                  :alt="mushroom.name"
                  @error="(e) => e.target.src = getPlaceholderImage('300')"
                >
              </div>
              <div class="content-info">
                <h3 class="content-title">
                  {{ mushroom.name }}
                </h3>
                <p class="content-description">
                  {{ mushroom.description }}
                </p>
                <div class="content-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editMushroom(mushroom)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteMushroom(mushroom.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane
        label="菜谱"
        name="recipe"
      >
        <div class="tab-content">
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              @click="openRecipeDialog"
            >
              上传菜谱
            </el-button>
            <el-input
              v-model="recipeSearch"
              placeholder="搜索菜谱名称"
              style="width: 300px; margin-left: 20px;"
              prefix-icon="Search"
            />
          </div>
          
          <!-- 菜谱列表 -->
          <div class="content-grid">
            <div 
              v-for="recipe in filteredRecipes" 
              :key="recipe.id" 
              class="content-card"
            >
              <div class="content-image">
                <img
                  :src="recipe.image || getPlaceholderImage('300')"
                  :alt="recipe.name"
                  @error="(e) => e.target.src = getPlaceholderImage('300')"
                >
              </div>
              <div class="content-info">
                <h3 class="content-title">
                  {{ recipe.name }}
                </h3>
                <p class="content-description">
                  {{ recipe.description }}
                </p>
                <div class="content-meta">
                  <span class="meta-tag">{{ recipe.difficulty }}</span>
                  <span class="meta-tag">{{ recipe.cookTime }}分钟</span>
                </div>
                <div class="content-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editRecipe(recipe)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteRecipe(recipe.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane
        label="烹饪视频"
        name="video"
      >
        <div class="tab-content">
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              @click="openVideoDialog"
            >
              上传烹饪视频
            </el-button>
            <el-input
              v-model="videoSearch"
              placeholder="搜索视频标题"
              style="width: 300px; margin-left: 20px;"
              prefix-icon="Search"
            />
          </div>
          
          <!-- 视频列表 -->
          <div class="content-grid">
            <div 
              v-for="video in filteredVideos" 
              :key="video.id" 
              class="content-card"
            >
              <div class="content-image">
                <img
                  :src="video.thumbnailUrl || getPlaceholderImage('300')"
                  :alt="video.title"
                  @error="(e) => e.target.src = getPlaceholderImage('300')"
                >
              </div>
              <div class="content-info">
                <h3 class="content-title">
                  {{ video.title }}
                </h3>
                <p class="content-description">
                  {{ video.description }}
                </p>
                <div class="content-meta">
                  <span class="meta-tag">{{ formatDuration(video.duration) }}</span>
                  <span class="meta-tag">{{ video.quality }}</span>
                </div>
                <div class="content-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editVideo(video)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteVideo(video.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane
        label="内容审核"
        name="review"
      >
        <div class="tab-content">
          <!-- 审核列表 -->
          <div class="review-list">
            <div 
              v-for="item in reviewItems" 
              :key="item.id" 
              class="review-item"
            >
              <div class="review-header">
                <h3>{{ item.title }}</h3>
                <span class="review-status">{{ item.status }}</span>
              </div>
              <p class="review-description">
                {{ item.description }}
              </p>
              <div class="review-actions">
                <el-button
                  type="success"
                  size="small"
                  @click="approveContent(item.id)"
                >
                  批准
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="rejectContent(item.id)"
                >
                  拒绝
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="viewContent(item.id)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 菌菇资料对话框 -->
    <el-dialog
      v-model="mushroomDialogVisible"
      :title="isEditingMushroom ? '编辑菌菇资料' : '上传菌菇资料'"
      width="800px"
    >
      <el-form
        ref="mushroomFormRef"
        :model="mushroomForm"
        :rules="mushroomFormRules"
        label-width="120px"
      >
        <el-form-item
          label="菌菇名称"
          prop="name"
        >
          <el-input
            v-model="mushroomForm.name"
            placeholder="请输入菌菇名称"
          />
        </el-form-item>
        <el-form-item
          label="学名"
          prop="scientificName"
        >
          <el-input
            v-model="mushroomForm.scientificName"
            placeholder="请输入学名"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="mushroomForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item
          label="形态特征"
          prop="morphology"
        >
          <el-input
            v-model="mushroomForm.morphology"
            type="textarea"
            :rows="2"
            placeholder="请输入形态特征"
          />
        </el-form-item>
        <el-form-item
          label="生长环境"
          prop="growthEnvironment"
        >
          <el-input
            v-model="mushroomForm.growthEnvironment"
            type="textarea"
            :rows="2"
            placeholder="请输入生长环境"
          />
        </el-form-item>
        <el-form-item
          label="营养价值"
          prop="nutritionalValue"
        >
          <el-input
            v-model="mushroomForm.nutritionalValue"
            type="textarea"
            :rows="2"
            placeholder="请输入营养价值（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="食用安全性"
          prop="safetyInfo"
        >
          <el-input
            v-model="mushroomForm.safetyInfo"
            type="textarea"
            :rows="2"
            placeholder="请输入食用安全性"
          />
        </el-form-item>
        <el-form-item
          label="适宜的烹饪方法"
          prop="cookingMethods"
        >
          <el-input
            v-model="mushroomForm.cookingMethods"
            placeholder="请输入适宜的烹饪方法"
          />
        </el-form-item>
        <el-form-item
          label="选购建议"
          prop="selectionTips"
        >
          <el-input
            v-model="mushroomForm.selectionTips"
            type="textarea"
            :rows="2"
            placeholder="请输入选购建议"
          />
        </el-form-item>
        <el-form-item
          label="生长季节"
          prop="season"
        >
          <el-input
            v-model="mushroomForm.season"
            placeholder="请输入生长季节，如：春季,秋季"
          />
        </el-form-item>
        <el-form-item
          label="培育指南"
          prop="cultivationGuide"
        >
          <el-input
            v-model="mushroomForm.cultivationGuide"
            type="textarea"
            :rows="2"
            placeholder="请输入培育指南"
          />
        </el-form-item>
        <el-form-item
          label="培育难度"
          prop="cultivationDifficulty"
        >
          <el-select
            v-model="mushroomForm.cultivationDifficulty"
            placeholder="请选择培育难度"
          >
            <el-option
              label="简单"
              value="easy"
            />
            <el-option
              label="中等"
              value="medium"
            />
            <el-option
              label="困难"
              value="hard"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="分类"
          prop="category"
        >
          <el-input
            v-model="mushroomForm.category"
            placeholder="请输入分类，如：食用菇、药用菇"
          />
        </el-form-item>
        <el-form-item
          label="产地信息"
          prop="originInfo"
        >
          <el-input
            v-model="mushroomForm.originInfo"
            type="textarea"
            :rows="2"
            placeholder="请输入产地信息（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="保存方法"
          prop="storageMethods"
        >
          <el-input
            v-model="mushroomForm.storageMethods"
            type="textarea"
            :rows="2"
            placeholder="请输入保存方法"
          />
        </el-form-item>
        <el-form-item
          label="功效与作用"
          prop="healthBenefits"
        >
          <el-input
            v-model="mushroomForm.healthBenefits"
            type="textarea"
            :rows="2"
            placeholder="请输入功效与作用"
          />
        </el-form-item>
        <el-form-item
          label="历史文化"
          prop="culturalInfo"
        >
          <el-input
            v-model="mushroomForm.culturalInfo"
            type="textarea"
            :rows="2"
            placeholder="请输入历史文化"
          />
        </el-form-item>
        <el-form-item
          label="市场信息"
          prop="marketInfo"
        >
          <el-input
            v-model="mushroomForm.marketInfo"
            type="textarea"
            :rows="2"
            placeholder="请输入市场信息（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="数据来源"
          prop="dataSource"
        >
          <el-input
            v-model="mushroomForm.dataSource"
            placeholder="请输入数据来源"
          />
        </el-form-item>
        <el-form-item
          label="图片URL"
          prop="image"
        >
          <el-input
            v-model="mushroomForm.image"
            placeholder="请输入图片URL"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="mushroomDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitMushroomForm"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 菜谱对话框 -->
    <el-dialog
      v-model="recipeDialogVisible"
      :title="isEditingRecipe ? '编辑菜谱' : '上传菜谱'"
      width="800px"
    >
      <el-form
        ref="recipeFormRef"
        :model="recipeForm"
        :rules="recipeFormRules"
        label-width="120px"
      >
        <el-form-item
          label="菜谱名称"
          prop="name"
        >
          <el-input
            v-model="recipeForm.name"
            placeholder="请输入菜谱名称"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="recipeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item
          label="烹饪难度"
          prop="difficulty"
        >
          <el-select
            v-model="recipeForm.difficulty"
            placeholder="请选择烹饪难度"
          >
            <el-option
              label="初级"
              value="beginner"
            />
            <el-option
              label="中级"
              value="intermediate"
            />
            <el-option
              label="高级"
              value="advanced"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="准备时间"
          prop="prepTime"
        >
          <el-input
            v-model.number="recipeForm.prepTime"
            type="number"
            placeholder="请输入准备时间（分钟）"
          />
        </el-form-item>
        <el-form-item
          label="烹饪时间"
          prop="cookTime"
        >
          <el-input
            v-model.number="recipeForm.cookTime"
            type="number"
            placeholder="请输入烹饪时间（分钟）"
          />
        </el-form-item>
        <el-form-item
          label="份量"
          prop="servings"
        >
          <el-input
            v-model.number="recipeForm.servings"
            type="number"
            placeholder="请输入份量"
          />
        </el-form-item>
        <el-form-item
          label="图片URL"
          prop="image"
        >
          <el-input
            v-model="recipeForm.image"
            placeholder="请输入图片URL"
          />
        </el-form-item>
        <el-form-item
          label="视频URL"
          prop="videoUrl"
        >
          <el-input
            v-model="recipeForm.videoUrl"
            placeholder="请输入视频URL"
          />
        </el-form-item>
        <el-form-item
          label="营养成分"
          prop="nutritionalAnalysis"
        >
          <el-input
            v-model="recipeForm.nutritionalAnalysis"
            type="textarea"
            :rows="2"
            placeholder="请输入营养成分（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="适用人群"
          prop="suitableFor"
        >
          <el-input
            v-model="recipeForm.suitableFor"
            type="textarea"
            :rows="2"
            placeholder="请输入适用人群（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="口味特点"
          prop="flavorProfile"
        >
          <el-input
            v-model="recipeForm.flavorProfile"
            type="textarea"
            :rows="2"
            placeholder="请输入口味特点（JSON格式）"
          />
        </el-form-item>
        <el-form-item
          label="菜系类型"
          prop="cuisineType"
        >
          <el-input
            v-model="recipeForm.cuisineType"
            placeholder="请输入菜系类型"
          />
        </el-form-item>
        <el-form-item
          label="餐点类型"
          prop="mealType"
        >
          <el-input
            v-model="recipeForm.mealType"
            placeholder="请输入餐点类型"
          />
        </el-form-item>
        <el-form-item
          label="蘑菇数量"
          prop="mushroomCount"
        >
          <el-input
            v-model.number="recipeForm.mushroomCount"
            type="number"
            placeholder="请输入蘑菇数量"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recipeDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitRecipeForm"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 烹饪视频对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="isEditingVideo ? '编辑烹饪视频' : '上传烹饪视频'"
      width="800px"
    >
      <el-form
        ref="videoFormRef"
        :model="videoForm"
        :rules="videoFormRules"
        label-width="120px"
      >
        <el-form-item
          label="视频标题"
          prop="title"
        >
          <el-input
            v-model="videoForm.title"
            placeholder="请输入视频标题"
          />
        </el-form-item>
        <el-form-item
          label="视频描述"
          prop="description"
        >
          <el-input
            v-model="videoForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入视频描述"
          />
        </el-form-item>
        <el-form-item
          label="视频URL"
          prop="videoUrl"
        >
          <el-input
            v-model="videoForm.videoUrl"
            placeholder="请输入视频URL"
          />
        </el-form-item>
        <el-form-item
          label="缩略图URL"
          prop="thumbnailUrl"
        >
          <el-input
            v-model="videoForm.thumbnailUrl"
            placeholder="请输入缩略图URL"
          />
        </el-form-item>
        <el-form-item
          label="视频时长"
          prop="duration"
        >
          <el-input
            v-model.number="videoForm.duration"
            type="number"
            placeholder="请输入视频时长（秒）"
          />
        </el-form-item>
        <el-form-item
          label="关联菜谱ID"
          prop="recipeId"
        >
          <el-input
            v-model.number="videoForm.recipeId"
            type="number"
            placeholder="请输入关联菜谱ID"
          />
        </el-form-item>
        <el-form-item
          label="关联菌菇ID"
          prop="mushroomId"
        >
          <el-input
            v-model.number="videoForm.mushroomId"
            type="number"
            placeholder="请输入关联菌菇ID"
          />
        </el-form-item>
        <el-form-item
          label="视频质量"
          prop="quality"
        >
          <el-select
            v-model="videoForm.quality"
            placeholder="请选择视频质量"
          >
            <el-option
              label="高清"
              value="hd"
            />
            <el-option
              label="标清"
              value="sd"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="视频来源"
          prop="source"
        >
          <el-input
            v-model="videoForm.source"
            placeholder="请输入视频来源"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitVideoForm"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 盲盒对话框 -->
    <el-dialog
      v-model="boxDialogVisible"
      :title="isEditingBox ? '编辑盲盒' : '新增盲盒'"
      width="800px"
    >
      <el-form
        ref="boxFormRef"
        :model="boxForm"
        label-width="120px"
      >
        <el-form-item
          label="盲盒名称"
          prop="name"
        >
          <el-input
            v-model="boxForm.name"
            placeholder="请输入盲盒名称"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="boxForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入盲盒描述"
          />
        </el-form-item>
        <el-form-item
          label="价格"
          prop="price"
        >
          <el-input-number
            v-model="boxForm.price"
            :min="0"
            :step="0.1"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item
          label="季节"
          prop="season"
        >
          <el-select
            v-model="boxForm.season"
            placeholder="请选择季节"
          >
            <el-option
              label="春季"
              value="春"
            />
            <el-option
              label="夏季"
              value="夏"
            />
            <el-option
              label="秋季"
              value="秋"
            />
            <el-option
              label="冬季"
              value="冬"
            />
            <el-option
              label="全年"
              value="全年"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片"
          prop="image"
        >
          <el-input
            v-model="boxForm.image"
            placeholder="请输入图片URL"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="boxForm.status"
            placeholder="请选择状态"
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="boxDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitBoxForm"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'
import { getPlaceholderImage } from '../../utils/imageUtils'

// 标签页
const activeTab = ref('mushroom')

// 搜索
const mushroomSearch = ref('')
const recipeSearch = ref('')
const videoSearch = ref('')

// 对话框
const mushroomDialogVisible = ref(false)
const recipeDialogVisible = ref(false)
const videoDialogVisible = ref(false)

// 编辑状态
const isEditingMushroom = ref(false)
const isEditingRecipe = ref(false)
const isEditingVideo = ref(false)

// 表单引用
const mushroomFormRef = ref(null)
const recipeFormRef = ref(null)
const videoFormRef = ref(null)

// 加载状态
const loadingVideos = ref(false)

// 表单数据
const mushroomForm = ref({
  name: '',
  scientificName: '',
  description: '',
  morphology: '',
  growthEnvironment: '',
  nutritionalValue: '',
  safetyInfo: '',
  cookingMethods: '',
  selectionTips: '',
  season: '',
  cultivationGuide: '',
  cultivationDifficulty: 'easy',
  category: '',
  originInfo: '',
  storageMethods: '',
  healthBenefits: '',
  culturalInfo: '',
  marketInfo: '',
  dataSource: '',
  image: ''
})

const recipeForm = ref({
  name: '',
  description: '',
  difficulty: 'beginner',
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  image: '',
  videoUrl: '',
  nutritionalAnalysis: '',
  suitableFor: '',
  flavorProfile: '',
  cuisineType: '',
  mealType: '',
  mushroomCount: 0
})

const videoForm = ref({
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  duration: 0,
  recipeId: null,
  mushroomId: null,
  quality: 'hd',
  source: ''
})

// 表单验证规则
const mushroomFormRules = {
  name: [{ required: true, message: '请输入菌菇名称', trigger: 'blur' }],
  scientificName: [{ required: true, message: '请输入学名', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

const recipeFormRules = {
  name: [{ required: true, message: '请输入菜谱名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择烹饪难度', trigger: 'change' }],
  prepTime: [{ required: true, message: '请输入准备时间', trigger: 'blur' }],
  cookTime: [{ required: true, message: '请输入烹饪时间', trigger: 'blur' }],
  servings: [{ required: true, message: '请输入份量', trigger: 'blur' }]
}

const videoFormRules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入视频描述', trigger: 'blur' }],
  videoUrl: [{ required: true, message: '请输入视频URL', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入视频时长', trigger: 'blur' }]
}

// 模拟数据（保留其他数据暂用模拟数据）
const mushrooms = ref([
  {
    id: 1,
    name: '香菇',
    scientificName: 'Lentinula edodes',
    description: '香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',
    image: 'https://example.com/mushrooms/xianggu.jpg'
  },
  {
    id: 2,
    name: '平菇',
    scientificName: 'Pleurotus ostreatus',
    description: '平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',
    image: 'https://example.com/mushrooms/pinggu.jpg'
  }
])

const recipes = ref([
  {
    id: 1,
    name: '香菇炖鸡',
    description: '经典的香菇炖鸡，味道鲜美，营养丰富。',
    difficulty: 'intermediate',
    cookTime: 60
  },
  {
    id: 2,
    name: '平菇炒肉',
    description: '简单美味的平菇炒肉，家常必备。',
    difficulty: 'beginner',
    cookTime: 20
  }
])

// 视频数据使用真实API
const videos = ref([])

const reviewItems = ref([
  {
    id: 1,
    title: '新上传的香菇资料',
    description: '包含香菇的详细信息，如形态特征、生长环境、营养价值等。',
    status: '待审核'
  },
  {
    id: 2,
    title: '新上传的香菇炖鸡菜谱',
    description: '详细的香菇炖鸡制作步骤和技巧。',
    status: '待审核'
  }
])

// 过滤后的数据
const filteredMushrooms = computed(() => {
  if (!mushroomSearch.value) return mushrooms.value
  return mushrooms.value.filter(mushroom => 
    mushroom.name.toLowerCase().includes(mushroomSearch.value.toLowerCase())
  )
})

const filteredRecipes = computed(() => {
  if (!recipeSearch.value) return recipes.value
  return recipes.value.filter(recipe => 
    recipe.name.toLowerCase().includes(recipeSearch.value.toLowerCase())
  )
})

const filteredVideos = computed(() => {
  if (!videoSearch.value) return videos.value
  return videos.value.filter(video => 
    video.title.toLowerCase().includes(videoSearch.value.toLowerCase())
  )
})

// 格式化时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 加载视频列表
const loadVideos = async () => {
  loadingVideos.value = true
  try {
    const response = await api.get('/cooking-videos', {
      params: {
        page: 1,
        limit: 100
      }
    })
    videos.value = response.data?.videos || []
    console.log('加载视频成功，共', videos.value.length, '个视频')
  } catch (error) {
    console.error('加载视频失败:', error)
    ElMessage.error('加载视频失败，请稍后重试')
  } finally {
    loadingVideos.value = false
  }
}

// 打开菌菇资料对话框
const openMushroomDialog = () => {
  isEditingMushroom.value = false
  mushroomForm.value = {
    name: '',
    scientificName: '',
    description: '',
    morphology: '',
    growthEnvironment: '',
    nutritionalValue: '',
    safetyInfo: '',
    cookingMethods: '',
    selectionTips: '',
    season: '',
    cultivationGuide: '',
    cultivationDifficulty: 'easy',
    category: '',
    originInfo: '',
    storageMethods: '',
    healthBenefits: '',
    culturalInfo: '',
    marketInfo: '',
    dataSource: '',
    image: ''
  }
  mushroomDialogVisible.value = true
}

// 编辑菌菇资料
const editMushroom = (mushroom) => {
  isEditingMushroom.value = true
  mushroomForm.value = { ...mushroom }
  mushroomDialogVisible.value = true
}

// 提交菌菇资料表单
const submitMushroomForm = async () => {
  if (!mushroomFormRef.value) return
  
  try {
    await mushroomFormRef.value.validate()
    
    // 模拟提交
    if (isEditingMushroom.value) {
      const index = mushrooms.value.findIndex(m => m.id === mushroomForm.value.id)
      if (index !== -1) {
        mushrooms.value[index] = { ...mushroomForm.value }
      }
      ElMessage.success('菌菇资料更新成功')
    } else {
      const newMushroom = {
        ...mushroomForm.value,
        id: mushrooms.value.length + 1
      }
      mushrooms.value.push(newMushroom)
      ElMessage.success('菌菇资料上传成功')
    }
    
    mushroomDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写')
  }
}

// 删除菌菇资料
const deleteMushroom = (id) => {
  ElMessageBox.confirm('确定要删除这个菌菇资料吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mushrooms.value.findIndex(m => m.id === id)
    if (index !== -1) {
      mushrooms.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 打开菜谱对话框
const openRecipeDialog = () => {
  isEditingRecipe.value = false
  recipeForm.value = {
    name: '',
    description: '',
    difficulty: 'beginner',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    image: '',
    videoUrl: '',
    nutritionalAnalysis: '',
    suitableFor: '',
    flavorProfile: '',
    cuisineType: '',
    mealType: '',
    mushroomCount: 0
  }
  recipeDialogVisible.value = true
}

// 编辑菜谱
const editRecipe = (recipe) => {
  isEditingRecipe.value = true
  recipeForm.value = { ...recipe }
  recipeDialogVisible.value = true
}

// 提交菜谱表单
const submitRecipeForm = async () => {
  if (!recipeFormRef.value) return
  
  try {
    await recipeFormRef.value.validate()
    
    // 模拟提交
    if (isEditingRecipe.value) {
      const index = recipes.value.findIndex(r => r.id === recipeForm.value.id)
      if (index !== -1) {
        recipes.value[index] = { ...recipeForm.value }
      }
      ElMessage.success('菜谱更新成功')
    } else {
      const newRecipe = {
        ...recipeForm.value,
        id: recipes.value.length + 1
      }
      recipes.value.push(newRecipe)
      ElMessage.success('菜谱上传成功')
    }
    
    recipeDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写')
  }
}

// 删除菜谱
const deleteRecipe = (id) => {
  ElMessageBox.confirm('确定要删除这个菜谱吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = recipes.value.findIndex(r => r.id === id)
    if (index !== -1) {
      recipes.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 打开视频对话框 - 跳转到专业的视频管理页面
const openVideoDialog = () => {
  ElMessage.info('请使用专业的视频管理页面进行操作')
  // 可以选择在这里跳转到 /admin/videos
  window.location.href = '/admin/videos'
}

// 编辑视频 - 跳转到专业的视频管理页面
const editVideo = (video) => {
  ElMessage.info('请使用专业的视频管理页面进行操作')
  window.location.href = '/admin/videos'
}

// 提交视频表单 - 不做任何事情
const submitVideoForm = async () => {
  ElMessage.info('请使用专业的视频管理页面进行操作')
  videoDialogVisible.value = false
}

// 删除视频 - 跳转到专业的视频管理页面
const deleteVideo = (id) => {
  ElMessage.info('请使用专业的视频管理页面进行操作')
  window.location.href = '/admin/videos'
}

// 批准内容
const approveContent = (id) => {
  const index = reviewItems.value.findIndex(item => item.id === id)
  if (index !== -1) {
    reviewItems.value[index].status = '已批准'
    ElMessage.success('内容已批准')
  }
}

// 拒绝内容
const rejectContent = (id) => {
  const index = reviewItems.value.findIndex(item => item.id === id)
  if (index !== -1) {
    reviewItems.value[index].status = '已拒绝'
    ElMessage.success('内容已拒绝')
  }
}

// 查看内容详情
const viewContent = (id) => {
  ElMessage.info('查看内容详情功能开发中')
}

// 组件挂载
onMounted(() => {
  console.log('ContentManagement component mounted')
  // 加载真实视频数据
  loadVideos()
})
</script>

<style scoped>
.content-management-container {
  padding: 20px;
}

.content-management-container h1 {
  margin-bottom: 30px;
  color: #333;
}

.content-tabs {
  margin-bottom: 30px;
}

.tab-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.action-buttons {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.content-card {
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.content-image {
  height: 200px;
  overflow: hidden;
}

.content-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .content-image img {
  transform: scale(1.05);
}

.content-info {
  padding: 20px;
}

.content-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.content-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.meta-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.content-actions {
  display: flex;
  gap: 10px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.review-status {
  background: #ffc107;
  color: #333;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.review-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>