<template>
  <view v-if="show" :style="handStyle">
    <image :src="handImage" class="hand-img" mode="aspectFit"/>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Position {
  top: string
  left: string
}

const props = withDefaults(defineProps<{
  type: string
  show: boolean
  position: Position
}>(), {
  type: 'click',
  show: true,
  position: () => ({ top: '50%', left: '50%' })
})

const handImage = computed(() => {
  return `/static/images/hand/hand_${props.type}.png`
})

const handStyle = computed(() => {
  return {
    position: 'absolute',
    top: props.position.top,
    left: props.position.left,
    transform: 'translate(-50%, -50%)'
  }
})
</script>

<style scoped lang="scss">
.hand-img { width: 100rpx; height: 100rpx; box-shadow: 0 12rpx 28rpx rgba(255,126,179,0.25); transition: transform 200ms ease; border-radius: 50%; background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%); padding: 8rpx; border: 3rpx solid rgba(255,126,179,0.2); }
.hand-img:hover { transform: translateY(-6rpx) scale(1.05); box-shadow: 0 16rpx 36rpx rgba(255,126,179,0.35); }
.hand-img:active { transform: translateY(-2rpx) scale(1.02); }

@media (max-width: 420px) {
  .hand-img { width: 80rpx; height: 80rpx; padding: 6rpx; }
}
</style>


