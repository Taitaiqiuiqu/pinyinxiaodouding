<template>
  <view class="page parent-quiz-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />

    <view class="center-area card container">
      <text class="title">家长验证</text>
      <text class="subtitle">请完成以下题目以继续</text>

      <view class="quiz">
        <view class="attempts-row">
          <text class="attempts">剩余尝试：{{ attemptsLeft }}</text>
          <text class="next-refill" v-if="attemptsLeft < 5 && nextRefillInMs > 0">下次刷新：{{ formatMs(nextRefillInMs) }}</text>
        </view>
        <text class="q-question">{{ question }}</text>
        <input 
          class="q-input" 
          type="text" 
          v-model="answer" 
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
        <text class="q-hint-text">提示：可以自行去搜索引擎搜索</text>
      </view>
    </view>

    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { useGlobalStore } from '../../src/store/global'
import HandGuide from '../../src/components/HandGuide/HandGuide.vue'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'

const globalStore = useGlobalStore()

const audio = ref<any>(null)
const question = ref('AI大模型底层使用哪种编程语言？')
const correctAnswer = ref('python')

const answer = ref('')
const feedback = ref('')
const btnDown = ref(false)
const attemptsLeft = ref(5)
const nextRefillInMs = ref(0)
const _attemptsTimerId = ref<any>(null)
const showHandGuide = ref(true)

onShow(() => {
  _loadAttemptsFromStorage()
  _startAttemptsTimer()
  nextTick(() => {
    playWelcomeAudio()
  })
})

const playWelcomeAudio = () => {
  console.log('[ParentQuiz] 开始播放欢迎音频')
  console.log('[ParentQuiz] audio ref:', audio.value)
  
  audio.value?.play({
    type: 'guide',
    file: 'parents_get_in',
    loop: false,
    onComplete: () => {
      console.log('[ParentQuiz] parents_get_in 播放完成，准备播放 parents_ask')
      setTimeout(() => {
        console.log('[ParentQuiz] 开始播放 parents_ask')
        audio.value?.play({
          type: 'guide',
          file: 'parents_ask',
          loop: false
        })
      }, 300)
    }
  })
}

onHide(() => {
  _stopAttemptsTimer()
})

const formatMs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const _loadAttemptsFromStorage = () => {
  try {
    const data = globalStore.parentQuizAttempts
    if (typeof data.attemptsLeft === 'number') {
      attemptsLeft.value = data.attemptsLeft
    }
    const lastRefill = data.lastRefillTime || null
    if (attemptsLeft.value < 5 && lastRefill) {
      const now = Date.now()
      const elapsed = now - lastRefill
      const interval = 10 * 60 * 1000
      const adds = Math.floor(elapsed / interval)
      if (adds > 0) {
        attemptsLeft.value = Math.min(5, attemptsLeft.value + adds)
        const newLast = lastRefill + adds * interval
        if (attemptsLeft.value >= 5) {
          globalStore.clearParentQuizAttempts()
        } else {
          globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: newLast })
        }
      } else {
        const next = lastRefill + interval - elapsed
        nextRefillInMs.value = Math.max(0, next)
      }
    }
  } catch (e) {
  }
}

