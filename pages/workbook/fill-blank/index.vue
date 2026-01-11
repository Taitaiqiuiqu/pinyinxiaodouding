<template>
  <view class="fill-blank-page">
    <view class="floating-stars"></view>

    <view class="center-area card container">
      <text class="title">拼音填空</text>
      <text class="subtitle">补充完整的拼音</text>

      <view class="game-area">
        <view class="score-row">
          <text class="score">得分：{{ score }}</text>
          <text class="question-num">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
        </view>

        <view class="question-display">
          <text class="question-text">{{ currentQuestionData.question }}</text>
          <view class="audio-button" @tap="playAudio" :class="{ playing: isPlaying }">
            <text class="audio-icon">{{ isPlaying ? '🔊' : '🔇' }}</text>
          </view>
        </view>

        <view class="options-grid">
          <view
            v-for="(option, index) in currentQuestionData.options"
            :key="index"
            class="option-card"
            :class="{
              correct: showResult && option.isCorrect,
              wrong: showResult && selectedOption === index && !option.isCorrect,
              selected: selectedOption === index && !showResult
            }"
            @tap="selectOption(index)"
          >
            <text class="option-text">{{ option.text }}</text>
          </view>
        </view>

        <view class="feedback-section" v-if="showResult">
          <text class="feedback-text" :class="{ correct: isCorrect, wrong: !isCorrect }">
            {{ feedbackText }}
          </text>
          <button class="next-btn" @tap="nextQuestion">
            {{ isLastQuestion ? '查看结果' : '下一题' }}
          </button>
        </view>
      </view>
    </view>

    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>

    <view class="result-modal" v-if="showResultModal" @tap="closeResultModal">
      <view class="result-content" @tap.stop>
        <text class="result-title">练习完成！</text>
        <text class="result-score">得分：{{ score }} / {{ totalQuestions * 10 }}</text>
        <text class="result-message">{{ getResultMessage() }}</text>
        <button class="restart-btn" @tap="restartPractice">再练一次</button>
        <button class="home-btn" @tap="goHome">返回</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { playPinyinAudio } from '@/src/services/PinyinAudioPlayer'
import { getPinyinAudioFileID } from '@/src/services/pinyinAudio'

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  question: string
  options: Option[]
  pinyin: string
  tone: 0 | 1 | 2 | 3 | 4
}

const score = ref(0)
const currentQuestion = ref(0)
const totalQuestions = ref(10)
const currentQuestionData = ref<Question>({ question: '', options: [], pinyin: '', tone: 0 })
const selectedOption = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const feedbackText = ref('')
const showResultModal = ref(false)
const isPlaying = ref(false)

