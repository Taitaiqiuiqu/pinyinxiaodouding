<template>
  <view v-if="show" :style="handStyle">
    <!-- 使用Icon组件和图标池中的图标 -->
    <Icon 
      :name="iconType" 
      size="120rpx" 
      className="hand-img"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import Icon from '../Icon/Icon.vue'

interface HandPosition {
  top: string
  left: string
}

const props = withDefaults(defineProps<{
  type: string
  show: boolean
  position: HandPosition
}>(), {
  type: 'click',
  show: true,
  position: () => ({ top: '50%', left: '50%' })
})

// 根据type属性计算对应的图标名称
const iconType = computed(() => {
  return props.type === 'click' ? 'hand-click' : 'hand-swipe'
})

const handStyle = computed((): CSSProperties => {
    return {
      position: 'absolute',
      top: props.position.top,
      left: props.position.left,
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      pointerEvents: 'none'
    }
  })</script>

<style scoped lang="scss">
.hand-img {
  box-shadow: 0 16rpx 40rpx rgba(255,71,111,0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 50%;
  background: #ffffff;
  padding: 12rpx;
  border: 4rpx solid #FF476F;
  animation: handBounce 1s ease-in-out infinite, wave 2s ease-in-out infinite;
  will-change: transform;
  width: 120rpx;
  height: 120rpx;
  opacity: 1;
  filter: none;
}

@keyframes handBounce {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-10rpx) rotate(15deg); }
}

@keyframes wave {
  0%, 100% { transform: rotate(15deg); }
  25% { transform: rotate(30deg); }
  75% { transform: rotate(0deg); }
}

.hand-img:hover {
  transform: translateY(-6rpx) scale(1.1) rotate(20deg);
  box-shadow: 0 16rpx 40rpx rgba(255,126,179,0.4);
  animation: none;
}

.hand-img:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.25);
}

/* 微信小程序使用rpx自动适配，无需媒体查询 */
</style>


