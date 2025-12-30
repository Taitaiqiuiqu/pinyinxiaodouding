<template>
  <view class="page quiz-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />
    <view class="top-area container">
      <RoleGuide :roleType="'idle'" :guideText="guideText" />
    </view>

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
          :position="{ top: '68%', left: '50%' }"
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
  </view>
</template>

<script>
import RoleGuide from '../../src/components/RoleGuide/RoleGuide.vue'
import HandGuide from '../../src/components/HandGuide/HandGuide.vue'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'

export default {
  components: { RoleGuide, HandGuide, AudioPlayer },
  data() {
    return {
      guideText: '请先完成答题验证',
      answer: '',
      feedback: '',
      btnDown: false,
      attemptsLeft: 5,
      nextRefillInMs: 0,
      _attemptsTimerId: null,
      showHandGuide: true,
      showAnimation: false
    }
  },
  onShow() {
    // play guide audio on enter with loop
    this.$refs.audio && this.$refs.audio.play({
      type: 'guide',
      file: 'age-select/guide_age_survey_3-8_01.MP3',
      loop: true
    }).catch(() => {})
    this._loadAttemptsFromStorage()
    this._startAttemptsTimer()
  },
  onHide() {
    this._stopAttemptsTimer()
  },
  methods: {
    formatMs(ms) {
      const total = Math.max(0, Math.floor(ms / 1000))
      const m = Math.floor(total / 60)
      const s = total % 60
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    },
    _storageKey() {
      return 'ageSelectAttempts_v1'
    },

    _loadAttemptsFromStorage() {
      try {
        const raw = uni.getStorageSync(this._storageKey())
        if (raw) {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw
          // { attemptsLeft, lastRefillTime }
          if (typeof data.attemptsLeft === 'number') {
            this.attemptsLeft = data.attemptsLeft
          }
          const lastRefill = data.lastRefillTime || null
          // compute replenishments
          if (this.attemptsLeft < 5 && lastRefill) {
            const now = Date.now()
            const elapsed = now - lastRefill
            const interval = 10 * 60 * 1000
            const adds = Math.floor(elapsed / interval)
            if (adds > 0) {
              this.attemptsLeft = Math.min(5, this.attemptsLeft + adds)
              // advance lastRefillTime by adds * interval
              const newLast = lastRefill + adds * interval
              if (this.attemptsLeft >= 5) {
                // clear refill tracking
                uni.removeStorageSync(this._storageKey())
              } else {
                uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: newLast })
              }
            } else {
              // keep stored data, compute nextRefillInMs
              const next = lastRefill + interval - elapsed
              this.nextRefillInMs = Math.max(0, next)
            }
          }
        }
      } catch (e) {
        // ignore storage errors
      }
    },

    _saveAttemptsToStorage() {
      try {
        if (this.attemptsLeft >= 5) {
          uni.removeStorageSync(this._storageKey())
          this.nextRefillInMs = 0
        } else {
          const now = Date.now()
          // if no existing data, set lastRefillTime to now
          const raw = uni.getStorageSync(this._storageKey())
          let lastRefill = raw && raw.lastRefillTime ? raw.lastRefillTime : now
          uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: lastRefill })
        }
      } catch (e) {}
    },

    _startAttemptsTimer() {
      this._stopAttemptsTimer()
      this._updateNextRefill()
      this._attemptsTimerId = setInterval(() => {
        this._updateNextRefill()
      }, 1000)
    },

    _stopAttemptsTimer() {
      if (this._attemptsTimerId) {
        clearInterval(this._attemptsTimerId)
        this._attemptsTimerId = null
      }
    },

    _updateNextRefill() {
      try {
        const raw = uni.getStorageSync(this._storageKey())
        if (!raw) {
          this.nextRefillInMs = 0
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
          this.attemptsLeft = Math.min(5, (data.attemptsLeft || 0) + adds)
          const newLast = lastRefill + adds * interval
          if (this.attemptsLeft >= 5) {
            uni.removeStorageSync(this._storageKey())
            this.nextRefillInMs = 0
          } else {
            uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: newLast })
            this.nextRefillInMs = Math.max(0, newLast + interval - now)
          }
        } else {
          this.nextRefillInMs = Math.max(0, lastRefill + interval - now)
        }
      } catch (e) {
        this.nextRefillInMs = 0
      }
    },
    hideHandGuide() {
      this.showHandGuide = false
    },
    
    submitAnswer() {
      // if no attempts left, block
      if (this.attemptsLeft <= 0) {
        this.feedback = '已达到最大尝试次数，无法继续'
        return
      }

      // correct answer is 8
      if (Number(this.answer) === 8) {
        this.feedback = '回答正确，正在跳转到年龄选择页面...'
        // clear stored attempts when passed
        try { uni.removeStorageSync(this._storageKey()) } catch(e){}
        
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
        this.attemptsLeft -= 1
        if (this.attemptsLeft <= 0) {
          this.feedback = '已达到最大尝试次数，无法继续'
          // set lastRefillTime to now to start cooldown tracking
          try { uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: Date.now() }) } catch(e){}
          this._updateNextRefill()
        } else {
          // ensure storage has lastRefillTime (start cooldown)
          try {
            const raw = uni.getStorageSync(this._storageKey())
            if (!raw || !raw.lastRefillTime) {
              uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: Date.now() })
            } else {
              uni.setStorageSync(this._storageKey(), { attemptsLeft: this.attemptsLeft, lastRefillTime: raw.lastRefillTime })
            }
          } catch(e){}
          this.feedback = `答案不正确，请再试一次（剩余 ${this.attemptsLeft} 次）`
          this._updateNextRefill()
        }
      }
    }
  }
}
</script>

