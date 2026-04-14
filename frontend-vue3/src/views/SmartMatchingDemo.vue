<template>
  <div class="smart-matching-demo-container">
    <div class="demo-header">
      <h1>智能匹配演示</h1>
      <p class="subtitle">
        体验时令菌菇盲盒与智能食谱匹配的完美结合
      </p>
    </div>

    <div class="demo-content">
      <!-- 功能介绍 -->
      <div class="feature-intro">
        <el-card class="intro-card">
          <template #header>
            <div class="card-header">
              <el-icon><MagicStick /></el-icon>
              <span>核心功能</span>
            </div>
          </template>
          <div class="features-grid">
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Box />
              </el-icon>
              <h3>盲盒内容分析</h3>
              <p>智能识别盲盒中的菌菇种类和特性</p>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <ForkSpoon />
              </el-icon>
              <h3>食谱智能推荐</h3>
              <p>基于用户偏好和盲盒内容精准推荐食谱</p>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <VideoCamera />
              </el-icon>
              <h3>视频个性化推送</h3>
              <p>根据口味偏好自动推送相关烹饪视频</p>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon">
                <Bell />
              </el-icon>
              <h3>定时智能提醒</h3>
              <p>周期性推送季节性美食和培育提醒</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 演示区域 -->
      <div class="demo-area">
        <el-row :gutter="30">
          <el-col :span="12">
            <el-card class="demo-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Box /></el-icon>
                  <span>选择您的盲盒</span>
                </div>
              </template>
              <div class="box-selection">
                <el-select 
                  v-model="selectedBoxId" 
                  placeholder="请选择一个盲盒"
                  style="width: 100%"
                  @change="handleBoxChange"
                >
                  <el-option
                    v-for="box in availableBoxes"
                    :key="box.id"
                    :label="`${box.name} (${box.season}季)`"
                    :value="box.id"
                  />
                </el-select>
                
                <div
                  v-if="selectedBox"
                  class="selected-box-info"
                >
                  <h4>{{ selectedBox.name }}</h4>
                  <p>{{ selectedBox.description }}</p>
                  <div class="box-mushrooms">
                    <el-tag 
                      v-for="item in selectedBox.items" 
                      :key="item.id"
                      type="success"
                      effect="dark"
                    >
                      {{ item.mushroom.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="demo-card">
              <template #header>
                <div class="card-header">
                  <el-icon><User /></el-icon>
                  <span>设置您的偏好</span>
                </div>
              </template>
              <div class="preference-setting">
                <el-form
                  :model="userPreference"
                  label-width="100px"
                >
                  <el-form-item label="烹饪技能">
                    <el-select v-model="userPreference.cookingSkill">
                      <el-option
                        label="入门级"
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
                  
                  <el-form-item label="口味偏好">
                    <el-checkbox-group v-model="selectedTastes">
                      <el-checkbox 
                        v-for="taste in tasteOptions" 
                        :key="taste.value"
                        :label="taste.value"
                      >
                        {{ taste.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item label="饮食限制">
                    <el-checkbox-group v-model="selectedRestrictions">
                      <el-checkbox 
                        v-for="restriction in restrictionOptions" 
                        :key="restriction.value"
                        :label="restriction.value"
                      >
                        {{ restriction.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      :loading="updatingPreferences"
                      @click="updatePreferences"
                    >
                      更新偏好设置
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 匹配结果展示 -->
      <div
        v-if="selectedBox"
        class="results-section"
      >
        <el-tabs v-model="activeResultTab">
          <el-tab-pane
            label="推荐食谱"
            name="recipes"
          >
            <BoxRecipeMatcher 
              :box-id="selectedBoxId"
              @recipe-selected="handleRecipeSelected"
              @video-played="handleVideoPlayed"
            />
          </el-tab-pane>
          
          <el-tab-pane
            label="匹配分析"
            name="analysis"
          >
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>智能匹配分析</span>
                </div>
              </template>
              <div class="analysis-content">
                <el-descriptions
                  :column="2"
                  border
                >
                  <el-descriptions-item label="盲盒匹配度">
                    <el-progress 
                      :percentage="analysisData.boxMatchRate" 
                      :status="analysisData.boxMatchRate > 80 ? 'success' : 'warning'"
                    />
                  </el-descriptions-item>
                  <el-descriptions-item label="偏好匹配度">
                    <el-progress 
                      :percentage="analysisData.preferenceMatchRate" 
                      :status="analysisData.preferenceMatchRate > 70 ? 'success' : 'warning'"
                    />
                  </el-descriptions-item>
                  <el-descriptions-item label="推荐食谱数">
                    <el-tag type="primary">
                      {{ analysisData.recommendedRecipeCount }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="相关视频数">
                    <el-tag type="success">
                      {{ analysisData.relatedVideoCount }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
                
                <div class="match-insights">
                  <h4>匹配洞察</h4>
                  <ul>
                    <li 
                      v-for="insight in analysisData.insights" 
                      :key="insight.id"
                      class="insight-item"
                    >
                      <el-icon><Lightning /></el-icon>
                      {{ insight.text }}
                    </li>
                  </ul>
                </div>
              </div>
            </el-card>
          </el-tab-pane>
          
          <el-tab-pane
            label="推送预览"
            name="preview"
          >
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><Message /></el-icon>
                  <span>个性化推送预览</span>
                </div>
              </template>
              <div class="push-preview">
                <el-timeline>
                  <el-timeline-item
                    v-for="push in pushPreviewData"
                    :key="push.id"
                    :timestamp="push.time"
                    placement="top"
                  >
                    <el-card>
                      <h4>{{ push.title }}</h4>
                      <p>{{ push.content }}</p>
                      <div class="push-tags">
                        <el-tag 
                          v-for="tag in push.tags" 
                          :key="tag"
                          size="small"
                          type="info"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 操作按钮 -->
      <div class="demo-actions">
        <el-button 
          type="primary" 
          size="large"
          :loading="simulating"
          @click="simulateFullProcess"
        >
          模拟完整流程
        </el-button>
        <el-button 
          type="success" 
          size="large"
          @click="resetDemo"
        >
          重置演示
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  MagicStick, Box, ForkSpoon, VideoCamera, Bell, 
  User, DataAnalysis, Lightning, Message 
} from '@element-plus/icons-vue'
import BoxRecipeMatcher from '../components/BoxRecipeMatcher.vue'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'

const boxStore = useMushroomBoxStore()

// 响应式数据
const selectedBoxId = ref(null)
const selectedBox = ref(null)
const activeResultTab = ref('recipes')
const simulating = ref(false)
const updatingPreferences = ref(false)

// 用户偏好设置
const userPreference = reactive({
  cookingSkill: 'beginner',
  tastePreferences: {},
  dietaryRestrictions: []
})

const selectedTastes = ref([])
const selectedRestrictions = ref([])

// 口味选项
const tasteOptions = [
  { label: '香辣', value: 'spicy' },
  { label: '酸甜', value: 'sweet_sour' },
  { label: '清淡', value: 'light' },
  { label: '浓郁', value: 'rich' },
  { label: '鲜美', value: 'umami' }
]

// 饮食限制选项
const restrictionOptions = [
  { label: '素食', value: 'vegetarian' },
  { label: '无麸质', value: 'gluten_free' },
  { label: '低脂', value: 'low_fat' },
  { label: '低碳水', value: 'low_carb' }
]

// 可用盲盒列表
const availableBoxes = computed(() => {
  return boxStore.boxes.filter(box => box.status === 'active')
})

// 分析数据
const analysisData = ref({
  boxMatchRate: 85,
  preferenceMatchRate: 78,
  recommendedRecipeCount: 6,
  relatedVideoCount: 4,
  insights: [
    { id: 1, text: '您选择的盲盒包含3种菌菇，营养搭配均衡' },
    { id: 2, text: '根据您的入门级烹饪技能，推荐了适合的简易食谱' },
    { id: 3, text: '检测到您偏好清淡口味，已过滤掉重口味食谱' },
    { id: 4, text: '为您匹配了2个相关的烹饪教学视频' }
  ]
})

// 推送预览数据
const pushPreviewData = ref([
  {
    id: 1,
    title: '盲盒食谱推荐',
    content: '根据您订阅的"春季精选盲盒"，为您推荐了6道美味食谱...',
    time: '2024-01-15 10:00',
    tags: ['食谱推荐', '盲盒匹配']
  },
  {
    id: 2,
    title: '个性化视频推送',
    content: '为您精选了4个烹饪视频，帮助您提升厨艺技巧...',
    time: '2024-01-16 11:00',
    tags: ['视频推荐', '技能提升']
  },
  {
    id: 3,
    title: '季节美食提醒',
    content: '春季时令美食上线啦！快来尝试新鲜的春季限定菜品...',
    time: '2024-01-17 09:00',
    tags: ['季节提醒', '新品推荐']
  }
])

// 处理盲盒选择变化
const handleBoxChange = async (boxId) => {
  try {
    selectedBox.value = await boxStore.fetchBoxById(boxId)
    ElMessage.success('盲盒信息已加载')
  } catch (error) {
    ElMessage.error('加载盲盒信息失败')
  }
}

// 更新用户偏好
const updatePreferences = async () => {
  updatingPreferences.value = true
  try {
    // 更新口味偏好对象
    userPreference.tastePreferences = {}
    selectedTastes.value.forEach(taste => {
      userPreference.tastePreferences[taste] = true
    })
    
    // 更新饮食限制数组
    userPreference.dietaryRestrictions = [...selectedRestrictions.value]
    
    // 这里应该调用API保存用户偏好
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success('偏好设置已更新')
    ElNotification({
      title: '设置成功',
      message: '您的个性化偏好已保存，将用于后续推荐',
      type: 'success'
    })
  } catch (error) {
    ElMessage.error('更新偏好设置失败')
  } finally {
    updatingPreferences.value = false
  }
}

// 处理食谱选择
const handleRecipeSelected = (recipeId) => {
  ElNotification({
    title: '食谱推荐',
    message: `已为您推荐相关食谱，ID: ${recipeId}`,
    type: 'success'
  })
}

// 处理视频播放
const handleVideoPlayed = (video) => {
  ElNotification({
    title: '视频推荐',
    message: `正在为您播放: ${video.title}`,
    type: 'success'
  })
}

// 模拟完整流程
const simulateFullProcess = async () => {
  simulating.value = true
  try {
    // 步骤1: 选择盲盒
    if (!selectedBoxId.value && availableBoxes.value.length > 0) {
      selectedBoxId.value = availableBoxes.value[0].id
      await handleBoxChange(selectedBoxId.value)
      ElMessage.info('已自动选择第一个盲盒')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // 步骤2: 设置偏好
    selectedTastes.value = ['light', 'umami']
    selectedRestrictions.value = ['vegetarian']
    await updatePreferences()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 步骤3: 展示匹配结果
    activeResultTab.value = 'analysis'
    ElMessage.info('正在分析匹配度...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 步骤4: 切换到推荐食谱
    activeResultTab.value = 'recipes'
    ElMessage.success('智能匹配完成！')
    
    ElNotification({
      title: '演示完成',
      message: '已为您展示完整的智能匹配流程',
      type: 'success'
    })
  } catch (error) {
    ElMessage.error('模拟流程执行失败')
  } finally {
    simulating.value = false
  }
}

// 重置演示
const resetDemo = () => {
  selectedBoxId.value = null
  selectedBox.value = null
  activeResultTab.value = 'recipes'
  userPreference.cookingSkill = 'beginner'
  userPreference.tastePreferences = {}
  userPreference.dietaryRestrictions = []
  selectedTastes.value = []
  selectedRestrictions.value = []
  ElMessage.info('演示已重置')
}

// 页面加载时初始化
onMounted(async () => {
  await boxStore.fetchBoxes()
  ElMessage.success('智能匹配演示已就绪')
})
</script>

<style scoped>
.smart-matching-demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

/* 功能介绍 */
.feature-intro {
  margin-bottom: 40px;
}

.intro-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: white;
}

.feature-icon {
  font-size: 2.5rem;
  color: #16a085;
  margin-bottom: 15px;
}

.feature-item h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.feature-item p {
  color: #5a6c7d;
  margin: 0;
  line-height: 1.5;
}

/* 演示区域 */
.demo-area {
  margin-bottom: 40px;
}

.demo-card {
  height: 100%;
}

.box-selection,
.preference-setting {
  padding: 20px 0;
}

.selected-box-info {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-box-info h4 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.selected-box-info p {
  color: #5a6c7d;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.box-mushrooms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 结果展示 */
.results-section {
  margin-bottom: 40px;
}

.analysis-content {
  padding: 20px 0;
}

.match-insights {
  margin-top: 30px;
}

.match-insights h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  margin-bottom: 10px;
  background: #e8f5e8;
  border-radius: 8px;
  color: #27ae60;
}

.insight-item .el-icon {
  font-size: 1.2rem;
}

.push-preview {
  padding: 20px 0;
}

.push-tags {
  margin-top: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 操作按钮 */
.demo-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.demo-actions .el-button {
  width: 180px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-matching-demo-container {
    padding: 15px;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .demo-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>