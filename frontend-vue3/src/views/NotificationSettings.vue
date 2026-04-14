<template>
  <div class="notification-settings-container">
    <h2>通知设置</h2>
    
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>通知偏好设置</span>
        </div>
      </template>
      
      <el-form
        ref="settingsForm"
        :model="notificationSettings"
        label-width="150px"
        class="settings-form"
      >
        <!-- 总开关 -->
        <el-form-item label="启用通知">
          <el-switch 
            v-model="notificationSettings.enabled" 
            size="large"
            @change="handleSettingsChange"
          />
        </el-form-item>
        
        <template v-if="notificationSettings.enabled">
          <!-- 通知方式 -->
          <el-form-item label="通知方式">
            <div class="notification-methods">
              <el-checkbox-group
                v-model="notificationMethods"
                @change="handleSettingsChange"
              >
                <el-checkbox label="browserNotifications">
                  浏览器通知
                </el-checkbox>
                <el-checkbox label="appNotifications">
                  应用内通知
                </el-checkbox>
                <el-checkbox label="sound">
                  声音提示
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
          
          <!-- 音效选择 -->
          <el-form-item
            v-if="notificationSettings.sound"
            label="提示音效"
          >
            <el-select 
              v-model="notificationSettings.soundType" 
              placeholder="选择音效" 
              @change="handleSettingsChange"
            >
              <el-option
                label="默认"
                value="default"
              />
              <el-option
                label="铃声"
                value="bell"
              />
              <el-option
                label="铃声"
                value="chime"
              />
              <el-option
                label="简单"
                value="simple"
              />
            </el-select>
            <el-button
              type="primary"
              size="small"
              class="preview-btn"
              @click="previewSound"
            >
              预览
            </el-button>
          </el-form-item>
          
          <!-- 振动 -->
          <el-form-item
            v-if="notificationSettings.browserNotifications"
            label="振动提示"
          >
            <el-switch 
              v-model="notificationSettings.vibration" 
              @change="handleSettingsChange"
            />
          </el-form-item>
          
          <!-- 免打扰设置 -->
          <el-form-item label="免打扰设置">
            <div class="do-not-disturb">
              <el-switch 
                v-model="notificationSettings.doNotDisturb" 
                class="dnd-switch"
                @change="handleSettingsChange"
              />
              <div
                v-if="notificationSettings.doNotDisturb"
                class="dnd-time"
              >
                <el-time-picker
                  v-model="dndStartTime"
                  format="HH:mm"
                  placeholder="开始时间"
                  @change="handleTimeChange"
                />
                <span class="time-separator">至</span>
                <el-time-picker
                  v-model="dndEndTime"
                  format="HH:mm"
                  placeholder="结束时间"
                  @change="handleTimeChange"
                />
              </div>
            </div>
          </el-form-item>
          
          <!-- 通知优先级 -->
          <el-form-item label="通知优先级">
            <el-select 
              v-model="notificationSettings.priority" 
              placeholder="选择通知优先级" 
              @change="handleSettingsChange"
            >
              <el-option
                label="高"
                value="high"
              />
              <el-option
                label="中"
                value="medium"
              />
              <el-option
                label="低"
                value="low"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="resetSettings">
          重置默认
        </el-button>
        <el-button
          type="primary"
          @click="saveSettings"
        >
          保存设置
        </el-button>
      </div>
    </el-card>
    
    <!-- 通知历史 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>通知历史</span>
          <el-button
            type="danger"
            size="small"
            class="clear-btn"
            @click="clearHistory"
          >
            清空历史
          </el-button>
        </div>
      </template>
      
      <div
        v-if="notificationHistory.length > 0"
        class="notification-history"
      >
        <el-timeline>
          <el-timeline-item 
            v-for="notification in notificationHistory" 
            :key="notification.id"
            :timestamp="formatTime(notification.time)"
            :type="notification.type || 'info'"
          >
            <div class="notification-item">
              <h4 class="notification-title">
                {{ notification.title }}
              </h4>
              <p class="notification-message">
                {{ notification.message }}
              </p>
              <div class="notification-meta">
                <span
                  v-if="notification.read"
                  class="notification-read"
                >已读</span>
                <span
                  v-else
                  class="notification-unread"
                >未读</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div
        v-else
        class="empty-history"
      >
        <el-empty description="暂无通知历史" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import notificationService from '../utils/notification'

