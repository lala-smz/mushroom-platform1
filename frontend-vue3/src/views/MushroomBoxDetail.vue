<template>
  <div class="product-detail-container">
    <!-- 退出查看按钮 -->
    <button 
      class="exit-view-button" 
      aria-label="退出查看，返回上一页" 
      tabindex="0"
      @click="exitView"
      @keydown.enter="exitView"
      @keydown.space="exitView"
    >
      <el-icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ><path d="M9 18l-6-6 6-6" /><path d="M15 6h6v12h-6" /></svg>
      </el-icon>
      <span>退出查看</span>
    </button>
    <div class="container">
      <div
        v-if="boxStore.loading"
        class="loading"
      >
        <el-icon class="is-loading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><circle
            cx="12"
            cy="12"
            r="10"
          /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        </el-icon>
        <span>加载中...</span>
      </div>
      <div
        v-else-if="!boxStore.currentBox"
        class="empty"
      >
        <el-empty description="盲盒不存在" />
      </div>
      <div
        v-else
        class="product-detail"
      >
        <!-- 盲盒图片 -->
        <div class="product-images">
          <el-carousel
            v-if="boxStore.currentBox.images && boxStore.currentBox.images.length > 1"
            :interval="5000"
            height="400px"
            arrow="always"
          >
            <el-carousel-item
              v-for="(image, index) in boxStore.currentBox.images"
              :key="index"
            >
              <img
                :src="image || '/images/placeholder-mushroom-300.svg'"
                :alt="boxStore.currentBox.name"
                class="main-image"
                @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
              >
            </el-carousel-item>
          </el-carousel>
          <img
            v-else
            :src="(boxStore.currentBox.images && boxStore.currentBox.images[0]) || boxStore.currentBox.image || '/images/placeholder-mushroom-300.svg'"
            :alt="boxStore.currentBox.name"
            class="main-image"
            @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
          >
        </div>
        
        <!-- 盲盒信息 -->
        <div class="product-info">
          <div class="season-tag">
            {{ boxStore.currentBox.season }}季
          </div>
          <h1 class="product-name">
            {{ boxStore.currentBox.name || '盲盒' }}
          </h1>
          <div class="product-status">
            <el-tag type="success">
              可购买
            </el-tag>
          </div>
          <p class="product-price">
            ¥{{ formatPrice(boxStore.currentBox.price) }}
          </p>
          <div class="product-meta">
            <span class="meta-item">库存: {{ boxStore.currentBox.stock || 999 }}</span>
            <span class="meta-item">浏览: {{ boxStore.currentBox.viewCount || 0 }}</span>
            <span class="meta-item">分类: 盲盒</span>
            <span class="meta-item">发布时间: {{ formatDate(boxStore.currentBox.createdAt) }}</span>
          </div>
          
          <!-- 代培服务展示 -->
          <div
            v-if="boxStore.currentBox.cultivationService"
            class="cultivation-service-highlight"
          >
            <div class="service-badge">
              <el-icon><StarFilled /></el-icon>
              包含代培服务
            </div>
            <div class="service-details">
              <div class="service-info">
                <span class="info-label">代培价格：</span>
                <span class="info-value">¥{{ boxStore.currentBox.cultivationPrice || 0 }}</span>
              </div>
              <div class="service-info">
                <span class="info-label">代培时长：</span>
                <span class="info-value">{{ boxStore.currentBox.cultivationDuration || 0 }}天</span>
              </div>
              <div class="service-inclusions">
                <span class="info-label">服务包含：</span>
                <div class="inclusion-tags">
                  <span
                    v-for="(inclusion, index) in boxStore.currentBox.cultivationInclusions?.split(',') || []"
                    :key="index"
                    class="inclusion-tag"
                  >
                    {{ inclusion.trim() }}
                  </span>
                </div>
              </div>
            </div>
            <div class="service-description">
              {{ boxStore.currentBox.cultivationDescription || '专业团队为您提供从菌包培育到收获的全程指导服务。' }}
            </div>
          </div>
          
          <!-- 购买选项 -->
          <div class="purchase-options">
            <el-form
              :inline="true"
              class="quantity-form"
            >
              <el-form-item label="数量">
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="Math.max(1, boxStore.currentBox.stock || 999)" 
                  size="large"
                />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                :disabled="!(boxStore.currentBox.stock || 999) || (boxStore.currentBox.stock || 999) <= 0" 
                @click="addToCart"
              >
                加入购物车
              </el-button>
              <el-button 
                type="success" 
                size="large" 
                :disabled="!(boxStore.currentBox.stock || 999) || (boxStore.currentBox.stock || 999) <= 0" 
                @click="buyNow"
              >
                立即购买
              </el-button>
              <el-button 
                type="info" 
                size="large" 
                @click="contactSeller"
              >
                联系商家
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 盲盒详情 -->
        <div class="product-description">
          <h2>盲盒详情</h2>
          <div class="description-content">
            {{ boxStore.currentBox.description }}
          </div>
        </div>
        
        <!-- 盲盒包含的菌菇列表 -->
        <div class="box-items-section">
          <h2>{{ isSeasonalBox ? '盲盒种类信息' : '盲盒包含的菌菇品种' }}</h2>
          
          <!-- 时令盲盒只显示种类信息 -->
          <div
            v-if="isSeasonalBox"
            class="seasonal-box-info"
          >
            <el-card class="info-card">
              <template #header>
                <div class="card-header">
                  <span>盲盒基本信息</span>
                </div>
              </template>
              <div class="info-content">
                <div class="info-item">
                  <span class="info-label">盲盒名称：</span>
                  <span class="info-value">{{ boxStore.currentBox.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">盲盒季节：</span>
                  <span class="info-value">{{ boxStore.currentBox.season }}季</span>
                </div>
                <div class="info-item">
                  <span class="info-label">盲盒价格：</span>
                  <span class="info-value">¥{{ formatPrice(boxStore.currentBox.price) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">盲盒库存：</span>
                  <span class="info-value">{{ boxStore.currentBox.stock || 999 }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">盲盒描述：</span>
                  <span class="info-value">{{ boxStore.currentBox.description }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">商品种类：</span>
                  <span class="info-value">菌菇类商品</span>
                </div>
                <div class="info-item">
                  <span class="info-label">商品数量：</span>
                  <span class="info-value">{{ boxStore.currentBox.items?.length || 0 }}种</span>
                </div>
              </div>
            </el-card>
          </div>
          
          <!-- 普通盲盒显示具体商品内容 -->
          <div
            v-else
            class="mushrooms-grid"
          >
            <div 
              v-for="item in boxStore.currentBox.items" 
              :key="item.id" 
              class="mushroom-item"
            >
              <img
                :src="item.image || item.mushroom?.image || '/images/placeholder-mushroom-150.svg'"
                :alt="item.mushroomName || item.mushroom?.name"
                class="mushroom-image"
                @error="(e) => e.target.src = '/images/placeholder-mushroom-150.svg'"
              >
              <div class="mushroom-info">
                <h3 class="mushroom-name">
                  {{ item.mushroomName || item.mushroom?.name }}
                </h3>
                <p class="mushroom-scientific">
                  {{ item.mushroom?.scientificName || '' }}
                </p>
                <p class="mushroom-description">
                  {{ item.mushroom?.description || '' }}
                </p>
                <div class="mushroom-cultivation">
                  <h4>培育难度</h4>
                  <div
                    class="difficulty-badge"
                    :class="item.mushroom?.difficulty || 'easy'"
                  >
                    {{ item.mushroom?.difficulty || '简单' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 培育指南 -->
        <div class="cultivation-guide-section">
          <h2>培育指南</h2>
          <div class="guide-content">
            <el-tabs v-model="activeGuideTab">
              <el-tab-pane label="培育步骤">
                <div class="guide-steps">
                  <div
                    v-for="(step, index) in cultivationSteps"
                    :key="index"
                    class="step-item"
                  >
                    <div class="step-number">
                      {{ index + 1 }}
                    </div>
                    <div class="step-content">
                      <h4>{{ step.title }}</h4>
                      <p>{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="注意事项">
                <div class="guide-notes">
                  <ul>
                    <li
                      v-for="(note, index) in cultivationNotes"
                      :key="index"
                    >
                      {{ note }}
                    </li>
                  </ul>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        
        <!-- 推荐食谱 -->
        <div class="recommended-recipes-section">
          <div class="section-header">
            <h2>推荐食谱</h2>
            <el-button
              type="primary"
              size="small"
              @click="showPreferencesDialog = true"
            >
              个人偏好设置
            </el-button>
          </div>
          
          <!-- 食谱分类标签 -->
          <div class="recipe-categories">
            <el-tabs
              v-model="activeRecipeTab"
              type="card"
              class="categories-tabs"
            >
              <el-tab-pane 
                v-for="category in recipeCategories" 
                :key="category.value"
                :label="category.label"
                :name="category.value"
              />
            </el-tabs>
          </div>
          
          <!-- 搜索输入框 -->
          <div class="recipe-search-box">
            <el-input
              v-model="recipeSearchKeyword"
              placeholder="搜索食谱名称、描述或食材..."
              size="small"
              clearable
              @input="handleRecipeSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              size="small"
              @click="resetAllFilters"
            >
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
          
          <!-- 食谱筛选器 -->
          <div class="recipe-filters">
            <el-row :gutter="15">
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.difficulty"
                  placeholder="难度"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('difficulty', recipeFilters.difficulty)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    v-for="option in DIFFICULTY_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.cuisine"
                  placeholder="菜系"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('cuisine', recipeFilters.cuisine)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    v-for="option in CUISINE_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.mealType"
                  placeholder="餐点类型"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('mealType', recipeFilters.mealType)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    v-for="option in MEAL_TYPE_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.spiciness"
                  placeholder="辣度"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('spiciness', recipeFilters.spiciness)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    v-for="option in SPICINESS_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.cookingMethod"
                  placeholder="烹饪方式"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('cookingMethod', recipeFilters.cookingMethod)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    v-for="option in COOKING_METHOD_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-select
                  v-model="recipeFilters.prepTime"
                  placeholder="烹饪时间"
                  size="small"
                  clearable
                  @change="updateRecipeFilter('prepTime', recipeFilters.prepTime)"
                >
                  <el-option
                    label="全部"
                    value="all"
                  />
                  <el-option
                    label="快速 (≤30分钟)"
                    value="quick"
                  />
                  <el-option
                    label="中等 (30-60分钟)"
                    value="medium"
                  />
                  <el-option
                    label="较长 (≥60分钟)"
                    value="long"
                  />
                </el-select>
              </el-col>
            </el-row>
          </div>
          
          <!-- 活跃筛选标签 -->
          <div
            v-if="activeFilterTags.length > 0"
            class="active-filter-tags"
          >
            <span class="tags-label">活跃筛选：</span>
            <el-tag
              v-for="tag in activeFilterTags"
              :key="tag.key"
              closable
              size="small"
              @close="clearFilter(tag.key)"
            >
              {{ tag.label }}
            </el-tag>
          </div>
          
          <div class="recipes-grid">
            <!-- 加载状态 -->
            <div
              v-if="isLoadingRecipes"
              class="loading-recipes"
            >
              <el-skeleton
                :rows="3"
                animated
              />
            </div>
            <!-- 错误状态 -->
            <div
              v-else-if="recipesError"
              class="error-recipes"
            >
              <el-alert
                :title="recipesError"
                type="error"
                show-icon
                :closable="false"
              />
              <div class="error-actions">
                <el-button
                  type="primary"
                  @click="fetchRecommendedRecipes(boxStore.currentBox)"
                >
                  重试
                </el-button>
                <el-button @click="recipesError = null">
                  关闭
                </el-button>
              </div>
            </div>
            <!-- 食谱列表 -->
            <template v-else>
              <div
                v-if="getRecipesByCategory().length === 0"
                class="no-recipes"
              >
                暂无推荐食谱
              </div>
              <div 
                v-for="recipe in getRecipesByCategory()" 
                :key="recipe.id" 
                class="recipe-card"
                @click="handleRecipeClick(recipe)"
              >
                <div class="recipe-image-container">
                  <img 
                    :src="getImageUrl(recipe.image)" 
                    :alt="recipe.name" 
                    class="recipe-image" 
                    @error="handleImageError"
                  >
                </div>
                <div class="recipe-content">
                  <h3 class="recipe-name">
                    {{ recipe.name }}
                  </h3>
                  <div class="recipe-meta">
                    <span class="difficulty">{{ getDifficultyText(recipe.difficulty) }}</span>
                    <span class="time">{{ (recipe.prepTime || 0) + (recipe.cookTime || 0) }}分钟</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 用户偏好设置对话框 -->
        <el-dialog
          v-model="showPreferencesDialog"
          title="个人偏好设置"
          width="500px"
          @close="saveUserPreferences"
        >
          <el-form label-width="120px">
            <el-form-item label="烹饪技能">
              <el-select
                v-model="userPreferences.cookingSkill"
                placeholder="选择烹饪技能"
              >
                <el-option
                  label="初学者"
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
            <el-form-item label="饮食限制">
              <el-checkbox-group v-model="userPreferences.dietaryRestrictions">
                <el-checkbox label="素食">
                  素食
                </el-checkbox>
                <el-checkbox label="无麸质">
                  无麸质
                </el-checkbox>
                <el-checkbox label="无乳糖">
                  无乳糖
                </el-checkbox>
                <el-checkbox label="低碳水">
                  低碳水
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="喜爱的食材">
              <el-input 
                v-model="favoriteIngredientsInput" 
                placeholder="请输入喜爱的食材，用逗号分隔"
              />
            </el-form-item>
            <el-form-item label="偏好菜系">
              <el-checkbox-group v-model="userPreferences.preferredCuisine">
                <el-checkbox label="chinese">
                  中式
                </el-checkbox>
                <el-checkbox label="western">
                  西式
                </el-checkbox>
                <el-checkbox label="japanese">
                  日式
                </el-checkbox>
                <el-checkbox label="other">
                  其他
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="口味偏好">
              <el-checkbox-group v-model="userPreferences.tastePreferences">
                <el-checkbox label="spicy">
                  辣
                </el-checkbox>
                <el-checkbox label="sweet">
                  甜
                </el-checkbox>
                <el-checkbox label="sour">
                  酸
                </el-checkbox>
                <el-checkbox label="savory">
                  咸鲜
                </el-checkbox>
                <el-checkbox label="bitter">
                  苦
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="喜爱的菌菇">
              <el-input 
                v-model="favoriteMushroomsInput" 
                placeholder="请输入喜爱的菌菇种类，用逗号分隔"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showPreferencesDialog = false">取消</el-button>
              <el-button
                type="primary"
                @click="saveUserPreferencesAndClose"
              >保存</el-button>
            </span>
          </template>
        </el-dialog>
        
        <!-- 相关视频 -->
        <div class="related-videos-section">
          <div class="section-header">
            <h2>相关视频</h2>
            <el-button
              type="primary"
              size="small"
              @click="resetVideoFilters"
            >
              重置筛选
            </el-button>
          </div>
          
          <!-- 视频分类标签 -->
          <div class="video-categories">
            <el-tabs
              v-model="activeVideoCategory"
              type="card"
              class="categories-tabs"
            >
              <el-tab-pane 
                v-for="category in videoCategories" 
                :key="category.value"
                :label="category.label"
                :name="category.value"
              />
            </el-tabs>
          </div>
          
          <!-- 视频搜索框和排序 -->
          <div class="video-search-sort-container">
            <div class="video-search-box">
              <el-input
                v-model="videoSearchKeyword"
                placeholder="搜索视频标题或描述..."
                size="small"
                clearable
                @input="handleVideoSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="video-sort-box">
              <el-select
                v-model="videoSortBy"
                placeholder="排序方式"
                size="small"
                @change="handleVideoSortChange"
              >
                <el-option
                  v-for="option in videoSortOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
          </div>
          
          <div class="videos-grid">
            <!-- 加载状态 -->
            <div
              v-if="isLoadingVideos"
              class="loading-videos"
            >
              <el-skeleton
                :rows="3"
                animated
              />
            </div>
            <!-- 错误状态 -->
            <div
              v-else-if="videosError"
              class="error-videos"
            >
              <el-alert
                :title="videosError"
                type="error"
                show-icon
                :closable="false"
              />
              <div class="error-actions">
                <el-button
                  type="primary"
                  @click="fetchVideos(boxStore.currentBox)"
                >
                  重试
                </el-button>
                <el-button @click="videosError = null">
                  关闭
                </el-button>
              </div>
            </div>
            <!-- 视频列表 -->
            <template v-else>
              <div
                v-if="filteredVideos.length === 0"
                class="no-videos"
              >
                暂无相关视频
              </div>
              <div 
                v-for="video in filteredVideos" 
                :key="video.id" 
                class="video-card"
                @click="handleVideoClick(video)"
              >
                <div class="video-thumbnail-container">
                  <img 
                    :src="video.thumbnail || '/images/placeholder-mushroom-150.svg'" 
                    :alt="video.title" 
                    class="video-thumbnail" 
                    @error="(e) => e.target.src = '/images/placeholder-mushroom-150.svg'"
                  >
                  <div class="video-duration">
                    {{ formatVideoDuration(video.duration) }}
                  </div>
                  <div class="video-category-tag">
                    {{ getCategoryLabel(video.category) }}
                  </div>
                </div>
                <div class="video-content">
                  <h3 class="video-title">
                    {{ video.title }}
                  </h3>
                  <p class="video-description">
                    {{ video.description }}
                  </p>
                  <div class="video-meta">
                    <span class="video-views">{{ video.views }}次观看</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 视频播放器模态框 -->
        <el-dialog
          v-model="showVideoPlayer"
          :title="selectedVideo?.title || '视频播放'"
          width="90%"
          :fullscreen="false"
          :close-on-click-modal="false"
          @close="closeVideoPlayer"
        >
          <VideoPlayer
            v-if="selectedVideo"
            :video="selectedVideo"
            :auto-play="true"
          />
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { StarFilled, Filter, Setting, Search, Refresh } from '@element-plus/icons-vue'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { useCartStore } from '../stores/useCartStore'
import { useUserStore } from '../stores/useUserStore'
import { useMessageStore } from '../stores/useMessageStore'
import VideoPlayer from '../components/VideoPlayer.vue'
import ChatPopup from '../components/ChatPopup.vue'
import dayjs from 'dayjs'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../utils/imageUtils'
import { apiClient } from '../api'
import {
  DIFFICULTY_OPTIONS,
  CUISINE_OPTIONS,
  MEAL_TYPE_OPTIONS,
  SPICINESS_OPTIONS,
  COOKING_METHOD_OPTIONS,
  getDifficultyText,
  getCuisineText,
  getMealTypeText,
  getSpicinessText,
  getCookingMethodText
} from '../utils/recipeOptions'

const route = useRoute()
const router = useRouter()
const boxStore = useMushroomBoxStore()
const recipeStore = useRecipeStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const messageStore = useMessageStore()

// 判断是否为时令盲盒
const isSeasonalBox = computed(() => {
  return boxStore.currentBox?.season?.includes('时令') || false
})

// 购买数量
const quantity = ref(1)

// 聊天弹窗状态
const showChatPopup = ref(false)
const sellerInfo = ref(null)

// 用户偏好设置
const userPreferences = ref({
  cookingSkill: 'beginner',
  dietaryRestrictions: [],
  favoriteIngredients: [],
  preferredCuisine: [],
  tastePreferences: {
    spicy: false,
    sweet: false,
    sour: false,
    savory: false,
    bitter: false
  },
  favoriteMushrooms: []
})

// 喜爱的食材输入
const favoriteIngredientsInput = ref('')

// 喜爱的菌菇输入
const favoriteMushroomsInput = ref('')

// 食谱筛选
const recipeFilters = ref({
  difficulty: 'all',
  prepTime: 'all',
  cuisine: 'all',
  mealType: 'all',
  spiciness: 'all',
  cookingMethod: 'all'
})

// 搜索关键词
const recipeSearchKeyword = ref('')

// 食谱分类标签
const recipeCategories = [
  { value: 'recommended', label: '推荐' },
  { value: 'quick', label: '快手菜' },
  { value: 'healthy', label: '健康' },
  { value: 'traditional', label: '传统' }
]

// 当前活跃的食谱标签
const activeRecipeTab = ref('recommended')

// 偏好设置对话框
const showPreferencesDialog = ref(false)

const activeGuideTab = ref('0')
const recommendedRecipes = ref([])
const isLoadingRecipes = ref(false)
const recipesError = ref(null)

// 视频功能相关状态
const videos = ref([])
const isLoadingVideos = ref(false)
const videosError = ref(null)
const selectedVideo = ref(null)
const activeVideoCategory = ref('all')
const showVideoPlayer = ref(false)
const videoSearchKeyword = ref('')
const videoSortBy = ref('relevance')
const videoFilters = ref({
  status: 'all',
  quality: 'all'
})

// 用户行为跟踪状态
const userBehavior = ref({
  watchedVideos: [],
  viewedRecipes: [],
  clickedRecipes: [],
  preferredCategories: {}
})

// 加载用户行为数据
const loadUserBehavior = () => {
  try {
    const savedBehavior = localStorage.getItem('userBehavior')
    if (savedBehavior) {
      userBehavior.value = JSON.parse(savedBehavior)
      console.log('已加载用户行为数据:', userBehavior.value)
    }
  } catch (error) {
    console.error('加载用户行为数据失败:', error)
  }
}

// 保存用户行为数据
const saveUserBehavior = () => {
  try {
    localStorage.setItem('userBehavior', JSON.stringify(userBehavior.value))
    console.log('用户行为数据已保存:', userBehavior.value)
  } catch (error) {
    console.error('保存用户行为数据失败:', error)
  }
}

// 记录视频观看
const trackVideoView = (video) => {
  if (!video) return
  
  const existingIndex = userBehavior.value.watchedVideos.findIndex(v => v.id === video.id)
  if (existingIndex >= 0) {
    userBehavior.value.watchedVideos[existingIndex].viewCount++
    userBehavior.value.watchedVideos[existingIndex].lastViewed = new Date().toISOString()
  } else {
    userBehavior.value.watchedVideos.push({
      id: video.id,
      title: video.title,
      category: video.category,
      viewCount: 1,
      firstViewed: new Date().toISOString(),
      lastViewed: new Date().toISOString()
    })
  }
  
  // 更新偏好类别
  updatePreferredCategories(video.category)
  saveUserBehavior()
}

// 记录食谱查看
const trackRecipeView = (recipe) => {
  if (!recipe) return
  
  const existingIndex = userBehavior.value.viewedRecipes.findIndex(r => r.id === recipe.id)
  if (existingIndex >= 0) {
    userBehavior.value.viewedRecipes[existingIndex].viewCount++
    userBehavior.value.viewedRecipes[existingIndex].lastViewed = new Date().toISOString()
  } else {
    userBehavior.value.viewedRecipes.push({
      id: recipe.id,
      name: recipe.name,
      difficulty: recipe.difficulty,
      viewCount: 1,
      firstViewed: new Date().toISOString(),
      lastViewed: new Date().toISOString()
    })
  }
  saveUserBehavior()
}

// 记录食谱点击
const trackRecipeClick = (recipe) => {
  if (!recipe) return
  
  const existingIndex = userBehavior.value.clickedRecipes.findIndex(r => r.id === recipe.id)
  if (existingIndex >= 0) {
    userBehavior.value.clickedRecipes[existingIndex].clickCount++
    userBehavior.value.clickedRecipes[existingIndex].lastClicked = new Date().toISOString()
  } else {
    userBehavior.value.clickedRecipes.push({
      id: recipe.id,
      name: recipe.name,
      clickCount: 1,
      firstClicked: new Date().toISOString(),
      lastClicked: new Date().toISOString()
    })
  }
  saveUserBehavior()
}

// 更新偏好类别
const updatePreferredCategories = (category) => {
  if (!category) return
  
  userBehavior.value.preferredCategories[category] = 
    (userBehavior.value.preferredCategories[category] || 0) + 1
}

// 获取基于行为的推荐视频
const getBehaviorBasedVideoRecommendations = () => {
  // 基于观看历史和偏好类别排序视频
  const sortedVideos = [...videos.value].sort((a, b) => {
    // 优先推荐用户看过的类别
    const aCategoryScore = userBehavior.value.preferredCategories[a.category] || 0
    const bCategoryScore = userBehavior.value.preferredCategories[b.category] || 0
    
    if (aCategoryScore !== bCategoryScore) {
      return bCategoryScore - aCategoryScore
    }
    
    // 其次按观看次数
    const aViewCount = userBehavior.value.watchedVideos.find(v => v.id === a.id)?.viewCount || 0
    const bViewCount = userBehavior.value.watchedVideos.find(v => v.id === b.id)?.viewCount || 0
    
    return bViewCount - aViewCount
  })
  
  return sortedVideos
}

// 获取基于行为的推荐食谱
const getBehaviorBasedRecipeRecommendations = () => {
  // 基于查看历史排序食谱
  const sortedRecipes = [...recommendedRecipes.value].sort((a, b) => {
    const aViewCount = userBehavior.value.viewedRecipes.find(r => r.id === a.id)?.viewCount || 0
    const bViewCount = userBehavior.value.viewedRecipes.find(r => r.id === b.id)?.viewCount || 0
    
    if (aViewCount !== bViewCount) {
      return bViewCount - aViewCount
    }
    
    const aClickCount = userBehavior.value.clickedRecipes.find(r => r.id === a.id)?.clickCount || 0
    const bClickCount = userBehavior.value.clickedRecipes.find(r => r.id === b.id)?.clickCount || 0
    
    return bClickCount - aClickCount
  })
  
  return sortedRecipes
}

// 视频分类
const videoCategories = [
  { value: 'all', label: '全部' },
  { value: 'cultivation', label: '培育指南' },
  { value: 'cooking', label: '烹饪教程' },
  { value: 'identification', label: '种类识别' }
]

// 视频排序选项
const videoSortOptions = [
  { value: 'relevance', label: '相关度' },
  { value: 'newest', label: '最新发布' },
  { value: 'views', label: '观看次数' },
  { value: 'duration', label: '视频时长' }
]

// 按分类、搜索和排序筛选视频
const filteredVideos = computed(() => {
  console.log('filteredVideos 计算中 - videos.value:', videos.value)
  console.log('filteredVideos 计算中 - activeVideoCategory:', activeVideoCategory.value)
  
  let result = [...videos.value]
  
  // 1. 按分类筛选
  if (activeVideoCategory.value !== 'all') {
    result = result.filter(video => video.category === activeVideoCategory.value)
    console.log('按分类筛选后:', result)
  }
  
  // 2. 按搜索关键词筛选
  if (videoSearchKeyword.value.trim()) {
    const keyword = videoSearchKeyword.value.toLowerCase().trim()
    result = result.filter(video => 
      video.title?.toLowerCase().includes(keyword) || 
      video.description?.toLowerCase().includes(keyword)
    )
    console.log('按搜索筛选后:', result)
  }
  
  // 3. 简单排序（先不使用用户行为排序，避免可能的问题）
  result = sortVideos(result, videoSortBy.value)
  
  console.log('最终返回的视频:', result)
  return result
})

// 视频排序函数
const sortVideos = (videoList, sortBy) => {
  return [...videoList].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'duration':
        return (b.duration || 0) - (a.duration || 0)
      case 'relevance':
      default:
        return (b.sortOrder || 0) - (a.sortOrder || 0)
    }
  })
}

// 订单表单
const orderForm = ref({
  receiver: '',
  phone: '',
  address: '',
  paymentMethod: 'alipay',
  cultivationService: false
})

// 培育步骤（模拟数据，实际应该从后端获取）
const cultivationSteps = ref([
  {
    title: '准备工作',
    description: '收到菌菇盲盒后，检查菌包是否完好，准备好喷壶、干净的容器和放置位置。'
  },
  {
    title: '菌包处理',
    description: '按照说明书打开菌包，保持菌包湿润，放置在通风阴凉的地方。'
  },
  {
    title: '日常管理',
    description: '每天喷水2-3次，保持环境湿度在80-90%，温度控制在18-25℃。'
  },
  {
    title: '收获时机',
    description: '当菌菇子实体长到合适大小，菌盖边缘开始内卷时，即可收获。'
  },
  {
    title: '收获方法',
    description: '用手轻轻扭转菌菇，或用刀从菌柄基部切下，注意不要损伤菌包。'
  }
])

// 注意事项（模拟数据）
const cultivationNotes = ref([
  '避免阳光直射，否则会影响菌菇生长。',
  '保持环境通风，但避免强风直吹。',
  '喷水时使用干净的水，避免使用自来水直接喷洒。',
  '收获后，继续按照说明管理菌包，可能会有第二潮、第三潮收获。',
  '如果菌包出现异味或发霉，应立即停止使用。'
])

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBoxDetail(newId)
  }
})



// 加入购物车
const addToCart = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    // 确保quantity不小于1
    if (quantity.value < 1) {
      quantity.value = 1
    }
    console.log(`添加到购物车，盲盒ID：${boxStore.currentBox.id}，数量：${quantity.value}`)
    await cartStore.addToCart(boxStore.currentBox.id, quantity.value, 'box')
    ElMessage.success('加入购物车成功')
  } catch (error) {
    console.error('加入购物车失败：', error)
    ElMessage.error(error.message || '加入购物车失败')
  }
}

// 立即购买
const buyNow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 先加入购物车，然后跳转到结算页
  try {
    // 确保quantity不小于1
    if (quantity.value < 1) {
      quantity.value = 1
    }
    console.log(`立即购买，盲盒ID：${boxStore.currentBox.id}，数量：${quantity.value}`)
    await cartStore.addToCart(boxStore.currentBox.id, quantity.value, 'box')
    router.push('/checkout')
  } catch (error) {
    console.error('操作失败：', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 联系商家
const contactSeller = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    // 从盲盒信息中获取商家ID
    const sellerId = boxStore.currentBox.sellerId || 1;
    const sellerRole = 'seller';
    
    if (!sellerId) {
      ElMessage.error('获取商家信息失败')
      return
    }
    
    // 初始化WebSocket连接（如果尚未连接）
    if (!messageStore.isWebSocketConnected) {
      messageStore.initWebSocket()
    }
    
    // 创建或获取与该商家的会话
    const conversation = await messageStore.createConversation(sellerId, sellerRole);
    
    // 获取会话列表，以便获取商家名称
    await messageStore.updateConversations();
    
    // 查找对应的会话，获取商家名称
    const targetConversation = messageStore.conversations.find(c => 
      ((c.initiatorId === sellerId && c.initiatorRole === sellerRole) && 
       (c.receiverId === userStore.userInfo.id && c.receiverRole === userStore.userInfo.role)) ||
      ((c.receiverId === sellerId && c.receiverRole === sellerRole) && 
       (c.initiatorId === userStore.userInfo.id && c.initiatorRole === userStore.userInfo.role))
    );
    
    // 设置卖家信息，优先使用服务器返回的商家名称，否则使用用户名或商家+ID格式
    const merchantName = targetConversation?.receiverRole === 'seller' ? 
      (targetConversation.receiverName || `商家${sellerId}`) : 
      (targetConversation?.initiatorName || `商家${sellerId}`);
    
    sellerInfo.value = {
      id: sellerId,
      role: sellerRole,
      name: merchantName
    };
    
    // 显示聊天弹窗
    showChatPopup.value = true;
  } catch (error) {
    console.error('联系商家失败:', error)
    ElMessage.error('联系商家失败，请稍后重试')
  }
}

// 退出查看，返回上一页
const exitView = () => {
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化价格
const formatPrice = (price) => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2);
  }
  
  const parsedPrice = parseFloat(price);
  return isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2);
}

