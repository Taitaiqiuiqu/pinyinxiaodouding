<template>
  <view class="page match-game-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />

    <view class="center-area card container">
      <text class="title">拼音消消乐</text>
      <text class="subtitle">找出相同的拼音，快速消除！</text>

      <view class="game-area">
        <view class="info-row">
          <text class="score">得分：{{ score }}</text>
          <text class="time">时间：{{ timeLeft }}秒</text>
        </view>

        <view class="game-grid" v-if="!gameOver">
          <view
            v-for="(card, index) in cards"
            :key="index"
            class="card-item"
            :class="{
              flipped: card.flipped || card.matched,
              matched: card.matched,
              selected: selectedCards.includes(index) && !card.matched
            }"
            @tap="selectCard(index)"
          >
            <view class="card-inner">
              <view class="card-front">
                <text class="card-icon">❓</text>
              </view>
              <view class="card-back">
                <text class="card-pinyin">{{ card.pinyin }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="game-over-section" v-if="gameOver">
          <text class="game-over-title">{{ allMatched ? '恭喜通关！' : '时间到！' }}</text>
          <text class="final-score">最终得分：{{ score }}</text>
          <button class="restart-btn" @tap="restartGame">再玩一次</button>
          <button class="home-btn" @tap="goHome">返回主页</button>
        </view>
      </view>
    </view>

    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { playPinyinAudio } from '@/src/services/PinyinAudioPlayer'
import { getPinyinAllTonesFileIDs } from '@/src/services/pinyinAudio'
import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer.vue'
import { useGlobalStore } from '@/src/store/global'

interface Card {
  pinyin: string
  tone: 0 | 1 | 2 | 3 | 4
  flipped: boolean
  matched: boolean
}

const globalStore = useGlobalStore()
const audio = ref<any>(null)
const score = ref(0)
const timeLeft = ref(60)
const cards = ref<Card[]>([])
const selectedCards = ref<number[]>([])
const gameOver = ref(false)
const allMatched = ref(false)
const timer = ref<number | null>(null)
const isProcessing = ref(false)
const gameStartTime = ref(0)
const correctMatches = ref(0)

const pinyinList = [
  'a', 'o', 'e', 'i', 'u', 'ü',
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'
]

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function initGame() {
  score.value = 0
  timeLeft.value = 60
  gameOver.value = false
  allMatched.value = false
  selectedCards.value = []
  isProcessing.value = false
  gameStartTime.value = Date.now()
  correctMatches.value = 0

  const pairCount = 8
  
  const availablePinyins = pinyinList.filter(pinyin => {
    const allToneFileIDs = getPinyinAllTonesFileIDs(pinyin)
    return allToneFileIDs.some(fileID => fileID !== null)
  })
  
  if (availablePinyins.length < pairCount) {
    console.warn('可用的拼音数量不足，无法开始游戏')
    return
  }
  
  const selectedPinyins = shuffleArray(availablePinyins).slice(0, pairCount)
  
  const cardPairs: Card[] = []
  selectedPinyins.forEach(pinyin => {
    const allToneFileIDs = getPinyinAllTonesFileIDs(pinyin)
    const availableTones: (0 | 1 | 2 | 3 | 4)[] = []
    
    allToneFileIDs.forEach((fileID, index) => {
      if (fileID !== null) {
        availableTones.push(index as 0 | 1 | 2 | 3 | 4)
      }
    })
    
    const fixedTone = availableTones.length > 0 
      ? availableTones[Math.floor(Math.random() * availableTones.length)]
      : 0
    
    cardPairs.push({ pinyin, tone: fixedTone, flipped: false, matched: false })
    cardPairs.push({ pinyin, tone: fixedTone, flipped: false, matched: false })
  })

  cards.value = shuffleArray(cardPairs)
  
  audio.value?.play({
    type: 'guide',
    file: 'global_let_click',
    loop: false
  })
  
  startTimer()
}

function startTimer() {
  if (timer.value) {
    clearInterval(timer.value)
  }
  
  timer.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame(false)
    }
  }, 1000)
}

