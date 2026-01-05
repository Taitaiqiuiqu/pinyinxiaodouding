<template>
  <view class="page quiz-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />

    <view class="center-area card container">
      <text class="title">答题验证</text>
      <text class="subtitle">请完成以下题目以继续</text>

      <!-- Quiz section -->
      <view class="quiz">
        <view class="attempts-row">
          <text class="attempts">剩余尝试：{{ attemptsLeft }}</text>
          <text class="next-refill" v-if="attemptsLeft < 5 && nextRefillInMs > 0">下次刷新：{{ formatMs(nextRefillInMs) }}</text>
        </view>
        <text class="q-question">9 × ? = 72</text>
        <input 
          class="q-input" 
          type="number" 
          v-model.number="answer" 
          placeholder="请输入答案" 
          :disabled="attemptsLeft<=0"
          @focus="hideHandGuide"
          @tap="hideHandGuide"
        />
        <HandGuide 
          v-if="showHandGuide"
          type="click"
          :show="showHandGuide"
          :position="{ top: '50%', left: '50%' }"
          class="hand-guide-animated"
        />
        <button
          class="btn-primary q-btn"
          :class="{disabled: answer === '' || attemptsLeft <= 0}"
          :disabled="answer === '' || attemptsLeft <= 0"
          @tap="submitAnswer"
          @touchstart="btnDown = true" @touchend="btnDown = false"
          :style="{ transform: btnDown ? 'scale(0.98)' : 'scale(1)' }"
        >提交</button>
        <text class="q-hint" v-if="feedback">{{ feedback }}</text>
      </view>
    </view>

    <!-- 装饰元素 -->
    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import HandGuide from '../../src/components/HandGuide/HandGuide.vue'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'

// 组件引用
const audio = ref<any>(null)

// 响应式数据
const answer = ref<number | ''>('')
const feedback = ref('')
const btnDown = ref(false)
const attemptsLeft = ref(5)
const nextRefillInMs = ref(0)
const _attemptsTimerId = ref<any>(null)
const showHandGuide = ref(true)
const showAnimation = ref(false)

// 生命周期钩子
onShow(() => {
  // play guide audio on enter with loop
  audio.value && audio.value.play({
    type: 'guide',
    file: 'age-select/guide_age_survey_3-8_01.MP3',
    loop: true
  }).catch(() => {})
  _loadAttemptsFromStorage()
  _startAttemptsTimer()
})

onHide(() => {
  _stopAttemptsTimer()
})

// 方法定义
const formatMs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const _storageKey = () => {
  return 'ageSelectAttempts_v1'
}

const _loadAttemptsFromStorage = () => {
  try {
    const raw = uni.getStorageSync(_storageKey())
    if (raw) {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw
      // { attemptsLeft, lastRefillTime }
      if (typeof data.attemptsLeft === 'number') {
        attemptsLeft.value = data.attemptsLeft
      }
      const lastRefill = data.lastRefillTime || null
      // compute replenishments
      if (attemptsLeft.value < 5 && lastRefill) {
        const now = Date.now()
        const elapsed = now - lastRefill
        const interval = 10 * 60 * 1000
        const adds = Math.floor(elapsed / interval)
        if (adds > 0) {
          attemptsLeft.value = Math.min(5, attemptsLeft.value + adds)
          // advance lastRefillTime by adds * interval
          const newLast = lastRefill + adds * interval
          if (attemptsLeft.value >= 5) {
            // clear refill tracking
            uni.removeStorageSync(_storageKey())
          } else {
            uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: newLast })
          }
        } else {
          // keep stored data, compute nextRefillInMs
          const next = lastRefill + interval - elapsed
          nextRefillInMs.value = Math.max(0, next)
        }
      }
    }
  } catch (e) {
    // ignore storage errors
  }
}

const _saveAttemptsToStorage = () => {
  try {
    if (attemptsLeft.value >= 5) {
      uni.removeStorageSync(_storageKey())
      nextRefillInMs.value = 0
    } else {
      const now = Date.now()
      // if no existing data, set lastRefillTime to now
      const raw = uni.getStorageSync(_storageKey())
      let lastRefill = raw && raw.lastRefillTime ? raw.lastRefillTime : now
      uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: lastRefill })
    }
  } catch (e) {}
}