// 内容缓存
const contentCache = ref({
  recipes: {},
  videos: {}
})

// 获取盲盒详情
const fetchBoxDetail = async (id) => {
  try {
    const box = await boxStore.fetchBoxById(id)
    if (box) {
      // 获取相关推荐食谱
      fetchRecommendedRecipes(box)
      // 获取相关视频
      fetchVideos(box)
    } else {
      // 显示友好提示
      ElMessage.warning('获取盲盒详情失败，显示默认信息')
    }
  } catch (error) {
    console.error('获取盲盒详情失败:', error)
    // 显示友好提示
    ElMessage.error('网络错误，请稍后重试')
    // 即使失败也不阻止页面加载，因为我们已经在 store 中添加了降级方案
  }
}

// 处理视频点击
const handleVideoClick = (video) => {
  selectedVideo.value = video
  showVideoPlayer.value = true
  trackVideoView(video) // 记录视频观看
  incrementVideoViews(video.id) // 增加视频观看次数
  console.log('选中的视频:', selectedVideo.value)
}

// 关闭视频播放器
const closeVideoPlayer = () => {
  showVideoPlayer.value = false
  selectedVideo.value = null
}

// 格式化视频时长
const formatVideoDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取视频分类标签
const getCategoryLabel = (category) => {
  const categoryMap = {
    cultivation: '培育指南',
    cooking: '烹饪教程',
    identification: '种类识别'
  }
  return categoryMap[category] || '综合内容'
}

