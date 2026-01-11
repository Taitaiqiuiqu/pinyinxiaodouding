<template>
  <view class="match-page">
    <view class="floating-stars"></view>

    <view class="center-area card container">
      <text class="title">拼音连线</text>
      <text class="subtitle">将汉字与对应的拼音连线</text>

      <view class="game-area">
        <view class="score-row">
          <text class="score">得分：{{ score }}</text>
          <text class="question-num">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
        </view>

        <view class="match-container">
          <view class="match-column">
            <text class="column-title">汉字</text>
            <view
              v-for="(item, index) in currentQuestionData.characters"
              :key="index"
              class="match-item character-item"
              :class="{
                selected: selectedCharacter === index,
                matched: item.matched
              }"
              @tap="selectCharacter(index)"
            >
              <text class="item-text">{{ item.text }}</text>
              <view class="item-dot"></view>
            </view>
          </view>

          <view class="match-column">
            <text class="column-title">拼音</text>
            <view
              v-for="(item, index) in currentQuestionData.pinyins"
              :key="index"
              class="match-item pinyin-item"
              :class="{
                selected: selectedPinyin === index,
                matched: item.matched
              }"
              @tap="selectPinyin(index)"
            >
              <view class="item-dot"></view>
              <text class="item-text">{{ item.text }}</text>
              <view class="audio-button" @tap.stop="playAudio(index)" :class="{ playing: playingPinyinIndex === index }">
                <text class="audio-icon">{{ playingPinyinIndex === index ? '🔊' : '🔇' }}</text>
              </view>
            </view>
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

interface MatchItem {
  text: string
  matched: boolean
  id: string
}

interface Question {
  characters: MatchItem[]
  pinyins: MatchItem[]
}

const score = ref(0)
const currentQuestion = ref(0)
const totalQuestions = ref(10)
const currentQuestionData = ref<Question>({ characters: [], pinyins: [] })
const selectedCharacter = ref<number | null>(null)
const selectedPinyin = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const feedbackText = ref('')
const showResultModal = ref(false)
const isPlaying = ref(false)
const playingPinyinIndex = ref<number | null>(null)

