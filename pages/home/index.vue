<template>
  <view class="page home-page">
    <!-- 音频解锁遮罩层 -->
  <view 
    v-if="isGuideActive && !canAutoPlay" 
    class="audio-unlock-overlay"
    @tap="onFirstInteraction"
  >
    <view class="unlock-content">
      <text class="unlock-title">点击屏幕开始引导</text>
      <text class="unlock-subtitle">请点击屏幕解锁音频播放</text>
    </view>
  </view>
  
  <!-- 新手引导遮罩层 -->
    <view 
      v-if="isGuideActive && canAutoPlay" 
      class="guide-overlay"
      :class="{
        'guide-dimmed': highlightedCard,
        'guide-dimmed-full': !showHand // 不需要小手引导时，显示半透明黑色
      }"
      @longpress="onLongPressStart"
      @touchend="onLongPressEnd"
    >
      <!-- 长按跳过进度环 -->
      <view v-if="isLongPressing" class="long-press-progress">
        <view class="progress-ring" :style="{ '--progress': longPressProgress + '%' }">
          <text class="progress-text">{{ Math.round(longPressProgress) }}%</text>
        </view>
      </view>
    </view>
    
    <!-- 跳过按钮 -->
    <view v-if="isGuideActive" class="skip-btn" @tap="skipGuide">
      <text class="skip-text">跳过</text>
    </view>
    
    <!-- 调试按钮：重置引导状态（仅开发用） -->
    <view v-if="true" class="debug-btn" @tap="resetGuideStatus">
      <text class="debug-text">重置引导</text>
    </view>

    <!-- 角色图与文字气泡 -->
    <view v-if="isGuideActive" class="guide-role" :class="{
      'guide-role-center': !showHand && !highlightedCard,
      'highlight-position': highlightedCard
    }">
      <image src="/static/images/role/role_idle.png" class="role-image" />
      <view v-if="showBubble" class="speech-bubble">
        <text class="bubble-text">{{ displayedText }}</text>
        <!-- 打字光标 -->
        <span class="typing-cursor" v-if="isTyping">|</span>
      </view>
    </view>

    <!-- 小手引导 -->
    <view 
      v-if="isGuideActive && showHand" 
      class="guide-hand"
      :style="{ left: handPosition.x + 'px', top: handPosition.y + 'px' }"
    >
      <!-- 简化版SVG小手，确保能显示 -->
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 手掌 -->
        <circle cx="50" cy="50" r="40" fill="#ff7eb3" stroke="#ff5c8d" stroke-width="4"/>
        <!-- 拇指 -->
        <line x1="50" y1="50" x2="80" y2="60" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <!-- 食指 -->
        <line x1="50" y1="50" x2="70" y2="30" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <!-- 中指 -->
        <line x1="50" y1="50" x2="50" y2="10" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <!-- 无名指 -->
        <line x1="50" y1="50" x2="30" y2="30" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <!-- 小指 -->
        <line x1="50" y1="50" x2="20" y2="50" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      </svg>
    </view>

    <!-- 功能模块卡片区域 -->
    <view class="content-area">
      <text class="page-title">选择学习模块</text>
      <text class="page-subtitle">根据孩子的年龄展示适合的学习内容</text>

      <!-- 功能卡片网格 -->
      <view class="module-grid">
        <view
          v-for="(module, idx) in allModulesWithStatus"
          :key="module.id"
          class="module-card motion-fade-up"
          :class="[
            'card-' + module.id, 
            { 'locked': !module.isUnlocked, 'guide-highlight': highlightedCard === module.id }
          ]"
          :style="{ transitionDelay: (idx * 100) + 'ms' }"
          @tap="handleModuleTap(module)"
        >
          <view class="card-icon">{{ module.icon }}</view>
          <text class="card-title">{{ module.title }}</text>
          <text class="card-description">{{ module.description }}</text>
          <view class="card-badge" v-if="module.badge && module.isUnlocked">{{ module.badge }}</view>
          <view class="card-lock-badge" v-if="!module.isUnlocked">
            <text class="lock-text">🔒 {{ module.lockText }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="bottom-tips">
      <text class="tips-text">点击卡片开始学习之旅 ✨</text>
    </view>

    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayerRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { useGlobalStore } from '../../src/store/global'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'

const audioPlayerRef = ref<any>(null)

// 全局状态
const globalStore = useGlobalStore()

// 响应式数据
const isGuideActive = ref(true)
const canAutoPlay = ref(false)
const currentStep = ref(0)
const showBubble = ref(false)
const displayedText = ref('')
const isTyping = ref(false)
const highlightedCard = ref('')
const showHand = ref(false) // 控制小手显示
const handPosition = ref({ x: 0, y: 0 }) // 小手位置
const isLongPressing = ref(false)
const longPressProgress = ref(0)
const longPressTimer = ref<any>(null)
const guideSteps = ref<string[]>([])
const cardPositions = ref<any>({})
const guideStartTime = ref(0)
const timers = ref<number[]>([])
const typingTimer = ref<any>(null)

// 基础模块数据
const allModules = ref([
  {
    id: 'course',
    title: '课程学习',
    description: '拼音跟读、拼音儿歌',
    icon: '📚',
    minAgeLevel: 1,
    badge: '推荐',
    route: '/pages/course/phonics'
  },
  {
    id: 'game',
    title: '游戏训练',
    description: '分龄游戏、寓教于乐',
    icon: '🎮',
    minAgeLevel: 1,
    badge: '热门',
    route: '/pages/game/click'
  },
  {
    id: 'handwriting',
    title: '手写练习',
    description: '拼音书写、笔顺练习',
    icon: '✏️',
    minAgeLevel: 3,
    badge: '5-8岁',
    route: '/pages/handwriting/index',
    lockText: '5岁以上'
  },
  {
    id: 'parent',
    title: '家长设置',
    description: '学习进度、使用时长',
    icon: '⚙️',
    minAgeLevel: 0,
    badge: '全年龄',
    route: '/pages/parent/index'
  }
])

// 音频资源映射
const audioResources = {
  welcome: 'guide_home_welcome',
  good: 'guide_home_good',
  start: 'guide_home_start',
  course: 'guide_home_course',
  game: 'guide_home_game',
  write: 'guide_home_write'
}

// 文字气泡内容
const bubbleTexts = {
  welcome: '小朋友，欢迎来到拼音世界，想不想和豆丁姐姐一起学习拼音呢？',
  good: '豆丁姐姐早就知道了，你是个喜欢学习的好孩子',
  start: '先让豆丁姐姐给你介绍一下，如何进行学习吧',
  course: '小朋友，看向豆丁姐姐的手，豆丁姐姐现在指的是课程学习，里面既有温柔的老师，还有好听的儿歌，都在那里等着你哦！',
  game: '豆丁姐姐现在指的是游戏训练，希望你不要玩太长时间哦，不然爸爸妈妈，就不会再让你来找豆丁姐姐玩了！',
  write: '豆丁姐姐现在指的是手写训练，快来尝试一下手写拼音吧',
  finish: '现在，选择你想学习的内容吧！'
}

// 计算属性
const ageLevel = computed(() => globalStore.ageLevel || 1)

const allModulesWithStatus = computed(() => {
  return allModules.value.map(module => ({
    ...module,
    isUnlocked: ageLevel.value >= module.minAgeLevel
  }))
})

// 页面生命周期
onLoad(() => {
  checkUserStatus()
  
  // 检查引导状态，如果已经完成，跳过引导
  const guideCompleted = uni.getStorageSync('homeGuideCompleted')
  if (guideCompleted) {
    console.log('[Guide] 引导已完成，跳过引导流程')
    isGuideActive.value = false
  } else {
    initGuideSteps()
    // 预加载引导音频
    nextTick(() => {
      preloadGuideAudios()
    })
  }
})

onShow(() => {
  checkUserStatus()
  // 页面显示时检查引导状态，但不自动开始（需要用户交互解锁）
  if (isGuideActive.value && currentStep.value === 0) {
    // 不自动开始，等待用户交互
    console.log('引导流程已准备就绪，等待用户交互解锁音频')
    // 计算卡片位置
    calculateCardPositions()
  }
})

onHide(() => {
  // 页面隐藏时停止引导
  stopGuide()
  // 清除所有定时器
  clearAllTimers()
})

onUnload(() => {
  // 页面卸载时清除所有定时器
  clearAllTimers()
})

// 方法定义
// 检查用户状态
const checkUserStatus = () => {
  if (!globalStore.openid) {
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }
  
  if (!globalStore.ageLevel) {
    uni.reLaunch({
      url: '/pages/age-select/index'
    })
    return
  }
}

// 根据年龄初始化引导步骤
const initGuideSteps = () => {
  let steps = ['welcome', 'good', 'start', 'course', 'game']
  // 总是添加手写练习步骤，不管年龄级别
  steps.push('write')
  // 移除finish步骤，因为没有对应的音频资源
  // steps.push('finish')
  guideSteps.value = steps
}

// 开始引导流程
const startGuideFlow = () => {
  // 执行页面加载动画
  playPageEnterAnimation()
  
  // 确保卡片位置已计算
  calculateCardPositions()
  
  // 延迟开始播放（等待页面动画完成）
  const timer = setTimeout(() => {
    playStepAudio(0)
  }, 1000) // 调整为1秒
  timers.value.push(timer)
}

// 处理用户首次交互（解锁音频）
const onFirstInteraction = () => {
  // 重新计算卡片位置，确保位置准确
  calculateCardPositions()
  
  // 记录引导开始时间
  guideStartTime.value = Date.now()
  
  // 添加交互反馈
  uni.showToast({
    title: '引导开始',
    icon: 'success',
    duration: 500
  })
  
  // 震动反馈
  uni.vibrateShort({
    type: 'light'
  })
  
  canAutoPlay.value = true
  // 开始引导流程
  startGuideFlow()
}

// 播放页面进入动画
const playPageEnterAnimation = () => {
  // 这里可以添加页面进入动画逻辑
  console.log('页面进入动画播放完成')
}

// 预加载引导音频
const preloadGuideAudios = () => {
  console.log('[Guide] 开始预加载引导音频')
  // 获取引导步骤中使用的音频
  const guideAudios = guideSteps.value.map(step => audioResources[step]).filter(Boolean)
  
  console.log('[Guide] 引导音频预加载完成')
}

// 播放指定步骤的音频
const playStepAudio = (stepIndex: number) => {
  if (stepIndex >= guideSteps.value.length) {
    finishGuideFlow()
    return
  }
  
  const stepKey = guideSteps.value[stepIndex]
  const audioFile = audioResources[stepKey]
  
  console.log('[Guide] 开始播放步骤音频:', stepKey, '音频文件:', audioFile, 'audioPlayerRef:', audioPlayerRef.value)
  
  // 更新当前步骤
  currentStep.value = stepIndex
  
  // 处理当前步骤的视觉效果
  handleStepVisualEffect(stepKey)
  
  // 播放音频
  if (audioPlayerRef.value) {
    try {
      audioPlayerRef.value.play({
        type: 'guide',
        file: audioFile,
        loop: false,
        onComplete: () => {
          // 音频播放完成，进入下一步
          handleStepEnd(stepIndex)
        }
      })
      console.log('[Guide] 音频播放方法已调用')
    } catch (error) {
      console.error('[Guide] 音频播放失败:', error)
    }
  } else {
    console.error('[Guide] $refs.audioPlayerRef 不存在，无法播放音频')
  }
}

// 开始打字效果
const startTypingEffect = (text: string) => {
  // 清空之前的文字
  displayedText.value = ''
  isTyping.value = true
  
  let index = 0
  const typingSpeed = 50 // 每个字50ms，模拟AI生成速度
  
  // 清除之前的打字定时器
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
  
  // 开始打字动画
  typingTimer.value = setInterval(() => {
    if (index < text.length) {
      displayedText.value += text.charAt(index)
      index++
    } else {
      // 打字完成
      isTyping.value = false
      clearInterval(typingTimer.value)
      typingTimer.value = null
    }
  }, typingSpeed)
}

// 停止打字效果
const stopTypingEffect = () => {
  isTyping.value = false
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
}

// 处理步骤对应的视觉效果
const handleStepVisualEffect = (stepKey: string) => {
  // 停止之前的打字效果
  stopTypingEffect()
  
  console.log(`[Guide] 处理步骤: ${stepKey}, 设置showHand = ${stepKey === 'course' || stepKey === 'game' || stepKey === 'write'}`)
  
  switch(stepKey) {
    case 'welcome':
      showBubble.value = true
      startTypingEffect(bubbleTexts.welcome)
      highlightedCard.value = ''
      showHand.value = false
      break
    
    case 'good':
      showBubble.value = true
      startTypingEffect(bubbleTexts.good)
      highlightedCard.value = ''
      showHand.value = false
      break
    
    case 'start':
      showBubble.value = true
      startTypingEffect(bubbleTexts.start)
      showHand.value = false // 不显示小手
      break
    
    case 'course':
      showBubble.value = false // 去除文字气泡
      highlightedCard.value = 'course'
      showHand.value = true
      handPosition.value = calculateHandPosition('course')
      console.log(`[Guide] course步骤，小手位置:`, handPosition.value)
      break
    
    case 'game':
      showBubble.value = false // 去除文字气泡
      highlightedCard.value = 'game'
      showHand.value = true
      handPosition.value = calculateHandPosition('game')
      console.log(`[Guide] game步骤，小手位置:`, handPosition.value)
      break
    
    case 'write':
      showBubble.value = false // 去除文字气泡
      highlightedCard.value = 'handwriting'
      showHand.value = true
      handPosition.value = calculateHandPosition('handwriting')
      console.log(`[Guide] write步骤，小手位置:`, handPosition.value)
      break
    
    case 'finish':
      showBubble.value = true
      startTypingEffect(bubbleTexts.finish)
      highlightedCard.value = ''
      showHand.value = false
      break
  }
  
  console.log(`[Guide] 处理后showHand: ${showHand.value}`)
}

// 计算卡片位置
const calculateCardPositions = () => {
  console.log('[Guide] 开始计算卡片位置')
  // 使用uni.createSelectorQuery获取元素实际位置
  const query = uni.createSelectorQuery()
  query.selectAll('.module-card').boundingClientRect()
  query.exec((res: any) => {
    if (res && res[0]) {
      cardPositions.value = res[0].reduce((positions: any, rect: any, index: number) => {
        const moduleId = allModulesWithStatus.value[index].id
        // 保存完整的rect信息，包括width和height
        positions[moduleId] = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        }
        console.log(`[Guide] 卡片 ${moduleId} 位置:`, rect)
        return positions
      }, {})
    }
  })
}