// 重试计数器
const retryCounts = ref({ recipes: 0, videos: 0 })
const maxRetries = 3
const retryDelay = 1000 // 1秒

// 统一食谱数据格式
const normalizeRecipeData = (recipe) => {
  const normalized = {
    ...recipe,
    // 字段映射
    cuisine: recipe.cuisine || recipe.cuisineType,
    cuisineType: recipe.cuisineType || recipe.cuisine,
    // 确保ingredients是数组
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients 
      : (recipe.ingredients ? [recipe.ingredients] : []),
    // 确保tags是数组
    tags: Array.isArray(recipe.tags) 
      ? recipe.tags 
      : (recipe.tags ? [recipe.tags] : [])
  }
  
  // 转换ingredients为字符串数组（用于搜索）
  if (normalized.ingredients.length > 0 && typeof normalized.ingredients[0] === 'object') {
    normalized.ingredientNames = normalized.ingredients
      .map(ing => ing.name || ing.ingredientName)
      .filter(Boolean)
  } else {
    normalized.ingredientNames = normalized.ingredients
  }
  
  return normalized
}

// 原始食谱数据（未筛选的）
const rawRecipes = ref([])

// 获取推荐食谱
const fetchRecommendedRecipes = async (box) => {
  console.log('开始获取推荐食谱:', box)
  
  // 重置状态
  isLoadingRecipes.value = true
  recipesError.value = null
  recommendedRecipes.value = []
  rawRecipes.value = []
  
  try {
    if (box && box.id) {
      const cacheKey = `box_${box.id}`
      console.log('用户偏好:', userPreferences.value)
      
      // 检查缓存 - 只缓存原始数据
      if (contentCache.value.recipes[cacheKey]) {
        console.log('从缓存获取食谱')
        rawRecipes.value = contentCache.value.recipes[cacheKey]
      } else {
        // 优先使用根据盲盒ID获取食谱的方法
        let recipes = []
        try {
          recipes = await recipeStore.fetchRecipesByBoxId(box.id)
          console.log('通过盲盒ID获取到的食谱:', recipes)
        } catch (boxError) {
          console.warn('通过盲盒ID获取食谱失败，尝试通过菌菇ID获取:', boxError)
          // 如果失败，则回退到原来的方法
          if (box.items && box.items.length > 0) {
            const mushroomId = box.items[0].mushroomId
            recipes = await recipeStore.fetchRecipesByMushroomId(mushroomId)
            console.log('通过菌菇ID获取到的食谱:', recipes)
          }
        }
        
        // 统一数据格式
        recipes = recipes.map(normalizeRecipeData)
        
        // 缓存原始数据
        rawRecipes.value = recipes
        contentCache.value.recipes[cacheKey] = recipes
        console.log('食谱已缓存')
      }
      
      // 重置重试计数
      retryCounts.value.recipes = 0
    } else {
      console.log('盲盒无内容，无法获取推荐食谱')
      recipesError.value = '盲盒无内容，无法获取推荐食谱'
      ElMessage.warning({
        message: '盲盒无内容，无法获取推荐食谱',
        duration: 3000,
        showClose: true
      })
    }
  } catch (error) {
    console.error('获取推荐食谱失败:', error)
    
    // 处理网络错误
    let errorMessage = '获取推荐食谱失败，请稍后重试'
    if (error.message.includes('Network') || error.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络设置后重试'
    } else if (error.message.includes('404')) {
      errorMessage = '未找到相关食谱，请稍后再试'
    } else if (error.message.includes('500')) {
      errorMessage = '服务器错误，请稍后再试'
    }
    
    recipesError.value = errorMessage
    
    // 显示错误提示
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true
    })
    
    // 重试机制
    if (retryCounts.value.recipes < maxRetries) {
      retryCounts.value.recipes++
      console.log(`尝试重试获取食谱 (${retryCounts.value.recipes}/${maxRetries})`)
      setTimeout(() => {
        fetchRecommendedRecipes(box)
      }, retryDelay * retryCounts.value.recipes) // 指数退避
    }
    
    // 即使出错也显示空状态，避免界面空白
    rawRecipes.value = []
  } finally {
    isLoadingRecipes.value = false
    console.log('推荐食谱获取完成')
  }
}