function selectCard(index: number) {
  if (gameOver.value || isProcessing.value) return
  
  const card = cards.value[index]
  
  if (card.flipped || card.matched) return
  if (selectedCards.value.length >= 2) return
  if (selectedCards.value.includes(index)) return

  card.flipped = true
  selectedCards.value.push(index)
  
  playPinyinAudio({ pinyin: card.pinyin, tone: card.tone })

  if (selectedCards.value.length === 2) {
    isProcessing.value = true
    checkMatch()
  }
}

function checkMatch() {
  const [firstIndex, secondIndex] = selectedCards.value
  const firstCard = cards.value[firstIndex]
  const secondCard = cards.value[secondIndex]

  if (firstCard.pinyin === secondCard.pinyin) {
    score.value += 10
    correctMatches.value++
    
    setTimeout(() => {
      firstCard.matched = true
      secondCard.matched = true
      selectedCards.value = []
      isProcessing.value = false

      if (cards.value.every(card => card.matched)) {
        endGame(true)
      }
    }, 500)
  } else {
    setTimeout(() => {
      firstCard.flipped = false
      secondCard.flipped = false
      selectedCards.value = []
      isProcessing.value = false
    }, 1000)
  }
}

function saveLearningRecord() {
  const now = Date.now()
  const duration = Math.floor((now - gameStartTime.value) / 1000)
  const totalPairs = cards.value.length / 2
  const accuracy = Math.round((correctMatches.value / totalPairs) * 100)

  const record = {
    id: `record_${now}`,
    date: new Date(now).toISOString().split('T')[0],
    type: 'games' as const,
    content: '拼音消消乐',
    duration: duration,
    accuracy: accuracy,
    score: score.value,
    timestamp: now
  }

  globalStore.addLearningRecord(record)
  console.log('[拼音消消乐] 学习记录已保存:', record)
}

function endGame(matched: boolean) {
  gameOver.value = true
  allMatched.value = matched
  
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  saveLearningRecord()
}

function restartGame() {
  initGame()
}

function goHome() {
  uni.navigateBack()
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.page.match-game-page {
  padding: 28rpx;
  background: #FFB84D;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.page.match-game-page::before {
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

.page.match-game-page::after {
  content: '';
  position: absolute;
  bottom: 60rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
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
  background: #FF476F;
  padding: 20rpx 40rpx;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.subtitle {
  color: #FFFFFF;
  margin-bottom: 48rpx;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.6;
  font-weight: 600;
  width: 100%;
  background: #3B82F6;
  padding: 16rpx 32rpx;
  border-radius: 28rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.game-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.info-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
}

.score, .time {
  font-size: 28rpx;
  font-weight: 700;
  color: #2d3436;
}

.game-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.card-item {
  aspect-ratio: 1;
  perspective: 1000rpx;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  border-radius: 16rpx;
  border: 6rpx solid #FFFFFF;
  box-shadow: 0 8rpx 0 #E5E7EB;
}

.card-item.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-item.matched .card-inner {
  opacity: 0.5;
  transform: rotateY(180deg);
}

.card-item.selected .card-inner {
  box-shadow: 0 8rpx 0 #FFB84D;
  border-color: #FFB84D;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.card-front {
  background: #3B82F6;
}

.card-back {
  background: #FFFFFF;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.card-icon {
  font-size: 48rpx;
}

.card-pinyin {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3436;
}

.game-over-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 48rpx 32rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E5E7EB;
}

.game-over-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #FF476F;
}

.final-score {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3436;
}

.restart-btn, .home-btn {
  width: 100%;
  max-width: 400rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 24rpx;
  border: 6rpx solid #FFFFFF;
  box-shadow: 0 8rpx 0 #E5E7EB;
  transition: all 0.2s ease;
}

.restart-btn {
  background: #FFB84D;
  color: #FFFFFF;
}

.restart-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #E5E7EB;
}

.home-btn {
  background: #3B82F6;
  color: #FFFFFF;
}

.home-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #E5E7EB;
}
</style>