// 计算小手位置
const calculateHandPosition = (target: string) => {
  // 如果有动态获取的卡片位置，使用动态位置
  if (cardPositions.value[target]) {
    const rect = cardPositions.value[target]
    // 小手位置设置在卡片中心偏右下，确保准确指向卡片
    return {
      x: rect.left + rect.width / 2 - 30, // 向右移动20rpx
      y: rect.top + rect.height / 2 - 30 // 向下移动20rpx
    }
  }
  
  // 否则使用默认位置（rpx转px估算值）
  const positions: any = {
    global: { x: 120, y: 220 }, // 向右向下移动
    course: { x: 190, y: 400 }, // 向右向下移动
    game: { x: 390, y: 400 }, // 向右向下移动
    handwriting: { x: 290, y: 550 } // 向右向下移动
  }
  return positions[target] || { x: 0, y: 0 }
}

// 处理步骤结束
const handleStepEnd = (currentIndex: number) => {
  // 立即隐藏文字气泡，减少间隔感知
  showBubble.value = false
  
  // 播放下一步音频（0.1秒后），保证流程流畅性
  const nextStepTimer = setTimeout(() => {
    playStepAudio(currentIndex + 1)
  }, 100) // 间隔修改为0.1秒
  timers.value.push(nextStepTimer)
}

