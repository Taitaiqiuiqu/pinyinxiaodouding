<template>
  <view class="page tone-training-page">
    <view class="floating-stars"></view>
    <AudioPlayer ref="audio" />

    <view class="center-area card container">
      <text class="title">声调训练</text>
      <text class="subtitle">听一听，选出正确的声调</text>

      <view class="game-area">
        <view class="score-row">
          <text class="score">得分：{{ score }}</text>
          <text class="question-num">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
        </view>

        <view class="pinyin-display">
          <text class="pinyin-text">{{ currentPinyin }}</text>
        </view>

        <view class="audio-section">
          <view class="audio-button" @tap="playAudio" :class="{ playing: isPlaying }">
            <text class="audio-icon">{{ isPlaying ? '🔊' : '🔇' }}</text>
            <text class="audio-text">点击播放</text>
          </view>
        </view>

        <view class="options-grid">
          <view
            v-for="(option, index) in toneOptions"
            :key="index"
            class="tone-card"
            :class="{
              correct: showResult && option.isCorrect,
              wrong: showResult && selectedTone === option.tone && !option.isCorrect,
              selected: selectedTone === option.tone && !showResult
            }"
            @tap="selectTone(option.tone)"
          >
            <text class="tone-number">{{ option.tone === 0 ? '轻声' : option.tone + '声' }}</text>
            <text class="tone-mark">{{ getToneMark(option.tone) }}</text>
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

interface ToneOption {
  tone: 0 | 1 | 2 | 3 | 4
  isCorrect: boolean
}

const audio = ref<any>(null)
const score = ref(0)
const currentQuestion = ref(0)
const totalQuestions = ref(10)
const currentPinyin = ref('')
const correctTone = ref<0 | 1 | 2 | 3 | 4>(0)
const toneOptions = ref<ToneOption[]>([])
const selectedTone = ref<0 | 1 | 2 | 3 | 4 | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const feedbackText = ref('')
const isPlaying = ref(false)
const showResultModal = ref(false)

const pinyinList = [
  'a', 'o', 'e', 'i', 'u', 'ü',
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  'an', 'en', 'in', 'un', 'ün',
  'ang', 'eng', 'ing', 'ong',
  'ba', 'pa', 'ma', 'fa', 'da', 'ta', 'na', 'la',
  'ga', 'ka', 'ha', 'ja', 'qa', 'xa',
  'zha', 'cha', 'sha', 'ra', 'za', 'ca', 'sa',
  'bai', 'pai', 'mai', 'dai', 'tai', 'nai', 'lai',
  'gai', 'kai', 'hai', 'zhai', 'chai', 'shai', 'zai', 'cai', 'sai',
  'ban', 'pan', 'man', 'fan', 'dan', 'tan', 'nan', 'lan',
  'gan', 'kan', 'han', 'zhan', 'chan', 'shan', 'ran', 'zan', 'can', 'san',
  'bang', 'pang', 'mang', 'fang', 'dang', 'tang', 'nang', 'lang',
  'gang', 'kang', 'hang', 'zhang', 'chang', 'shang', 'rang', 'zang', 'cang', 'sang',
  'bei', 'pei', 'mei', 'fei',
  'gei', 'kei', 'hei', 'zhei', 'chei', 'shei', 'zei',
  'ben', 'pen', 'men', 'fen',
  'gen', 'ken', 'hen', 'zhen', 'chen', 'shen', 'ren', 'zen', 'cen', 'sen',
  'beng', 'peng', 'meng', 'feng',
  'geng', 'keng', 'heng', 'zheng', 'cheng', 'sheng', 'reng', 'zeng', 'ceng', 'seng',
  'bi', 'pi', 'mi', 'di', 'ti', 'ni', 'li',
  'ji', 'qi', 'xi', 'zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si',
  'jia', 'qia', 'xia',
  'bian', 'pian', 'mian', 'dian', 'tian', 'nian', 'lian',
  'jian', 'qian', 'xian',
  'biao', 'piao', 'miao', 'diao', 'tiao', 'niao', 'liao',
  'jiao', 'qiao', 'xiao',
  'bie', 'pie', 'mie', 'die', 'tie', 'nie', 'lie',
  'jie', 'qie', 'xie',
  'bin', 'pin', 'min',
  'jin', 'qin', 'xin',
  'bing', 'ping', 'ming', 'ding', 'ting', 'ning', 'ling',
  'jing', 'qing', 'xing',
  'bo', 'po', 'mo', 'fo',
  'bu', 'pu', 'mu', 'fu', 'du', 'tu', 'nu', 'lu',
  'gu', 'ku', 'hu', 'zhu', 'chu', 'shu', 'ru', 'zu', 'cu', 'su',
  'duo', 'tuo', 'nuo', 'luo',
  'guo', 'kuo', 'huo', 'zhuo', 'chuo', 'shuo', 'ruo', 'zuo', 'cuo', 'suo',
  'dui', 'tui',
  'gui', 'kui', 'hui', 'zhui', 'chui', 'shui', 'rui', 'zui', 'cui', 'sui',
  'dun', 'tun',
  'gun', 'kun', 'hun', 'zhun', 'chun', 'shun', 'run', 'zun', 'cun', 'sun',
  'dong', 'tong', 'nong', 'long',
  'gong', 'kong', 'hong', 'zhong', 'chong', 'rong', 'zong', 'cong', 'song'
]