const _saveAttemptsToStorage = () => {
  try {
    if (attemptsLeft.value >= 5) {
      globalStore.clearParentQuizAttempts()
      nextRefillInMs.value = 0
    } else {
      const now = Date.now()
      const data = globalStore.parentQuizAttempts
      let lastRefill = data && data.lastRefillTime ? data.lastRefillTime : now
      globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: lastRefill })
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
    const data = globalStore.parentQuizAttempts
    if (!data || data.attemptsLeft >= 5) {
      nextRefillInMs.value = 0
      return
    }
    const lastRefill = data.lastRefillTime || Date.now()
    const interval = 10 * 60 * 1000
    const now = Date.now()
    const elapsed = now - lastRefill
    if (elapsed >= interval) {
      const adds = Math.floor(elapsed / interval)
      attemptsLeft.value = Math.min(5, (data.attemptsLeft || 0) + adds)
      const newLast = lastRefill + adds * interval
      if (attemptsLeft.value >= 5) {
        globalStore.clearParentQuizAttempts()
        nextRefillInMs.value = 0
      } else {
        globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: newLast })
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
  if (attemptsLeft.value <= 0) {
    feedback.value = '已达到最大尝试次数，无法继续'
    return
  }

  if (answer.value.trim().toLowerCase() === correctAnswer.value) {
    feedback.value = '验证成功，正在跳转...'
    globalStore.clearParentQuizAttempts()
    globalStore.setParentVerified(true)
    
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/parent-settings/index'
      })
    }, 1500)
  } else {
    attemptsLeft.value -= 1
    if (attemptsLeft.value <= 0) {
      feedback.value = '已达到最大尝试次数，无法继续'
      globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: Date.now() })
      _updateNextRefill()
    } else {
      try {
        const data = globalStore.parentQuizAttempts
        if (!data || !data.lastRefillTime) {
          globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: Date.now() })
        } else {
          globalStore.setParentQuizAttempts({ attemptsLeft: attemptsLeft.value, lastRefillTime: data.lastRefillTime })
        }
      } catch(e){}
      feedback.value = `答案不正确，请再试一次（剩余 ${attemptsLeft.value} 次）`
      _updateNextRefill()
    }
  }
}
</script>

<style scoped>
.page.parent-quiz-page {
  padding: 28rpx;
  background: #8B5CF6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.page.parent-quiz-page::before {
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
  box-shadow: 0 12rpx 0 #E53E5F;
}

.page.parent-quiz-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #D97706;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-20rpx) rotate(-15deg); }
}

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

@keyframes bounce-in {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.02); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.page.parent-quiz-page > view, .page.parent-quiz-page > input, .page.parent-quiz-page > button, .page.parent-quiz-page > text {
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
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: #FFFFFF;
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
  background: #8B5CF6;
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
  position: relative;
  z-index: 1;
}

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
  color: #6B21A8;
  font-weight: 700;
}

.next-refill {
  font-size: 20rpx;
  color: #6B21A8;
  font-weight: 600;
}

.q-question {
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 24rpx;
  color: #6B21A8;
  line-height: 1.4;
  text-align: center;
}

.q-input {
  width: 80%;
  padding: 32rpx 24rpx;
  border-radius: 24rpx;
  border: 4rpx solid #E9D5FF;
  text-align: center;
  font-size: 28rpx;
  background: #FFFFFF;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 200ms ease;
  color: #6B21A8;
  font-weight: 600;
}

.q-input:focus {
  border-color: #6B21A8;
  box-shadow: 0 0 0 6rpx rgba(107, 33, 168, 0.15);
}

.q-btn {
  background: #6B21A8;
  color: #fff;
  padding: 32rpx 64rpx;
  height: 72rpx;
  border-radius: 24rpx;
  font-weight: 700;
  font-size: 32rpx;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(107, 33, 168, 0.3);
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
  box-shadow: 0 4rpx 8rpx rgba(107, 33, 168, 0.2);
}

.q-btn.disabled {
  opacity: 0.5;
  background: #9CA3AF;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.1);
}

.q-hint {
  margin-top: 16rpx;
  color: #6B21A8;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: center;
  font-weight: 600;
  width: 100%;
}

.q-hint-text {
  margin-top: 8rpx;
  color: #6B21A8;
  font-size: 20rpx;
  line-height: 1.5;
  text-align: center;
  font-style: italic;
  opacity: 0.7;
}

.hand-guide-animated {
  animation: hand-bounce 2s ease-in-out infinite;
}

@keyframes hand-bounce {
  0%, 100% { transform: translateY(0) scale(1) translate(-50%, -50%); }
  25% { transform: translateY(-8rpx) scale(1.05) translate(-50%, -50%); }
  50% { transform: translateY(-12rpx) scale(1.08) translate(-50%, -50%); }
  75% { transform: translateY(-8rpx) scale(1.05) translate(-50%, -50%); }
}

.decoration {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
}

.decoration-1 {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  top: 10%;
  left: 5%;
}

.decoration-2 {
  width: 150rpx;
  height: 150rpx;
  background: rgba(255, 255, 255, 0.1);
  bottom: 20%;
  right: 10%;
}

.decoration-3 {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.1);
  top: 50%;
  right: 20%;
}
</style>
