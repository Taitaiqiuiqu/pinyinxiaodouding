<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">练习中心</text>
        <view class="empty-space"></view>
      </view>
    </view>

    <!-- 练习内容 -->
    <view class="content-area">
      <!-- 练习信息 -->
      <view class="exercise-info">
        <text class="exercise-title">{{ exerciseData.title }}</text>
        <text class="exercise-subtitle">{{ exerciseData.description }}</text>
        <view class="exercise-meta">
          <text class="exercise-type">{{ exerciseData.type }}</text>
          <text class="exercise-duration">5分钟</text>
        </view>
      </view>

      <!-- 练习内容区域 -->
      <view class="exercise-content">
        <!-- 根据练习类型显示不同内容 -->
        <view v-if="exerciseData.type === '发音'" class="pronunciation-practice">
          <text class="practice-label">请跟读以下发音</text>
          <view class="phonetic-display">
            <text class="phonetic-character">{{ exerciseData.phonetic }}</text>
            <text class="phonetic-pinyin">{{ exerciseData.pinyin }}</text>
          </view>
          <view class="audio-control" @tap="playAudio">
            <text class="audio-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
            <text class="audio-text">播放发音</text>
          </view>
          <view class="recording-control" @tap="startRecording">
            <text class="recording-icon">{{ isRecording ? '⏹️' : '🎤' }}</text>
            <text class="recording-text">{{ isRecording ? '停止录音' : '开始录音' }}</text>
          </view>
        </view>

        <view v-else-if="exerciseData.type === '听力'" class="listening-practice">
          <text class="practice-label">请听音频并选择正确答案</text>
          <view class="audio-control" @tap="playAudio">
            <text class="audio-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
            <text class="audio-text">播放音频</text>
          </view>
          <view class="options-list">
            <view 
              v-for="(option, index) in exerciseData.options" 
              :key="index"
              class="option-item"
              :class="{ 'selected': selectedOption === index }"
              @tap="selectOption(index)"
            >
              <text class="option-text">{{ option }}</text>
            </view>
          </view>
        </view>

        <view v-else-if="exerciseData.type === '书写'" class="writing-practice">
          <text class="practice-label">请按照示例书写</text>
          <view class="writing-example">
            <text class="example-character">{{ exerciseData.phonetic }}</text>
            <text class="example-strokes">{{ exerciseData.strokes.join(' → ') }}</text>
          </view>
          <view class="writing-area">
            <text class="writing-hint">请在下方区域书写</text>
            <view class="writing-canvas">
              <!-- 这里可以集成手写识别组件 -->
              <text class="canvas-placeholder">手写区域</text>
            </view>
          </view>
        </view>

        <view v-else-if="exerciseData.type === '拼读'" class="spelling-practice">
          <text class="practice-label">请拼写出正确的拼音</text>
          <view class="spelling-word">
            <text class="word-character">{{ exerciseData.phonetic }}</text>
          </view>
          <input 
            class="spelling-input" 
            type="text" 
            v-model="spellingAnswer" 
            placeholder="请输入拼音"
          />
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button class="action-btn secondary" @tap="skipExercise">跳过</button>
        <button class="action-btn primary" @tap="submitExercise" :disabled="!canSubmit">提交答案</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isPlaying = ref(false)
const isRecording = ref(false)
const selectedOption = ref(-1)
const spellingAnswer = ref('')
const exerciseType = ref('发音')
const courseId = ref('')
const exerciseId = ref('')

// 练习数据
const exerciseData = ref({
  id: '',
  title: '',
  description: '',
  type: '',
  phonetic: '',
  pinyin: '',
  strokes: [],
  options: []
})

// 计算属性：是否可以提交
const canSubmit = computed(() => {
  if (exerciseData.value.type === '听力') {
    return selectedOption.value >= 0
  } else if (exerciseData.value.type === '拼读') {
    return spellingAnswer.value.trim() !== ''
  }
  return true
})

// 页面加载
onLoad((options: any) => {
  console.log('练习页面加载，参数:', options)
  courseId.value = options.courseId || ''
  exerciseId.value = options.exerciseId || ''
  
  // 加载练习数据
  loadExerciseData()
})

// 加载练习数据
const loadExerciseData = () => {
  console.log('加载练习数据，课程ID:', courseId.value, '练习ID:', exerciseId.value)
  
  // 模拟练习数据，实际项目中可以从API获取
  const mockExerciseData = {
    'ex001': {
      id: 'ex001',
      title: '发音练习',
      description: '跟着音频练习 a 的四个声调发音',
      type: '发音',
      phonetic: 'a',
      pinyin: 'ā á ǎ à',
      strokes: ['左半圆', '竖右弯']
    },
    'ex002': {
      id: 'ex002',
      title: '声调区分',
      description: '听音频，选择正确的声调',
      type: '听力',
      phonetic: 'a',
      pinyin: '',
      options: ['ā', 'á', 'ǎ', 'à']
    },
    'ex003': {
      id: 'ex003',
      title: '书写练习',
      description: '练习 a 的标准书写',
      type: '书写',
      phonetic: 'a',
      pinyin: 'a',
      strokes: ['左半圆', '竖右弯']
    },
    'ex004': {
      id: 'ex004',
      title: '声母辨音',
      description: '区分相似声母的发音',
      type: '听力',
      phonetic: '',
      pinyin: '',
      options: ['b', 'p', 'm', 'f']
    },
    'ex005': {
      id: 'ex005',
      title: '拼音拼读',
      description: '拼写出正确的拼音',
      type: '拼读',
      phonetic: '爸',
      pinyin: '',
      options: []
    }
  }
  
  // 根据练习ID获取对应练习数据
  exerciseData.value = mockExerciseData[exerciseId.value] || mockExerciseData['ex001']
}

