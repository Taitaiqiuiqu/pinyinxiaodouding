<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">{{ categoryTitle }}</text>
        <view class="empty-space"></view>
      </view>
      <text class="page-subtitle">{{ categoryDescription }}</text>
    </view>

    <!-- 课程列表 -->
    <view class="content-area">
      <view class="course-list">
        <view
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          class="lesson-item motion-fade-up"
          :class="{ 'locked': !lesson.isUnlocked }"
          :style="{ transitionDelay: (index * 100) + 'ms' }"
          @tap="handleLessonTap(lesson)"
        >
          <!-- 课程序号 -->
          <view class="lesson-number">
            <text class="number-text">{{ index + 1 }}</text>
          </view>

          <!-- 课程内容 -->
          <view class="lesson-content">
            <view class="lesson-header">
              <text class="lesson-title">{{ lesson.title }}</text>
              <text class="lesson-status" v-if="lesson.status">{{ lesson.status }}</text>
            </view>
            <text class="lesson-description">{{ lesson.description }}</text>
            <view class="lesson-meta">
              <text class="lesson-duration">{{ lesson.duration }}</text>
              <text class="lesson-type">{{ lesson.type }}</text>
            </view>
          </view>

          <!-- 课程状态图标 -->
          <view class="lesson-icon">
            <text v-if="lesson.isUnlocked" class="unlocked-icon">{{ lesson.icon }}</text>
            <text v-else class="locked-icon">🔒</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="bottom-tips">
      <text class="tips-text">按顺序学习，效果更佳 📚</text>
    </view>

    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayerRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AudioPlayer from '../../../src/components/AudioPlayer/AudioPlayer.vue'

const audioPlayerRef = ref<any>(null)
// 获取路由参数
const categoryType = ref('initial')

// 分类配置
const categoryConfig = {
  initial: {
    title: '声母课程',
    description: '学习23个声母的正确发音和写法',
    icon: '🔤'
  },
  final: {
    title: '韵母课程',
    description: '掌握24个韵母的发音技巧',
    icon: '🎵'
  },
  tone: {
    title: '声调课程',
    description: '学会四个声调的准确发音',
    icon: '📢'
  },
  rhythm: {
    title: '拼音儿歌',
    description: '通过儿歌学习拼音，轻松有趣',
    icon: '🎶'
  }
}

// 计算属性
const categoryTitle = computed(() => {
  return categoryConfig[categoryType.value as keyof typeof categoryConfig]?.title || '课程列表'
})

const categoryDescription = computed(() => {
  return categoryConfig[categoryType.value as keyof typeof categoryConfig]?.description || '选择要学习的课程'
})

// 模拟课程数据
const lessons = ref([
  {
    id: 'lesson001',
    title: '单韵母 a',
    description: '学习单韵母 a 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: true,
    status: '未学习',
    route: '/pages/course/detail/index?id=lesson001'
  },
  {
    id: 'lesson002',
    title: '单韵母 o',
    description: '学习单韵母 o 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: true,
    status: '未学习',
    route: '/pages/course/detail/index?id=lesson002'
  },
  {
    id: 'lesson003',
    title: '单韵母 e',
    description: '学习单韵母 e 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: true,
    status: '未学习',
    route: '/pages/course/detail/index?id=lesson003'
  },
  {
    id: 'lesson004',
    title: '单韵母 i',
    description: '学习单韵母 i 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: true,
    status: '未学习',
    route: '/pages/course/detail/index?id=lesson004'
  },
  {
    id: 'lesson005',
    title: '单韵母 u',
    description: '学习单韵母 u 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: false,
    status: '',
    route: '/pages/course/detail/index?id=lesson005'
  },
  {
    id: 'lesson006',
    title: '单韵母 ü',
    description: '学习单韵母 ü 的发音和书写',
    duration: '5分钟',
    type: '基础',
    icon: '🎯',
    isUnlocked: false,
    status: '',
    route: '/pages/course/detail/index?id=lesson006'
  }
])

// 页面加载
onLoad((options: any) => {
  console.log('课程列表页面加载，分类:', options.type)
  categoryType.value = options.type || 'initial'
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理课程点击
const handleLessonTap = (lesson: any) => {
  if (!lesson.isUnlocked) {
    uni.showToast({
      title: '该课程未解锁，请先学习前面的课程',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  uni.navigateTo({
    url: lesson.route
  })
}
</script>

<style scoped>
/* 页面基础样式 */
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 50%, #ffb347 100%);
  position: relative;
  overflow-x: hidden;
}

/* 头部导航 */
.header {
  padding: 40rpx 32rpx 32rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: white;
  text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.25);
  flex: 1;
  text-align: center;
}

.empty-space {
  width: 60rpx;
}

.page-subtitle {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

/* 内容区域 */
.content-area {
  padding: 32rpx;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

/* 课程项 */
.lesson-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.lesson-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: linear-gradient(180deg, #ff7eb3 0%, #ff9a56 100%);
}

.lesson-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

/* 未解锁课程样式 */
.lesson-item.locked {
  opacity: 0.6;
  background: rgba(240, 240, 240, 0.8);
  border: 1rpx solid rgba(200, 200, 200, 0.3);
}

.lesson-item.locked:active {
  transform: none;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

/* 课程序号 */
.lesson-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.number-text {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
}

/* 课程内容 */
.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.lesson-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d3436;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.lesson-status {
  font-size: 20rpx;
  color: #ff7eb3;
  background: rgba(255, 126, 179, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.lesson-description {
  display: block;
  font-size: 22rpx;
  color: #636e72;
  margin-bottom: 12rpx;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.lesson-meta {
  display: flex;
  gap: 16rpx;
}

.lesson-duration {
  font-size: 20rpx;
  color: #95a5a6;
}

.lesson-type {
  font-size: 20rpx;
  color: #95a5a6;
}

/* 课程图标 */
.lesson-icon {
  margin-left: 20rpx;
  flex-shrink: 0;
}

.unlocked-icon {
  font-size: 40rpx;
  transition: transform 0.25s ease;
}

.lesson-item:active .unlocked-icon {
  transform: scale(1.2);
}

.locked-icon {
  font-size: 40rpx;
  color: #bdc3c7;
}

/* 底部提示 */
.bottom-tips {
  margin-top: 40rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.tips-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(5rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  animation: pulse 2.5s ease-in-out infinite;
}

/* 动画效果 */
.motion-fade-up {
  opacity: 0;
  transform: translateY(40rpx);
  animation: fadeUp 0.6s ease forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .course-list {
    padding: 0 10rpx;
  }
  
  .lesson-item {
    padding: 20rpx;
  }
  
  .lesson-number {
    width: 50rpx;
    height: 50rpx;
    margin-right: 16rpx;
  }
  
  .number-text {
    font-size: 24rpx;
  }
}
</style>