// 基于用户行为排序食谱
const sortRecipesByUserBehavior = (recipes) => {
  return [...recipes].sort((a, b) => {
    // 1. 优先推荐用户点击过的食谱
    const aClickCount = userBehavior.value.clickedRecipes.find(r => r.id === a.id)?.clickCount || 0
    const bClickCount = userBehavior.value.clickedRecipes.find(r => r.id === b.id)?.clickCount || 0
    if (aClickCount !== bClickCount) {
      return bClickCount - aClickCount
    }
    
    // 2. 其次推荐用户查看过的食谱
    const aViewCount = userBehavior.value.viewedRecipes.find(r => r.id === a.id)?.viewCount || 0
    const bViewCount = userBehavior.value.viewedRecipes.find(r => r.id === b.id)?.viewCount || 0
    if (aViewCount !== bViewCount) {
      return bViewCount - aViewCount
    }
    
    // 3. 考虑烹饪技能匹配
    const skillMatchScore = (recipe) => {
      if (userPreferences.value.cookingSkill === 'beginner' && 
          (recipe.difficulty === 'easy' || recipe.difficulty === 'beginner')) return 3
      if (userPreferences.value.cookingSkill === 'intermediate' && 
          (recipe.difficulty === 'easy' || recipe.difficulty === 'medium' || 
           recipe.difficulty === 'beginner' || recipe.difficulty === 'intermediate')) return 2
      if (userPreferences.value.cookingSkill === 'advanced') return 1
      return 0
    }
    
    const aSkillScore = skillMatchScore(a)
    const bSkillScore = skillMatchScore(b)
    if (aSkillScore !== bSkillScore) {
      return bSkillScore - aSkillScore
    }
    
    // 4. 考虑饮食限制匹配
    const dietaryMatchScore = (recipe) => {
      if (userPreferences.value.dietaryRestrictions.length === 0) return 1
      
      for (const restriction of userPreferences.value.dietaryRestrictions) {
        if (recipe.ingredients?.includes(restriction)) {
          return 0
        }
      }
      return 1
    }
    
    const aDietaryScore = dietaryMatchScore(a)
    const bDietaryScore = dietaryMatchScore(b)
    if (aDietaryScore !== bDietaryScore) {
      return bDietaryScore - aDietaryScore
    }
    
    // 5. 考虑菜系偏好
    const cuisineMatchScore = (recipe) => {
      if (userPreferences.value.preferredCuisine.length === 0) return 1
      return userPreferences.value.preferredCuisine.includes(recipe.cuisine) ? 1 : 0
    }
    
    const aCuisineScore = cuisineMatchScore(a)
    const bCuisineScore = cuisineMatchScore(b)
    if (aCuisineScore !== bCuisineScore) {
      return bCuisineScore - aCuisineScore
    }
    
    // 6. 最后按烹饪时间（快速优先）
    const aTotalTime = (a.prepTime || 0) + (a.cookTime || 0)
    const bTotalTime = (b.prepTime || 0) + (b.cookTime || 0)
    return aTotalTime - bTotalTime
  })
}

