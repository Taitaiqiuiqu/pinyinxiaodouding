<template>
  <view class="home-page">
    <!-- 页面顶部 -->
    <view class="header">
      <text class="page-title">拼音学习乐园</text>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 功能模块卡片 -->
      <view class="module-grid">
        <!-- 拼音启蒙卡片 -->
        <view class="module-card card-primary" @tap="showComingSoon('拼音启蒙')">
          <view class="card-content">
            <Icon name="course" size="100rpx" color="#FFFFFF" />
            <text class="card-title">拼音启蒙</text>
            <text class="card-desc">拼音跟读、拼音儿歌</text>
          </view>
        </view>

        <!-- 游戏训练卡片 -->
        <view class="module-card card-secondary" @tap="showComingSoon('游戏训练')">
          <view class="card-content">
            <Icon name="game" size="100rpx" color="#FFFFFF" />
            <text class="card-title">游戏训练</text>
            <text class="card-desc">分龄游戏、寓教于乐</text>
          </view>
        </view>

        <!-- 手写练习卡片 -->
        <view class="module-card card-tertiary" @tap="showComingSoon('手写练习')">
          <view class="card-content">
            <Icon name="write" size="100rpx" color="#FFFFFF" />
            <text class="card-title">手写练习</text>
            <text class="card-desc">拼音书写、笔顺练习</text>
          </view>
        </view>

        <!-- 家长设置卡片 -->
        <view class="module-card card-quaternary" @tap="showComingSoon('家长设置')">
          <view class="card-content">
            <Icon name="parent" size="100rpx" color="#FFFFFF" />
            <text class="card-title">家长设置</text>
            <text class="card-desc">学习进度、使用时长</text>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text class="tip-text">点击卡片开始学习之旅 ✨</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import Icon from '../../src/components/Icon/Icon.vue';
import { useGlobalStore } from '../../src/store/global';

// 全局状态管理
const globalStore = useGlobalStore();

// 页面加载时检查用户状态
onLoad(() => {
  checkUserStatus();
});

// 检查用户状态
const checkUserStatus = () => {
  // 如果没有openid，跳转到登录页
  if (!globalStore.openid) {
    const openid = uni.getStorageSync('openid');
    if (openid) {
      globalStore.setOpenId(openid);
    } else {
      uni.reLaunch({
        url: '/pages/login/index'
      });
    }
  }
};

// 页面跳转
const navigateTo = (url: string) => {
  uni.navigateTo({
    url
  });
};

// 显示功能开发中提示
const showComingSoon = (moduleName: string) => {
  uni.showToast({
    title: `${moduleName}功能正在开发中，敬请期待！`,
    icon: 'none',
    duration: 2000
  });
};
</script>

<style scoped>
/* 页面基础样式 */
.home-page {
  min-height: 100vh;
  background: #FF476F;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.home-page::before {
  content: '';
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
}

.home-page::after {
  content: '';
  position: absolute;
  bottom: 40rpx;
  left: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
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
  text-align: center;
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

.card-quaternary {
  background: #10B981;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
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
