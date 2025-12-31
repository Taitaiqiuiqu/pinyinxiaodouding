<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">课程详情</text>
        <view class="action-btn" @tap="toggleFavorite">
          <text class="action-icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
        </view>
      </view>
    </view>

    <!-- 课程信息卡片 -->
    <view class="course-card">
      <view class="course-header">
        <view class="course-icon">{{ course.icon }}</view>
        <view class="course-basic-info">
          <text class="course-title">{{ course.title }}</text>
          <text class="course-subtitle">{{ course.subtitle }}</text>
          <view class="course-meta">
            <text class="course-level">{{ course.level }}</text>
            <text class="course-duration">{{ course.duration }}</text>
            <text class="course-type">{{ course.type }}</text>
          </view>
        </view>
      </view>
      <text class="course-description">{{ course.description }}</text>
    </view>

    <!-- 课程内容区域 -->
    <view class="content-area">
      <!-- 学习目标 -->
      <view class="section">
        <text class="section-title">学习目标</text>
        <view class="goal-list">
          <view
            v-for="(goal, index) in course.goals"
            :key="index"
            class="goal-item motion-fade-up"
          >
            <text class="goal-icon">✅</text>
            <text class="goal-text">{{ goal }}</text>
          </view>
        </view>
      </view>

      <!-- 课程内容 -->
      <view class="section">
        <text class="section-title">课程内容</text>
        <view class="lesson-content">
          <!-- 发音示例 -->
          <view class="content-item">
            <text class="content-label">发音示例</text>
            <view class="pronunciation-example">
              <view class="phonetic-character">{{ course.phonetic }}</view>
              <text class="phonetic-pinyin">{{ course.pinyin }}</text>
              <view class="audio-control" @tap="playPronunciation">
                <text class="audio-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
                <text class="audio-text">播放发音</text>
              </view>
            </view>
          </view>

          <!-- 口型要点 -->
          <view class="content-item">
            <text class="content-label">口型要点</text>
            <text class="content-text">{{ course.mouthShape }}</text>
          </view>

          <!-- 书写笔顺 -->
          <view class="content-item">
            <text class="content-label">书写笔顺</text>
            <view class="writing-guide">
              <view class="stroke-order">
                <text class="stroke-number" v-for="(stroke, index) in course.strokes" :key="index">
                  {{ index + 1 }}
                </text>
              </view>
              <text class="writing-tip">{{ course.writingTip }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 练习环节 -->
      <view class="section">
        <text class="section-title">练习环节</text>
        <view class="exercise-list">
          <view
            v-for="(exercise, index) in course.exercises"
            :key="exercise.id"
            class="exercise-item motion-fade-up"
            @tap="handleExerciseTap(exercise)"
          >
            <view class="exercise-icon">{{ exercise.icon }}</view>
            <view class="exercise-info">
              <text class="exercise-title">{{ exercise.title }}</text>
              <text class="exercise-description">{{ exercise.description }}</text>
            </view>
            <view class="exercise-action">
              <text class="action-text">开始练习</text>
              <text class="action-arrow">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="start-btn" type="primary" @tap="startLearning">
        <text class="btn-text">开始学习</text>
      </button>
    </view>

    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayerRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AudioPlayer from '../../../src/components/AudioPlayer/AudioPlayer.vue'

const audioPlayerRef = ref<any>(null)

// 响应式数据
const isFavorite = ref(false)
const isPlaying = ref(false)

// 课程ID
const courseId = ref('lesson001')

// 课程数据映射
const courseDataMap: Record<string, any> = {
  // 声母课程
  'lesson001': {
    id: 'lesson001',
    title: '单韵母 a',
    subtitle: '学习拼音的基础',
    description: '单韵母 a 是拼音学习的基础，掌握正确的发音和书写对于后续学习至关重要。通过本课程，孩子将学会 a 的标准发音、口型要点和书写笔顺。',
    icon: '🔤',
    level: '入门',
    duration: '5分钟',
    type: '拼音基础',
    phonetic: 'a',
    pinyin: 'ā á ǎ à',
    mouthShape: '嘴巴张大，舌头自然放平，发音时声带振动，声音响亮而清晰。',
    strokes: ['左半圆', '竖右弯'],
    writingTip: '先写左半圆，再写竖右弯，注意笔画顺序和占格位置。',
    goals: [
      '掌握单韵母 a 的正确发音',
      '了解 a 的口型要点和发音技巧',
      '学会 a 的标准书写笔顺',
      '能够区分 a 的四个声调'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '发音练习',
        description: '跟着音频练习 a 的四个声调发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声调区分',
        description: '听音频，选择正确的声调',
        icon: '🎵',
        type: '听力'
      },
      {
        id: 'ex003',
        title: '书写练习',
        description: '练习 a 的标准书写',
        icon: '✏️',
        type: '书写'
      }
    ]
  },
  'lesson002': {
    id: 'lesson002',
    title: '单韵母 o',
    subtitle: '圆唇韵母',
    description: '单韵母 o 是一个圆唇韵母，通过本课程学习，孩子将掌握 o 的正确发音方法和书写规范。',
    icon: '🔤',
    level: '入门',
    duration: '5分钟',
    type: '拼音基础',
    phonetic: 'o',
    pinyin: 'ō ó ǒ ò',
    mouthShape: '嘴巴拢圆，舌头后缩，发音时声带振动，声音圆润而饱满。',
    strokes: ['左上起笔，圆弧形'],
    writingTip: '从左上起笔，一笔写成一个圆弧形，注意占格位置。',
    goals: [
      '掌握单韵母 o 的正确发音',
      '了解 o 的口型要点和发音技巧',
      '学会 o 的标准书写笔顺',
      '能够区分 o 的四个声调'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '发音练习',
        description: '跟着音频练习 o 的四个声调发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声调区分',
        description: '听音频，选择正确的声调',
        icon: '🎵',
        type: '听力'
      },
      {
        id: 'ex003',
        title: '书写练习',
        description: '练习 o 的标准书写',
        icon: '✏️',
        type: '书写'
      }
    ]
  },
  'lesson003': {
    id: 'lesson003',
    title: '单韵母 e',
    subtitle: '扁唇韵母',
    description: '单韵母 e 是一个扁唇韵母，通过本课程学习，孩子将掌握 e 的正确发音方法和书写规范。',
    icon: '🔤',
    level: '入门',
    duration: '5分钟',
    type: '拼音基础',
    phonetic: 'e',
    pinyin: 'ē é ě è',
    mouthShape: '嘴巴半开，舌头后缩，发音时声带振动，声音清晰而自然。',
    strokes: ['横折左半圆'],
    writingTip: '先写横折，再写左半圆，注意笔画顺序和占格位置。',
    goals: [
      '掌握单韵母 e 的正确发音',
      '了解 e 的口型要点和发音技巧',
      '学会 e 的标准书写笔顺',
      '能够区分 e 的四个声调'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '发音练习',
        description: '跟着音频练习 e 的四个声调发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声调区分',
        description: '听音频，选择正确的声调',
        icon: '🎵',
        type: '听力'
      },
      {
        id: 'ex003',
        title: '书写练习',
        description: '练习 e 的标准书写',
        icon: '✏️',
        type: '书写'
      }
    ]
  },
  'lesson004': {
    id: 'lesson004',
    title: '单韵母 i',
    subtitle: '前高元音',
    description: '单韵母 i 是一个前高元音，通过本课程学习，孩子将掌握 i 的正确发音方法和书写规范。',
    icon: '🔤',
    level: '入门',
    duration: '5分钟',
    type: '拼音基础',
    phonetic: 'i',
    pinyin: 'ī í ǐ ì',
    mouthShape: '嘴巴微张，舌头前伸，发音时声带振动，声音尖细而清晰。',
    strokes: ['竖', '点'],
    writingTip: '先写竖，再写点，注意笔画顺序和占格位置。',
    goals: [
      '掌握单韵母 i 的正确发音',
      '了解 i 的口型要点和发音技巧',
      '学会 i 的标准书写笔顺',
      '能够区分 i 的四个声调'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '发音练习',
        description: '跟着音频练习 i 的四个声调发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声调区分',
        description: '听音频，选择正确的声调',
        icon: '🎵',
        type: '听力'
      },
      {
        id: 'ex003',
        title: '书写练习',
        description: '练习 i 的标准书写',
        icon: '✏️',
        type: '书写'
      }
    ]
  },
  // 推荐课程
  'course001': {
    id: 'course001',
    title: '声母入门',
    subtitle: '学习23个声母',
    description: '系统学习23个声母的发音和书写，为拼音学习打下坚实基础。',
    icon: '🔤',
    level: '入门',
    duration: '60分钟',
    type: '拼音基础',
    phonetic: 'b p m f',
    pinyin: 'bā pǎ mǎ fā',
    mouthShape: '掌握不同声母的发音口型和技巧',
    strokes: ['基本笔画组合'],
    writingTip: '学习声母的标准书写方法',
    goals: [
      '掌握23个声母的正确发音',
      '学会声母的标准书写',
      '能够区分不同声母的发音特点',
      '为后续拼音学习打下基础'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '声母发音练习',
        description: '系统练习23个声母的发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声母书写练习',
        description: '练习声母的标准书写',
        icon: '✏️',
        type: '书写'
      },
      {
        id: 'ex003',
        title: '声母辨音练习',
        description: '区分相似声母的发音',
        icon: '🎵',
        type: '听力'
      }
    ]
  },
  'course002': {
    id: 'course002',
    title: '韵母进阶',
    subtitle: '学习单韵母和复韵母',
    description: '深入学习单韵母和复韵母的发音特点和书写规范。',
    icon: '🎵',
    level: '进阶',
    duration: '80分钟',
    type: '拼音基础',
    phonetic: 'a o e i u ü',
    pinyin: 'āi ei ui ao ou iu',
    mouthShape: '掌握不同韵母的发音口型变化',
    strokes: ['复杂笔画组合'],
    writingTip: '学习韵母的标准书写方法',
    goals: [
      '掌握单韵母和复韵母的正确发音',
      '学会韵母的标准书写',
      '能够区分不同韵母的发音特点',
      '提高拼音拼读能力'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '韵母发音练习',
        description: '系统练习韵母的发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '韵母书写练习',
        description: '练习韵母的标准书写',
        icon: '✏️',
        type: '书写'
      },
      {
        id: 'ex003',
        title: '韵母拼读练习',
        description: '练习韵母与声母的组合拼读',
        icon: '📚',
        type: '拼读'
      }
    ]
  },
  'course003': {
    id: 'course003',
    title: '声调练习',
    subtitle: '掌握四个声调',
    description: '系统学习拼音的四个声调，提高发音准确性和辨识度。',
    icon: '📢',
    level: '基础',
    duration: '40分钟',
    type: '拼音基础',
    phonetic: 'ā á ǎ à',
    pinyin: 'shēng diào liàn xí',
    mouthShape: '掌握不同声调的发音变化',
    strokes: ['声调标注'],
    writingTip: '学习声调的正确标注方法',
    goals: [
      '掌握拼音的四个声调',
      '学会声调的正确标注',
      '能够区分不同声调的发音',
      '提高普通话水平'
    ],
    exercises: [
      {
        id: 'ex001',
        title: '声调发音练习',
        description: '系统练习四个声调的发音',
        icon: '🎤',
        type: '发音'
      },
      {
        id: 'ex002',
        title: '声调听辨练习',
        description: '听音频，选择正确的声调',
        icon: '🎵',
        type: '听力'
      },
      {
        id: 'ex003',
        title: '声调标注练习',
        description: '练习声调的正确标注',
        icon: '✏️',
        type: '书写'
      }
    ]
  }
}

