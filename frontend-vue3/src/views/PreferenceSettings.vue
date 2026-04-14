<template>
  <div class="preference-settings-container">
    <div class="page-header">
      <h1>口味偏好设置</h1>
      <p class="subtitle">
        设置您的口味偏好，我们将为您推荐更符合您口味的烹饪视频和食谱
      </p>
    </div>

    <el-skeleton
      v-if="recipeStore.loading"
      :rows="10"
      animated
    />

    <div
      v-else-if="recipeStore.error"
      class="error-state"
    >
      <el-alert
        :title="recipeStore.error"
        type="error"
        show-icon
        :closable="false"
      />
      <div class="error-actions">
        <el-button
          type="primary"
          @click="fetchUserPreferences"
        >
          重试
        </el-button>
      </div>
    </div>

    <div
      v-else
      class="preference-form"
    >
      <div class="preference-section">
        <h2 class="section-title">
          🌶️ 辣度偏好
        </h2>
        <p class="section-description">
          选择您喜欢的辣度级别
        </p>
        <el-radio-group v-model="userPreferences.spiciness">
          <el-radio-button
            v-for="option in SPICINESS_OPTIONS"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          🍳 烹饪方式偏好
        </h2>
        <p class="section-description">
          选择您喜欢的烹饪方式（可多选）
        </p>
        <el-checkbox-group v-model="userPreferences.cookingMethods">
          <div class="cooking-methods-grid">
            <el-checkbox
              v-for="option in COOKING_METHOD_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          🚫 饮食禁忌
        </h2>
        <p class="section-description">
          选择您的饮食禁忌（可多选）
        </p>
        <el-checkbox-group v-model="userPreferences.dietaryRestrictions">
          <div class="dietary-restrictions-grid">
            <el-checkbox
              v-for="option in DIETARY_RESTRICTION_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          🍽️ 口味偏好
        </h2>
        <p class="section-description">
          选择您喜欢的口味（可多选）
        </p>
        <el-checkbox-group v-model="userPreferences.flavorPreferences">
          <div class="flavor-preferences-grid">
            <el-checkbox
              v-for="option in FLAVOR_PREFERENCE_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          🥬 食材偏好
        </h2>
        <p class="section-description">
          选择您喜欢的食材（可多选）
        </p>
        <el-checkbox-group v-model="userPreferences.ingredientPreferences">
          <div class="ingredient-preferences-grid">
            <el-checkbox
              v-for="option in INGREDIENT_PREFERENCE_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          ⏰ 烹饪时间偏好
        </h2>
        <p class="section-description">
          选择您能接受的烹饪时间
        </p>
        <el-slider
          v-model="userPreferences.maxCookingTime"
          :min="5"
          :max="120"
          :step="5"
          :format-tooltip="formatCookingTime"
        />
        <p class="slider-value">
          最大烹饪时间：{{ userPreferences.maxCookingTime }} 分钟
        </p>
      </div>

      <div class="preference-section">
        <h2 class="section-title">
          🎯 烹饪难度偏好
        </h2>
        <p class="section-description">
          选择您能接受的烹饪难度
        </p>
        <el-select
          v-model="userPreferences.difficultyPreference"
          placeholder="选择难度"
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
          <el-option
            label="不限"
            value="any"
          />
        </el-select>
      </div>

      <div class="form-actions">
        <el-button
          type="primary"
          size="large"
          :loading="isSaving"
          @click="saveUserPreferences"
        >
          保存偏好设置
        </el-button>
        <el-button
          size="large"
          @click="resetPreferences"
        >
          重置为默认值
        </el-button>
      </div>

      <el-alert
        v-if="saveSuccess"
        title="保存成功！您的偏好设置已更新"
        type="success"
        show-icon
        :closable="false"
        class="success-alert"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRecipeStore } from '../stores/useRecipeStore'
import { ElMessage } from 'element-plus'
import {
  SPICINESS_OPTIONS,
  COOKING_METHOD_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  FLAVOR_PREFERENCE_OPTIONS,
  INGREDIENT_PREFERENCE_OPTIONS
} from '../utils/recipeOptions'

const recipeStore = useRecipeStore()

const isSaving = ref(false)
const saveSuccess = ref(false)

const userPreferences = reactive({
  spiciness: 'mild',
  cookingMethods: ['stirFry', 'soup'],
  dietaryRestrictions: [],
  flavorPreferences: ['sweet', 'umami'],
  ingredientPreferences: ['chicken', 'vegetables'],
  maxCookingTime: 30,
  difficultyPreference: 'medium'
})

const formatCookingTime = (value) => {
  return `${value} 分钟`
}

const fetchUserPreferences = async () => {
  await recipeStore.fetchUserPreferences()
  if (recipeStore.userPreferences) {
    Object.assign(userPreferences, recipeStore.userPreferences)
  }
}

const saveUserPreferences = async () => {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await recipeStore.updateUserPreferences(userPreferences)
    ElMessage.success('偏好设置保存成功！')
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('保存偏好设置失败:', error)
    ElMessage.error('保存偏好设置失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const resetPreferences = () => {
  Object.assign(userPreferences, {
    spiciness: 'mild',
    cookingMethods: ['stirFry', 'soup'],
    dietaryRestrictions: [],
    flavorPreferences: ['sweet', 'umami'],
    ingredientPreferences: ['chicken', 'vegetables'],
    maxCookingTime: 30,
    difficultyPreference: 'medium'
  })
  ElMessage.info('偏好设置已重置为默认值')
}

onMounted(async () => {
  await fetchUserPreferences()
})
</script>

<style scoped>
.preference-settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.error-state {
  padding: 40px 0;
  text-align: center;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.preference-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 30px;
  overflow: hidden;
}

.preference-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.preference-section:last-child {
  border-bottom: none;
  margin-bottom: 30px;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.section-description {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0 0 20px 0;
}

.cooking-methods-grid,
.dietary-restrictions-grid,
.flavor-preferences-grid,
.ingredient-preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.slider-value {
  text-align: center;
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.form-actions .el-button {
  min-width: 200px;
}

.success-alert {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .preference-settings-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .preference-form {
    padding: 20px;
  }
  
  .preference-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .cooking-methods-grid,
  .dietary-restrictions-grid,
  .flavor-preferences-grid,
  .ingredient-preferences-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .cooking-methods-grid,
  .dietary-restrictions-grid,
  .flavor-preferences-grid,
  .ingredient-preferences-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>