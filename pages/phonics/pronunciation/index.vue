<template>
  <view class="pronunciation-page">
    <!-- 页面头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text>返回</text>
      </view>
      <text class="page-title">拼音跟读</text>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 功能模块卡片 -->
      <view class="module-grid">
        <!-- 声母模块 -->
        <view class="module-card card-primary" @click="goToShengmu">
          <view class="card-content">
            <Icon name="shengmu" size="100rpx" color="#FFFFFF" />
            <text class="card-title">声母</text>
            <text class="card-desc">学习23个声母发音</text>
          </view>
        </view>
        
        <!-- 韵母模块 -->
        <view class="module-card card-secondary" @click="goToYunmu">
          <view class="card-content">
            <Icon name="yunmu" size="100rpx" color="#FFFFFF" />
            <text class="card-title">韵母</text>
            <text class="card-desc">掌握单韵母和复韵母</text>
          </view>
        </view>
        
        <!-- 整体认读模块 -->
        <view class="module-card card-tertiary" @click="goToZhengti">
          <view class="card-content">
            <Icon name="zhengti" size="100rpx" color="#FFFFFF" />
            <text class="card-title">整体认读</text>
            <text class="card-desc">记住16个整体认读音节</text>
          </view>
        </view>
      </view>
      
      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text class="tip-text">选择模块开始学习 ✨</text>
      </view>
    </view>
  </view>
</template>

<script>
import Icon from '@/src/components/Icon/Icon.vue'

export default {
  name: 'PhonicsPronunciationPage',
  components: {
    Icon
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToShengmu() {
      uni.navigateTo({
        url: '/pages/phonics/pronunciation/shengmu'
      });
    },
    goToYunmu() {
      uni.navigateTo({
        url: '/pages/phonics/pronunciation/yunmu'
      });
    },
    goToZhengti() {
      uni.navigateTo({
        url: '/pages/phonics/pronunciation/zhengti'
      });
    }
  }
};
</script>

<style scoped>
/* 页面基础样式 */
.pronunciation-page {
  min-height: 100vh;
  background: #FFB84D;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.pronunciation-page::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.pronunciation-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #1D4ED8;
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
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.back-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.page-title {
  flex: 1;
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
  text-align: center;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 0 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 功能模块网格 */
.module-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32rpx;
  width: 100%;
  max-width: 680rpx;
}

/* 模块卡片基础样式 */
.module-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

/* 卡片悬停效果 */
.module-card:active {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
  position: relative;
}

/* 卡片图标 */
.card-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  line-height: 1;
}

/* 卡片标题 */
.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-top: 20rpx;
  margin-bottom: 8rpx;
}

/* 卡片描述 */
.card-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  line-height: 1.5;
}

/* 卡片颜色变体 - 积木风格纯色 */
.card-primary {
  background: #FF476F;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.card-secondary {
  background: #FBBF24;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.card-tertiary {
  background: #3B82F6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

/* 底部提示 */
.bottom-tip {
  margin-top: 60rpx;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 16rpx 40rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}
</style>