const questions: Question[] = [
  { question: 'b__', options: [{ text: 'a', isCorrect: true }, { text: 'o', isCorrect: false }, { text: 'e', isCorrect: false }, { text: 'i', isCorrect: false }], pinyin: 'ba', tone: 0 },
  { question: '__o', options: [{ text: 'b', isCorrect: true }, { text: 'p', isCorrect: false }, { text: 'm', isCorrect: false }, { text: 'f', isCorrect: false }], pinyin: 'bo', tone: 0 },
  { question: 'm__', options: [{ text: 'a', isCorrect: true }, { text: 'e', isCorrect: false }, { text: 'i', isCorrect: false }, { text: 'u', isCorrect: false }], pinyin: 'ma', tone: 0 },
  { question: '__a', options: [{ text: 'd', isCorrect: true }, { text: 't', isCorrect: false }, { text: 'n', isCorrect: false }, { text: 'l', isCorrect: false }], pinyin: 'da', tone: 0 },
  { question: 'g__', options: [{ text: 'e', isCorrect: true }, { text: 'a', isCorrect: false }, { text: 'i', isCorrect: false }, { text: 'u', isCorrect: false }], pinyin: 'ge', tone: 0 },
  { question: '__i', options: [{ text: 'j', isCorrect: true }, { text: 'q', isCorrect: false }, { text: 'x', isCorrect: false }, { text: 'y', isCorrect: false }], pinyin: 'ji', tone: 0 },
  { question: 'h__', options: [{ text: 'a', isCorrect: true }, { text: 'e', isCorrect: false }, { text: 'i', isCorrect: false }, { text: 'u', isCorrect: false }], pinyin: 'ha', tone: 0 },
  { question: '__u', options: [{ text: 'k', isCorrect: true }, { text: 'g', isCorrect: false }, { text: 'h', isCorrect: false }, { text: 'l', isCorrect: false }], pinyin: 'ku', tone: 0 },
  { question: 'z__', options: [{ text: 'h', isCorrect: true }, { text: 'a', isCorrect: false }, { text: 'e', isCorrect: false }, { text: 'i', isCorrect: false }], pinyin: 'zhi', tone: 0 },
  { question: '__h', options: [{ text: 'c', isCorrect: true }, { text: 'z', isCorrect: false }, { text: 's', isCorrect: false }, { text: 'r', isCorrect: false }], pinyin: 'ch', tone: 0 },
  { question: 'sh__', options: [{ text: 'i', isCorrect: true }, { text: 'a', isCorrect: false }, { text: 'e', isCorrect: false }, { text: 'u', isCorrect: false }], pinyin: 'shi', tone: 0 },
  { question: '__i', options: [{ text: 'ch', isCorrect: true }, { text: 'zh', isCorrect: false }, { text: 'sh', isCorrect: false }, { text: 'r', isCorrect: false }], pinyin: 'chi', tone: 0 },
  { question: 'r__', options: [{ text: 'i', isCorrect: true }, { text: 'a', isCorrect: false }, { text: 'e', isCorrect: false }, { text: 'u', isCorrect: false }], pinyin: 'ri', tone: 0 },
  { question: '__i', options: [{ text: 'zh', isCorrect: true }, { text: 'ch', isCorrect: false }, { text: 'sh', isCorrect: false }, { text: 'r', isCorrect: false }], pinyin: 'zhi', tone: 0 },
  { question: '__ai', options: [{ text: 'b', isCorrect: true }, { text: 'p', isCorrect: false }, { text: 'm', isCorrect: false }, { text: 'f', isCorrect: false }], pinyin: 'bai', tone: 0 },
  { question: 'b__', options: [{ text: 'ai', isCorrect: true }, { text: 'ei', isCorrect: false }, { text: 'ao', isCorrect: false }, { text: 'ou', isCorrect: false }], pinyin: 'bai', tone: 0 },
  { question: '__ei', options: [{ text: 'm', isCorrect: true }, { text: 'b', isCorrect: false }, { text: 'p', isCorrect: false }, { text: 'f', isCorrect: false }], pinyin: 'mei', tone: 0 },
  { question: 'm__', options: [{ text: 'ei', isCorrect: true }, { text: 'ai', isCorrect: false }, { text: 'ao', isCorrect: false }, { text: 'ou', isCorrect: false }], pinyin: 'mei', tone: 0 },
  { question: '__ao', options: [{ text: 'd', isCorrect: true }, { text: 't', isCorrect: false }, { text: 'n', isCorrect: false }, { text: 'l', isCorrect: false }], pinyin: 'dao', tone: 0 },
  { question: 'd__', options: [{ text: 'ao', isCorrect: true }, { text: 'ai', isCorrect: false }, { text: 'ei', isCorrect: false }, { text: 'ou', isCorrect: false }], pinyin: 'dao', tone: 0 }
]

const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

onMounted(() => {
  generateQuestion()
})

function generateQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length)
  currentQuestionData.value = questions[randomIndex]
  selectedOption.value = null
  showResult.value = false
}

async function playAudio() {
  if (isPlaying.value) return

  const fileID = getPinyinAudioFileID({ pinyin: currentQuestionData.value.pinyin, tone: currentQuestionData.value.tone })
  if (!fileID) {
    console.warn(`音频文件不存在: ${currentQuestionData.value.pinyin}${currentQuestionData.value.tone === 0 ? '' : currentQuestionData.value.tone}.mp3`)
    return
  }

  isPlaying.value = true
  try {
    await playPinyinAudio({
      pinyin: currentQuestionData.value.pinyin,
      tone: currentQuestionData.value.tone
    })
  } catch (error) {
    console.error('播放音频失败:', error)
  } finally {
    isPlaying.value = false
  }
}

