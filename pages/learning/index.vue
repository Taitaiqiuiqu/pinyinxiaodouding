<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">{{ learningData.title }}</text>
        <view class="progress-info">
          <text class="progress-text">{{ currentStep }}/{{ totalSteps }}</text>
        </view>
      </view>
    </view>

    <!-- 学习内容区域 -->
    <view class="content-area">
      <!-- 学习内容 -->
      <view class="learning-content">
        <!-- 发音学习 -->
        <view v-if="currentStep === 1" class="pronunciation-learning">
          <text class="step-label">第1步：学习发音</text>
          <view class="phonetic-display">
            <text class="phonetic-character">{{ learningData.phonetic }}</text>
            <text class="phonetic-pinyin">{{ learningData.pinyin }}</text>
          </view>
          <text class="pronunciation-tip">{{ learningData.mouthShape }}</text>
          <view class="audio-control" @tap="playAudio">
            <text class="audio-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
            <text class="audio-text">{{ isPlaying ? '暂停' : '播放发音' }}</text>
          </view>
        </view>

        <!-- 口型学习 -->
        <view v-else-if="currentStep === 2" class="mouth-shape-learning">
          <text class="step-label">第2步：学习口型</text>
          <view class="video-placeholder">
            <text class="video-icon">📹</text>
            <text class="video-text">口型示范视频</text>
          </view>
          <text class="video-tip">点击播放按钮观看口型示范</text>
        </view>

        <!-- 书写学习 -->
        <view v-else-if="currentStep === 3" class="writing-learning">
          <text class="step-label">第3步：学习书写</text>
          <view class="writing-demo">
            <text class="demo-character">{{ learningData.phonetic }}</text>
            <text class="demo-strokes">笔顺：{{ learningData.strokes.join(' → ') }}</text>
          </view>
          <view class="writing-guide">
            <text class="guide-text">{{ learningData.writingTip }}</text>
          </view>
        </view>

        <!-- 练习巩固 -->
        <view v-else-if="currentStep === 4" class="practice-learning">
          <text class="step-label">第4步：练习巩固</text>
          <text class="practice-description">现在让我们做一些练习来巩固所学内容吧！</text>
          <view class="practice-preview">
            <text class="preview-icon">✅</text>
            <text class="preview-text">发音练习</text>
          </view>
          <view class="practice-preview">
            <text class="preview-icon">✅</text>
            <text class="preview-text">听力练习</text>
          </view>
          <view class="practice-preview">
            <text class="preview-icon">✅</text>
            <text class="preview-text">书写练习</text>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button 
          class="action-btn secondary" 
          @tap="previousStep" 
          :disabled="currentStep === 1"
        >上一步</button>
        <button 
          class="action-btn primary" 
          @tap="nextStep"
        >{{ currentStep === totalSteps ? '完成学习' : '下一步' }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isPlaying = ref(false)
const currentStep = ref(1)
const courseId = ref('')
const learningData = ref({
  id: '',
  title: '',
  phonetic: '',
  pinyin: '',
  mouthShape: '',
  strokes: [],
  writingTip: ''
})

// 总步骤数
const totalSteps = 4

// 学习数据
const loadLearningData = () => {
  console.log('加载学习数据，课程ID:', courseId.value)
  
  // 模拟学习数据
  const mockLearningData = {
    'lesson001': {
      id: 'lesson001',
      title: '单韵母 a',
      phonetic: 'a',
      pinyin: 'ā á ǎ à',
      mouthShape: '嘴巴张大，舌头自然放平，发音时声带振动，声音响亮而清晰。',
      strokes: ['左半圆', '竖右弯'],
      writingTip: '先写左半圆，再写竖右弯，注意笔画顺序和占格位置。'
    },
    'lesson002': {
      id: 'lesson002',
      title: '单韵母 o',
      phonetic: 'o',
      pinyin: 'ō ó ǒ ò',
      mouthShape: '嘴巴拢圆，舌头后缩，发音时声带振动，声音圆润而饱满。',
      strokes: ['左上起笔，圆弧形'],
      writingTip: '从左上起笔，一笔写成一个圆弧形，注意占格位置。'
    },
    'lesson003': {
      id: 'lesson003',
      title: '单韵母 e',
      phonetic: 'e',
      pinyin: 'ē é ě è',
      mouthShape: '嘴巴半开，舌头后缩，发音时声带振动，声音清晰而自然。',
      strokes: ['横折左半圆'],
      writingTip: '先写横折，再写左半圆，注意笔画顺序和占格位置。'
    },
    // 推荐课程
    'course001': {
      id: 'course001',
      title: '声母入门',
      phonetic: 'b p m f',
      pinyin: 'bā pǎ mǎ fā',
      mouthShape: '掌握不同声母的发音口型和技巧',
      strokes: ['基本笔画组合'],
      writingTip: '学习声母的标准书写方法'
    }
  }
  
  // 根据课程ID获取学习数据
  learningData.value = mockLearningData[courseId.value] || mockLearningData['lesson001']
}

// 页面加载
onLoad((options: any) => {
  console.log('学习页面加载，参数:', options)
  courseId.value = options.courseId || 'lesson001'
  loadLearningData()
})

// 播放音频
const playAudio = () => {
  isPlaying.value = !isPlaying.value
  console.log(`播放${learningData.value.phonetic}的发音`)
  // 模拟播放
  if (!isPlaying.value) {
    setTimeout(() => {
      isPlaying.value = false
    }, 2000)
  }
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  } else {
    // 完成学习
    completeLearning()
  }
}

