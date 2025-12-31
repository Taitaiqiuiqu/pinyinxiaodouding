<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <text class="page-title">拼音课程</text>
      <text class="page-subtitle">系统学习拼音，轻松掌握发音</text>
    </view>

    <!-- 功能模块卡片 -->
    <view class="content-area">
      <!-- 课程分类 -->
      <view class="section">
        <text class="section-title">课程分类</text>
        <view class="category-grid">
          <view
            v-for="category in categories"
            :key="category.id"
            class="category-card motion-fade-up"
            @tap="handleCategoryTap(category)"
          >
            <view class="category-icon">{{ category.icon }}</view>
            <text class="category-title">{{ category.title }}</text>
            <text class="category-count">{{ category.count }}节课</text>
          </view>
        </view>
      </view>

      <!-- 推荐课程 -->
      <view class="section">
        <text class="section-title">推荐课程</text>
        <view class="course-list">
          <view
            v-for="course in recommendedCourses"
            :key="course.id"
            class="course-item motion-fade-up"
            @tap="handleCourseTap(course)"
          >
            <view class="course-icon">{{ course.icon }}</view>
            <view class="course-info">
              <text class="course-title">{{ course.title }}</text>
              <text class="course-description">{{ course.description }}</text>
              <view class="course-meta">
                <text class="course-level">{{ course.level }}</text>
                <text class="course-duration">{{ course.duration }}</text>
              </view>
            </view>
            <view class="course-progress" v-if="course.progress > 0">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: course.progress + '%' }"></view>
              </view>
              <text class="progress-text">{{ course.progress }}%</text>
            </view>
            <view class="course-status" v-else>
              <text class="status-text">{{ course.status }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="bottom-tips">
      <text class="tips-text">点击课程开始学习 ✨</text>
    </view>

    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayerRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AudioPlayer from '../../../src/components/AudioPlayer/AudioPlayer.vue'

const audioPlayerRef = ref<any>(null)

// 课程分类数据
const categories = ref([
  {
    id: 'initial',
    title: '声母',
    icon: '🔤',
    count: 23,
    route: '/pages/course/lessons/index?type=initial'
  },
  {
    id: 'final',
    title: '韵母',
    icon: '🎵',
    count: 24,
    route: '/pages/course/lessons/index?type=final'
  },
  {
    id: 'tone',
    title: '声调',
    icon: '📢',
    count: 4,
    route: '/pages/course/lessons/index?type=tone'
  },
  {
    id: 'rhythm',
    title: '拼音儿歌',
    icon: '🎶',
    count: 10,
    route: '/pages/course/lessons/index?type=rhythm'
  }
])

// 推荐课程数据
const recommendedCourses = ref([
  {
    id: 'course001',
    title: '声母入门',
    description: '学习基础声母发音，掌握正确口型',
    icon: '🔤',
    level: '入门',
    duration: '15分钟',
    progress: 0,
    status: '未开始',
    route: '/pages/course/detail/index?id=course001'
  },
  {
    id: 'course002',
    title: '韵母进阶',
    description: '系统学习单韵母和复韵母',
    icon: '🎵',
    level: '进阶',
    duration: '20分钟',
    progress: 0,
    status: '未开始',
    route: '/pages/course/detail/index?id=course002'
  },
  {
    id: 'course003',
    title: '声调练习',
    description: '掌握四个声调的正确发音',
    icon: '📢',
    level: '基础',
    duration: '10分钟',
    progress: 0,
    status: '未开始',
    route: '/pages/course/detail/index?id=course003'
  }
])

// 页面加载
onLoad(() => {
  // 可以在这里加载用户的学习进度等数据
  console.log('拼音课程页面加载')
})

// 处理分类点击
const handleCategoryTap = (category: any) => {
  uni.navigateTo({
    url: category.route
  })
}

// 处理课程点击
const handleCourseTap = (course: any) => {
  uni.navigateTo({
    url: course.route
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
  padding: 60rpx 32rpx 32rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.25);
}

.page-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 内容区域 */
.content-area {
  padding: 0 32rpx;
}

/* 区块样式 */
.section {
  margin-bottom: 50rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 24rpx;
  text-shadow: 1rpx 1rpx 2rpx rgba(255,126,179,0.2);
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

.category-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.category-card:active {
  transform: scale(0.97);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.category-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  transition: transform 0.25s ease;
}

.category-card:active .category-icon {
  transform: scale(1.1);
}

.category-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8rpx;
}

.category-count {
  display: block;
  font-size: 22rpx;
  color: #636e72;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

.course-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.course-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.course-icon {
  font-size: 56rpx;
  margin-right: 24rpx;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8rpx;
}

.course-description {
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

.course-meta {
  display: flex;
  gap: 16rpx;
}

.course-level {
  font-size: 20rpx;
  color: #ff7eb3;
  background: rgba(255, 126, 179, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.course-duration {
  font-size: 20rpx;
  color: #636e72;
}

.course-progress {
  margin-left: 20rpx;
  text-align: right;
}

.progress-bar {
  width: 80rpx;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff7eb3 0%, #ff9a56 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 20rpx;
  color: #ff7eb3;
  font-weight: 600;
}

.course-status {
  margin-left: 20rpx;
  text-align: right;
}

.status-text {
  font-size: 20rpx;
  color: #636e72;
  background: rgba(99, 110, 114, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 14rpx;
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
  .category-grid {
    padding: 0 10rpx;
  }
  
  .category-card {
    padding: 28rpx 20rpx;
  }
  
  .course-item {
    padding: 20rpx;
  }
}
</style>