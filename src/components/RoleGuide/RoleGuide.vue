<template>
  <view class="role-guide" @tap="onTap">
    <image :src="roleImage" class="role-image" mode="aspectFit" />
    <view class="speech-bubble" v-if="guideText">
      <text class="guide-text">{{ guideText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RoleGuide',
  props: {
    roleType: {
      type: String,
      default: 'idle' // idle/point/speak/cheer/think
    },
    guideText: {
      type: String,
      default: ''
    },
    age: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['tap'],
  computed: {
    roleImage() {
      // 约定素材路径在 /static/images/role/
      return `/static/images/role/role_${this.roleType}.png`
    }
  },
  methods: {
    onTap() {
      this.$emit('tap')
    }
  }
}
</script>

.style-import {
  @import '../../../uni.scss';
}

<style scoped lang="scss">
@import '../../../uni.scss';
.role-guide { display:flex; flex-direction:column; align-items:center; }
.role-image { width: 180rpx; height: 180rpx; border-radius: 28rpx; box-shadow: $shadow-card; animation: bob 2200ms ease-in-out infinite; background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%); padding:12rpx; border: 3rpx solid rgba(255,126,179,0.2); }
.speech-bubble { margin-top: 16rpx; background: linear-gradient(90deg,#ff7eb3,#ff9a56); padding: 16rpx 20rpx; border-radius: 24rpx; box-shadow: 0 8rpx 20rpx rgba(255,126,179,0.25); max-width: 90%; position: relative; }
.speech-bubble::before { content: ''; position: absolute; top: -12rpx; left: 50%; transform: translateX(-50%); border-left: 12rpx solid transparent; border-right: 12rpx solid transparent; border-bottom: 16rpx solid #ff7eb3; }
.guide-text { font-size: 18rpx; color: #fff; font-weight:700; text-align:center; text-shadow: 1rpx 1rpx 2rpx rgba(0,0,0,0.1); }
.role-guide:active .role-image { transform: translateY(-4rpx) scale(1.05); transition: transform 180ms ease; }

@media (max-width: 420px) {
  .role-image { width: 140rpx; height: 140rpx; border-radius: 22rpx; padding:10rpx; }
  .speech-bubble { padding: 14rpx 18rpx; border-radius: 20rpx; }
  .guide-text { font-size: 16rpx; }
}
</style>