// 难度值映射
const DIFFICULTY_VALUE_MAP = {
  'easy': ['easy', 'beginner'],
  'medium': ['medium', 'intermediate'],
  'hard': ['hard', 'advanced'],
  'beginner': ['easy', 'beginner'],
  'intermediate': ['medium', 'intermediate'],
  'advanced': ['hard', 'advanced']
}

// 应用食谱筛选
const applyRecipeFilters = (recipes) => {
  if (!recipes || !Array.isArray(recipes)) {
    return []
  }
  
  return recipes.filter(recipe => {
    // 难度筛选 - 支持多种难度值表示
    if (recipeFilters.value.difficulty !== 'all') {
      const allowedDifficulties = DIFFICULTY_VALUE_MAP[recipeFilters.value.difficulty] || [recipeFilters.value.difficulty]
      if (!allowedDifficulties.includes(recipe.difficulty)) {
        return false
      }
    }
    
    // 烹饪时间筛选
    if (recipeFilters.value.prepTime !== 'all') {
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
      switch (recipeFilters.value.prepTime) {
        case 'quick':
          if (totalTime > 30) return false
          break
        case 'medium':
          if (totalTime < 30 || totalTime > 60) return false
          break
        case 'long':
          if (totalTime < 60) return false
          break
      }
    }
    
    // 菜系筛选 - 同时支持cuisine和cuisineType字段
    if (recipeFilters.value.cuisine !== 'all') {
      const recipeCuisine = recipe.cuisine || recipe.cuisineType
      if (recipeCuisine !== recipeFilters.value.cuisine) {
        return false
      }
    }
    
    // 餐点类型筛选
    if (recipeFilters.value.mealType !== 'all' && recipe.mealType !== recipeFilters.value.mealType) {
      return false
    }
    
    // 辣度筛选
    if (recipeFilters.value.spiciness !== 'all' && recipe.spiciness !== recipeFilters.value.spiciness) {
      return false
    }
    
    // 烹饪方式筛选
    if (recipeFilters.value.cookingMethod !== 'all' && recipe.cookingMethod !== recipeFilters.value.cookingMethod) {
      return false
    }
    
    // 应用用户偏好
    if (userPreferences.value.dietaryRestrictions.length > 0) {
      // 检查是否符合饮食限制
      for (const restriction of userPreferences.value.dietaryRestrictions) {
        if (recipe.ingredients?.includes(restriction)) {
          return false
        }
      }
    }
    
    return true
  })
}