// 完成学习
const completeLearning = () => {
  uni.showToast({
    title: '学习完成！',
    icon: 'success',
    duration: 1500
  })
  // 跳转到课程详情页面
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
/* 页面基础样式 */
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 50%, #ffb347 100%);
  position: relative;
  overflow-x: hidden;
}

/* 头部导航 */
.header {
  padding: 40rpx 32rpx 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: white;
  text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.25);
  flex: 1;
  text-align: center;
}

.progress-info {
  width: 60rpx;
  text-align: right;
}

.progress-text {
  font-size: 24rpx;
  color: white;
  font-weight: 600;
}

/* 内容区域 */
.content-area {
  padding: 32rpx;
}

/* 学习内容 */
.learning-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  text-align: center;
}

.step-label {
  display: block;
  font-size: 24rpx;
  color: #ff7eb3;
  margin-bottom: 32rpx;
  font-weight: 600;
}

/* 发音学习 */
.pronunciation-learning {
  text-align: center;
}

.phonetic-display {
  margin-bottom: 32rpx;
}

.phonetic-character {
  font-size: 140rpx;
  font-weight: bold;
  color: #ff7eb3;
  margin-bottom: 16rpx;
  display: block;
  animation: pulse 2s ease-in-out infinite;
}

.phonetic-pinyin {
  font-size: 48rpx;
  color: #636e72;
  margin-bottom: 24rpx;
  font-weight: 600;
  display: block;
}

.pronunciation-tip {
  font-size: 24rpx;
  color: #636e72;
  margin-bottom: 32rpx;
  line-height: 1.5;
  display: block;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

/* 音频控制 */
.audio-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
  color: white;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(255, 126, 179, 0.3);
  margin: 0 auto;
  justify-content: center;
  max-width: 300rpx;
}

.audio-control:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(255, 126, 179, 0.4);
}

.audio-icon {
  font-size: 28rpx;
  font-weight: bold;
}

.audio-text {
  font-size: 24rpx;
  font-weight: 600;
}

/* 口型学习 */
.mouth-shape-learning {
  text-align: center;
}

.video-placeholder {
  background: rgba(255, 126, 179, 0.1);
  border: 2rpx dashed rgba(255, 126, 179, 0.4);
  border-radius: 20rpx;
  padding: 64rpx 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.video-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.video-text {
  font-size: 32rpx;
  color: #636e72;
  font-weight: 600;
}

.video-tip {
  font-size: 24rpx;
  color: #636e72;
}

/* 书写学习 */
.writing-learning {
  text-align: center;
}

.writing-demo {
  margin-bottom: 32rpx;
}

.demo-character {
  font-size: 120rpx;
  font-weight: bold;
  color: #ff7eb3;
  margin-bottom: 24rpx;
  display: block;
}

.demo-strokes {
  font-size: 28rpx;
  color: #636e72;
  margin-bottom: 24rpx;
  display: block;
}

.writing-guide {
  background: rgba(255, 126, 179, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.guide-text {
  font-size: 24rpx;
  color: #636e72;
  line-height: 1.5;
}

/* 底部操作按钮 */
.bottom-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
  color: white;
  box-shadow: 0 6rpx 24rpx rgba(255, 126, 179, 0.4);
}

.action-btn.primary:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(255, 126, 179, 0.5);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #ff7eb3;
  border: 2rpx solid rgba(255, 126, 179, 0.3);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.action-btn.secondary:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.8);
}

.action-btn:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow: none;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .learning-content {
    padding: 32rpx 24rpx;
    margin: 0 20rpx 24rpx;
  }
  
  .content-area {
    padding: 20rpx;
  }
  
  .phonetic-character {
    font-size: 120rpx;
  }
  
  .phonetic-pinyin {
    font-size: 40rpx;
  }
  
  .video-placeholder {
    padding: 48rpx 24rpx;
  }
  
  .video-icon {
    font-size: 60rpx;
  }
}
</style>