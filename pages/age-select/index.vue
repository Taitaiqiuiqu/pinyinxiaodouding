<template>
  <view class="page age-select-page">
    <AudioPlayer ref="audio" />
    <view class="top-area container">
      <RoleGuide :roleType="'idle'" :guideText="guideText" />
    </view>

    <view class="center-area card container">
      <text class="title">请选择年龄</text>
      <text class="subtitle">选择孩子所在年龄段，界面将展示对应课程</text>

      <!-- Age options -->
      <view class="age-options">
        <view
          class="option motion-fade-up"
          v-for="(opt, idx) in options"
          :key="opt.value"
          :class="['opt-' + opt.value]"
          :style="{ transitionDelay: (idx * 100) + 'ms' }"
          @tap="selectAge(opt.value)"
        >
          <text class="opt-icon">{{ opt.icon }}</text>
          <text class="opt-label">{{ opt.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import RoleGuide from '../../src/components/RoleGuide/RoleGuide.vue'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'
import { useGlobalStore } from '../../src/store/global'
import { updateAge } from '../../src/services/cloud'
import GlobalAudioManager from '../../src/services/GlobalAudioManager'

const audio = ref<any>(null)

// 响应式数据
const guideText = ref('请选择适合孩子的年龄')
const options = ref([
  { value: 1, label: '3-4 岁', icon: '🌸' },
  { value: 2, label: '4-5 岁', icon: '⭐' },
  { value: 3, label: '5-6 岁', icon: '🌱' },
  { value: 4, label: '6-8 岁', icon: '🌈' }
])

onShow(() => {
  // play guide audio on enter with loop
  audio.value && audio.value.play({
    type: 'guide',
    file: 'age-select/guide_age_survey_3-8_01.MP3',
    loop: true
  }).catch(() => {})
})

// 方法定义
const selectAge = async (ageLevel: number) => {
  // 停止循环播放音频
  const audioManager = GlobalAudioManager.getInstance()
  audioManager.stopLoop()
  
  const store = useGlobalStore()
  store.setAgeLevel(ageLevel)
  uni.setStorageSync('ageLevel', ageLevel)
  
  uni.showLoading({ title: '保存中...' })
  
  try {
    const result = await updateAge(ageLevel)
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      // 跳转到home页面
      uni.navigateTo({ url: '/pages/home/index' })
    } else {
      uni.showToast({ title: result.message, icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
.page.age-select-page { padding: 28rpx; background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%); min-height:100vh; display:flex; flex-direction:column; align-items:center; position:relative; overflow:hidden; }

/* Decorative elements - cute and colorful */
.page.age-select-page::before,
.page.age-select-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  z-index: 0;
}

.page.age-select-page::before {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  top: -150rpx;
  left: -150rpx;
  animation: float 6s ease-in-out infinite;
}

.page.age-select-page::after {
  width: 220rpx;
  height: 220rpx;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  bottom: -110rpx;
  right: -110rpx;
  animation: float 5s ease-in-out infinite;
  animation-delay: 2s;
}

.page.age-select-page > view {
  position: relative;
  z-index: 1;
}

.center-area { width:100%; max-width:720rpx; display:flex; flex-direction:column; align-items:center; margin-top:40rpx; }
.title { font-size:36rpx; font-weight:700; margin-bottom:12rpx; color:#2d3436; }
.subtitle { color:#636e72; margin-bottom:20rpx; font-size:16rpx; }
.card { width:100%; background: linear-gradient(180deg,#ffffff,#fff9f5); box-shadow: 0 12rpx 32rpx rgba(255,126,179,0.15); padding:24rpx; border-radius:24rpx; }
.age-options { width:100%; display:flex; flex-wrap:wrap; gap:16rpx; justify-content:center; margin-top:20rpx; }
.option { width:45%; background: linear-gradient(180deg,#ffffff,#f8fbff); border:2rpx solid #e6eef9; padding:24rpx; border-radius:20rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 8rpx 20rpx rgba(255,126,179,0.12); position:relative; overflow:hidden; }
.opt-label { font-size:20rpx; color:#2d3436; font-weight:600; }
.opt-icon { font-size:48rpx; margin-bottom:8rpx; }

/* Responsive adjustments */
@media (max-width: 420px) {
  .option { width: 100%; }
  .center-area.card { padding: 20rpx !important; border-radius: 20rpx !important; }
}

/* Animations & interactions */
.motion-fade-up { transform: translateY(10rpx); opacity: 0; animation: fadeUp 500ms forwards; }
@keyframes fadeUp { to { transform: translateY(0); opacity: 1; } }
.option { transition: transform 200ms ease, box-shadow 200ms ease, opacity 250ms ease; }
.option:active { transform: translateY(4rpx) scale(0.97); box-shadow: 0 6rpx 16rpx rgba(255,126,179,0.15); }
.option:hover { transform: translateY(-8rpx); box-shadow: 0 20rpx 48rpx rgba(255,126,179,0.25); }

/* Colored variants for age options - cute colorful gradients */
.opt-3 { background: linear-gradient(135deg,#fff0f5,#ffe4ec); border-color: rgba(255,126,179,0.4); }
.opt-3 .opt-icon { content: '🌸'; }
.opt-4 { background: linear-gradient(135deg,#fff9e6,#ffe9b3); border-color: rgba(255,217,61,0.4); }
.opt-4 .opt-icon { content: '⭐'; }
.opt-5 { background: linear-gradient(135deg,#f0fff4,#d4ffc4); border-color: rgba(107,207,127,0.4); }
.opt-5 .opt-icon { content: '🌱'; }
.opt-6 { background: linear-gradient(135deg,#f0f4ff,#e0d4ff); border-color: rgba(167,139,250,0.4); }
.opt-6 .opt-icon { content: '🌈'; }
</style>