const _startAttemptsTimer = () => {
  _stopAttemptsTimer()
  _updateNextRefill()
  _attemptsTimerId.value = setInterval(() => {
    _updateNextRefill()
  }, 1000)
}

const _stopAttemptsTimer = () => {
  if (_attemptsTimerId.value) {
    clearInterval(_attemptsTimerId.value)
    _attemptsTimerId.value = null
  }
}

const _updateNextRefill = () => {
  try {
    const raw = uni.getStorageSync(_storageKey())
    if (!raw) {
      nextRefillInMs.value = 0
      return
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    const lastRefill = data.lastRefillTime || Date.now()
    const interval = 10 * 60 * 1000
    const now = Date.now()
    const elapsed = now - lastRefill
    if (elapsed >= interval) {
      // perform replenishment(s)
      const adds = Math.floor(elapsed / interval)
      attemptsLeft.value = Math.min(5, (data.attemptsLeft || 0) + adds)
      const newLast = lastRefill + adds * interval
      if (attemptsLeft.value >= 5) {
        uni.removeStorageSync(_storageKey())
        nextRefillInMs.value = 0
      } else {
        uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: newLast })
        nextRefillInMs.value = Math.max(0, newLast + interval - now)
      }
    } else {
      nextRefillInMs.value = Math.max(0, lastRefill + interval - now)
    }
  } catch (e) {
    nextRefillInMs.value = 0
  }
}

const hideHandGuide = () => {
  showHandGuide.value = false
}


const submitAnswer = () => {
  // if no attempts left, block
  if (attemptsLeft.value <= 0) {
    feedback.value = '已达到最大尝试次数，无法继续'
    return
  }

  // correct answer is 8
  if (Number(answer.value) === 8) {
    feedback.value = '回答正确，正在跳转到年龄选择页面...'
    // clear stored attempts when passed
    try { uni.removeStorageSync(_storageKey()) } catch(e){}
    
    // 设置答题成功标志
    uni.setStorageSync('quizCompleted', true)
    
    // 注意：不停止音频播放，让音频持续到age-select页面
    
    // Navigate to age selection page
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/age-select/index'
      })
    }, 1500)
  } else {
    attemptsLeft.value -= 1
    if (attemptsLeft.value <= 0) {
      feedback.value = '已达到最大尝试次数，无法继续'
      // set lastRefillTime to now to start cooldown tracking
      try { uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: Date.now() }) } catch(e){}
      _updateNextRefill()
    } else {
      // ensure storage has lastRefillTime (start cooldown)
      try {
        const raw = uni.getStorageSync(_storageKey())
        if (!raw || !raw.lastRefillTime) {
          uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: Date.now() })
        } else {
          uni.setStorageSync(_storageKey(), { attemptsLeft: attemptsLeft.value, lastRefillTime: raw.lastRefillTime })
        }
      } catch(e){}
      feedback.value = `答案不正确，请再试一次（剩余 ${attemptsLeft.value} 次）`
      _updateNextRefill()
    }
  }
}
</script>

<style scoped>
/* 页面基础样式 - 积木风格纯色背景 */
.page.quiz-page {
  padding: 28rpx;
  background: #FBBF24;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Decorative elements - 积木风格 */
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

/* Additional floating decorations */
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

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(2deg); }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.1) rotate(90deg); opacity: 0.6; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12); }
  50% { box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2); }
}

@keyframes bounce-in {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.02); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.page.quiz-page > view, .page.quiz-page > input, .page.quiz-page > button, .page.quiz-page > text {
  position: relative;
  z-index: 1;
}

.center-area {
  width: 100%;
  max-width: 720rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  color: #2d3436;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #2d3436;
  margin-bottom: 32rpx;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.6;
  font-weight: 600;
  width: 100%;
}

.card {
  width: 100%;
  background: #FFFFFF;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
  padding: 32rpx;
  border-radius: 16rpx;
  border: 3rpx solid #FFFFFF;
  position: relative;
  overflow: hidden;
  animation: bounce-in 250ms ease-out;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: #FF476F;
  border-radius: 16rpx 16rpx 0 0;
}