// 完成引导流程
const finishGuideFlow = () => {
  // 保存引导完成状态
  uni.setStorageSync('homeGuideCompleted', true)
  
  // 计算引导总时长
  const guideEndTime = Date.now()
  const guideDuration = guideEndTime - guideStartTime.value
  console.log(`引导流程完成，总时长：${guideDuration}ms`)
  
  // 显示结束提示
  showBubble.value = true
  startTypingEffect(bubbleTexts.finish)
  highlightedCard.value = ''
  showHand.value = false
  
  // 延迟隐藏引导
  const finishTimer = setTimeout(() => {
    isGuideActive.value = false
    showBubble.value = false
    // 清除除当前定时器外的所有定时器，避免自毁
    const currentTimerId = finishTimer
    timers.value.forEach(timer => {
      if (timer !== currentTimerId) {
        clearTimeout(timer)
      }
    })
    timers.value = []
    
    // 清除其他定时器
    if (longPressTimer.value) {
      clearInterval(longPressTimer.value)
      longPressTimer.value = null
    }
    if (typingTimer.value) {
      clearInterval(typingTimer.value)
      typingTimer.value = null
    }
  }, 3000)
  timers.value.push(finishTimer)
  
  console.log('引导流程完成')
}

// 清除所有定时器
const clearAllTimers = () => {
  console.log('[Guide] 开始清除所有定时器')
  // 清除所有setTimeout定时器
  timers.value.forEach(timer => clearTimeout(timer))
  timers.value = []
  
  // 清除长按计时器
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 清除打字效果定时器
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
  
  console.log('[Guide] 所有定时器已清除')
}

