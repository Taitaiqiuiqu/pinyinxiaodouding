<template>
  <view class="page games-list-page">
    <view class="floating-stars"></view>

    <view class="center-area container">
      <text class="title">游戏训练</text>
      <text class="subtitle">选择一个游戏开始学习吧！</text>

      <view class="games-grid">
        <view class="game-card" @tap="goToGame('listen-guess')">
          <view class="game-icon">🎧</view>
          <text class="game-title">听音辨音</text>
          <text class="game-desc">听拼音，选正确的答案</text>
          <view class="game-difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="stars">
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
            </view>
          </view>
        </view>

        <view class="game-card disabled">
          <view class="game-icon">🎵</view>
          <text class="game-title">声调训练</text>
          <text class="game-desc">学习拼音的四个声调</text>
          <view class="game-difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="stars">
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
            </view>
          </view>
          <view class="coming-soon">
            <text>即将推出</text>
          </view>
        </view>

        <view class="game-card disabled">
          <view class="game-icon">✏️</view>
          <text class="game-title">拼音拼写</text>
          <text class="game-desc">听音拼写完整的拼音</text>
          <view class="game-difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="stars">
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
            </view>
          </view>
          <view class="coming-soon">
            <text>即将推出</text>
          </view>
        </view>

        <view class="game-card disabled">
          <view class="game-icon">🎮</view>
          <text class="game-title">拼音消消乐</text>
          <text class="game-desc">快速消除匹配的拼音</text>
          <view class="game-difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="stars">
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
              <text class="star">⭐</text>
            </view>
          </view>
          <view class="coming-soon">
            <text>即将推出</text>
          </view>
        </view>
      </view>
    </view>

    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
  </view>
</template>

<script setup lang="ts">
function goToGame(gameType: string) {
  if (gameType === 'listen-guess') {
    uni.navigateTo({
      url: '/pages/games/listen-guess/index'
    })
  }
}
</script>

<style scoped>
.page.games-list-page {
  padding: 28rpx;
  background: #FFB84D;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.page.games-list-page::before {
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
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.page.games-list-page::after {
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
  border: 8rpx solid #FFFFFF;
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
  background: #FF476F;
  padding: 20rpx 40rpx;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.subtitle {
  color: #FFFFFF;
  margin-bottom: 48rpx;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.6;
  font-weight: 600;
  width: 100%;
  background: #3B82F6;
  padding: 16rpx 32rpx;
  border-radius: 28rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.games-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.game-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.game-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.game-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-card.disabled:active {
  transform: none;
}

.game-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
}

.game-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3436;
  text-align: center;
}

.game-desc {
  font-size: 24rpx;
  color: #6B7280;
  text-align: center;
  line-height: 1.4;
}

.game-difficulty {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.difficulty-label {
  font-size: 20rpx;
  color: #9CA3AF;
  font-weight: 600;
}

.stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 20rpx;
}

.coming-soon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
}

.coming-soon text {
  font-size: 24rpx;
  font-weight: 700;
  color: #FF6B3D;
  background: #FFF5F0;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}
</style>