const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

onMounted(() => {
  generateQuestion()
})

onUnmounted(() => {
  stopAudio()
})

function generateQuestion() {
  const randomPinyin = pinyinList[Math.floor(Math.random() * pinyinList.length)]
  currentPinyin.value = randomPinyin
  
  const allToneFileIDs = getPinyinAllTonesFileIDs(randomPinyin)
  const availableTones: (0 | 1 | 2 | 3 | 4)[] = []
  
  allToneFileIDs.forEach((fileID, index) => {
    if (fileID !== null) {
      availableTones.push(index as 0 | 1 | 2 | 3 | 4)
    }
  })
  
  if (availableTones.length === 0) {
    console.warn(`拼音 ${randomPinyin} 没有可用的声调音频，跳过`)
    generateQuestion()
    return
  }
  
  correctTone.value = availableTones[Math.floor(Math.random() * availableTones.length)] as 0 | 1 | 2 | 3 | 4

  const options: ToneOption[] = []
  options.push({
    tone: correctTone.value,
    isCorrect: true
  })

  const allTones: (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4]
  
  for (let i = 0; i < allTones.length; i++) {
    if (allTones[i] !== correctTone.value) {
      options.push({
        tone: allTones[i],
        isCorrect: false
      })
    }
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  toneOptions.value = options
  selectedTone.value = null
  showResult.value = false
}

function getToneMark(tone: 0 | 1 | 2 | 3 | 4): string {
  const toneMarks: Record<number, string> = {
    0: '',
    1: 'ā',
    2: 'á',
    3: 'ǎ',
    4: 'à'
  }
  return toneMarks[tone] || ''
}

async function playAudio() {
  isPlaying.value = true
  try {
    await playPinyinAudio({
      pinyin: currentPinyin.value,
      tone: correctTone.value
    })
  } catch (error) {
    console.error('播放音频失败:', error)
  } finally {
    isPlaying.value = false
  }
}

function selectTone(tone: 0 | 1 | 2 | 3 | 4) {
  if (showResult.value) return

  selectedTone.value = tone
  isCorrect.value = tone === correctTone.value

  if (isCorrect.value) {
    score.value += 10
    feedbackText.value = '回答正确！'
  } else {
    const toneText = correctTone.value === 0 ? '轻声' : correctTone.value + '声'
    feedbackText.value = `回答错误，正确答案是 ${toneText}`
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
  if (percentage >= 90) return '太棒了！你是声调小天才！'
  if (percentage >= 70) return '做得很好！继续加油！'
  if (percentage >= 50) return '还不错，多练习会更好！'
  return '再接再厉，你一定可以的！'
}

function restartGame() {
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

function stopAudio() {
  if (audio.value) {
    audio.value.stop()
  }
}
</script>

<style scoped>
.page.tone-training-page {
  padding: 28rpx;
  background: #8B5CF6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.page.tone-training-page::before {
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

.page.tone-training-page::after {
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
  color: #8B5CF6;
  font-weight: 700;
}

.pinyin-display {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24rpx 0;
  background: #F3F4F6;
  border-radius: 24rpx;
}

.pinyin-text {
  font-size: 72rpx;
  font-weight: 700;
  color: #8B5CF6;
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
  background: #8B5CF6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #7C3AED;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.audio-button:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #7C3AED;
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

.options-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.tone-card {
  background: #FBBF24;
  border: 8rpx solid #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 0 #D97706;
  padding: 32rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tone-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #D97706;
}

.tone-card.selected {
  background: #8B5CF6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #7C3AED;
}

.tone-card.correct {
  background: #10B981;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
}

.tone-card.wrong {
  background: #EF4444;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #DC2626;
}

.tone-number {
  font-size: 24rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.tone-mark {
  font-size: 48rpx;
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
  background: #10B981;
  box-shadow: 0 12rpx 0 #059669;
}

.restart-btn:active, .home-btn:active {
  transform: translateY(4rpx);
}

.restart-btn:active {
  box-shadow: 0 8rpx 0 #7C3AED;
}

.home-btn:active {
  box-shadow: 0 8rpx 0 #059669;
}
</style>