// 计算属性：筛选和搜索后的食谱
const filteredAndSearchedRecipes = computed(() => {
  let recipes = [...rawRecipes.value]
  
  // 1. 先按分类筛选
  if (activeRecipeTab.value !== 'recommended') {
    recipes = recipes.filter(recipe => {
      switch (activeRecipeTab.value) {
        case 'quick':
          return (recipe.prepTime || 0) + (recipe.cookTime || 0) <= 30
        case 'healthy':
          return recipe.tags?.includes('healthy')
        case 'traditional':
          return recipe.tags?.includes('traditional')
        default:
          return true
      }
    })
  }
  
  // 2. 应用搜索关键词
  if (recipeSearchKeyword.value.trim()) {
    const keyword = recipeSearchKeyword.value.toLowerCase().trim()
    recipes = recipes.filter(recipe => {
      // 搜索名称
      if (recipe.name?.toLowerCase().includes(keyword)) return true
      // 搜索描述
      if (recipe.description?.toLowerCase().includes(keyword)) return true
      // 搜索食材（兼容不同格式）
      if (recipe.ingredientNames) {
        if (recipe.ingredientNames.some(ing => 
          typeof ing === 'string' && ing.toLowerCase().includes(keyword)
        )) return true
      }
      if (recipe.ingredients) {
        if (recipe.ingredients.some(ing => {
          if (typeof ing === 'string') {
            return ing.toLowerCase().includes(keyword)
          } else if (ing && (ing.name || ing.ingredientName)) {
            const ingName = (ing.name || ing.ingredientName).toLowerCase()
            return ingName.includes(keyword)
          }
          return false
        })) return true
      }
      return false
    })
  }
  
  // 3. 应用筛选器
  recipes = applyRecipeFilters(recipes)
  
  // 4. 应用基于行为的排序
  recipes = sortRecipesByUserBehavior(recipes)
  
  return recipes
})

// 按分类获取食谱（现在使用computed属性）
const getRecipesByCategory = () => {
  return filteredAndSearchedRecipes.value
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 更新食谱筛选（立即生效，无需防抖）
const updateRecipeFilter = (key, value) => {
  recipeFilters.value[key] = value
  console.log('食谱筛选已更新:', recipeFilters.value)
}

// 处理搜索（带防抖 - 输入时使用）
const handleRecipeSearch = debounce(() => {
  console.log('搜索食谱:', recipeSearchKeyword.value)
}, 300)

// 活跃筛选标签
const activeFilterTags = computed(() => {
  const tags = []
  
  if (recipeFilters.value.difficulty !== 'all') {
    tags.push({
      key: 'difficulty',
      label: `难度: ${getDifficultyText(recipeFilters.value.difficulty)}`
    })
  }
  
  if (recipeFilters.value.cuisine !== 'all') {
    tags.push({
      key: 'cuisine',
      label: `菜系: ${getCuisineText(recipeFilters.value.cuisine)}`
    })
  }
  
  if (recipeFilters.value.mealType !== 'all') {
    tags.push({
      key: 'mealType',
      label: `餐点: ${getMealTypeText(recipeFilters.value.mealType)}`
    })
  }
  
  if (recipeFilters.value.spiciness !== 'all') {
    tags.push({
      key: 'spiciness',
      label: `辣度: ${getSpicinessText(recipeFilters.value.spiciness)}`
    })
  }
  
  if (recipeFilters.value.cookingMethod !== 'all') {
    tags.push({
      key: 'cookingMethod',
      label: `烹饪: ${getCookingMethodText(recipeFilters.value.cookingMethod)}`
    })
  }
  
  if (recipeFilters.value.prepTime !== 'all') {
    const timeLabels = {
      quick: '快速 (≤30分钟)',
      medium: '中等 (30-60分钟)',
      long: '较长 (≥60分钟)'
    }
    tags.push({
      key: 'prepTime',
      label: `时间: ${timeLabels[recipeFilters.value.prepTime]}`
    })
  }
  
  if (recipeSearchKeyword.value.trim()) {
    tags.push({
      key: 'search',
      label: `搜索: "${recipeSearchKeyword.value}"`
    })
  }
  
  if (activeRecipeTab.value !== 'recommended') {
    const categoryLabels = {
      quick: '快手菜',
      healthy: '健康',
      traditional: '传统'
    }
    tags.push({
      key: 'category',
      label: `分类: ${categoryLabels[activeRecipeTab.value]}`
    })
  }
  
  return tags
})

// 清除单个筛选
const clearFilter = (key) => {
  if (key === 'search') {
    recipeSearchKeyword.value = ''
  } else if (key === 'category') {
    activeRecipeTab.value = 'recommended'
  } else {
    recipeFilters.value[key] = 'all'
  }
}

// 重置所有筛选
const resetAllFilters = () => {
  recipeFilters.value = {
    difficulty: 'all',
    prepTime: 'all',
    cuisine: 'all',
    mealType: 'all',
    spiciness: 'all',
    cookingMethod: 'all'
  }
  recipeSearchKeyword.value = ''
  activeRecipeTab.value = 'recommended'
}

// 保存用户偏好
const saveUserPreferences = () => {
  // 处理喜爱的食材输入
  if (favoriteIngredientsInput.value) {
    userPreferences.value.favoriteIngredients = favoriteIngredientsInput.value
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient)
  }
  
  // 处理喜爱的菌菇输入
  if (favoriteMushroomsInput.value) {
    userPreferences.value.favoriteMushrooms = favoriteMushroomsInput.value
      .split(',')
      .map(mushroom => mushroom.trim())
      .filter(mushroom => mushroom)
  }
  
  // 在实际应用中，这里应该将用户偏好保存到后端或本地存储
  localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
  ElMessage.success('用户偏好已保存')
  console.log('用户偏好已保存:', userPreferences.value)
}