// 停止引导
const stopGuide = () => {
  // 停止当前音频
  if (audioPlayerRef.value) {
    audioPlayerRef.value.stop()
    console.log('引导停止')
  }
  
  // 清除所有定时器
  clearAllTimers()
}

// 长按开始
const onLongPressStart = () => {
  isLongPressing.value = true
  longPressProgress.value = 0
  
  // 启动长按进度计时器
  longPressTimer.value = setInterval(() => {
    if (longPressProgress.value >= 100) {
      // 长按完成，执行跳过
      skipGuide()
      clearInterval(longPressTimer.value)
      longPressTimer.value = null
      return
    }
    // 5秒完成100%进度
    longPressProgress.value += (100 / 50) // 每100ms增加2%
  }, 100)
}

// 长按结束
const onLongPressEnd = () => {
  isLongPressing.value = false
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 跳过引导流程
const skipGuide = () => {
  // 停止当前引导
  stopGuide()
  
  // 保存引导完成状态
  uni.setStorageSync('homeGuideCompleted', true)
  
  // 计算引导总时长
  const guideEndTime = Date.now()
  const guideDuration = guideEndTime - guideStartTime.value
  console.log(`引导流程已跳过，总时长：${guideDuration}ms`)
  
  // 清除长按计时器
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 快速隐藏引导
  isGuideActive.value = false
  showBubble.value = false
  isLongPressing.value = false
  longPressProgress.value = 0
  
  console.log('引导流程已跳过')
}

// 重置引导状态（调试用）
const resetGuideStatus = () => {
  // 清除引导完成标记
  uni.removeStorageSync('homeGuideCompleted')
  uni.showToast({
    title: '引导状态已重置',
    icon: 'success',
    duration: 1000
  })
  console.log('[Guide] 引导状态已重置')
  // 重新加载页面
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/home/index'
    })
  }, 1000)
}