.quiz {
  width: 100%;
  max-width: 640rpx;
  background: #FFFFFF;
  padding: 48rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  box-shadow: 0 12rpx 0 #E5E7EB;
  border: 8rpx solid #FFFFFF;
  animation: pulse-glow 2.5s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.q-title {
  font-size: 20rpx;
  margin-bottom: 12rpx;
  color: #FF476F;
  font-weight: 600;
}

.q-question {
  font-size: 48rpx;
  font-weight: 800;
  margin-bottom: 24rpx;
  color: #FF6B3D;
  line-height: 1.4;
  text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.q-input {
  width: 60%;
  padding: 32rpx 24rpx;
  border-radius: 24rpx;
  border: 4rpx solid #FFE8E1;
  text-align: center;
  font-size: 36rpx;
  background: #FFFFFF;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 200ms ease;
}

.q-input:focus {
  border-color: #FF6B3D;
  box-shadow: 0 0 0 6rpx rgba(255, 107, 61, 0.15);
}

.q-btn {
  background: #FF476F;
  color: #fff;
  padding: 32rpx 64rpx;
  height: 72rpx;
  border-radius: 24rpx;
  font-weight: 700;
  font-size: 32rpx;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  border: none;
  transition: transform 150ms ease, box-shadow 150ms ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.q-btn.disabled {
  opacity: 0.5;
  background: #9CA3AF;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.1);
}

.q-hint {
  margin-top: 16rpx;
  color: #FF6B3D;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: center;
  font-weight: 600;
  width: 100%;
}

/* Responsive adjustments - 微信小程序使用rpx自动适配，无需媒体查询 */
.attempts-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 12rpx;
}

.attempts {
  font-size: 24rpx;
  color: #FF6B3D;
  font-weight: 700;
}

.next-refill {
  font-size: 20rpx;
  color: #FF476F;
  font-weight: 600;
}

/* Animations & interactions */
.motion-fade-up {
  transform: translateY(12rpx);
  opacity: 0;
  animation: fadeUp 420ms forwards;
}

@keyframes fadeUp {
  to { transform: translateY(0); opacity: 1; }
}

/* Button press feedback */
.btn-primary {
  transition: transform 120ms ease, box-shadow 120ms ease;
  will-change: transform;
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.2);
}

/* Hover effects for interactive elements */
.q-input:focus {
  border-color: #FF6B3D;
  box-shadow: 0 0 0 6rpx rgba(255, 107, 61, 0.15);
}

/* Additional spacing for better visual hierarchy */
.quiz > view:not(:last-child) {
  margin-bottom: 8rpx;
}

.quiz > view:nth-child(odd) {
  margin-bottom: 16rpx;
}

/* Hand Guide Animation */
.hand-guide-animated {
  animation: hand-bounce 2s ease-in-out infinite;
}

@keyframes hand-bounce {
  0%, 100% { transform: translateY(0) scale(1) translate(-50%, -50%); }
  25% { transform: translateY(-8rpx) scale(1.05) translate(-50%, -50%); }
  50% { transform: translateY(-12rpx) scale(1.08) translate(-50%, -50%); }
  75% { transform: translateY(-8rpx) scale(1.05) translate(-50%, -50%); }
}

/* Enhanced Button Interactions */
.q-btn {
  position: relative;
  overflow: hidden;
}

/* Input Field Enhancements */
.q-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Quiz Container Breathing Effect */
.quiz {
  animation: quiz-breathing 4s ease-in-out infinite;
}

@keyframes quiz-breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Attempts Counter Animation */
.attempts {
  animation: counter-pulse 2s ease-in-out infinite;
}

@keyframes counter-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Feedback Message Animation */
.q-hint {
  animation: feedback-slide 0.5s ease-out;
}

@keyframes feedback-slide {
  from { 
    transform: translateY(20rpx); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

/* Title Enhancement */
.title {
  animation: title-glow 3s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { 
    text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2); 
  }
  50% { 
    text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.3); 
  }
}

/* Question Animation */
.q-question {
  animation: question-entrance 0.8s ease-out;
}

@keyframes question-entrance {
  0% { 
    transform: scale(0.8) rotate(-5deg); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.05) rotate(2deg); 
    opacity: 0.8; 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1; 
  }
}
</style>
