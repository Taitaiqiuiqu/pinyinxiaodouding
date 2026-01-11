<template>
  <view class="page spell-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />

    <view class="center-area card container">
      <text class="title">拼音拼写</text>
      <text class="subtitle">听一听，写出正确的拼音</text>

      <view class="game-area">
        <view class="score-row">
          <text class="score">得分：{{ score }}</text>
          <text class="question-num">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
        </view>

        <view class="character-display">
          <text class="character-text">{{ currentCharacter }}</text>
        </view>

        <view class="audio-section">
          <view class="audio-button" @tap="playAudio" :class="{ playing: isPlaying }">
            <text class="audio-icon">{{ isPlaying ? '🔊' : '🔇' }}</text>
            <text class="audio-text">点击播放</text>
          </view>
        </view>

        <view class="input-section">
          <view class="input-row">
            <input
              v-model="userInput"
              class="pinyin-input"
              placeholder="输入拼音"
              @input="onInput"
              :disabled="showResult"
            />
            <button class="submit-btn" @tap="submitAnswer" :disabled="showResult || !userInput.trim()">
              提交
            </button>
          </view>
          <view class="hint-text" v-if="showResult">
            <text>正确答案：</text>
            <text class="correct-answer">{{ correctPinyin }}</text>
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
        <text class="result-title">游戏结束！</text>
        <text class="result-score">得分：{{ score }} / {{ totalQuestions * 10 }}</text>
        <text class="result-message">{{ getResultMessage() }}</text>
        <button class="restart-btn" @tap="restartGame">再玩一次</button>
        <button class="home-btn" @tap="goHome">返回主页</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { playPinyinAudio } from '@/src/services/PinyinAudioPlayer'
import { getPinyinAllTonesFileIDs } from '@/src/services/pinyinAudio'
import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer.vue'
import { useGlobalStore } from '@/src/store/global'
import TimeTracker from '@/src/services/TimeTracker'

interface WordData {
  character: string
  pinyin: string
  tone: 0 | 1 | 2 | 3 | 4
}

const globalStore = useGlobalStore()
const timeTracker = TimeTracker.getInstance()
const audio = ref<any>(null)
const score = ref(0)
const currentQuestion = ref(0)
const totalQuestions = ref(10)
const currentCharacter = ref('')
const correctPinyin = ref('')
const correctTone = ref<0 | 1 | 2 | 3 | 4>(0)
const userInput = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const feedbackText = ref('')
const isPlaying = ref(false)
const showResultModal = ref(false)
const gameStartTime = ref(0)
const correctAnswers = ref(0)

const wordList: WordData[] = [
  { character: '爸', pinyin: 'ba', tone: 4 },
  { character: '妈', pinyin: 'ma', tone: 1 },
  { character: '我', pinyin: 'wo', tone: 3 },
  { character: '你', pinyin: 'ni', tone: 3 },
  { character: '他', pinyin: 'ta', tone: 1 },
  { character: '好', pinyin: 'hao', tone: 3 },
  { character: '大', pinyin: 'da', tone: 4 },
  { character: '小', pinyin: 'xiao', tone: 3 },
  { character: '人', pinyin: 'ren', tone: 2 },
  { character: '口', pinyin: 'kou', tone: 3 },
  { character: '手', pinyin: 'shou', tone: 3 },
  { character: '目', pinyin: 'mu', tone: 4 },
  { character: '耳', pinyin: 'er', tone: 3 },
  { character: '日', pinyin: 'ri', tone: 4 },
  { character: '月', pinyin: 'yue', tone: 4 },
  { character: '水', pinyin: 'shui', tone: 3 },
  { character: '火', pinyin: 'huo', tone: 3 },
  { character: '山', pinyin: 'shan', tone: 1 },
  { character: '石', pinyin: 'shi', tone: 2 },
  { character: '田', pinyin: 'tian', tone: 2 },
  { character: '土', pinyin: 'tu', tone: 3 },
  { character: '木', pinyin: 'mu', tone: 4 },
  { character: '天', pinyin: 'tian', tone: 1 },
  { character: '地', pinyin: 'di', tone: 4 },
  { character: '风', pinyin: 'feng', tone: 1 },
  { character: '雨', pinyin: 'yu', tone: 3 },
  { character: '云', pinyin: 'yun', tone: 2 },
  { character: '花', pinyin: 'hua', tone: 1 },
  { character: '草', pinyin: 'cao', tone: 3 },
  { character: '树', pinyin: 'shu', tone: 4 },
  { character: '鸟', pinyin: 'niao', tone: 3 },
  { character: '鱼', pinyin: 'yu', tone: 2 },
  { character: '马', pinyin: 'ma', tone: 3 },
  { character: '牛', pinyin: 'niu', tone: 2 },
  { character: '羊', pinyin: 'yang', tone: 2 },
  { character: '狗', pinyin: 'gou', tone: 3 },
  { character: '猫', pinyin: 'mao', tone: 1 },
  { character: '书', pinyin: 'shu', tone: 1 },
  { character: '笔', pinyin: 'bi', tone: 3 },
  { character: '纸', pinyin: 'zhi', tone: 3 },
  { character: '门', pinyin: 'men', tone: 2 },
  { character: '窗', pinyin: 'chuang', tone: 1 },
  { character: '桌', pinyin: 'zhuo', tone: 1 },
  { character: '椅', pinyin: 'yi', tone: 3 },
  { character: '床', pinyin: 'chuang', tone: 2 },
  { character: '灯', pinyin: 'deng', tone: 1 }
]