// 响应式数据
const course = ref(courseDataMap['lesson001'])

// 页面加载
onLoad((options: any) => {
  console.log('课程详情页面加载，课程ID:', options.id)
  courseId.value = options.id || 'lesson001'
  loadCourseData()
})

// 加载课程数据
const loadCourseData = () => {
  console.log('加载课程数据:', courseId.value)
  // 根据课程ID从映射中获取对应课程数据
  const courseData = courseDataMap[courseId.value]
  if (courseData) {
    course.value = courseData
  } else {
    // 如果没有找到对应课程，使用默认课程
    course.value = courseDataMap['lesson001']
    console.warn(`未找到课程ID为${courseId.value}的课程数据，使用默认课程`)
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已添加到收藏' : '已取消收藏',
    icon: 'success',
    duration: 1500
  })
}

// 播放发音示例
const playPronunciation = () => {
  isPlaying.value = true
  // 模拟播放发音
  console.log(`播放${course.value.title}的发音`)
  // 这里可以调用AudioPlayer组件的播放方法
  setTimeout(() => {
    isPlaying.value = false
    uni.showToast({
      title: '发音播放完成',
      icon: 'success',
      duration: 1500
    })
  }, 2000) // 模拟播放时长
}

// 处理练习点击
const handleExerciseTap = (exercise: any) => {
  console.log(`进入${exercise.title}练习，课程ID: ${courseId.value}, 练习ID: ${exercise.id}`)
  
  // 跳转到练习页面
  uni.navigateTo({
    url: `/pages/exercise/index?courseId=${courseId.value}&exerciseId=${exercise.id}`
  })
}