// 保存用户偏好并关闭对话框
const saveUserPreferencesAndClose = () => {
  saveUserPreferences()
  showPreferencesDialog.value = false
}

// 加载用户偏好
const loadUserPreferences = () => {
  try {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      userPreferences.value = JSON.parse(savedPreferences)
      // 设置喜爱的食材输入
      if (userPreferences.value.favoriteIngredients && userPreferences.value.favoriteIngredients.length > 0) {
        favoriteIngredientsInput.value = userPreferences.value.favoriteIngredients.join(', ')
      }
      // 设置喜爱的菌菇输入
      if (userPreferences.value.favoriteMushrooms && userPreferences.value.favoriteMushrooms.length > 0) {
        favoriteMushroomsInput.value = userPreferences.value.favoriteMushrooms.join(', ')
      }
      // 确保口味偏好对象存在
      if (!userPreferences.value.tastePreferences) {
        userPreferences.value.tastePreferences = {
          spicy: false,
          sweet: false,
          sour: false,
          savory: false,
          bitter: false
        }
      }
      console.log('已加载用户偏好:', userPreferences.value)
    }
  } catch (error) {
    console.error('加载用户偏好失败:', error)
  }
}

// 获取相关视频
const fetchVideos = async (box) => {
  console.log('开始获取相关视频:', box)
  
  // 重置状态
  isLoadingVideos.value = true
  videosError.value = null
  videos.value = []
  
  try {
    if (box && box.id) {
      const cacheKey = `box_${box.id}_videos`
      
      // 清除旧缓存，确保获取最新数据
      delete contentCache.value.videos[cacheKey]
      
      // 调用后端 API 获取视频
      console.log('调用 API 获取盲盒关联视频，盲盒ID:', box.id)
      const response = await apiClient.cookingVideo.getByMushroomBoxId(box.id)
      console.log('API 返回的视频数据:', response)
      
      let videoData = []
      if (response && response.success && response.data) {
        videoData = response.data
      } else if (Array.isArray(response)) {
        videoData = response
      } else if (response && Array.isArray(response.data)) {
        videoData = response.data
      }
      
      console.log('提取到的视频数据:', videoData)
      
      // 确保视频数据格式正确
      videoData = videoData.map(video => ({
        id: video.id,
        title: video.title || '未命名视频',
        description: video.description || '',
        thumbnail: video.thumbnailUrl || video.thumbnail || video.coverImage || '/images/placeholder-mushroom-150.svg',
        url: video.videoUrl || video.url || '',
        duration: video.duration || 0,
        views: video.viewCount || video.views || 0,
        category: video.category || 'general',
        sortOrder: video.sortOrder || 0,
        status: video.status || 'active',
        quality: video.quality || '720p',
        createdAt: video.createdAt || new Date().toISOString()
      }))
      
      videos.value = videoData
      console.log('处理后的视频:', videos.value)
      
      // 缓存结果
      contentCache.value.videos[cacheKey] = videoData
      console.log('视频已缓存')
      
      // 重置重试计数
      retryCounts.value.videos = 0
    } else {
      console.log('盲盒无内容，无法获取相关视频')
      videosError.value = '盲盒无内容，无法获取相关视频'
    }
  } catch (error) {
    console.error('获取相关视频失败:', error)
    
    // 处理网络错误
    let errorMessage = '获取相关视频失败，请稍后重试'
    if (error.message.includes('Network') || error.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络设置后重试'
    } else if (error.message.includes('404')) {
      errorMessage = '未找到相关视频，请稍后再试'
    } else if (error.message.includes('500')) {
      errorMessage = '服务器错误，请稍后再试'
    } else {
      errorMessage = error.message || '获取相关视频失败，请稍后重试'
    }
    
    videosError.value = errorMessage
    
    // 重试机制
    if (retryCounts.value.videos < maxRetries) {
      retryCounts.value.videos++
      console.log(`尝试重试获取视频 (${retryCounts.value.videos}/${maxRetries})`)
      setTimeout(() => {
        fetchVideos(box)
      }, retryDelay * retryCounts.value.videos) // 指数退避
    }
    
    // 即使出错也显示空状态，避免界面空白
    videos.value = []
  } finally {
    isLoadingVideos.value = false
    console.log('相关视频获取完成')
  }
}

// 增加视频观看次数
const incrementVideoViews = async (videoId) => {
  if (!videoId) return
  
  try {
    await apiClient.cookingVideo.incrementViews(videoId)
  } catch (error) {
    console.error('增加视频观看次数失败:', error)
  }
}

// 基于用户行为排序视频
const sortVideosByUserBehavior = (videoData) => {
  return [...videoData].sort((a, b) => {
    // 1. 优先推荐用户看过的类别
    const aCategoryScore = userBehavior.value.preferredCategories[a.category] || 0
    const bCategoryScore = userBehavior.value.preferredCategories[b.category] || 0
    if (aCategoryScore !== bCategoryScore) {
      return bCategoryScore - aCategoryScore
    }
    
    // 2. 其次推荐用户看过的视频
    const aViewCount = userBehavior.value.watchedVideos.find(v => v.id === a.id)?.viewCount || 0
    const bViewCount = userBehavior.value.watchedVideos.find(v => v.id === b.id)?.viewCount || 0
    if (aViewCount !== bViewCount) {
      return bViewCount - aViewCount
    }
    
    // 3. 考虑视频时长（中等长度优先）
    const durationScore = (video) => {
      if (video.duration >= 300 && video.duration <= 600) return 3 // 5-10分钟
      if (video.duration >= 180 && video.duration <= 900) return 2 // 3-15分钟
      return 1
    }
    
    const aDurationScore = durationScore(a)
    const bDurationScore = durationScore(b)
    if (aDurationScore !== bDurationScore) {
      return bDurationScore - aDurationScore
    }
    
    // 4. 最后按观看次数
    return b.views - a.views
  })
}

// 处理购买
const handlePurchase = async () => {
  // 表单验证
  if (!orderForm.value.receiver || !orderForm.value.phone || !orderForm.value.address) {
    ElMessage.error({
      message: '请填写完整的收货信息',
      duration: 3000,
      showClose: true
    })
    return
  }
  
  try {
    const order = await boxStore.createBoxOrder(route.params.id, orderForm.value)
    ElMessage.success({
      message: '订单创建成功！',
      duration: 3000,
      showClose: true
    })
    // 跳转到订单详情页
    setTimeout(() => {
      router.push(`/box-orders/${order.id}`)
    }, 1500)
  } catch (error) {
    let errorMessage = '订单创建失败，请稍后重试'
    if (error.message.includes('Network')) {
      errorMessage = '网络连接失败，请检查网络设置后重试'
    } else if (error.message.includes('404')) {
      errorMessage = '盲盒信息不存在，请稍后再试'
    } else if (error.message.includes('500')) {
      errorMessage = '服务器内部错误，请稍后再试'
    }
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true
    })
  }
}

