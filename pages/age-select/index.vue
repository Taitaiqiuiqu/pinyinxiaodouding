<template>
  <view class="page age-select-page">
    <AudioPlayer ref="audio" />

    <view class="header">
      <text class="page-title">选择年龄</text>
      <text class="page-subtitle">选择孩子所在年龄段，界面将展示对应课程</text>
    </view>

    <!-- Age options -->
    <view class="content-area">
      <view class="age-options">
        <view
          class="option motion-fade-up"
          v-for="(opt, idx) in options"
          :key="opt.value"
          :class="['opt-' + opt.value]"
          :style="{ transitionDelay: (idx * 100) + 'ms' }"
          @tap="selectAge(opt.value)"
        >
          <text class="opt-icon">{{ opt.icon }}</text>
          <text class="opt-label">{{ opt.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'
import { useGlobalStore } from '../../src/store/global'
import { updateAge } from '../../src/services/cloud'
import GlobalAudioManager from '../../src/services/GlobalAudioManager'

const audio = ref<any>(null)

// 响应式数据
const options = ref([
  { value: 1, label: '3-4 岁', icon: '🌸' },
  { value: 2, label: '4-5 岁', icon: '⭐' },
  { value: 3, label: '5-6 岁', icon: '🌱' },
  { value: 4, label: '6-8 岁', icon: '🌈' }
])

onShow(() => {
  // play guide audio on enter with loop
  audio.value && audio.value.play({
    type: 'guide',
    file: 'age-select/guide_age_survey_3-8_01.MP3',
    loop: true
  }).catch(() => {})
})

// 方法定义
const selectAge = async (ageLevel: number) => {
  // 停止循环播放音频
  const audioManager = GlobalAudioManager.getInstance()
  audioManager.stopLoop()
  const store = useGlobalStore()
  store.setAgeLevel(ageLevel)
  uni.setStorageSync('ageLevel', ageLevel)
  
  uni.showLoading({ title: '保存中...' })
  
  try {
    const result = await updateAge(ageLevel)
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      // 跳转到home页面
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/home/index' })
      }, 1000)
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
/* 页面基础样式 - 积木风格纯色背景 */
.page.age-select-page {
  padding: 0;
  background: #3B82F6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  width: 100%;
}

/* 积木风格装饰元素 */
.page.age-select-page::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #D97706;
}

.page.age-select-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #E53E5F;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-20rpx) rotate(-15deg); }
}

/* 左上角装饰元素浮动动画 */
@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

/* 页面头部 */
.header {
  text-align: center;
  margin-top: 100rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16rpx;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.2);
  animation: fadeUp 0.6s ease forwards;
}

.page-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-align: center;
  max-width: 80%;
  margin: 0 auto;
  animation: fadeUp 0.6s ease 0.2s forwards;
  opacity: 0;
}

/* 主要内容区域 */
.content-area {
  width: 100%;
  max-width: 720rpx;
  position: relative;
  z-index: 1;
  padding: 0 28rpx;
}



@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 年龄选项样式 */
.age-options {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 28rpx;
  justify-content: center;
  margin-top: 20rpx;
}

.option {
  width: 45%;
  background: #FFFFFF;
  padding: 32rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 8rpx solid #FFFFFF;
}

/* 年龄选项图标和文字 */
.opt-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  animation: float 3s ease-in-out infinite;
  transition: transform 0.25s ease;
}

.opt-label {
  font-size: 28rpx;
  color: #2d3436;
  font-weight: 700;
  letter-spacing: 0.5rpx;
}

.option:hover .opt-icon {
  transform: scale(1.15);
  animation: none;
}

/* 选项悬停效果 */
.option:active {
  transform: translateY(6rpx) scale(0.98);
  box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.1);
}

.option:hover {
  transform: translateY(-6rpx);
}

/* 动画效果 */
.motion-fade-up {
  opacity: 0;
  transform: translateY(40rpx) scale(0.95);
  animation: fadeUp 0.6s ease forwards;
}

/* 选项颜色变体 - 积木风格纯色 */
.opt-1 {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.opt-2 {
  background: #FBBF24;
  box-shadow: 0 12rpx 0 #D97706;
}

.opt-3 {
  background: #10B981;
  box-shadow: 0 12rpx 0 #059669;
}

.opt-4 {
  background: #8B5CF6;
  box-shadow: 0 12rpx 0 #7C3AED;
}

/* 选项文字颜色适配 */
.opt-1 .opt-label,
.opt-2 .opt-label,
.opt-3 .opt-label,
.opt-4 .opt-label {
  color: #FFFFFF;
}

/* 添加微妙的装饰元素 */
.option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: #FFFFFF;
  opacity: 0.6;
  z-index: 1;
}

.option::after {
  content: '';
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 20rpx;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24%;
  animation: twinkle 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.5; transform: scale(1); }
}
</style>
