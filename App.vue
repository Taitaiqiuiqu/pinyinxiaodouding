<template>
  <view class="app-container">
    <!-- 页面容器 -->
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initCloud } from './src/services/cloud'

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发环境
  initCloud().then(() => {
    console.log('Cloud initialized successfully')
  }).catch(err => {
    console.error('Cloud initialization failed:', err)
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
	/* 全局样式 - 简约+儿童化设计 */
	
	/* 全局页面基础样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		color: $text-primary;
		background-color: $uni-bg-color;
	}
	
	/* 全局页面容器 */
	.page {
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
		will-change: transform, opacity;
		background: $brand-soft;
	}
	
	/* 全局主背景 */
	.primary-bg {
		background: $module-primary;
	}
	
	/* 学习模块背景 */
	.learning-bg {
		background: $module-learning;
	}
	
	/* 游戏模块背景 */
	.game-bg {
		background: $module-game;
	}
	
	/* 成就模块背景 */
	.achievement-bg {
		background: $module-achievement;
	}
	
	/* 创意模块背景 */
	.creative-bg {
		background: $module-creative;
	}
	
	/* 全局柔和背景 */
	.soft-bg {
		background-color: $brand-soft;
	}
	
	/* 全局装饰元素 - 简约设计 */
	.decorated-bg {
		position: relative;
		overflow: hidden;
	}
	
	/* 简约装饰性背景元素 */
	.decorated-bg::before {
		content: '';
		position: fixed;
		top: -150rpx;
		right: -150rpx;
		width: 350rpx;
		height: 350rpx;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 50%;
		animation: float 10s ease-in-out infinite;
		pointer-events: none;
		z-index: 0;
	}
	
	.decorated-bg::after {
		content: '';
		position: fixed;
		bottom: -120rpx;
		left: -120rpx;
		width: 280rpx;
		height: 280rpx;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 50%;
		animation: float 12s ease-in-out infinite reverse;
		pointer-events: none;
		z-index: 0;
	}
	
	/* 页面过渡动画 - 简约流畅 */
	.page-enter-active,
	.page-leave-active {
		transition: all $motion-medium ease;
	}
	
	.page-enter-from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	
	.page-leave-to {
		opacity: 0;
		transform: translateY(-20rpx);
	}
</style>