const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

onMounted(() => {
  gameStartTime.value = Date.now()
  generateQuestion()
})

onUnmounted(() => {
  stopAudio()
})

function generateQuestion() {
  const randomIndex = Math.floor(Math.random() * wordList.length)
  const word = wordList[randomIndex]
  
  currentCharacter.value = word.character
  correctPinyin.value = word.pinyin
  correctTone.value = word.tone
  
  userInput.value = ''
  showResult.value = false
}

async function playAudio() {
  isPlaying.value = true
  try {
    await playPinyinAudio({
      pinyin: correctPinyin.value,
      tone: correctTone.value
    })
  } catch (error) {
    console.error('播放音频失败:', error)
  } finally {
    isPlaying.value = false
  }
}

function onInput(e: any) {
  userInput.value = e.detail.value.toLowerCase()
}

function submitAnswer() {
  if (showResult.value) return

  const input = userInput.value.trim().toLowerCase()
  if (!input) return

  isCorrect.value = input === correctPinyin.value.toLowerCase()

  if (isCorrect.value) {
    score.value += 10
    correctAnswers.value++
    feedbackText.value = '回答正确！'
  } else {
    feedbackText.value = '回答错误，请查看正确答案'
  }

  showResult.value = true
}

function nextQuestion() {
  if (isLastQuestion.value) {
    showResultModal.value = true
    saveLearningRecord()
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

function saveLearningRecord() {
  const now = Date.now()
  const duration = Math.floor((now - gameStartTime.value) / 1000)
  const accuracy = Math.round((correctAnswers.value / totalQuestions.value) * 100)

  const record = {
    id: `record_${now}`,
    date: new Date(now).toISOString().split('T')[0],
    type: 'games' as const,
    content: '拼音拼写游戏',
    duration: duration,
    accuracy: accuracy,
    score: score.value,
    timestamp: now
  }

  globalStore.addLearningRecord(record)
  console.log('[拼音拼写] 学习记录已保存:', record)
}

function restartGame() {
  score.value = 0
  currentQuestion.value = 0
  correctAnswers.value = 0
  gameStartTime.value = Date.now()
  showResultModal.value = false
  generateQuestion()
}

function goHome() {
  uni.navigateBack()
}

function closeResultModal() {
  showResultModal.value = false
}

function stopAudio() {
  if (audio.value) {
    audio.value.stop()
  }
}
</script>

<style scoped>
.page.spell-page {
  padding: 28rpx;
  background: #10B981;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.page.spell-page::before {
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

.page.spell-page::after {
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
  color: #10B981;
  font-weight: 700;
}

.character-display {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 48rpx 0;
  background: #F3F4F6;
  border-radius: 24rpx;
}

.character-text {
  font-size: 120rpx;
  font-weight: 700;
  color: #10B981;
}

.audio-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 32rpx 0;
}

.audio-button {
  width: 200rpx;
  height: 200rpx;
  border-radius: 32rpx;
  background: #10B981;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.audio-button:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #059669;
}

.audio-button.playing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.audio-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
}

.audio-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.input-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.input-row {
  width: 100%;
  display: flex;
  gap: 16rpx;
}

.pinyin-input {
  flex: 1;
  height: 88rpx;
  background: #F3F4F6;
  border: 4rpx solid #E5E7EB;
  border-radius: 24rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #2d3436;
  font-weight: 600;
}

.pinyin-input:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
}

.submit-btn {
  height: 88rpx;
  padding: 0 32rpx;
  background: #10B981;
  color: #FFFFFF;
  border-radius: 24rpx;
  font-weight: 700;
  font-size: 28rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
  transition: all 0.3s ease;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #059669;
}

.submit-btn:disabled {
  background: #9CA3AF;
  box-shadow: none;
}

.hint-text {
  width: 100%;
  text-align: center;
  font-size: 28rpx;
  color: #6B7280;
  padding: 16rpx;
  background: #F3F4F6;
  border-radius: 16rpx;
}

.correct-answer {
  color: #10B981;
  font-weight: 700;
  font-size: 32rpx;
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
  color: #10B981;
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
  background: #10B981;
  box-shadow: 0 12rpx 0 #059669;
}

.home-btn {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.restart-btn:active, .home-btn:active {
  transform: translateY(4rpx);
}

.restart-btn:active {
  box-shadow: 0 8rpx 0 #059669;
}

.home-btn:active {
  box-shadow: 0 8rpx 0 #E53E5F;
}
</style>