<style scoped>
.page.quiz-page { padding: 28rpx; background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%); min-height:100vh; display:flex; flex-direction:column; align-items:center; position:relative; overflow:hidden; }

/* Decorative elements - cute and colorful */
.page.quiz-page::before,
.page.quiz-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  z-index: 0;
  opacity: 0.15;
}

.page.quiz-page::before {
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, #ffecd2 0%, #fcb69f 70%, transparent 71%);
  top: -150rpx;
  right: -150rpx;
  animation: float 6s ease-in-out infinite;
}

.page.quiz-page::after {
  width: 280rpx;
  height: 280rpx;
  background: radial-gradient(circle, #a8edea 0%, #fed6e3 70%, transparent 71%);
  bottom: -140rpx;
  left: -140rpx;
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
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
  0%, 100% { box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.12); }
  50% { box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.2); }
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

.center-area { width:100%; max-width:720rpx; display:flex; flex-direction:column; align-items:center; margin-top:60rpx; }
.title { font-size:36rpx; font-weight:700; margin-bottom:16rpx; color:#ff7eb3; text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.15); }
.subtitle { color:#ff9a56; margin-bottom:24rpx; font-size:20rpx; text-align:center; line-height:1.6; font-weight:600; }
.card { 
  width:100%; 
  background: linear-gradient(135deg, #ffffff 0%, #fff9f5 30%, #ffeef8 100%); 
  box-shadow: 0 12rpx 32rpx rgba(255,126,179,0.15), 0 4rpx 16rpx rgba(255,154,86,0.08); 
  padding:32rpx; 
  border-radius:24rpx; 
  border: 3rpx solid rgba(255,126,179,0.2); 
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
  background: linear-gradient(90deg, #ff7eb3, #ff9a56, #ffd93d);
  border-radius: 32rpx 32rpx 0 0;
}
.quiz { 
  width:100%; 
  max-width:520rpx; 
  background: linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
  padding:32rpx; 
  border-radius:24rpx; 
  display:flex; 
  flex-direction:column; 
  align-items:center; 
  gap:20rpx; 
  box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.12), inset 0 1rpx 0 rgba(255,255,255,0.6); 
  border: 2rpx solid rgba(255,126,179,0.15); 
  animation: pulse-glow 2.5s ease-in-out infinite;
  position: relative;
}

.quiz::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 49%, rgba(255,126,179,0.03) 50%, transparent 51%);
  border-radius: 24rpx;
  pointer-events: none;
}
.q-title { font-size:20rpx; margin-bottom:12rpx; color:#ff7eb3; font-weight:600; }
.q-question { font-size:32rpx; font-weight:800; margin-bottom:16rpx; color:#ff9a56; line-height:1.4; text-shadow: 1rpx 1rpx 2rpx rgba(255,154,86,0.1); }
.q-input { width:50%; padding:24rpx 20rpx; border-radius:16rpx; border:3rpx solid #ffeef8; text-align:center; font-size:24rpx; background:#fff; box-shadow: 0 4rpx 12rpx rgba(255,126,179,0.08); transition: all 200ms ease; }
.q-input:focus { border-color: #ff7eb3; box-shadow: 0 0 0 6rpx rgba(255,126,179,0.15); }
.q-btn { background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%); color:#fff; padding:24rpx 48rpx; height:52rpx; border-radius:24rpx; font-weight:700; font-size:22rpx; margin-top:8rpx; box-shadow: 0 6rpx 20rpx rgba(255,154,86,0.25); border: none; transition: transform 150ms ease, box-shadow 150ms ease; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.q-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.5s ease; }
.q-btn:active::before { left: 100%; }
.q-btn.disabled { opacity:0.5; background: linear-gradient(135deg, #ffd93d 0%, #6bcf7f 100%); box-shadow: 0 6rpx 18rpx rgba(255,217,61,0.25); }
.q-hint { margin-top:12rpx; color:#ff7eb3; font-size:18rpx; line-height:1.5; text-align:center; font-weight:600; }
.q-input { transition: all 200ms ease; }

/* Responsive adjustments */
@media (max-width: 420px) {
  .q-input { width: 75% !important; }
  .center-area.card { padding: 24rpx !important; border-radius: 24rpx !important; }
  .page.quiz-page { padding: 24rpx 20rpx; }
  .q-question { font-size:28rpx !important; }
  .quiz { padding: 24rpx !important; }
  .title { font-size:32rpx !important; }
  .subtitle { font-size:18rpx !important; }
}
@media (max-width: 320px) {
  .q-input { width: 90% !important; }
  .q-btn { padding: 20rpx 40rpx !important; }
}
.attempts-row { width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:16rpx; padding:0 8rpx; }
.attempts { font-size:18rpx; color:#ff7eb3; font-weight:700; }
.next-refill { font-size:16rpx; color:#ff9a56; font-weight:600; }

/* Animations & interactions */
.motion-fade-up { transform: translateY(12rpx); opacity: 0; animation: fadeUp 420ms forwards; }
@keyframes fadeUp { to { transform: translateY(0); opacity: 1; } }

/* Button press feedback */
.btn-primary { transition: transform 120ms ease, box-shadow 120ms ease; will-change: transform; }
.btn-primary:active { transform: scale(0.98); box-shadow: 0 6rpx 18rpx rgba(255,126,179,0.2); }

/* Hover effects for interactive elements */
.q-input:focus { border-color: #ff7eb3; box-shadow: 0 0 0 6rpx rgba(255,126,179,0.15); }

/* Additional spacing for better visual hierarchy */
.quiz > view:not(:last-child) { margin-bottom: 8rpx; }
.quiz > view:nth-child(odd) { margin-bottom: 16rpx; }

/* Hand Guide Animation */
.hand-guide-animated {
  animation: hand-bounce 2s ease-in-out infinite;
}

@keyframes hand-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-8rpx) scale(1.05); }
  50% { transform: translateY(-12rpx) scale(1.08); }
  75% { transform: translateY(-8rpx) scale(1.05); }
}

/* Enhanced Button Interactions */
.q-btn {
  position: relative;
  overflow: hidden;
}

.q-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.3s, height 0.3s;
  transform: translate(-50%, -50%);
}

.q-btn:active::after {
  width: 300rpx;
  height: 300rpx;
}

/* Input Field Enhancements */
.q-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.q-input:focus {
  animation: input-glow 1s ease-in-out infinite alternate;
}

@keyframes input-glow {
  from { box-shadow: 0 0 0 6rpx rgba(255,126,179,0.15); }
  to { box-shadow: 0 0 0 12rpx rgba(255,126,179,0.08); }
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
    text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.15); 
  }
  50% { 
    text-shadow: 2rpx 2rpx 8rpx rgba(255,126,179,0.3), 0 0 20rpx rgba(255,126,179,0.2); 
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