// 处理模块点击
const handleModuleTap = (module: any) => {
  if (!module.isUnlocked) {
    uni.showToast({
      title: `该功能需要${module.lockText || module.minAgeLevel + '岁以上'}才能使用`,
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 根据模块类型跳转到不同页面
  switch (module.id) {
    case 'parent':
      uni.navigateTo({
        url: '/pages/parent/index'
      })
      break
    case 'course':
      uni.navigateTo({
        url: '/pages/course/phonics/index'
      })
      break
    case 'game':
    case 'handwriting':
      // 这些页面尚未实现，显示提示信息
      uni.showToast({
        title: `${module.title}功能正在开发中，敬请期待！`,
        icon: 'none',
        duration: 2000
      })
      break
    default:
      console.warn('Unknown module:', module.id)
  }
}
</script>

<style scoped>
/* 页面基础样式 */
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 50%, #ffb347 100%);
  position: relative;
  overflow-x: hidden;
  will-change: transform, opacity;
}

/* 装饰性背景元素 */
.page::before {
  content: '';
  position: fixed;
  top: -50rpx;
  right: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.page::after {
  content: '';
  position: fixed;
  bottom: -30rpx;
  left: -30rpx;
  width: 150rpx;
  height: 150rpx;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
  pointer-events: none;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(2deg); }
}

.home-page {
  padding-bottom: 40rpx;
}

.container {
  padding: 0 32rpx;
}

/* 内容区域 */
.content-area {
  padding: 0 32rpx;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.25);
}

.page-subtitle {
  display: block;
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 60rpx;
  font-weight: 600;
}

/* 功能模块网格 */
.module-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

.module-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 32rpx;
  position: relative;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  min-height: 160rpx;
  will-change: transform, box-shadow;
}