// 播放音频
const playAudio = () => {
  isPlaying.value = true
  console.log(`播放${exerciseData.value.phonetic}的发音`)
  // 模拟播放
  setTimeout(() => {
    isPlaying.value = false
  }, 2000)
}

// 开始录音
const startRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    console.log('开始录音')
  } else {
    console.log('停止录音')
    // 模拟录音结束后的处理
    setTimeout(() => {
      uni.showToast({
        title: '录音完成',
        icon: 'success',
        duration: 1500
      })
    }, 500)
  }
}

// 选择选项
const selectOption = (index: number) => {
  selectedOption.value = index
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳过练习
const skipExercise = () => {
  uni.showToast({
    title: '已跳过该练习',
    icon: 'none',
    duration: 1500
  })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

// 提交练习
const submitExercise = () => {
  console.log('提交练习答案')
  
  // 模拟提交成功
  uni.showToast({
    title: '练习提交成功！',
    icon: 'success',
    duration: 1500
  })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
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

.empty-space {
  width: 60rpx;
}

/* 内容区域 */
.content-area {
  padding: 32rpx;
}

/* 练习信息 */
.exercise-info {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
}

.exercise-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8rpx;
}

.exercise-subtitle {
  display: block;
  font-size: 24rpx;
  color: #636e72;
  margin-bottom: 16rpx;
}

.exercise-meta {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.exercise-type,
.exercise-duration {
  font-size: 20rpx;
  color: #ff7eb3;
  background: rgba(255, 126, 179, 0.1);
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

/* 练习内容 */
.exercise-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
}

.practice-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 24rpx;
  text-align: center;
}

/* 发音练习 */
.phonetic-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.phonetic-character {
  font-size: 120rpx;
  font-weight: bold;
  color: #ff7eb3;
  margin-bottom: 16rpx;
  animation: pulse 2s ease-in-out infinite;
}

.phonetic-pinyin {
  font-size: 48rpx;
  color: #636e72;
  margin-bottom: 24rpx;
  font-weight: 600;
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
  margin: 0 auto 24rpx;
  justify-content: center;
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

/* 录音控制 */
.recording-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 126, 179, 0.1);
  color: #ff7eb3;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2rpx solid rgba(255, 126, 179, 0.3);
  margin: 0 auto;
  justify-content: center;
}

.recording-control:active {
  background: rgba(255, 126, 179, 0.2);
  transform: scale(0.95);
}

.recording-icon {
  font-size: 28rpx;
  font-weight: bold;
}

.recording-text {
  font-size: 24rpx;
  font-weight: 600;
}

/* 听力练习 */
.listening-practice {
  text-align: center;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 32rpx;
}

.option-item {
  background: rgba(255, 126, 179, 0.05);
  border: 2rpx solid rgba(255, 126, 179, 0.2);
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:active {
  background: rgba(255, 126, 179, 0.1);
  transform: scale(0.98);
}

.option-item.selected {
  background: rgba(255, 126, 179, 0.2);
  border-color: rgba(255, 126, 179, 0.6);
}

.option-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3436;
}

/* 书写练习 */
.writing-practice {
  text-align: center;
}

.writing-example {
  margin-bottom: 32rpx;
}

.example-character {
  font-size: 100rpx;
  font-weight: bold;
  color: #ff7eb3;
  margin-bottom: 16rpx;
  display: block;
}

.example-strokes {
  font-size: 24rpx;
  color: #636e72;
}

.writing-area {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.writing-hint {
  font-size: 24rpx;
  color: #636e72;
  margin-bottom: 24rpx;
}

.writing-canvas {
  width: 100%;
  height: 300rpx;
  background: #f8f9fa;
  border: 2rpx dashed #dee2e6;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-placeholder {
  font-size: 24rpx;
  color: #adb5bd;
}

/* 拼读练习 */
.spelling-practice {
  text-align: center;
}

.spelling-word {
  margin-bottom: 32rpx;
}

.word-character {
  font-size: 100rpx;
  font-weight: bold;
  color: #ff7eb3;
  margin-bottom: 16rpx;
  display: block;
}

.spelling-input {
  width: 80%;
  padding: 24rpx;
  border: 2rpx solid #ff7eb3;
  border-radius: 16rpx;
  font-size: 32rpx;
  text-align: center;
  margin: 0 auto 24rpx;
  display: block;
}

.spelling-input:focus {
  outline: none;
  box-shadow: 0 0 0 6rpx rgba(255, 126, 179, 0.15);
}

/* 底部操作按钮 */
.bottom-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
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

.action-btn.primary:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow: none;
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

/* 动画效果 */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .exercise-info,
  .exercise-content {
    padding: 24rpx;
    margin: 0 20rpx 24rpx;
  }
  
  .content-area {
    padding: 20rpx;
  }
  
  .phonetic-character {
    font-size: 100rpx;
  }
  
  .phonetic-pinyin {
    font-size: 40rpx;
  }
}
</style>