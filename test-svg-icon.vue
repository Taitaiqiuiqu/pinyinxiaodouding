<template>
  <view class="test-page">
    <text class="title">SVG图标测试</text>
    
    <!-- 直接测试Icon组件 -->
    <view class="test-section">
      <text class="subtitle">直接使用Icon组件</text>
      <Icon name="hand-click" size="200rpx" />
    </view>
    
    <!-- 测试HandGuide组件 -->
    <view class="test-section">
      <text class="subtitle">使用HandGuide组件</text>
      <HandGuide 
        type="click" 
        :show="true" 
        :position="{ top: '50%', left: '50%' }" 
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import Icon from './src/components/Icon/Icon.vue'
import HandGuide from './src/components/HandGuide/HandGuide.vue'
</script>

<style scoped>
.test-page {
  padding: 40rpx;
  background-color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  color: #333;
}

.subtitle {
  font-size: 28rpx;
  margin-bottom: 20rpx;
  color: #666;
}

.test-section {
  margin-bottom: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 300rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  position: relative;
}
</style>