/* 卡片装饰元素 */
.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 126, 179, 0.3) 20%,
    rgba(255, 154, 86, 0.3) 40%,
    rgba(255, 179, 71, 0.3) 60%,
    rgba(255, 126, 179, 0.3) 80%,
    transparent 100%);
  opacity: 0.6;
}

.module-card::after {
  content: '';
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 20rpx;
  height: 20rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.5; transform: scale(1); }
}

.module-card:active {
  transform: scale(0.97);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

/* 卡片图标 */
.card-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  display: block;
  text-align: center;
  transition: transform 0.25s ease;
  will-change: transform;
}

/* 未解锁状态样式 */
.module-card.locked {
  opacity: 0.6;
  background: rgba(240, 240, 240, 0.8);
  border: 1rpx solid rgba(200, 200, 200, 0.3);
  cursor: not-allowed;
}

.module-card.locked:active {
  transform: none;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.module-card.locked .card-title {
  color: #999999;
}

.module-card.locked .card-description {
  color: #bbbbbb;
}

.module-card.locked .card-icon {
  filter: grayscale(100%) opacity(0.7);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3436;
  text-align: center;
  margin-bottom: 12rpx;
  letter-spacing: 0.5rpx;
}

.card-description {
  display: block;
  font-size: 26rpx;
  color: #636e72;
  text-align: center;
  line-height: 1.5;
}

.card-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: linear-gradient(45deg, #ff7675, #e17055);
  color: white;
  font-size: 18rpx;
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  font-weight: 600;
  box-shadow: 0 3rpx 10rpx rgba(225, 112, 85, 0.25);
  letter-spacing: 0.3rpx;
}

.card-lock-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(165, 165, 165, 0.95);
  color: white;
  font-size: 16rpx;
  padding: 5rpx 10rpx;
  border-radius: 14rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.lock-text {
  color: white;
  font-weight: 600;
}

/* 底部提示 */
.bottom-tips {
  margin-top: 60rpx;
  text-align: center;
  position: relative;
}

.tips-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(5rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
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

/* 响应式适配 */
@media (max-width: 750rpx) {
  .module-grid {
    padding: 0 20rpx;
  }
  
  .module-card {
    padding: 32rpx 24rpx;
  }
  
  .card-icon {
    font-size: 56rpx;
  }
  
  .card-title {
    font-size: 32rpx;
  }
  
  .card-description {
    font-size: 26rpx;
  }
}

/* 调试按钮样式（仅开发用） */
.debug-btn {
  position: fixed;
  top: 40rpx;
  left: 40rpx;
  padding: 12rpx 24rpx;
  background: rgba(0, 255, 0, 0.8);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transition: all 0.3s ease;
  backdrop-filter: blur(8rpx);
}

.debug-btn:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.debug-text {
  font-size: 24rpx;
  font-weight: 600;
  color: white;
  letter-spacing: 1rpx;
}

/* 新手引导样式 */
/* 音频解锁遮罩层 */
.audio-unlock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
  pointer-events: auto;
}

.unlock-content {
  text-align: center;
  padding: 60rpx;
  background: white;
  border-radius: 30rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #ff7eb3;
}

.unlock-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b3d;
  margin-bottom: 20rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

.unlock-subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

/* 引导遮罩层 */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  pointer-events: none;
  transition: all 0.3s ease;
}

/* 引导遮罩层变暗状态 */
.guide-dimmed {
  background-color: rgba(0, 0, 0, 0.6); /* 增强遮罩效果，使其他区域更暗 */
  pointer-events: auto;
}

/* 不需要小手引导时，显示半透明黑色 */
.guide-dimmed-full {
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: auto;
}