function selectOption(index: number) {
  if (showResult.value) return

  selectedOption.value = index
  const option = currentQuestionData.value.options[index]
  isCorrect.value = option.isCorrect

  if (isCorrect.value) {
    score.value += 10
    feedbackText.value = '回答正确！'
  } else {
    const correctOption = currentQuestionData.value.options.find(o => o.isCorrect)
    feedbackText.value = `回答错误，正确答案是 ${correctOption?.text}`
  }

  showResult.value = true
}

function nextQuestion() {
  if (isLastQuestion.value) {
    showResultModal.value = true
  } else {
    currentQuestion.value++
    generateQuestion()
  }
}

function getResultMessage() {
  const percentage = (score.value / (totalQuestions.value * 10)) * 100
  if (percentage >= 90) return '太棒了！你是拼音小天才！'
  if (percentage >= 70) return '做得很好！继续加油！'
  if (percentage >= 50) return '还不错，多练习会更好！'
  return '再接再厉，你一定可以的！'
}

function restartPractice() {
  score.value = 0
  currentQuestion.value = 0
  showResultModal.value = false
  generateQuestion()
}

function goHome() {
  uni.navigateBack()
}

function closeResultModal() {
  showResultModal.value = false
}
</script>

<style scoped>
.fill-blank-page {
  padding: 28rpx;
  background: #FF476F;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.fill-blank-page::before {
  content: '';
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
  box-shadow: 0 12rpx 0 #D97706;
}

.fill-blank-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 120rpx;
  height: 120rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #1D4ED8;
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

.center-area {
  width: 100%;
  max-width: 720rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  z-index: 1;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 12rpx 0 #E5E7EB;
  padding: 32rpx;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  position: relative;
  overflow: hidden;
}

.game-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.score-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12rpx;
}

.score, .question-num {
  font-size: 28rpx;
  color: #FF476F;
  font-weight: 700;
}

.question-display {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48rpx 0;
  background: #F3F4F6;
  border-radius: 24rpx;
  gap: 24rpx;
}

.question-text {
  font-size: 72rpx;
  font-weight: 700;
  color: #FF476F;
}

.audio-button {
  width: 80rpx;
  height: 80rpx;
  background: #FFB84D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 0 #F59E0B;
  transition: all 0.3s ease;
  cursor: pointer;
}

.audio-button:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #F59E0B;
}

.audio-button.playing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.audio-icon {
  font-size: 40rpx;
}

.options-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.option-card {
  background: #F3F4F6;
  border: 6rpx solid #E5E7EB;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.option-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #E5E7EB;
}

.option-card.selected {
  background: #FFB84D;
  border-color: #FFB84D;
  box-shadow: 0 8rpx 0 #F59E0B;
}

.option-card.correct {
  background: #10B981;
  border-color: #10B981;
  box-shadow: 0 8rpx 0 #059669;
}

.option-card.wrong {
  background: #EF4444;
  border-color: #EF4444;
  box-shadow: 0 8rpx 0 #DC2626;
}

.option-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #2d3436;
}

.option-card.selected .option-text,
.option-card.correct .option-text,
.option-card.wrong .option-text {
  color: #FFFFFF;
}

.feedback-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 0;
}

.feedback-text {
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  color: #2d3436;
}

.feedback-text.correct {
  color: #10B981;
}

.feedback-text.wrong {
  color: #EF4444;
}

.next-btn {
  background: #3B82F6;
  color: #FFFFFF;
  padding: 24rpx 64rpx;
  border-radius: 32rpx;
  font-weight: 700;
  font-size: 28rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
  transition: all 0.3s ease;
}

.next-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #1D4ED8;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-content {
  background: #FFFFFF;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
  padding: 48rpx;
  width: 80%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.result-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FF476F;
}

.result-score {
  font-size: 36rpx;
  font-weight: 600;
  color: #2d3436;
}

.result-message {
  font-size: 28rpx;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
}

.restart-btn, .home-btn {
  width: 100%;
  padding: 24rpx;
  border-radius: 32rpx;
  font-weight: 700;
  font-size: 28rpx;
  border: 8rpx solid #FFFFFF;
  transition: all 0.3s ease;
  color: #FFFFFF;
}

.restart-btn {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.home-btn {
  background: #3B82F6;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.restart-btn:active, .home-btn:active {
  transform: translateY(4rpx);
}

.restart-btn:active {
  box-shadow: 0 8rpx 0 #E53E5F;
}

.home-btn:active {
  box-shadow: 0 8rpx 0 #1D4ED8;
}

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
</style>
