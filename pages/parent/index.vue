<template>
  <view class="page parent-page">
    <!-- 顶部引导区域 -->
    <view class="top-area container">
      <RoleGuide :roleType="'idle'" :guideText="guideText" />
    </view>

    <!-- 家长设置内容区域 -->
    <view class="content-area">
      <text class="page-title">家长设置</text>
      <text class="page-subtitle">管理孩子的学习进度和使用时间</text>

      <!-- 设置选项列表 -->
      <view class="settings-list">
        
        <!-- 学习进度卡片 -->
        <view class="setting-card">
          <view class="card-header">
            <text class="card-icon">📊</text>
            <text class="card-title">学习进度</text>
          </view>
          <view class="card-content">
            <view class="progress-item">
              <text class="progress-label">今日学习时长</text>
              <text class="progress-value">{{ formatTime(usedTime) }} / {{ formatTime(maxUsageTime) }}</text>
            </view>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 使用时长设置 -->
        <view class="setting-card">
          <view class="card-header">
            <text class="card-icon">⏰</text>
            <text class="card-title">使用时长设置</text>
          </view>
          <view class="card-content">
            <view class="time-selector">
              <text class="time-label">最大使用时长：{{ maxUsageTime }} 分钟/天</text>
              <view class="time-buttons">
                <button 
                  class="time-btn" 
                  :class="{ active: maxUsageTime === 15 }"
                  @tap="setMaxUsageTime(15)"
                >15分钟</button>
                <button 
                  class="time-btn" 
                  :class="{ active: maxUsageTime === 30 }"
                  @tap="setMaxUsageTime(30)"
                >30分钟</button>
                <button 
                  class="time-btn" 
                  :class="{ active: maxUsageTime === 60 }"
                  @tap="setMaxUsageTime(60)"
                >60分钟</button>
              </view>
            </view>
          </view>
        </view>

        <!-- 锁定状态 -->
        <view class="setting-card" v-if="isLocked">
          <view class="card-header">
            <text class="card-icon">🔒</text>
            <text class="card-title">使用限制</text>
          </view>
          <view class="card-content">
            <text class="locked-text">已达到今日使用时长限制</text>
            <text class="locked-hint">请明天再来学习吧！</text>
          </view>
        </view>



      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions container">
      <button class="action-btn primary" @tap="resetUsageTime" v-if="!isLocked">
        <text class="btn-icon">🔄</text>
        <text>重置今日时长</text>
      </button>
      <button class="action-btn secondary" @tap="goBack">
        <text class="btn-icon">←</text>
        <text>返回主页</text>
      </button>
    </view>
  </view>
</template>

<script>
import RoleGuide from '../../src/components/RoleGuide/RoleGuide.vue'
import { useGlobalStore } from '../../src/store/global'

export default {
  components: { RoleGuide },
  data() {
      return {
        guideText: '管理孩子的学习设置',
        maxUsageTime: 30,
        usedTime: 0,
        isLocked: false
      }
    },
  computed: {
    progressPercentage() {
      if (this.maxUsageTime === 0) return 0
      return Math.min(100, (this.usedTime / this.maxUsageTime) * 100)
    }
  },
  onShow() {
    this.loadUserSettings()
  },
  methods: {
    formatTime(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${mins}分钟`
    },
    
    loadUserSettings() {
      const store = useGlobalStore()
      this.maxUsageTime = store.maxUsageTime || 30
      this.usedTime = store.usedTime || 0
      this.isLocked = this.usedTime >= this.maxUsageTime
    },
    
    setMaxUsageTime(minutes) {
      const store = useGlobalStore()
      store.setMaxUsageTime(minutes)
      this.maxUsageTime = minutes
      this.isLocked = this.usedTime >= this.maxUsageTime
      
      uni.showToast({
        title: '设置已保存',
        icon: 'success'
      })
    },
    
    resetUsageTime() {
      const store = useGlobalStore()
      store.setUsedTime(0)
      this.usedTime = 0
      this.isLocked = false
      
      uni.showToast({
        title: '今日时长已重置',
        icon: 'success'
      })
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.parent-page {
  padding-bottom: 40rpx;
}

.container {
  padding: 0 32rpx;
}

/* 顶部引导区域 */
.top-area {
  padding-top: 60rpx;
  padding-bottom: 40rpx;
}

/* 内容区域 */
.content-area {
  padding: 0 32rpx;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 60rpx;
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

.setting-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 进度相关 */
.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 28rpx;
  color: #666666;
}

.progress-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

/* 时长选择器 */
.time-selector {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-label {
  font-size: 28rpx;
  color: #333333;
  text-align: center;
}

.time-buttons {
  display: flex;
  justify-content: space-around;
  gap: 16rpx;
}

.time-btn {
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  color: #666666;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
}

.time-btn.active {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  transform: scale(1.05);
}

/* 锁定状态 */
.locked-text {
  font-size: 32rpx;
  color: #ff6b6b;
  text-align: center;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.locked-hint {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
}

/* 数据管理 */
.data-info {
  font-size: 26rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.data-clean-btn {
  padding: 20rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
  font-size: 26rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(255, 152, 0, 0.3);
}

.data-clean-btn:active {
  transform: scale(0.98);
}

.data-clean-btn:disabled {
  background: #cccccc;
  box-shadow: none;
  transform: none;
}

/* 底部操作按钮 */
.bottom-actions {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-width: 400rpx;
  margin-left: auto;
  margin-right: auto;
}

.action-btn {
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #666666;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 32rpx;
}



/* 响应式适配 */
@media (max-width: 750rpx) {
  .settings-list {
    padding: 0 20rpx;
  }
  
  .setting-card {
    padding: 32rpx 24rpx;
  }
  
  .time-buttons {
    flex-direction: column;
  }
}
</style>