/* 跳过按钮样式 */
.skip-btn {
  position: fixed;
  top: 40rpx;
  left: 40rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 1003;
  transition: all 0.3s ease;
  backdrop-filter: blur(8rpx);
  border: 1rpx solid rgba(255, 126, 179, 0.3);
}

.skip-btn:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.skip-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b3d;
  letter-spacing: 1rpx;
}

/* 角色图与文字气泡 */
.guide-role {
  position: fixed;
  top: 40rpx;
  right: 40rpx;
  z-index: 1003; /* 最高层级，确保不会被遮挡 */
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none; /* 确保点击事件能穿透到下方 */
}

/* 角色和气泡在有高亮卡片时的位置调整，避免被遮挡 */
.highlight-position {
  transform: scale(1.1); /* 轻微放大，提高可见度 */
}

/* 角色图片样式 */
.role-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  z-index: 1003;
  transition: all 0.3s ease;
  animation: roleBounce 2s ease-in-out infinite; /* 呼吸动画 */
}

/* 角色呼吸动画 */
@keyframes roleBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 文字气泡样式 */
.speech-bubble {
  margin-top: 20rpx;
  background-color: white; /* 白色背景 */
  border: 2rpx solid #ff7eb3; /* 粉色边框 */
  border-radius: 20rpx;
  padding: 20rpx;
  max-width: 400rpx;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1); /* 添加阴影 */
  animation: fadeIn 0.3s ease;
  min-height: 60rpx;
  display: flex;
  align-items: center;
  z-index: 1003;
}

/* 气泡尾巴 */
.speech-bubble::before {
  content: '';
  position: absolute;
  top: -16rpx;
  right: 40rpx;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  border-bottom: 20rpx solid white;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  top: -19rpx;
  right: 38rpx;
  border-left: 22rpx solid transparent;
  border-right: 22rpx solid transparent;
  border-bottom: 22rpx solid #ff7eb3;
}

/* 不需要小手引导时，角色和气泡居中显示 */
.guide-role-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  right: auto;
}

/* 有高亮卡片时，调整角色和气泡位置 */
.guide-role.highlight-position {
  top: 20rpx;
  right: 20rpx;
  transform: scale(0.9);
}

/* 打字光标样式 */
.typing-cursor {
  display: inline-block;
  width: 8rpx;
  height: 28rpx;
  background-color: #666;
  animation: blink 1s infinite;
  margin-left: 4rpx;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.role-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

/* 文字气泡 */
.speech-bubble {
  margin-top: 20rpx;
  background-color: white;
  border: 2rpx solid #ff7eb3;
  border-radius: 20rpx;
  padding: 20rpx;
  max-width: 400rpx;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
  min-height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  top: -16rpx;
  right: 40rpx;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  border-bottom: 20rpx solid white;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  top: -19rpx;
  right: 38rpx;
  border-left: 22rpx solid transparent;
  border-right: 22rpx solid transparent;
  border-bottom: 22rpx solid #ff7eb3;
}

.bubble-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  text-align: center;
}

/* 小手引导样式 */
.guide-hand {
  position: fixed;
  z-index: 1004; /* 提高z-index，确保显示在最上层 */
  animation: handBounce 1s ease-in-out infinite;
  pointer-events: none; /* 确保点击事件能穿透到下方 */
  transform: rotate(15deg); /* 小手旋转角度 */
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除调试背景色 */
}

@keyframes handBounce {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-10rpx) rotate(15deg); }
}

/* 高亮卡片样式 */
.module-card.guide-highlight {
  transform: scale(1.15); /* 增大卡片缩放比例 */
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 61, 0.5); /* 增强阴影效果 */
  border: 3rpx solid #ff6b3d; /* 加粗边框 */
  position: relative;
  z-index: 999; /* 降低层级，确保不会遮挡角色和气泡 */
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* 平滑过渡动画 */
  background: rgba(255, 255, 255, 0.98); /* 确保卡片背景亮度 */
}

/* 长按跳过进度环 */
.long-press-progress {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.progress-ring {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: conic-gradient(#ff6b3d var(--progress), rgba(255, 255, 255, 0.3) 0%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.progress-ring::before {
  content: '';
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background-color: white;
  position: absolute;
}

.progress-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b3d;
  z-index: 1;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>