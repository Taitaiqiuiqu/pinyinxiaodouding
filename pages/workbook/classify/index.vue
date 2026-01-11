<template>
  <view class="classify-page">
    <view class="floating-stars"></view>

    <view class="center-area card container">
      <text class="title">拼音分类</text>
      <text class="subtitle">将拼音分类到正确的类别</text>

      <view class="game-area">
        <view class="score-row">
          <text class="score">得分：{{ score }}</text>
          <text class="question-num">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
        </view>

        <view class="classify-container">
          <text class="instruction">点击拼音，然后选择对应的类别</text>
          
          <view class="categories-area">
            <view
              v-for="(category, index) in categories"
              :key="index"
              class="category-box"
              :class="category.colorClass"
            >
              <text class="category-title">{{ category.name }}</text>
              <view class="category-items">
                <view
                  v-for="(item, itemIndex) in category.items"
                  :key="itemIndex"
                  class="category-item"
                >
                  <text class="item-text">{{ item }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="source-area">
            <text class="area-label">待分类拼音</text>
            <view class="source-items">
              <view
                v-for="(item, index) in sourceItems"
                :key="index"
                class="source-item"
                :class="{ selected: selectedItem === index }"
                @tap="selectItem(index)"
              >
                <text class="item-text">{{ item }}</text>
                <view class="audio-button" @tap.stop="playAudio(item)" :class="{ playing: playingItem === item }">
                  <text class="audio-icon">{{ playingItem === item ? '🔊' : '🔇' }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="category-buttons" v-if="selectedItem !== null">
            <text class="select-label">选择类别：</text>
            <view
              v-for="(category, index) in categories"
              :key="index"
              class="category-btn"
              :class="category.colorClass"
              @tap="addToCategory(index)"
            >
              <text class="btn-text">{{ category.name }}</text>
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

interface Category {
  name: string
  colorClass: string
  items: string[]
}

const score = ref(0)
const currentQuestion = ref(0)
const totalQuestions = ref(10)
const categories = ref<Category[]>([])
const sourceItems = ref<string[]>([])
const selectedItem = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const feedbackText = ref('')
const showResultModal = ref(false)
const isPlaying = ref(false)
const playingItem = ref<string | null>(null)

const questions: Category[][] = [
  [
    { name: '声母', colorClass: 'category-primary', items: [] },
    { name: '韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '单韵母', colorClass: 'category-primary', items: [] },
    { name: '复韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '平舌音', colorClass: 'category-primary', items: [] },
    { name: '翘舌音', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '声母', colorClass: 'category-primary', items: [] },
    { name: '韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '单韵母', colorClass: 'category-primary', items: [] },
    { name: '复韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '平舌音', colorClass: 'category-primary', items: [] },
    { name: '翘舌音', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '声母', colorClass: 'category-primary', items: [] },
    { name: '韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '单韵母', colorClass: 'category-primary', items: [] },
    { name: '复韵母', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '平舌音', colorClass: 'category-primary', items: [] },
    { name: '翘舌音', colorClass: 'category-secondary', items: [] }
  ],
  [
    { name: '声母', colorClass: 'category-primary', items: [] },
    { name: '韵母', colorClass: 'category-secondary', items: [] }
  ]
]

const itemSets: string[][] = [
  ['b', 'a', 'm', 'o', 'f', 'e', 'd', 'i'],
  ['a', 'o', 'e', 'ai', 'ei', 'ui', 'ao', 'ou'],
  ['z', 'c', 's', 'zh', 'ch', 'sh', 'r', 'z'],
  ['p', 'u', 't', 'e', 'n', 'i', 'l', 'u'],
  ['i', 'u', 'ü', 'ie', 'üe', 'er', 'ia', 'iu'],
  ['c', 's', 'zh', 'ch', 'sh', 'r', 'z', 'c'],
  ['g', 'a', 'k', 'e', 'h', 'i', 'j', 'u'],
  ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui'],
  ['z', 'c', 's', 'zh', 'ch', 'sh', 'r', 's'],
  ['q', 'a', 'x', 'e', 'y', 'i', 'w', 'u']
]

const correctAnswers: string[][][] = [
  [['b', 'm', 'f', 'd'], ['a', 'o', 'e', 'i']],
  [['a', 'o', 'e'], ['ai', 'ei', 'ui', 'ao', 'ou']],
  [['z', 'c', 's'], ['zh', 'ch', 'sh', 'r']],
  [['p', 't', 'n', 'l'], ['u', 'e', 'i', 'u']],
  [['i', 'u', 'ü'], ['ie', 'üe', 'er', 'ia', 'iu']],
  [['c', 's'], ['zh', 'ch', 'sh', 'r']],
  [['g', 'k', 'h', 'j', 'q', 'x', 'y', 'w'], ['a', 'e', 'i', 'u']],
  [['a', 'e', 'i', 'u', 'ü'], ['ai', 'ei', 'ui']],
  [['z', 'c', 's'], ['zh', 'ch', 'sh', 'r']],
  [['q', 'x', 'y', 'w'], ['a', 'e', 'i', 'u']]
]

const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

onMounted(() => {
  generateQuestion()
})

function shuffleArray(array: string[]): string[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length)
  
  categories.value = questions[randomIndex].map(cat => ({ ...cat, items: [] }))
  sourceItems.value = shuffleArray(itemSets[randomIndex])
  selectedItem.value = null
  showResult.value = false
}

function selectItem(index: number) {
  if (showResult.value) return
  
  if (selectedItem.value === index) {
    selectedItem.value = null
  } else {
    selectedItem.value = index
  }
}

function addToCategory(categoryIndex: number) {
  if (selectedItem.value === null) return
  
  const item = sourceItems.value[selectedItem.value]
  categories.value[categoryIndex].items.push(item)
  sourceItems.value.splice(selectedItem.value, 1)
  selectedItem.value = null
  
  if (sourceItems.value.length === 0) {
    checkClassification()
  }
}

function checkClassification() {
  const currentAnswers = categories.value.map(cat => [...cat.items].sort())
  const correct = correctAnswers[currentQuestion.value].map(cat => [...cat].sort())
  
  isCorrect.value = currentAnswers.every((answer, index) => 
    answer.join('') === correct[index].join('')
  )
  
  if (isCorrect.value) {
    score.value += 10
    feedbackText.value = '分类正确！'
  } else {
    feedbackText.value = '分类错误，请再试一次'
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

async function playAudio(item: string) {
  if (isPlaying.value) return
  
  const fileID = getPinyinAudioFileID({ pinyin: item, tone: 0 })
  if (!fileID) {
    console.warn(`音频文件不存在: ${item}.mp3`)
    return
  }
  
  playingItem.value = item
  isPlaying.value = true
  try {
    await playPinyinAudio({
      pinyin: item,
      tone: 0
    })
  } catch (error) {
    console.error('播放音频失败:', error)
  } finally {
    isPlaying.value = false
    playingItem.value = null
  }
}
</script>

<style scoped>
.classify-page {
  padding: 28rpx;
  background: #8B5CF6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.classify-page::before {
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

.classify-page::after {
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
  color: #8B5CF6;
  font-weight: 700;
}

.classify-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.instruction {
  font-size: 28rpx;
  color: #2d3436;
  font-weight: 600;
  text-align: center;
}

.categories-area {
  width: 100%;
  display: flex;
  gap: 20rpx;
}

.category-box {
  flex: 1;
  background: #F3F4F6;
  border: 6rpx solid #E5E7EB;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  min-height: 200rpx;
}

.category-box.category-primary {
  background: #DBEAFE;
  border-color: #3B82F6;
}

.category-box.category-secondary {
  background: #DCFCE7;
  border-color: #10B981;
}

.category-title {
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
  color: #2d3436;
}

.category-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
}

.category-item {
  background: #FFFFFF;
  border: 4rpx solid #E5E7EB;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-item .item-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3436;
}

.source-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.area-label {
  font-size: 24rpx;
  color: #6B7280;
  font-weight: 600;
  text-align: center;
}

.source-items {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.source-item {
  background: #F3F4F6;
  border: 6rpx solid #E5E7EB;
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.source-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #E5E7EB;
}

.source-item.selected {
  background: #FFB84D;
  border-color: #FFB84D;
  box-shadow: 0 8rpx 0 #F59E0B;
}

.source-item.selected .item-text {
  color: #FFFFFF;
}

.source-item .item-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #2d3436;
}

.category-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 24rpx;
}

.select-label {
  font-size: 24rpx;
  color: #6B7280;
  font-weight: 600;
  text-align: center;
}

.category-btn {
  padding: 20rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8rpx 0 rgba(0, 0, 0, 0.1);
}

.category-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 rgba(0, 0, 0, 0.1);
}

.category-btn.category-primary {
  background: #3B82F6;
  box-shadow: 0 8rpx 0 #1D4ED8;
}

.category-btn.category-secondary {
  background: #10B981;
  box-shadow: 0 8rpx 0 #059669;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 700;
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
  color: #8B5CF6;
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
  background: #8B5CF6;
  box-shadow: 0 12rpx 0 #7C3AED;
}

.home-btn {
  background: #FF476F;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.restart-btn:active, .home-btn:active {
  transform: translateY(4rpx);
}

.restart-btn:active {
  box-shadow: 0 8rpx 0 #7C3AED;
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
</style>
