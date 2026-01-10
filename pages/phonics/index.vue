<template>
  <view class="phonics-page">
    <!-- 积木风格装饰元素 -->
    <view class="decoration-block decoration-1"></view>
    <view class="decoration-block decoration-2"></view>
    <view class="decoration-block decoration-3"></view>
    
    <!-- 页面头部 -->
    <view class="header">
      <text class="page-title">拼音启蒙</text>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 功能模块卡片 -->
      <view class="module-grid">
        <!-- 拼音跟读模块 -->
        <view class="module-card card-primary" @click="goToPronunciation">
          <view class="card-content">
            <text class="card-icon">🎤</text>
            <text class="card-title">拼音跟读</text>
            <text class="card-desc">跟着学习标准拼音发音</text>
          </view>
        </view>
        
        <!-- 拼音儿歌模块 -->
        <view class="module-card card-secondary" @click="goToSongs">
          <view class="card-content">
            <text class="card-icon">🎵</text>
            <text class="card-title">拼音儿歌</text>
            <text class="card-desc">通过儿歌轻松学拼音</text>
          </view>
        </view>
      </view>
      
      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text class="tip-text">选择模块开始学习之旅 ✨</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PhonicsPage',
  methods: {
    goToPronunciation() {
      uni.navigateTo({
        url: '/pages/phonics/pronunciation/index'
      });
    },
    goToSongs() {
      uni.navigateTo({
        url: '/pages/songs/index'
      });
    }
  }
};
</script>

<style scoped>
/* 页面基础样式 */
.phonics-page {
  min-height: 100vh;
  background: #FF476F;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.decoration-block {
  position: absolute;
  border-radius: 24rpx;
  z-index: 0;
}

.decoration-1 {
  top: 20rpx;
  right: 20rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FBBF24;
  transform: rotate(15deg);
  animation: float-left 8s ease-in-out infinite reverse;
}

.decoration-2 {
  top: 200rpx;
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  transform: rotate(-8deg);
  animation: float 6s ease-in-out infinite;
}

.decoration-3 {
  bottom: 100rpx;
  right: 50rpx;
  width: 80rpx;
  height: 80rpx;
  background: #10B981;
  transform: rotate(12deg);
  animation: float-right 7s ease-in-out infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-20rpx) rotate(-12deg); }
}

@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

@keyframes float-right {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-15rpx) rotate(18deg); }
}

/* 页面头部 */
.header {
  padding: 60rpx 32rpx 40rpx;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
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
  grid-template-columns: 1fr 1fr;
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