// 开始学习
const startLearning = () => {
  console.log(`开始学习课程: ${course.value.title}, 课程ID: ${courseId.value}`)
  
  // 跳转到学习页面
  uni.navigateTo({
    url: `/pages/learning/index?courseId=${courseId.value}`,
    success: () => {
      console.log('跳转学习页面成功')
    },
    fail: (err) => {
      console.error('跳转学习页面失败:', err)
      uni.showToast({
        title: `跳转失败: ${err.errMsg}`,
        icon: 'none',
        duration: 3000
      })
      
      // 如果跳转到学习页面失败，尝试跳转到练习页面
      uni.navigateTo({
        url: `/pages/exercise/index?courseId=${courseId.value}&exerciseId=ex001`,
        success: () => {
          console.log('跳转练习页面成功')
        },
        fail: (exerciseErr) => {
          console.error('跳转练习页面也失败:', exerciseErr)
        }
      })
    }
  })
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

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.action-icon {
  font-size: 32rpx;
}

/* 课程卡片 */
.course-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 0 32rpx 32rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
}

.course-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.course-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.course-basic-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8rpx;
}

.course-subtitle {
  display: block;
  font-size: 24rpx;
  color: #636e72;
  margin-bottom: 16rpx;
}

.course-meta {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.course-level,
.course-duration,
.course-type {
  font-size: 20rpx;
  color: #ff7eb3;
  background: rgba(255, 126, 179, 0.1);
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.course-description {
  font-size: 24rpx;
  color: #636e72;
  line-height: 1.6;
}

/* 内容区域 */
.content-area {
  padding: 0 32rpx 120rpx;
}

/* 区块样式 */
.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 24rpx;
}

/* 学习目标 */
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.goal-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}