// 注册dayjs插件
 dayjs.extend(relativeTime)

// 通知设置表单
const settingsForm = ref(null)
const notificationSettings = ref({})
const notificationHistory = ref([])

// 通知方式数组
const notificationMethods = computed({
  get() {
    const methods = []
    if (notificationSettings.value.browserNotifications) methods.push('browserNotifications')
    if (notificationSettings.value.appNotifications) methods.push('appNotifications')
    if (notificationSettings.value.sound) methods.push('sound')
    return methods
  },
  set(val) {
    notificationSettings.value.browserNotifications = val.includes('browserNotifications')
    notificationSettings.value.appNotifications = val.includes('appNotifications')
    notificationSettings.value.sound = val.includes('sound')
  }
})

// 免打扰时间
const dndStartTime = ref(null)
const dndEndTime = ref(null)

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 加载设置
const loadSettings = () => {
  const settings = notificationService.loadSettings()
  notificationSettings.value = settings
  
  // 转换免打扰时间
  if (settings.dndStart) {
    const [hours, minutes] = settings.dndStart.split(':').map(Number)
    dndStartTime.value = new Date()
    dndStartTime.value.setHours(hours)
    dndStartTime.value.setMinutes(minutes)
  }
  
  if (settings.dndEnd) {
    const [hours, minutes] = settings.dndEnd.split(':').map(Number)
    dndEndTime.value = new Date()
    dndEndTime.value.setHours(hours)
    dndEndTime.value.setMinutes(minutes)
  }
}

// 加载通知历史
const loadNotificationHistory = () => {
  notificationHistory.value = notificationService.loadNotificationHistory()
}

// 处理设置变化
const handleSettingsChange = () => {
  notificationService.updateSettings(notificationSettings.value)
}

// 处理时间变化
const handleTimeChange = () => {
  if (dndStartTime.value) {
    const hours = dndStartTime.value.getHours().toString().padStart(2, '0')
    const minutes = dndStartTime.value.getMinutes().toString().padStart(2, '0')
    notificationSettings.value.dndStart = `${hours}:${minutes}`
  }
  
  if (dndEndTime.value) {
    const hours = dndEndTime.value.getHours().toString().padStart(2, '0')
    const minutes = dndEndTime.value.getMinutes().toString().padStart(2, '0')
    notificationSettings.value.dndEnd = `${hours}:${minutes}`
  }
  
  handleSettingsChange()
}

// 预览音效
const previewSound = () => {
  notificationService.playNotificationSound(notificationSettings.value.soundType)
}

// 保存设置
const saveSettings = () => {
  notificationService.saveSettings(notificationSettings.value)
  ElMessage.success('设置保存成功')
}

// 重置默认设置
const resetSettings = () => {
  notificationService.saveSettings({
    enabled: true,
    browserNotifications: true,
    appNotifications: true,
    sound: true,
    soundType: 'default',
    vibration: true,
    doNotDisturb: false,
    dndStart: '22:00',
    dndEnd: '08:00',
    priority: 'medium'
  })
  loadSettings()
  ElMessage.success('设置已重置为默认值')
}

// 清空通知历史
const clearHistory = () => {
  notificationService.clearNotificationHistory()
  loadNotificationHistory()
  ElMessage.success('通知历史已清空')
}

// 组件挂载
onMounted(() => {
  loadSettings()
  loadNotificationHistory()
})
</script>

<style scoped>
.notification-settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notification-settings-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.settings-card,
.history-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-form {
  padding: 20px 0;
}

.notification-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-methods .el-checkbox {
  margin-right: 0;
}

.preview-btn {
  margin-left: 10px;
}

.do-not-disturb {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dnd-switch {
  margin-right: 10px;
}

.dnd-time {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-separator {
  color: #909399;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.history-card .card-header {
  justify-content: space-between;
}

.clear-btn {
  font-size: 12px;
  padding: 4px 12px;
}

.notification-history {
  padding: 20px 0;
}

.notification-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notification-title {
  font-weight: 600;
  margin: 0;
  font-size: 15px;
}

.notification-message {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.notification-meta {
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
}

.notification-read {
  color: #67c23a;
}

.notification-unread {
  color: #f56c6c;
}

.empty-history {
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-settings-container {
    padding: 10px;
  }
  
  .settings-form {
    padding: 10px 0;
  }
  
  .dnd-time {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .do-not-disturb {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>