// 处理食谱点击
const handleRecipeClick = (recipe) => {
  if (!recipe) return
  trackRecipeClick(recipe)
  trackRecipeView(recipe)
  router.push(`/recipes/${recipe.id}`)
}

// 导航到食谱详情（保留用于兼容性）
const navigateToRecipeDetail = (recipeId) => {
  const recipe = recommendedRecipes.value.find(r => r.id === recipeId)
  if (recipe) {
    trackRecipeClick(recipe)
    trackRecipeView(recipe)
  }
  router.push(`/recipes/${recipeId}`)
}

// 重置视频筛选
const resetVideoFilters = () => {
  activeVideoCategory.value = 'all'
  videoSearchKeyword.value = ''
  videoSortBy.value = 'relevance'
  videoFilters.value = {
    status: 'all',
    quality: 'all'
  }
}

// 处理视频搜索
const handleVideoSearch = () => {
  console.log('搜索视频:', videoSearchKeyword.value)
}

// 处理视频排序变化
const handleVideoSortChange = () => {
  console.log('视频排序方式:', videoSortBy.value)
}

// 重试获取盲盒详情
const retryFetchBoxDetail = () => {
  if (route.params.id) {
    fetchBoxDetail(route.params.id)
  }
}



// 页面加载时获取数据
onMounted(() => {
  loadUserPreferences() // 加载用户偏好
  loadUserBehavior() // 加载用户行为数据
  if (route.params.id) {
    fetchBoxDetail(route.params.id)
  }
})
</script>

<style scoped>
.product-detail-container {
  padding: 20px 0;
  position: relative;
}

/* 退出查看按钮样式 */
.exit-view-button {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.exit-view-button:hover {
  background-color: #e4e7ed;
  color: #409eff;
  border-color: #c6e2ff;
}

.exit-view-button:active {
  background-color: #dcdfe6;
  color: #3a8ee6;
  border-color: #3a8ee6;
}

.exit-view-button:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
  gap: 10px;
}

.empty {
  padding: 100px 0;
}

.product-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* 盲盒图片 */
.product-images {
  margin-bottom: 30px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 盲盒信息 */
.product-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.season-tag {
  display: inline-block;
  background: #16a085;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.product-name {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.product-status {
  margin-bottom: 20px;
}

.product-price {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 20px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  padding: 5px 0;
}

/* 购买选项 */
.purchase-options {
  margin-top: 30px;
}

.quantity-form {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 盲盒详情 */
.product-description {
  margin-top: 30px;
}

.product-description h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.description-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

/* 代培服务样式 */
.cultivation-service-highlight {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #16a085;
}

.service-badge {
  display: inline-flex;
  align-items: center;
  background: #16a085;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.service-badge .el-icon {
  margin-right: 8px;
}

.service-details {
  margin-bottom: 15px;
}

.service-info {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  margin-right: 10px;
  min-width: 80px;
}

.info-value {
  color: #16a085;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail {
    padding: 15px;
  }
  
  .product-name {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 24px;
  }
  
  .product-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  /* 退出查看按钮响应式设计 */
  .exit-view-button {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    font-size: 12px;
  }
  
  /* 在小屏幕上只显示图标，隐藏文字 */
  .exit-view-button span {
    display: none;
  }
  
  .exit-view-button svg {
    width: 16px;
    height: 16px;
  }
}

.service-inclusions {
  margin-top: 10px;
}

.inclusion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.inclusion-tag {
  background: white;
  color: #16a085;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  border: 1px solid #16a085;
}

.service-description {
  color: #546e7a;
  font-size: 0.95rem;
  line-height: 1.5;
}

.service-hint {
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 5px;
  margin-left: 20px;
}

/* 菌菇列表 */
.box-items-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.box-items-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.mushrooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.mushroom-item {
  display: flex;
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mushroom-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.mushroom-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.mushroom-info {
  flex: 1;
}

.mushroom-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.mushroom-scientific {
  font-size: 0.85rem;
  color: #95a5a6;
  margin: 0 0 10px 0;
  font-style: italic;
}

.mushroom-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mushroom-cultivation h4 {
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.difficulty-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-badge.easy {
  background: #e8f5e8;
  color: #4caf50;
}

.difficulty-badge.medium {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty-badge.hard {
  background: #ffebee;
  color: #f44336;
}

/* 培育指南 */
.cultivation-guide-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.cultivation-guide-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.guide-content {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.guide-steps {
  padding: 10px 0;
}

.step-item {
  display: flex;
  margin-bottom: 25px;
  position: relative;
}

.step-number {
  width: 30px;
  height: 30px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.step-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.guide-notes ul {
  padding-left: 20px;
}

.guide-notes li {
  color: #7f8c8d;
  margin-bottom: 10px;
  line-height: 1.5;
}

/* 推荐食谱 */
.recommended-recipes-section {
  padding: 30px;
}

.recommended-recipes-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.recipe-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.recipe-image-container {
  height: 180px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-content {
  padding: 15px;
}

.recipe-name {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #95a5a6;
}

.no-recipes {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 0.9rem;
}

/* 相关视频样式 */
.related-videos-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

/* 视频搜索和排序容器 */
.video-search-sort-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.video-search-box {
  flex: 1;
  max-width: 400px;
}

.video-sort-box {
  min-width: 120px;
}

@media (max-width: 768px) {
  .video-search-sort-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .video-search-box {
    max-width: 100%;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

/* 视频分类标签 */
.video-categories {
  margin-bottom: 20px;
}

.categories-tabs {
  border-bottom: 1px solid #e4e7ed;
}

.categories-tabs .el-tabs__item {
  font-size: 14px;
  padding: 10px 20px;
}

.categories-tabs .el-tabs__item.is-active {
  color: #4CAF50;
  font-weight: 600;
}

.categories-tabs .el-tabs__active-bar {
  background-color: #4CAF50;
}

/* 视频卡片 */
.video-thumbnail-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.video-category-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.video-thumbnail-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-thumbnail {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.video-content {
  padding: 15px;
}

.video-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-meta {
  font-size: 0.85rem;
  color: #95a5a6;
}

.loading-videos,
.error-videos {
  grid-column: 1 / -1;
}

.no-videos {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 0.9rem;
}

.error-state {
  text-align: center;
  padding: 50px 0;
}

/* 搜索框样式 */
.recipe-search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}

.recipe-search-box .el-input {
  flex: 1;
}

/* 食谱筛选器样式 */
.recipe-filters {
  margin: 15px 0;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
}

.recipe-filters .el-select {
  width: 100%;
}

/* 活跃筛选标签样式 */
.active-filter-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 15px 0;
  padding: 10px 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.tags-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 食谱分类标签 */
.recipe-categories {
  margin-bottom: 20px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 错误操作按钮 */
.error-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.error-recipes,
.error-videos {
  grid-column: 1 / -1;
  padding: 20px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .box-main-info {
    flex-direction: column;
  }
  
  .box-images {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .mushrooms-grid {
    grid-template-columns: 1fr;
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .box-name {
    font-size: 1.5rem;
  }
  
  .price {
    font-size: 1.5rem;
  }
  
  .recipe-filters .el-col {
    margin-bottom: 10px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .section-header h2 {
    margin: 0;
  }
}

/* 食谱分类标签样式 */
.categories-tabs {
  border-bottom: 1px solid #e4e7ed;
}

.categories-tabs .el-tabs__item {
  font-size: 14px;
  padding: 10px 20px;
}

.categories-tabs .el-tabs__item.is-active {
  color: #4CAF50;
  font-weight: 600;
}

.categories-tabs .el-tabs__active-bar {
  background-color: #4CAF50;
}

/* 食谱卡片悬停效果增强 */
.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.recipe-card {
  transition: all 0.3s ease;
}

/* 时令盲盒信息样式 */
.seasonal-box-info {
  margin-top: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-label {
  font-weight: bold;
  color: #606266;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  flex: 1;
  word-break: break-word;
}
</style>
