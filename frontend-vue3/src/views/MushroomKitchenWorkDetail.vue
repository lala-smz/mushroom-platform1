<template>
  <div class="mushroom-kitchen-work-detail">
    <!-- 作品头部信息 -->
    <div class="work-header">
      <el-button
        type="primary"
        plain
        class="back-button"
        @click="goBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>{{ work?.title || '作品详情' }}</h1>
    </div>

    <!-- 作品主体内容 -->
    <div class="work-content">
      <!-- 作品图片 -->
      <div class="work-image-section">
        <img
          :src="work?.imageUrl || '/images/placeholder-mushroom-300.svg'"
          :alt="work?.title"
          class="work-image"
          @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
        >
      </div>

      <!-- 作品信息和互动区 -->
      <div class="work-info-section">
        <!-- 作品基本信息 -->
        <div class="work-basic-info">
          <div class="work-rating">
            <el-rate
              v-model="workRating"
              disabled
              :max="5"
              :score-template="'{{ value }}'"
            />
            <span class="rating-text">{{ work?.rating || 0 }} 星</span>
          </div>
          <div class="work-meta">
            <div class="author-info">
              <span class="author-label">作者：</span>
              <span 
                class="author-name" 
                @click="navigateToUserWorks(work?.authorId)"
              >
                {{ work?.authorName }}
              </span>
            </div>
            <div class="publish-date">
              <span class="date-label">发布时间：</span>
              <span>{{ formatDate(work?.createdAt) }}</span>
            </div>
            <div class="mushroom-type">
              <span class="type-label">菌菇种类：</span>
              <span class="type-value">{{ getMushroomTypeName(work?.mushroomType) }}</span>
            </div>
            <div class="cooking-time">
              <span class="time-label">烹饪时间：</span>
              <span class="time-value">{{ work?.cookingTime || '30分钟' }}</span>
            </div>
            <div class="difficulty-level">
              <span class="difficulty-label">难度等级：</span>
              <span class="difficulty-value">{{ work?.difficulty || '中等' }}</span>
            </div>
          </div>
        </div>

        <!-- 互动按钮 -->
        <div class="interaction-buttons">
          <el-button 
            type="primary" 
            :plain="!isLiked" 
            :icon="isLiked ? StarFilled : Star" 
            class="interaction-btn"
            :loading="isLiking"
            @click="toggleLike"
          >
            {{ isLiking ? '点赞中...' : (isLiked ? '已点赞' : '点赞') }}
            <span class="btn-count">({{ work?.likes || 0 }})</span>
          </el-button>

          <el-button 
            type="primary" 
            :plain="false" 
            :icon="Star" 
            class="interaction-btn rating-btn"
            @click="showRatingDialog = true"
          >
            评分
          </el-button>
          <el-button 
            type="primary" 
            plain 
            :icon="Share" 
            class="interaction-btn"
            @click="showShareDialog = true"
          >
            分享
          </el-button>
          <el-button 
            type="primary" 
            plain 
            :icon="Collection" 
            class="interaction-btn"
            @click="navigateToMyWorks"
          >
            我的菜肴
          </el-button>
          
          <el-button 
            type="primary" 
            :plain="!isFavorited" 
            :icon="isFavorited ? StarFilled : Star" 
            class="interaction-btn"
            :loading="isFavoriting"
            @click="toggleFavorite"
          >
            {{ isFavoriting ? '操作中...' : (isFavorited ? '已收藏' : '收藏') }}
          </el-button>
        </div>

        <!-- 作品描述 -->
        <div class="work-description">
          <h3>作品描述</h3>
          <p>{{ work?.description || '暂无描述' }}</p>
        </div>

        <!-- 配料信息 -->
        <div class="work-ingredients">
          <h3>配料</h3>
          <ul class="ingredients-list">
            <li
              v-for="(ingredient, index) in (work?.ingredients || ['菌菇适量', '盐适量', '食用油适量'])"
              :key="index"
            >
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <!-- 做法步骤 -->
        <div class="work-steps">
          <h3>做法步骤</h3>
          <!-- 步骤导航 -->
          <div
            v-if="(work?.steps || ['准备菌菇并清洗干净', '热锅倒油，放入菌菇翻炒', '加入适量盐调味', '翻炒均匀后出锅']).length > 1"
            class="steps-navigation"
          >
            <el-button-group>
              <el-button 
                v-for="(step, index) in (work?.steps || ['准备菌菇并清洗干净', '热锅倒油，放入菌菇翻炒', '加入适量盐调味', '翻炒均匀后出锅'])" 
                :key="index"
                :type="currentStep === index ? 'primary' : 'default'"
                size="small"
                @click="currentStep = index"
              >
                步骤 {{ index + 1 }}
              </el-button>
            </el-button-group>
          </div>
          <!-- 步骤详情 -->
          <ol class="steps-list">
            <li
              v-for="(step, index) in (work?.steps || ['准备菌菇并清洗干净', '热锅倒油，放入菌菇翻炒', '加入适量盐调味', '翻炒均匀后出锅'])"
              :key="index"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-content">{{ step }}</span>
            </li>
          </ol>
        </div>

        <!-- 营养成分 -->
        <div class="work-nutrition">
          <h3>营养成分</h3>
          <div class="nutrition-list">
            <div class="nutrition-item">
              <span class="nutrition-label">热量：</span>
              <span class="nutrition-value">{{ work?.nutrition?.calories || '120' }} 千卡</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">蛋白质：</span>
              <span class="nutrition-value">{{ work?.nutrition?.protein || '5' }} g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">碳水化合物：</span>
              <span class="nutrition-value">{{ work?.nutrition?.carbs || '15' }} g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">脂肪：</span>
              <span class="nutrition-value">{{ work?.nutrition?.fat || '6' }} g</span>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 评论系统 -->
    <div class="comments-section">
      <h2>评论区</h2>
      
      <!-- 评论表单 -->
      <div
        v-if="userStore.isLoggedIn"
        class="comment-form-section"
      >
        <h3>发表反馈</h3>
        <el-form
          ref="commentFormRef"
          :model="commentForm"
          :rules="commentRules"
          label-width="100px"
          class="comment-form"
        >
          <el-form-item
            label="评分"
            prop="rating"
          >
            <el-rate
              v-model="commentForm.rating"
              :max="5"
              show-score
              text-color="#ff9900"
              :score-template="commentForm.rating ? '{value}星' : ''"
              @change="handleRatingChange"
            />
            <p class="form-hint">
              您可以仅提交评分而不输入评论
            </p>
          </el-form-item>
          <el-form-item
            label="评论内容"
            prop="content"
          >
            <el-input
              v-model="commentForm.content"
              type="textarea"
              placeholder="请输入您的评论"
              maxlength="500"
              show-word-limit
              rows="4"
              @input="handleCommentInput"
            />
            <p class="form-hint">
              您可以仅提交评论而不进行评分
            </p>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="isSubmittingComment"
              :disabled="!canSubmit"
              @click="submitComment"
            >
              提交反馈
            </el-button>
            <el-button
              type="default"
              :disabled="isSubmittingComment"
              @click="resetForm"
            >
              重置
            </el-button>
            <p class="form-note">
              提示：您可以选择仅提交评论、仅提交评分，或同时提交两者
            </p>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 评论列表 -->
      <div class="comments-list">
        <div
          v-if="comments.length > 0"
          class="comments-header"
        >
          <span>共有 {{ comments.length }} 条评论</span>
        </div>
        <div
          v-else
          class="no-comments"
        >
          暂无评论，快来发表第一条评论吧！
        </div>
        
        <!-- 评论加载状态 -->
        <div
          v-if="isLoadingComments"
          class="loading-comments"
        >
          <el-skeleton
            :rows="3"
            animated
          />
        </div>
        
        <!-- 评论列表 -->
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          :class="[
            'comment-item',
            { 
              'comment-only': comment.content && !comment.rating, 
              'rating-only': !comment.content && comment.rating, 
              'comment-with-rating': comment.content && comment.rating 
            }
          ]"
        >
          <div class="comment-header">
            <div class="comment-user-info">
              <span class="comment-username">{{ comment.user?.username || '未知用户' }}</span>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              <span 
                v-if="comment.content && (!comment.rating || comment.rating === 0)" 
                class="comment-type-label comment-only-label"
              >
                纯评论
              </span>
              <span 
                v-else-if="!comment.content && comment.rating && comment.rating > 0" 
                class="comment-type-label rating-only-label"
              >
                纯评分
              </span>
              <span 
                v-else-if="comment.content && comment.rating && comment.rating > 0" 
                class="comment-type-label comment-with-rating-label"
              >
                评论+评分
              </span>
            </div>
            <div 
              v-if="comment.rating && comment.rating > 0" 
              class="comment-rating"
            >
              <el-rate
                :model-value="comment.rating"
                disabled
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}"
                class="custom-rating"
              />
            </div>
          </div>
          <div 
            v-if="comment.content" 
            class="comment-content"
          >
            {{ comment.content }}
          </div>
          <div 
            v-else-if="comment.rating && comment.rating > 0 && !comment.content" 
            class="rating-only-message"
          >
            用户仅提交了评分
          </div>
          <div class="comment-actions">
            <!-- 回复按钮 -->
            <el-button
              v-if="userStore.isLoggedIn && comment.content"
              type="primary"
              size="small"
              plain
              @click="toggleReplyForm(comment.id)"
            >
              {{ replyForms[comment.id] ? '取消回复' : '回复' }}
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              v-if="userStore.isLoggedIn && (comment.userId === userStore.userInfo?.id || userStore.userInfo?.role === 'admin')"
              type="danger"
              size="small"
              :loading="isDeletingComment"
              @click="deleteComment(comment.id)"
            >
              {{ isDeletingComment ? '删除中...' : '删除' }}
            </el-button>
          </div>
          
          <!-- 回复表单 -->
          <div
            v-if="replyForms[comment.id] && userStore.isLoggedIn"
            class="reply-form"
          >
            <el-form
              :model="replyForms[comment.id]"
              label-width="0"
              class="reply-form-inner"
            >
              <el-form-item prop="content">
                <el-input
                  v-model="replyForms[comment.id].content"
                  type="textarea"
                  placeholder="请输入回复内容"
                  maxlength="300"
                  show-word-limit
                  rows="3"
                />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="isSubmittingReply"
                  :disabled="!replyForms[comment.id].content.trim()"
                  @click="submitReply(comment.id)"
                >
                  {{ isSubmittingReply ? '提交中...' : '提交回复' }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 回复列表 -->
          <div
            v-if="comment.replies && comment.replies.length > 0"
            class="replies-list"
          >
            <div 
              v-for="reply in comment.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-header">
                <span class="reply-username">{{ reply.user?.username || '未知用户' }}</span>
                <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <div class="reply-content">
                {{ reply.content || '无回复内容' }}
              </div>
              <div
                v-if="userStore.isLoggedIn && (reply.userId === userStore.userInfo?.id || userStore.userInfo?.role === 'admin')"
                class="reply-actions"
              >
                <el-button
                  type="danger"
                  size="small"
                  :loading="isDeletingComment"
                  @click="deleteComment(reply.id)"
                >
                  {{ isDeletingComment ? '删除中...' : '删除' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 相关推荐 -->
    <div class="related-works-section">
      <h2>相关推荐</h2>
      <div class="related-works-grid">
        <!-- 相关推荐加载状态 -->
        <div
          v-if="isLoadingRelatedWorks"
          class="loading-related-works"
        >
          <el-skeleton
            :rows="3"
            animated
          />
        </div>
        
        <!-- 相关推荐列表 -->
        <div 
          v-for="relatedWork in relatedWorks" 
          :key="relatedWork.id"
          class="related-work-card"
          @click="navigateToWorkDetail(relatedWork.id)"
        >
          <div class="related-work-image-container">
            <img 
              :src="relatedWork.imageUrl || '/images/placeholder-mushroom-300.svg'" 
              :alt="relatedWork.title" 
              class="related-work-image"
              @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
            >
          </div>
          <h3 class="related-work-title">
            {{ relatedWork.title }}
          </h3>
          <div class="related-work-meta">
            <span class="related-work-author">{{ relatedWork.authorName }}</span>
            <span class="related-work-rating">{{ relatedWork.rating }} 星</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享对话框 -->
    <el-dialog
      v-model="showShareDialog"
      title="分享作品"
      width="400px"
    >
      <div class="share-content">
        <p class="share-title">
          {{ work?.title }}
        </p>
        <div class="share-platforms">
          <el-button
            type="primary"
            plain
            class="share-btn wechat"
            @click="shareToWechat"
          >
            <el-icon><ChatLineRound /></el-icon>
            微信
          </el-button>
          <el-button
            type="primary"
            plain
            class="share-btn weibo"
            @click="shareToWeibo"
          >
            <el-icon><Position /></el-icon>
            微博
          </el-button>
          <el-button
            type="primary"
            plain
            class="share-btn copy"
            @click="copyShareLink"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制链接
          </el-button>
        </div>
        <div class="share-link">
          <el-input
            v-model="shareLink"
            readonly
          />
        </div>
      </div>
    </el-dialog>

    <!-- 评分对话框 -->
    <StarRating
      :visible="showRatingDialog"
      :work-id="workId"
      :current-rating="workRating"
      @close="showRatingDialog = false"
      @confirm="handleRatingConfirm"
    />



    <!-- 评分趋势图表 -->
    <RatingTrendChart
      :work-id="workId"
      :data="ratingTrendData"
      :is-loading="isLoadingRatingTrend"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/useUserStore'
import { useWorkStore } from '../stores/useWorkStore'
import { ArrowLeft, Star, StarFilled, Collection, Share, ChatLineRound, Position, DocumentCopy } from '@element-plus/icons-vue'
import { apiClient } from '../api/index.js'
import { ElMessage } from 'element-plus'
import StarRating from '../components/StarRating.vue'
import RatingTrendChart from '../components/RatingTrendChart.vue'
import webSocketService from '../utils/websocket'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const workStore = useWorkStore()

// 作品ID
const workId = computed(() => route.params.id)

// 作品数据
const work = computed(() => workStore.currentWork)
const workRating = computed(() => work.value?.rating || 0)



// 互动状态
const isLiked = ref(false)
const isLiking = ref(false)

// 收藏状态
const isFavorited = computed(() => {
  return workStore.isWorkFavorited(workId.value)
})
const isFavoriting = computed(() => {
  return workStore.isFavoriting
})

// 切换点赞状态
const toggleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录后再点赞')
    navigateToLogin()
    return
  }
  
  if (isLiking.value) {
    return // 防止重复点击
  }
  
  try {
    isLiking.value = true
    
    if (isLiked.value) {
      // 取消点赞
      await workStore.unlikeWork(workId.value)
      isLiked.value = false
      ElMessage.success('取消点赞成功！')
    } else {
      // 点赞
      try {
        await workStore.likeWork(workId.value)
        isLiked.value = true
        ElMessage.success('点赞成功！')
      } catch (error) {
        // 检查是否是"已经点赞过"的错误
        if (error.message && error.message.includes('已经点赞过')) {
          // 如果是这种情况，更新本地状态为已点赞
          isLiked.value = true
          ElMessage.info('您已经点赞过该作品啦！')
        } else {
          // 其他错误重新抛出
          throw error
        }
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录后再收藏')
    navigateToLogin()
    return
  }
  
  if (isFavoriting.value) {
    return // 防止重复点击
  }
  
  try {
    if (isFavorited.value) {
      // 取消收藏
      await workStore.unfavoriteWork(workId.value)
      ElMessage.success('取消收藏成功！')
    } else {
      // 收藏
      await workStore.favoriteWork(workId.value)
      ElMessage.success('收藏成功！')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    // 错误处理已经在 store 中完成
  }
}







// 分享相关
const showShareDialog = ref(false)
const shareLink = ref('')

// 评分相关
const showRatingDialog = ref(false)
const ratingTrendData = ref([])
const isLoadingRatingTrend = ref(false)

// 步骤导航
const currentStep = ref(0)

// 评论相关
const commentFormRef = ref(null)
const commentForm = reactive({
  content: '',
  rating: null
})
const commentRules = reactive({
  content: [
    { max: 500, message: '评论内容长度不能超过 500 个字符', trigger: 'blur' }
  ],
  rating: [
    { type: 'number', min: 1, max: 5, message: '评分必须在 1-5 星之间', trigger: 'change' }
  ]
})
const comments = ref([])
const isSubmittingComment = ref(false)
const isLoadingComments = ref(false)
const isDeletingComment = ref(false)

// 计算属性：判断是否可以提交反馈
const canSubmit = computed(() => {
  return commentForm.content.trim() || (commentForm.rating && commentForm.rating > 0)
})

// 处理评分变化
const handleRatingChange = (value) => {
  console.log('评分变化:', value)
  // 可以在这里添加额外的评分处理逻辑
}

// 处理评论输入
const handleCommentInput = (value) => {
  console.log('评论输入:', value)
  // 可以在这里添加额外的评论输入处理逻辑
}

// 重置表单
const resetForm = () => {
  commentForm.content = ''
  commentForm.rating = null
  if (commentFormRef.value) {
    commentFormRef.value.resetFields()
  }
}

// 回复相关
const replyForms = reactive({})
const isSubmittingReply = ref(false)

// 初始化回复表单
const initReplyForm = (commentId) => {
  replyForms[commentId] = {
    content: '',
    parentId: commentId
  }
}

// 切换回复表单显示
const toggleReplyForm = (commentId) => {
  if (replyForms[commentId]) {
    delete replyForms[commentId]
  } else {
    initReplyForm(commentId)
  }
}

// 分享到微信
const shareToWechat = () => {
  // 微信分享需要特殊处理，这里显示提示
  ElMessage.info('请在微信中打开链接进行分享')
  // 实际项目中可以生成二维码让用户扫码分享
}

// 分享到微博
const shareToWeibo = () => {
  if (!shareLink.value) return
  
  const title = encodeURIComponent(work.value?.title || '菌类作品')
  const content = encodeURIComponent(`我发现了一个有趣的菌类作品：${work.value?.title || ''}`)
  const url = encodeURIComponent(shareLink.value)
  
  const weiboUrl = `http://service.weibo.com/share/share.php?url=${url}&title=${title}&content=${content}`
  window.open(weiboUrl, '_blank', 'width=600,height=400')
}

// 复制分享链接
const copyShareLink = async () => {
  if (!shareLink.value) return
  
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('链接复制成功！')
  } catch (error) {
    console.error('复制链接失败:', error)
    ElMessage.error('复制链接失败，请手动复制')
  }
}

// 相关推荐
const relatedWorks = ref([])
const isLoadingRelatedWorks = ref(false)



// 菌菇种类映射
const mushroomTypesMap = {
  shiitake: '香菇',
  oyster: '平菇',
  enoki: '金针菇',
  king: '杏鲍菇',
  matsutake: '松茸',
  other: '其他'
}

// 获取菌菇种类名称
const getMushroomTypeName = (type) => {
  return mushroomTypesMap[type] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return ''
  }
  
  try {
    // 优先使用现代浏览器的toLocaleDateString方法
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    // 兼容旧浏览器的备选方案
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 导航到用户作品页
const navigateToUserWorks = (userId) => {
  if (userId) {
    router.push(`/mushroom-kitchen/user/${userId}`)
  }
}

// 导航到作品详情页
const navigateToWorkDetail = (id) => {
  if (id !== workId.value) {
    router.push(`/mushroom-kitchen/work/${id}`)
  }
}

// 导航到登录页
const navigateToLogin = () => {
  router.push({
    name: 'Login',
    query: { redirect: route.fullPath }
  })
}

// 导航到我的菜肴页面
const navigateToMyWorks = () => {
  if (userStore.isLoggedIn && userStore.userInfo?.id) {
    router.push(`/mushroom-kitchen/user/${userStore.userInfo.id}`)
  } else {
    navigateToLogin()
  }
}

// 获取评论列表
const fetchComments = async (page = 1, pageSize = 20) => {
  if (!workId.value) {
    console.error('获取评论失败: 无效的作品ID')
    ElMessage.error('无效的作品ID')
    return
  }

  try {
    isLoadingComments.value = true
    
    // 显示加载提示
    const loadingMessage = ElMessage({
      message: '加载评论中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    // 直接调用API获取评论
    try {
      const response = await apiClient.work.getComments(workId.value, { page, pageSize })
      
      if (response && response.data && Array.isArray(response.data.comments)) {
        // 正确处理API返回的数据
        const fetchedComments = response.data.comments.map(comment => ({
          id: comment.id,
          content: comment.content || '',
          rating: comment.rating ? parseInt(comment.rating) : null,
          createdAt: comment.createdAt || new Date().toISOString(),
          user: comment.user || { username: '匿名用户' },
          userId: comment.userId || comment.user?.id || null,
          replies: comment.replies && Array.isArray(comment.replies) ? comment.replies : []
        }))
        
        // 按时间排序，最新的在前
        comments.value = fetchedComments.sort((a, b) => {
          const timeB = new Date(b.createdAt).getTime()
          const timeA = new Date(a.createdAt).getTime()
          return timeB - timeA
        })
        
        // 关闭加载提示
        setTimeout(() => {
          loadingMessage.close()
        }, 300)
        
        // 评论加载成功提示
        if (comments.value.length > 0) {
          ElMessage({
            message: `成功加载 ${comments.value.length} 条评论`,
            type: 'success',
            duration: 2000
          })
        }
      } else {
        console.warn('获取评论数据格式不正确或评论数组不存在:', response)
        comments.value = []
        // 关闭加载提示
        setTimeout(() => {
          loadingMessage.close()
        }, 300)
        ElMessage.info('暂无评论数据')
      }
    } catch (apiError) {
      console.error('API获取评论失败:', apiError)
      // 关闭加载提示
      setTimeout(() => {
        loadingMessage.close()
      }, 300)
      throw apiError // 抛出错误让外层处理
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    
    // 根据错误类型提供更友好的错误信息
    let errorMessage = '获取评论失败，请稍后重试'
    if (error.message?.includes('timeout')) {
      errorMessage = '加载评论超时，请检查网络连接后重试'
    } else if (error.message?.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.status === 404) {
      errorMessage = '作品不存在或评论功能暂不可用'
    } else if (error.response?.status === 403) {
      errorMessage = '您没有权限查看评论'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
    comments.value = []
  } finally {
    isLoadingComments.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录后再评论')
    navigateToLogin()
    return
  }
  
  if (isSubmittingComment.value) {
    return // 防止重复点击
  }
  
  if (!commentFormRef.value) {
    ElMessage.error('表单引用错误')
    return
  }
  
  // 检查是否至少有评论内容或评分
  if (!commentForm.content.trim() && !commentForm.rating) {
    ElMessage.error('请至少输入评论内容或选择评分')
    return
  }
  
  // 验证评分是否在有效范围内（如果有评分）
  if (commentForm.rating && (typeof commentForm.rating !== 'number' || commentForm.rating < 1 || commentForm.rating > 5)) {
    ElMessage.error('评分必须在1-5星之间')
    return
  }
  
  try {
    // 移除对表单的强制验证，因为我们允许独立提交
    isSubmittingComment.value = true
    
    // 保存评论内容，防止网络异常导致内容丢失
    const commentContentBackup = commentForm.content
    const commentRatingBackup = commentForm.rating
    
    try {
      // 提交评分（如果有）
      if (commentForm.rating && commentForm.rating >= 1 && commentForm.rating <= 5) {
        await apiClient.work.addRating({
          workId: parseInt(workId.value, 10),
          userId: userStore.userInfo.id,
          rating: commentForm.rating
        })
      }
      
      // 提交评论（只要有评分或评论内容）
      if (commentForm.content.trim() || (commentForm.rating && commentForm.rating >= 1 && commentForm.rating <= 5)) {
        console.log('开始提交评论:', { 
          workId: workId.value, 
          content: commentForm.content, 
          rating: commentForm.rating 
        })
        
        // 直接调用API提交评论
        const response = await apiClient.work.addComment({
          workId: parseInt(workId.value, 10),
          userId: userStore.userInfo.id,
          content: commentForm.content,
          rating: commentForm.rating || null
        })
        
        if (!response.success) {
          throw new Error(response.error || '提交评论失败')
        }
      }
      
      console.log('评论/评分提交成功，准备更新页面')
      
      // 重置表单
      commentForm.content = ''
      commentForm.rating = null
      
      // 重新获取评论列表，确保评论立即显示
      await fetchComments()
      
      // 重新获取作品详情以更新总体评分
      await fetchWorkDetail()
      
      ElMessage.success('提交成功！')
      console.log('页面更新完成')
    } catch (error) {
      console.error('提交失败:', {
        error: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      
      // 恢复评论内容，防止内容丢失
      commentForm.content = commentContentBackup
      commentForm.rating = commentRatingBackup
      
      // 根据错误类型提供更友好的错误信息
      let errorMessage = '提交失败，请稍后重试'
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接后重试'
      } else if (error.message.includes('Network Error')) {
        errorMessage = '网络错误，请检查网络连接'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 404) {
        errorMessage = '评论/评分功能暂不可用'
      } else if (error.response?.status === 403) {
        errorMessage = '您没有权限提交评论/评分'
      } else if (error.response?.status === 500) {
        errorMessage = '服务器内部错误，请稍后重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      ElMessage.error(errorMessage)
    } finally {
      isSubmittingComment.value = false
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// 提交回复
const submitReply = async (commentId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录后再回复')
    navigateToLogin()
    return
  }
  
  if (isSubmittingReply.value) {
    return // 防止重复点击
  }
  
  const replyForm = replyForms[commentId]
  if (!replyForm) {
    ElMessage.error('回复表单错误')
    return
  }
  
  if (!replyForm.content.trim()) {
    ElMessage.error('请输入回复内容')
    return
  }
  
  // 验证回复内容长度
  if (replyForm.content.length > 300) {
    ElMessage.error('回复内容不能超过300个字符')
    return
  }
  
  // 保存回复内容，防止网络异常导致内容丢失
  const replyContentBackup = replyForm.content
  
  try {
    isSubmittingReply.value = true
    
    // 直接调用API提交回复
    const response = await apiClient.work.addComment({
      workId: parseInt(workId.value, 10),
      userId: userStore.userInfo.id,
      content: replyForm.content,
      rating: 5, // 回复默认评分为5
      parentId: commentId // 指定父评论ID
    })
    
    if (response.success) {
      // 清除回复表单
      delete replyForms[commentId]
      // 重新获取评论列表
      await fetchComments()
      ElMessage.success('回复提交成功！')
    } else {
      throw new Error(response.error || '提交回复失败')
    }
  } catch (error) {
    console.error('提交回复失败:', error)
    
    // 恢复回复内容，防止内容丢失
    if (replyForms[commentId]) {
      replyForms[commentId].content = replyContentBackup
    }
    
    // 根据错误类型提供更友好的错误信息
    let errorMessage = '提交回复失败，请稍后重试'
    if (error.message.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.response?.status === 404) {
      errorMessage = '评论功能暂不可用'
    } else if (error.response?.status === 403) {
      errorMessage = '您没有权限提交回复'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    isSubmittingReply.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (isDeletingComment.value) {
    return // 防止重复点击
  }
  
  // 验证评论ID
  if (!commentId) {
    ElMessage.error('评论ID不能为空')
    return
  }
  
  // 确保评论ID是数字类型
  const numericCommentId = typeof commentId === 'number' ? commentId : parseInt(commentId, 10)
  if (isNaN(numericCommentId) || numericCommentId <= 0) {
    ElMessage.error('无效的评论ID')
    return
  }
  
  // 验证用户是否登录
  if (!userStore.isLoggedIn || !userStore.userInfo?.id) {
    ElMessage.error('请先登录后再删除评论')
    navigateToLogin()
    return
  }
  
  try {
    isDeletingComment.value = true
    
    // 显示删除中提示
    const deletingMessage = ElMessage({
      message: '删除评论中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    console.log('开始删除评论:', { commentId: numericCommentId, userId: userStore.userInfo.id })
    
    // 直接调用API删除评论，传递用户ID
    const response = await apiClient.work.deleteComment(numericCommentId, {
      userId: userStore.userInfo.id
    })
    
    console.log('删除评论响应:', response)
    
    if (response.success) {
      // 关闭删除中提示
      setTimeout(() => {
        deletingMessage.close()
      }, 300)
      
      // 重新获取评论列表
      await fetchComments()
      // 重新获取作品详情以更新总体评分
      await fetchWorkDetail()
      
      ElMessage.success('评论删除成功！')
    } else {
      throw new Error(response.error || '删除评论失败')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    
    // 根据错误类型提供更友好的错误信息
    let errorMessage = '删除评论失败，请稍后重试'
    if (error.message.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    } else if (error.message.includes('权限') || error.message.includes('无权')) {
      errorMessage = '您没有权限删除此评论'
    } else if (error.response?.status === 404) {
      errorMessage = '评论不存在或已被删除'
    } else if (error.response?.status === 403) {
      errorMessage = '您没有权限删除此评论'
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.error || '请求参数错误'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    isDeletingComment.value = false
  }
}

// 处理评分确认
const handleRatingConfirm = async (ratingData) => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录再评分')
    navigateToLogin()
    return
  }
  
  try {
    // 直接调用API提交评分
    console.log('评分数据:', ratingData)
    
    const response = await apiClient.work.addRating({
      workId: parseInt(ratingData.workId, 10),
      rating: parseFloat(ratingData.rating),
      comment: ratingData.comment || ''
    })
    
    if (response.success) {
      // 关闭评分对话框
      showRatingDialog.value = false
      // 重新获取作品详情以更新评分
      await fetchWorkDetail()
      ElMessage.success('评分提交成功！')
      
      // 发送WebSocket事件通知服务器评分已提交
      try {
        // 确保WebSocket连接
        await webSocketService.ensureConnection()
        // 发送评分提交事件
        webSocketService.sendRatingSubmit(ratingData.workId, ratingData.rating)
      } catch (wsError) {
        console.error('发送评分提交WebSocket事件失败:', wsError)
        // WebSocket发送失败不影响评分结果
      }
    } else {
      throw new Error(response.error || '评分提交失败')
    }
  } catch (error) {
    console.error('评分失败:', error)
    
    // 根据错误类型提供更友好的错误信息
    let errorMessage = '评分提交失败，请稍后重试'
    if (error.message?.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接后重试'
    } else if (error.message?.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    } else if (error.response?.status === 404) {
      errorMessage = '评分功能暂不可用'
    } else if (error.response?.status === 403) {
      errorMessage = '您没有权限进行评分'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
  }
}

// 获取相关推荐
const fetchRelatedWorks = async () => {
  isLoadingRelatedWorks.value = true
  try {
    // 使用 apiClient 获取推荐作品作为相关推荐
    console.log('开始获取相关推荐:')
    const response = await apiClient.work.getRecommended({ mushroomType: 'all' })
    
    // 检查响应数据结构
    if (!response || !response.data || !response.data.works) {
      throw new Error('获取相关推荐失败：响应数据结构不正确')
    }
    
    relatedWorks.value = response.data.works.map(work => ({
      id: work.id,
      title: work.title,
      imageUrl: work.imageUrl,
      authorName: work.user?.username || work.authorName || '未知用户',
      rating: work.rating
    }))
    console.log('相关推荐获取成功:', relatedWorks.value.length, '条')
  } catch (error) {
    console.error('获取相关推荐失败:', {
      error: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null
    })
    // 相关推荐失败不影响主页面显示
    relatedWorks.value = []
  } finally {
    isLoadingRelatedWorks.value = false
  }
}

// 获取作品详情
const fetchWorkDetail = async () => {
  try {
    // 并行执行多个API请求，提升加载速度
    const [workDetailResult, relatedWorksResult, ratingTrendResult, commentsResult] = await Promise.allSettled([
      workStore.fetchWorkDetail(workId.value),
      fetchRelatedWorks(),
      fetchRatingTrendData(),
      fetchComments()
    ])
    
    // 生成分享链接
    shareLink.value = `${window.location.origin}/mushroom-kitchen/work/${workId.value}`
    
    // 检查收藏状态
    if (userStore.isLoggedIn && workId.value) {
      await workStore.checkWorkFavoriteStatus(workId.value)
    }
    
    // 记录各API请求的执行情况
    console.log('作品详情页数据加载结果:', {
      workDetail: workDetailResult.status,
      relatedWorks: relatedWorksResult.status,
      ratingTrend: ratingTrendResult.status,
      comments: commentsResult.status
    })
  } catch (error) {
    console.error('获取作品详情失败:', error)
  }
}

// 获取评分趋势数据
const fetchRatingTrendData = async () => {
  try {
    isLoadingRatingTrend.value = true
    
    // 检查是否有真实的 API 端点可用于获取评分趋势数据
    // 目前使用模拟数据，将来可以替换为真实的 API 调用
    console.log('开始获取评分趋势数据:')
    
    // 模拟获取过去30天的评分数据
    const mockData = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      // 生成随机评分数据（2-5分之间）
      const rating = (Math.random() * 3 + 2).toFixed(1)
      mockData.push({ date: dateStr, rating: parseFloat(rating) })
    }
    
    ratingTrendData.value = mockData
    console.log('评分趋势数据获取成功:', mockData.length, '条')
    
    // 将来可以替换为真实的 API 调用
    /*
    try {
      const response = await apiClient.work.getRatingTrend(workId.value)
      if (response.success && response.data && Array.isArray(response.data)) {
        ratingTrendData.value = response.data
      }
    } catch (apiError) {
      console.error('获取真实评分趋势数据失败，使用模拟数据:', apiError)
      // 使用模拟数据作为 fallback
      const mockData = []
      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const rating = (Math.random() * 3 + 2).toFixed(1)
        mockData.push({ date: dateStr, rating: parseFloat(rating) })
      }
      ratingTrendData.value = mockData
    }
    */
  } catch (error) {
    console.error('获取评分趋势数据失败:', error)
    // 失败时使用空数组
    ratingTrendData.value = []
  } finally {
    isLoadingRatingTrend.value = false
  }
}



// 检查作品点赞状态
const checkLikeStatus = async () => {
  if (userStore.isLoggedIn && workId.value) {
    try {
      const isWorkLiked = await workStore.checkWorkLikeStatus(workId.value)
      isLiked.value = isWorkLiked
    } catch (error) {
      console.error('检查点赞状态失败:', error)
      // 检查点赞状态失败不影响页面显示
    }
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchWorkDetail()
  // 检查点赞状态
  await checkLikeStatus()
  
  // 设置WebSocket监听，实现评论区实时更新
  setupWebSocketListeners()
})

// 设置WebSocket监听
const setupWebSocketListeners = async () => {
  try {
    // 确保WebSocket连接
    await webSocketService.ensureConnection()
    
    // 监听评论更新事件
    webSocketService.onCommentUpdate(async (data) => {
      if (data.workId === workId.value) {
        console.log('收到评论更新:', data)
        // 重新获取评论列表，实现实时更新
        await fetchComments()
      }
    })
    
    // 监听评分更新事件
    webSocketService.onRatingUpdate(async (data) => {
      if (data.workId === workId.value) {
        console.log('收到评分更新:', data)
        // 重新获取作品详情，更新总体评分
        await fetchWorkDetail()
        // 同时更新评论列表，确保评分显示正确
        await fetchComments()
      }
    })
    
    console.log('WebSocket监听器设置完成')
  } catch (error) {
    console.error('设置WebSocket监听器失败:', error)
    // WebSocket设置失败不影响页面正常功能，只是无法实时更新
  }
}
</script>

<style scoped>
.mushroom-kitchen-work-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.work-header {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  min-width: 100px;
}

.work-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.work-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

.work-image-section {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.work-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.work-image:hover {
  transform: scale(1.02);
}

.work-image.image-loading {
  opacity: 0;
}

.work-image.image-loaded {
  opacity: 1;
}

.work-image.image-error {
  opacity: 1;
  background: #f8f9fa;
}

.work-image-error {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  background: #f8f9fa;
  border-radius: 16px;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 1;
}

.work-image-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 作品操作按钮样式 */
.work-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
}

.work-actions .el-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.work-actions .el-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.work-actions .el-button .el-icon {
  font-size: 18px;
}

.work-info-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.work-basic-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.work-rating {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-text {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.work-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.author-info,
.publish-date,
.mushroom-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-label,
.date-label,
.type-label {
  color: #7f8c8d;
  font-weight: 500;
}

.author-name {
  color: #4CAF50;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.author-name:hover {
  color: #45a049;
}

.interaction-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.interaction-btn {
  flex: 1;
  min-width: 120px;
}

.btn-count {
  margin-left: 5px;
  font-weight: 600;
}

/* 评分按钮样式 */
.rating-btn {
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.rating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.rating-btn .el-icon {
  margin-right: 6px;
  font-size: 18px;
}

.work-description {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.work-description h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.work-description p {
  color: #546e7a;
  line-height: 1.6;
  margin: 0;
}

/* 配料信息样式 */
.work-ingredients {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.work-ingredients h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li {
  color: #546e7a;
  line-height: 1.6;
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
}

.ingredients-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #4CAF50;
  font-weight: bold;
}

/* 做法步骤样式 */
.work-steps {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.work-steps h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.steps-navigation {
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.steps-navigation .el-button-group {
  flex-wrap: wrap;
  gap: 10px;
}

.steps-navigation .el-button {
  min-width: 80px;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-list li {
  color: #546e7a;
  line-height: 1.6;
  margin-bottom: 15px;
  position: relative;
  padding-left: 50px;
  display: flex;
  align-items: flex-start;
}

.step-number {
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
}

.step-content {
  flex: 1;
}

/* 营养成分样式 */
.work-nutrition {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.work-nutrition h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.nutrition-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nutrition-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.nutrition-value {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

/* 烹饪时间和难度等级样式 */
.cooking-time,
.difficulty-level {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-label,
.difficulty-label {
  color: #7f8c8d;
}

.time-value,
.difficulty-value {
  color: #2c3e50;
  font-weight: 500;
}

/* 评论类型标签样式 */
.comment-type-label {
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.comment-only-label {
  background-color: #e3f2fd;
  color: #1976d2;
}

.rating-only-label {
  background-color: #fff3e0;
  color: #f57c00;
}

.comment-with-rating-label {
  background-color: #e8f5e9;
  color: #388e3c;
}

/* 不同类型评论的样式 */
.comment-item {
  transition: all 0.3s ease;
}

.comment-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rating-only-message {
  color: #7f8c8d;
  font-style: italic;
  margin: 10px 0;
}

/* 自定义星级评分样式 */
.comment-rating {
  display: flex;
  align-items: center;
}

.custom-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.custom-rating :deep(.el-rate__icon) {
  font-size: 18px;
  transition: all 0.2s ease;
}

.custom-rating :deep(.el-rate__icon.is-full) {
  color: #ff9900;
}

.custom-rating :deep(.el-rate__icon.void) {
  color: #e4e7ed;
}

.custom-rating :deep(.el-rate__text) {
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  color: #ff9900;
  min-width: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-rating :deep(.el-rate__icon) {
    font-size: 16px;
  }
  
  .custom-rating :deep(.el-rate__text) {
    font-size: 12px;
    margin-left: 6px;
  }
  
  .comment-rating {
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .custom-rating :deep(.el-rate__icon) {
    font-size: 14px;
  }
  
  .custom-rating :deep(.el-rate__text) {
    font-size: 11px;
    margin-left: 4px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 评论表单样式调整 */
.comment-form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.comment-form-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.comment-form .el-form-item {
  margin-bottom: 20px;
}

.form-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
  margin-bottom: 0;
}

.form-note {
  font-size: 13px;
  color: #34495e;
  margin-top: 15px;
  margin-bottom: 0;
  font-weight: 500;
}



.related-works-section {
  margin-bottom: 40px;
}

.related-works-section h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.related-works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.related-work-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.related-work-image-container {
  position: relative;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.related-work-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.related-work-image.image-loading {
  opacity: 0;
}

.related-work-image.image-loaded {
  opacity: 1;
}

.related-work-image.image-error {
  opacity: 1;
  background: #f8f9fa;
}

.related-work-title {
  font-size: 1rem;
  color: #2c3e50;
  margin: 15px;
  font-weight: 600;
}

.related-work-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px 15px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.related-work-rating {
  color: #ff9800;
  font-weight: 600;
}

.share-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-title {
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.share-platforms {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.share-btn {
  flex: 1;
}

.share-link {
  margin-top: 10px;
}

/* 评论系统样式 */
.comments-section {
  margin: 60px 0;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 16px;
}

.comments-section h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.5rem;
}

.comment-form-section {
  margin-bottom: 40px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-form {
  max-width: 100%;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comments-header {
  margin-bottom: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
  font-style: italic;
  background: white;
  border-radius: 12px;
}

.loading-comments {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
}

.loading-related-works {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  grid-column: 1 / -1;
}

.comment-item {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.comment-username {
  font-weight: 600;
  color: #2c3e50;
}

.comment-date {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.comment-content {
  margin-bottom: 15px;
  color: #546e7a;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  margin-top: 10px;
}

/* 回复表单样式 */
.reply-form {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.reply-form-inner {
  max-width: 100%;
}

/* 回复列表样式 */
.replies-list {
  margin-top: 20px;
  margin-left: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

/* 添加层级连接线 */
.replies-list::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.reply-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 添加回复指示器 */
.reply-item::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 20px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid #2196F3;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-username {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.reply-date {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.reply-content {
  margin-bottom: 10px;
  color: #546e7a;
  line-height: 1.5;
  font-size: 0.9rem;
}

.reply-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.reply-actions .el-button {
  font-size: 0.8rem;
  padding: 0 8px;
}

/* 编辑表单样式 */
.edit-form {
  max-width: 100%;
}

.image-upload-section {
  margin-bottom: 20px;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  background-color: #fafafa;
}

.placeholder-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 10px;
}



@media (max-width: 768px) {
  .mushroom-kitchen-work-detail {
    padding: 20px 15px;
  }

  .work-header h1 {
    font-size: 1.6rem;
  }

  .work-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .work-image {
    max-height: 400px;
  }

  .interaction-buttons {
    flex-direction: column;
  }

  .interaction-btn {
    width: 100%;
  }

  .related-works-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .share-platforms {
    flex-direction: column;
  }

  .comments-section {
    padding: 20px;
    margin: 40px 0;
  }

  .comment-form-section {
    padding: 20px;
  }

  .comment-item {
    padding: 15px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .comment-actions {
    flex-direction: column;
    gap: 8px;
  }

  .comment-actions .el-button {
    width: 100%;
  }

  .reply-form {
    padding: 12px;
  }

  .replies-list {
    margin-left: 15px;
  }

  .reply-item {
    padding: 10px;
  }

  .reply-actions {
    flex-direction: column;
    gap: 8px;
  }

  .reply-actions .el-button {
    width: 100%;
  }

  /* 编辑对话框响应式样式 */
  .el-dialog {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  .image-preview {
    max-height: 200px;
  }

  .image-placeholder {
    height: 150px;
  }
}

/* 平板设备响应式样式 */
@media (min-width: 769px) and (max-width: 1024px) {
  .mushroom-kitchen-work-detail {
    padding: 30px 20px;
  }

  .work-content {
    gap: 30px;
  }

  .comments-section {
    padding: 25px;
  }

  .comment-form-section {
    padding: 20px;
  }

  .comment-item {
    padding: 18px;
  }

  .related-works-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .comment-item {
    padding: 20px;
  }

  .comment-actions .el-button {
    padding: 10px 16px;
    font-size: 16px;
  }

  .reply-form .el-textarea {
    font-size: 16px;
  }

  .el-rate {
    font-size: 24px;
  }

  .el-input__inner {
    font-size: 16px;
    padding: 12px 15px;
  }
}
</style>