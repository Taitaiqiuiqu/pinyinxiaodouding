<template>
  <view class="game-card" @tap="$emit('tap')">
    <image :src="image" class="card-img" mode="aspectFill"/>
    <view class="card-body">
      <text class="card-title">{{ title }}</text>
      <slot name="extra"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    image: { type: String, default: '' },
    title: { type: String, default: '' }
  },
  emits: ['tap']
}
</script>

<style scoped>
.game-card { border-radius: 24rpx; overflow: hidden; background: linear-gradient(180deg,#ffffff,#fff9f5); box-shadow: 0 12rpx 32rpx rgba(255,126,179,0.15); border: 3rpx solid rgba(255,126,179,0.2); transition: transform 200ms ease, box-shadow 200ms ease; position: relative; }
.game-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4rpx; background: linear-gradient(90deg, #ff7eb3, #ff9a56, #ffd93d, #6bcf7f, #a78bfa, #4ecdc4); opacity: 0.6; }
.game-card:active { transform: translateY(4rpx) scale(0.995); box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.2); }
.card-img { width: 100%; height: 220rpx; display:block; object-fit:cover; }
@media (max-width: 420px) {
  .card-img { height: 180rpx; }
}
.card-body { padding: 20rpx; }
.card-title { font-size: 20rpx; color:#ff7eb3; font-weight:700; text-shadow: 1rpx 1rpx 2rpx rgba(255,126,179,0.1); }
</style>


