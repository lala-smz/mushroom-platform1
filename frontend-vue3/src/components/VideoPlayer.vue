<template>
  <div
    class="video-player-container"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <div
      ref="wrapperRef"
      class="video-wrapper"
    >
      <video
        ref="videoRef"
        :src="videoSrc"
        class="video-element"
        :class="{ 'video-cover': fitMode === 'cover' }"
        controls
        playsinline
        @play="handlePlay"
        @pause="handlePause"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @loadeddata="handleLoadedData"
        @canplay="handleCanPlay"
        @waiting="handleWaiting"
        @playing="handlePlaying"
        @error="handleError"
      />
      
      <div
        v-if="showPoster"
        class="poster-overlay"
        @click="startPlayback"
      >
        <img
          v-if="posterUrl"
          :src="posterUrl"
          class="poster-image"
          alt="视频封面"
        >
        <div
          v-else
          class="poster-placeholder"
        >
          <span>加载中...</span>
        </div>
        <div class="play-button-overlay">
          <div
            class="play-button"
            @click.stop="startPlayback"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div
        v-if="!showPoster"
        class="controls-overlay"
      >
        <div class="control-buttons">
          <button 
            class="control-btn" 
            :title="fitMode === 'contain' ? '填充屏幕' : '适应屏幕'" 
            @click="toggleFitMode"
          >
            <svg
              v-if="fitMode === 'contain'"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 4h3v3h2V4c0-1.1-.9-2-2-2h-3v2zm-7 0H7v3H5v4h2V7h3V4zm7 7h-3v2h3v3h2v-3c0-1.1-.9-2-2-2zM7 19v-3H4v3c0 1.1.9 2 2 2h3v-2H7z" />
            </svg>
          </button>
          
          <button 
            class="control-btn" 
            :title="isFullscreen ? '退出全屏' : '全屏显示'" 
            @click="toggleFullscreen"
          >
            <svg
              v-if="!isFullscreen"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="showInfo && !isFullscreen"
      class="video-info"
    >
      <h3 class="video-title">
        {{ videoTitle }}
      </h3>
      <p
        v-if="videoDesc"
        class="video-desc"
      >
        {{ videoDesc }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  video: {
    type: Object,
    required: true,
    default: () => ({})
  },
  autoPlay: {
    type: Boolean,
    default: false
  },
  showInfo: {
    type: Boolean,
    default: true
  }
})

const videoRef = ref(null)
const wrapperRef = ref(null)
const showPoster = ref(true)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const hasError = ref(false)
const isFullscreen = ref(false)
const fitMode = ref('contain')

const videoSrc = computed(() => {
  return props.video?.videoUrl || props.video?.url || ''
})

const posterUrl = computed(() => {
  return props.video?.thumbnailUrl || props.video?.thumbnail || ''
})

const videoTitle = computed(() => {
  return props.video?.title || ''
})

const videoDesc = computed(() => {
  return props.video?.description || ''
})

const startPlayback = () => {
  if (!videoRef.value || !videoSrc.value) return
  
  console.log('开始播放视频:', videoSrc.value)
  showPoster.value = false
  isLoading.value = true
  
  videoRef.value.play().then(() => {
    console.log('视频播放成功')
    isPlaying.value = true
    isLoading.value = false
  }).catch((error) => {
    console.error('视频播放失败:', error)
    isLoading.value = false
  })
}

const handlePlay = () => {
  console.log('视频播放事件触发')
  isPlaying.value = true
  showPoster.value = false
  isLoading.value = false
}

const handlePause = () => {
  console.log('视频暂停事件触发')
  isPlaying.value = false
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}

const handleLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
  console.log('视频元数据加载完成，时长:', duration.value, '秒')
}

const handleLoadedData = () => {
  console.log('视频数据已加载')
  isLoading.value = false
}

const handleCanPlay = () => {
  console.log('视频可以播放')
}

const handleWaiting = () => {
  console.log('视频缓冲中...')
  isLoading.value = true
}

const handlePlaying = () => {
  console.log('视频正在播放')
  isLoading.value = false
  isPlaying.value = true
  showPoster.value = false
}

const handleError = (event) => {
  console.error('视频加载错误:', event)
  hasError.value = true
  isLoading.value = false
  isPlaying.value = false
}

const toggleFitMode = () => {
  fitMode.value = fitMode.value === 'contain' ? 'cover' : 'contain'
  console.log('视频填充模式:', fitMode.value)
}

const toggleFullscreen = () => {
  if (!wrapperRef.value) return
  
  if (!isFullscreen.value) {
    if (wrapperRef.value.requestFullscreen) {
      wrapperRef.value.requestFullscreen()
    } else if (wrapperRef.value.webkitRequestFullscreen) {
      wrapperRef.value.webkitRequestFullscreen()
    } else if (wrapperRef.value.msRequestFullscreen) {
      wrapperRef.value.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!(document.fullscreenElement || 
    document.webkitFullscreenElement || 
    document.msFullscreenElement)
  
  if (isFullscreen.value) {
    fitMode.value = 'cover'
  }
}

const resetPlayer = () => {
  console.log('重置播放器')
  showPoster.value = true
  isPlaying.value = false
  isLoading.value = false
  hasError.value = false
  currentTime.value = 0
  duration.value = 0
  
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
}

watch(() => props.video, (newVideo, oldVideo) => {
  if (oldVideo && newVideo !== oldVideo) {
    console.log('视频源变更:', newVideo)
    resetPlayer()
    
    if (newVideo && videoSrc.value) {
      nextTick(() => {
        if (videoRef.value) {
          videoRef.value.load()
        }
      })
    }
  }
}, { deep: true })

onMounted(() => {
  console.log('VideoPlayer 组件已挂载')
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: #000;
  transition: all 0.3s ease;
}

.video-player-container.is-fullscreen {
  max-width: 100%;
  border-radius: 0;
  box-shadow: none;
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
  overflow: hidden;
}

.video-player-container.is-fullscreen {
  max-width: 100%;
  border-radius: 0;
  box-shadow: none;
}

.video-player-container.is-fullscreen .video-wrapper {
  padding-top: 0;
  height: 100%;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background: #000;
  z-index: 1;
}

.video-element.video-cover {
  object-fit: cover;
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  font-size: 16px;
}

.play-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.poster-overlay:hover .play-button-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.play-button:hover {
  transform: scale(1.1);
  background: #fff;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

.play-button svg {
  width: 36px;
  height: 36px;
  margin-left: 6px;
}

.controls-overlay {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 5;
  padding: 12px;
  pointer-events: none;
}

.control-buttons {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.video-info {
  padding: 20px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  border-top: 1px solid #e9ecef;
}

.video-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.video-desc {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.7;
  margin: 0;
}

@media (max-width: 768px) {
  .video-player-container {
    max-width: 100%;
    border-radius: 8px;
  }
  
  .play-button {
    width: 64px;
    height: 64px;
  }
  
  .play-button svg {
    width: 28px;
    height: 28px;
    margin-left: 4px;
  }
  
  .video-info {
    padding: 16px;
  }
  
  .video-title {
    font-size: 16px;
  }
  
  .video-desc {
    font-size: 13px;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .control-btn svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .video-info {
    padding: 12px;
  }
  
  .video-title {
    font-size: 15px;
  }
  
  .play-button {
    width: 56px;
    height: 56px;
  }
  
  .play-button svg {
    width: 24px;
    height: 24px;
  }
}
</style>