.goal-text {
  font-size: 24rpx;
  color: #636e72;
  line-height: 1.5;
}

/* 课程内容 */
.content-item {
  margin-bottom: 32rpx;
}

.content-item:last-child {
  margin-bottom: 0;
}

.content-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 16rpx;
}

.content-text {
  font-size: 24rpx;
  color: #636e72;
  line-height: 1.6;
}

/* 发音示例 */
.pronunciation-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background: rgba(255, 126, 179, 0.05);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 126, 179, 0.1);
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

/* 书写笔顺 */
.writing-guide {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.stroke-order {
  display: flex;
  gap: 24rpx;
  justify-content: center;
}

.stroke-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(255, 126, 179, 0.3);
}

.writing-tip {
  font-size: 24rpx;
  color: #636e72;
  text-align: center;
  line-height: 1.5;
}

/* 练习环节 */
.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.exercise-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: rgba(255, 126, 179, 0.05);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 126, 179, 0.1);
  transition: all 0.3s ease;
}

.exercise-item:active {
  transform: scale(0.98);
  background: rgba(255, 126, 179, 0.1);
}

.exercise-icon {
  font-size: 56rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8rpx;
}

.exercise-description {
  display: block;
  font-size: 22rpx;
  color: #636e72;
  line-height: 1.4;
}

.exercise-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #ff7eb3;
}

.action-text {
  font-size: 22rpx;
  font-weight: 600;
}

.action-arrow {
  font-size: 24rpx;
  font-weight: bold;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid rgba(255, 126, 179, 0.2);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.start-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  border-radius: 48rpx;
  box-shadow: 0 6rpx 24rpx rgba(255, 126, 179, 0.4);
  transition: all 0.3s ease;
}

.start-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(255, 126, 179, 0.5);
}

/* 动画效果 */
.motion-fade-up {
  opacity: 0;
  transform: translateY(40rpx);
  animation: fadeUp 0.6s ease forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .course-card,
  .section {
    padding: 24rpx;
    margin: 0 20rpx 24rpx;
  }
  
  .content-area {
    padding: 0 20rpx 100rpx;
  }
  
  .phonetic-character {
    font-size: 100rpx;
  }
  
  .phonetic-pinyin {
    font-size: 40rpx;
  }
}
</style>