const questions: Question[] = [
  {
    characters: [
      { text: '爸', matched: false, id: 'ba' },
      { text: '妈', matched: false, id: 'ma' },
      { text: '我', matched: false, id: 'wo' },
      { text: '你', matched: false, id: 'ni' }
    ],
    pinyins: [
      { text: 'ba', matched: false, id: 'ba' },
      { text: 'ma', matched: false, id: 'ma' },
      { text: 'wo', matched: false, id: 'wo' },
      { text: 'ni', matched: false, id: 'ni' }
    ]
  },
  {
    characters: [
      { text: '好', matched: false, id: 'hao' },
      { text: '大', matched: false, id: 'da' },
      { text: '小', matched: false, id: 'xiao' },
      { text: '人', matched: false, id: 'ren' }
    ],
    pinyins: [
      { text: 'hao', matched: false, id: 'hao' },
      { text: 'da', matched: false, id: 'da' },
      { text: 'xiao', matched: false, id: 'xiao' },
      { text: 'ren', matched: false, id: 'ren' }
    ]
  },
  {
    characters: [
      { text: '口', matched: false, id: 'kou' },
      { text: '手', matched: false, id: 'shou' },
      { text: '目', matched: false, id: 'mu' },
      { text: '耳', matched: false, id: 'er' }
    ],
    pinyins: [
      { text: 'kou', matched: false, id: 'kou' },
      { text: 'shou', matched: false, id: 'shou' },
      { text: 'mu', matched: false, id: 'mu' },
      { text: 'er', matched: false, id: 'er' }
    ]
  },
  {
    characters: [
      { text: '日', matched: false, id: 'ri' },
      { text: '月', matched: false, id: 'yue' },
      { text: '水', matched: false, id: 'shui' },
      { text: '火', matched: false, id: 'huo' }
    ],
    pinyins: [
      { text: 'ri', matched: false, id: 'ri' },
      { text: 'yue', matched: false, id: 'yue' },
      { text: 'shui', matched: false, id: 'shui' },
      { text: 'huo', matched: false, id: 'huo' }
    ]
  },
  {
    characters: [
      { text: '山', matched: false, id: 'shan' },
      { text: '石', matched: false, id: 'shi' },
      { text: '田', matched: false, id: 'tian' },
      { text: '土', matched: false, id: 'tu' }
    ],
    pinyins: [
      { text: 'shan', matched: false, id: 'shan' },
      { text: 'shi', matched: false, id: 'shi' },
      { text: 'tian', matched: false, id: 'tian' },
      { text: 'tu', matched: false, id: 'tu' }
    ]
  },
  {
    characters: [
      { text: '天', matched: false, id: 'tian' },
      { text: '地', matched: false, id: 'di' },
      { text: '风', matched: false, id: 'feng' },
      { text: '雨', matched: false, id: 'yu' }
    ],
    pinyins: [
      { text: 'tian', matched: false, id: 'tian' },
      { text: 'di', matched: false, id: 'di' },
      { text: 'feng', matched: false, id: 'feng' },
      { text: 'yu', matched: false, id: 'yu' }
    ]
  },
  {
    characters: [
      { text: '云', matched: false, id: 'yun' },
      { text: '花', matched: false, id: 'hua' },
      { text: '草', matched: false, id: 'cao' },
      { text: '树', matched: false, id: 'shu' }
    ],
    pinyins: [
      { text: 'yun', matched: false, id: 'yun' },
      { text: 'hua', matched: false, id: 'hua' },
      { text: 'cao', matched: false, id: 'cao' },
      { text: 'shu', matched: false, id: 'shu' }
    ]
  },
  {
    characters: [
      { text: '鸟', matched: false, id: 'niao' },
      { text: '鱼', matched: false, id: 'yu' },
      { text: '马', matched: false, id: 'ma' },
      { text: '牛', matched: false, id: 'niu' }
    ],
    pinyins: [
      { text: 'niao', matched: false, id: 'niao' },
      { text: 'yu', matched: false, id: 'yu' },
      { text: 'ma', matched: false, id: 'ma' },
      { text: 'niu', matched: false, id: 'niu' }
    ]
  },
  {
    characters: [
      { text: '羊', matched: false, id: 'yang' },
      { text: '狗', matched: false, id: 'gou' },
      { text: '猫', matched: false, id: 'mao' },
      { text: '书', matched: false, id: 'shu' }
    ],
    pinyins: [
      { text: 'yang', matched: false, id: 'yang' },
      { text: 'gou', matched: false, id: 'gou' },
      { text: 'mao', matched: false, id: 'mao' },
      { text: 'shu', matched: false, id: 'shu' }
    ]
  },
  {
    characters: [
      { text: '笔', matched: false, id: 'bi' },
      { text: '纸', matched: false, id: 'zhi' },
      { text: '门', matched: false, id: 'men' },
      { text: '窗', matched: false, id: 'chuang' }
    ],
    pinyins: [
      { text: 'bi', matched: false, id: 'bi' },
      { text: 'zhi', matched: false, id: 'zhi' },
      { text: 'men', matched: false, id: 'men' },
      { text: 'chuang', matched: false, id: 'chuang' }
    ]
  }
]

const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

onMounted(() => {
  generateQuestion()
})

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length)
  const question = questions[randomIndex]
  
  currentQuestionData.value = {
    characters: shuffleArray(question.characters.map(item => ({ ...item, matched: false }))),
    pinyins: shuffleArray(question.pinyins.map(item => ({ ...item, matched: false })))
  }
  
  selectedCharacter.value = null
  selectedPinyin.value = null
  showResult.value = false
}

function selectCharacter(index: number) {
  if (showResult.value) return
  if (currentQuestionData.value.characters[index].matched) return
  
  selectedCharacter.value = index
  
  if (selectedPinyin.value !== null) {
    checkMatch()
  }
}

