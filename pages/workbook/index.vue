<template>
  <view class="workbook-page">
    <view class="floating-stars"></view>

    <view class="center-area card container">
      <text class="title">拼音练习册</text>
      <text class="subtitle">选择练习类型，开始学习吧！</text>

      <view class="practice-types">
        <view
          v-for="(type, index) in practiceTypes"
          :key="index"
          class="practice-card"
          :class="type.colorClass"
          @tap="selectPracticeType(type)"
        >
          <view class="practice-icon">{{ type.icon }}</view>
          <text class="practice-title">{{ type.title }}</text>
          <text class="practice-desc">{{ type.desc }}</text>
        </view>
      </view>
    </view>

    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PracticeType {
  id: string
  title: string
  desc: string
  icon: string
  colorClass: string
  path: string
}

const practiceTypes = ref<PracticeType[]>([
  {
    id: 'fill-blank',
    title: '拼音填空',
    desc: '补充完整的拼音',
    icon: '✏️',
    colorClass: 'card-primary',
    path: '/pages/workbook/fill-blank/index'
  },
  {
    id: 'match',
    title: '拼音连线',
    desc: '汉字与拼音匹配',
    icon: '🔗',
    colorClass: 'card-secondary',
    path: '/pages/workbook/match/index'
  },
  {
    id: 'sort',
    title: '拼音排序',
    desc: '按顺序排列拼音',
    icon: '📊',
    colorClass: 'card-tertiary',
    path: '/pages/workbook/sort/index'
  },
  {
    id: 'classify',
    title: '拼音分类',
    desc: '分类拼音音节',
    icon: '📁',
    colorClass: 'card-quaternary',
    path: '/pages/workbook/classify/index'
  }
])

function selectPracticeType(type: PracticeType) {
  uni.navigateTo({
    url: type.path
  })
}
</script>

<style scoped>
.workbook-page {
  padding: 28rpx;
  background: #FBBF24;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.workbook-page::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.workbook-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 120rpx;
  height: 120rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-20rpx) rotate(-15deg); }
}

@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

.floating-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-stars::before,
.floating-stars::after {
  content: '✨';
  position: absolute;
  font-size: 24rpx;
  opacity: 0.3;
  animation: sparkle 4s ease-in-out infinite;
}

.floating-stars::before {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.floating-stars::after {
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.1) rotate(90deg); opacity: 0.6; }
}

.center-area {
  width: 100%;
  max-width: 720rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  z-index: 1;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #FFFFFF;
  margin-bottom: 48rpx;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.6;
  font-weight: 600;
  width: 100%;
}

.card {
  width: 100%;
  background: #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
  padding: 32rpx;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  position: relative;
  overflow: hidden;
}

.practice-types {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.practice-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
}

.practice-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.practice-card.card-primary {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.practice-card.card-secondary {
  background: #3B82F6;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.practice-card.card-tertiary {
  background: #10B981;
  box-shadow: 0 12rpx 0 #059669;
}

.practice-card.card-quaternary {
  background: #8B5CF6;
  box-shadow: 0 12rpx 0 #7C3AED;
}

.practice-card:active.card-primary {
  box-shadow: 0 8rpx 0 #E53E5F;
}

.practice-card:active.card-secondary {
  box-shadow: 0 8rpx 0 #1D4ED8;
}

.practice-card:active.card-tertiary {
  box-shadow: 0 8rpx 0 #059669;
}

.practice-card:active.card-quaternary {
  box-shadow: 0 8rpx 0 #7C3AED;
}

.practice-icon {
  font-size: 64rpx;
}

.practice-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.practice-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.decoration {
  position: fixed;
  background: #FF6B3D;
  opacity: 0.6;
  z-index: 0;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

.decoration-1 {
  width: 300rpx;
  height: 300rpx;
  top: -150rpx;
  right: -150rpx;
  transform: rotate(20deg);
}

.decoration-2 {
  width: 280rpx;
  height: 280rpx;
  bottom: -140rpx;
  left: -140rpx;
  transform: rotate(45deg);
}

.decoration-3 {
  width: 150rpx;
  height: 150rpx;
  top: 30%;
  left: 10%;
  transform: rotate(10deg);
}
</style>