function selectPinyin(index: number) {
  if (showResult.value) return
  if (currentQuestionData.value.pinyins[index].matched) return
  
  selectedPinyin.value = index
  
  if (selectedCharacter.value !== null) {
    checkMatch()
  }
}

function checkMatch() {
  if (selectedCharacter.value === null || selectedPinyin.value === null) return
  
  const character = currentQuestionData.value.characters[selectedCharacter.value]
  const pinyin = currentQuestionData.value.pinyins[selectedPinyin.value]
  
  isCorrect.value = character.id === pinyin.id
  
  if (isCorrect.value) {
    character.matched = true
    pinyin.matched = true
    score.value += 10
    feedbackText.value = '匹配正确！'
    
    if (currentQuestionData.value.characters.every(item => item.matched)) {
      showResult.value = true
    }
  } else {
    feedbackText.value = '匹配错误，请重新选择'
    setTimeout(() => {
      selectedCharacter.value = null
      selectedPinyin.value = null
    }, 1000)
  }
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

async function playAudio(index: number) {
  if (isPlaying.value) return
  if (currentQuestionData.value.pinyins[index].matched) return

  const pinyin = currentQuestionData.value.pinyins[index].text
  const fileID = getPinyinAudioFileID({ pinyin, tone: 0 })
  if (!fileID) {
    console.warn(`音频文件不存在: ${pinyin}.mp3`)
    return
  }

  playingPinyinIndex.value = index
  isPlaying.value = true
  try {
    await playPinyinAudio({
      pinyin,
      tone: 0
    })
  } catch (error) {
    console.error('播放音频失败:', error)
  } finally {
    isPlaying.value = false
    playingPinyinIndex.value = null
  }
}
</script>

<style scoped>
.match-page {
  padding: 28rpx;
  background: #3B82F6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.match-page::before {
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

.match-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 120rpx;
  height: 120rpx;
  background: #FF476F;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 12rpx 0 #E53E5F;
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
  color: #3B82F6;
  font-weight: 700;
}

.match-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}

.match-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.column-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #3B82F6;
  text-align: center;
  padding: 12rpx;
  background: #F3F4F6;
  border-radius: 16rpx;
}

.match-item {
  background: #F3F4F6;
  border: 6rpx solid #E5E7EB;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.match-item:active:not(.matched) {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #E5E7EB;
}

.match-item.selected {
  background: #FFB84D;
  border-color: #FFB84D;
  box-shadow: 0 8rpx 0 #F59E0B;
}

.match-item.matched {
  background: #10B981;
  border-color: #10B981;
  box-shadow: 0 8rpx 0 #059669;
  opacity: 0.7;
}

.character-item {
  justify-content: flex-end;
}

.pinyin-item {
  justify-content: flex-start;
}

.item-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #2d3436;
}

.match-item.selected .item-text,
.match-item.matched .item-text {
  color: #FFFFFF;
}

.item-dot {
  width: 24rpx;
  height: 24rpx;
  background: #3B82F6;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  box-shadow: 0 4rpx 0 #1D4ED8;
}

.match-item.selected .item-dot {
  background: #FFFFFF;
  border-color: #FFB84D;
}

.match-item.matched .item-dot {
  background: #FFFFFF;
  border-color: #10B981;
}

.audio-button {
  width: 48rpx;
  height: 48rpx;
  background: #FFB84D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 0 #F59E0B;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.audio-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 0 #F59E0B;
}

.audio-button.playing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.audio-icon {
  font-size: 24rpx;
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
  background: #FF476F;
  color: #FFFFFF;
  padding: 24rpx 64rpx;
  border-radius: 32rpx;
  font-weight: 700;
  font-size: 28rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
  transition: all 0.3s ease;
}

.next-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #E53E5F;
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
  color: #3B82F6;
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
  background: #3B82F6;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.home-btn {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.restart-btn:active, .home-btn:active {
  transform: translateY(4rpx);
}

.restart-btn:active {
  box-shadow: 0 8rpx 0 #1D4ED8;
}

.home-btn:active {
  box-shadow: 0 8rpx 0 #E53E5F;
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
