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
    :class="{ 'guide-dimmed': highlightedCard }"
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

    <!-- 角色图与文字气泡 -->
    <view v-if="isGuideActive" class="guide-role">
      <image src="/static/images/role/role_idle.png" class="role-image" />
      <view v-if="showBubble" class="speech-bubble">
        <text class="bubble-text">{{ bubbleText }}</text>
      </view>
    </view>

    <!-- 小手引导 -->
    <view 
      v-if="isGuideActive && showHand" 
      class="guide-hand"
      :style="{ left: handPosition.x + 'px', top: handPosition.y + 'px' }"
    >
      <image src="/static/images/hand/hand_click.png" class="hand-image" />
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

<script>
import { useGlobalStore } from '../../src/store/global'
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue'

export default {
  components: {
    AudioPlayer
  },
  data() {
    return {
      // 基础模块数据
      allModules: [
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
      ],
      // 新手引导状态
      isGuideActive: true, // 是否显示引导
      canAutoPlay: false, // 是否可自动播放音频（需要用户交互解锁）
      currentStep: 0, // 当前引导步骤
      showBubble: false, // 是否显示文字气泡
      bubbleText: '', // 气泡文字内容
      highlightedCard: '', // 当前高亮卡片
      showHand: false, // 是否显示小手引导
      handPosition: { x: 0, y: 0 }, // 小手位置
      isLongPressing: false, // 是否长按状态
      longPressProgress: 0, // 长按进度
      longPressTimer: null, // 长按计时器
      guideSteps: [], // 动态引导步骤队列
      // 音频资源映射
      audioResources: {
        welcome: 'guide_home_welcome',
        good: 'guide_home_good',
        start: 'guide_home_start',
        course: 'guide_home_course',
        game: 'guide_home_game',
        write: 'guide_home_write'
      },
      // 文字气泡内容
      bubbleTexts: {
        welcome: '小朋友，欢迎来到拼音世界，想不想和豆丁姐姐一起学习拼音呢？',
        good: '豆丁姐姐早就知道了，你是个喜欢学习的好孩子',
        start: '先让豆丁姐姐给你介绍一下，如何进行学习吧',
        course: '小朋友，看向豆丁姐姐的手，豆丁姐姐现在指的是课程学习，里面既有温柔的老师，还有好听的儿歌，都在那里等着你哦！',
        game: '豆丁姐姐现在指的是游戏训练，希望你不要玩太长时间哦，不然爸爸妈妈，就不会再让你来找豆丁姐姐玩了！',
        write: '豆丁姐姐现在指的是手写训练，快来尝试一下手写拼音吧',
        finish: '现在，选择你想学习的内容吧！'
      },
      // 音频播放器引用（通过this.$refs访问，不需要在此声明）
    }
  },
  computed: {
    ageLevel() {
      const store = useGlobalStore()
      return store.ageLevel || 1
    },
    allModulesWithStatus() {
      return this.allModules.map(module => ({
        ...module,
        isUnlocked: this.ageLevel >= module.minAgeLevel
      }))
    }
  },
  onLoad() {
    this.checkUserStatus()
    this.initGuideSteps()
  },
  onShow() {
    this.checkUserStatus()
    // 页面显示时检查引导状态，但不自动开始（需要用户交互解锁）
    if (this.isGuideActive && this.currentStep === 0) {
      // 不自动开始，等待用户交互
      console.log('引导流程已准备就绪，等待用户交互解锁音频')
    }
  },
  onHide() {
    // 页面隐藏时停止引导
    this.stopGuide()
  },
  methods: {
    // 检查用户状态
    checkUserStatus() {
      const store = useGlobalStore()
      if (!store.openid) {
        uni.reLaunch({
          url: '/pages/login/index'
        })
        return
      }
      
      if (!store.ageLevel) {
        uni.reLaunch({
          url: '/pages/age-select/index'
        })
        return
      }
    },
    
    // 根据年龄初始化引导步骤
    initGuideSteps() {
      let steps = ['welcome', 'good', 'start', 'course', 'game']
      // 5-8岁用户添加手写练习步骤
      if (this.ageLevel >= 5) {
        steps.push('write')
      }
      // 移除finish步骤，因为没有对应的音频资源
      // steps.push('finish')
      this.guideSteps = steps
    },
    
    // 开始引导流程
    startGuide流程() {
      // 执行页面加载动画
      this.playPageEnterAnimation()
      
      // 延迟开始播放（等待页面动画完成）
      setTimeout(() => {
        this.playStepAudio(0)
      }, 1500)
    },
    
    // 处理用户首次交互（解锁音频）
    onFirstInteraction() {
      this.canAutoPlay = true
      // 开始引导流程
      this.startGuide流程()
    },
    
    // 播放页面进入动画
    playPageEnterAnimation() {
      // 这里可以添加页面进入动画逻辑
      console.log('页面进入动画播放完成')
    },
    
    // 播放指定步骤的音频
    playStepAudio(stepIndex) {
      if (stepIndex >= this.guideSteps.length) {
        this.finishGuide流程()
        return
      }
      
      const stepKey = this.guideSteps[stepIndex]
      const audioFile = this.audioResources[stepKey]
      
      console.log('[Guide] 开始播放步骤音频:', stepKey, '音频文件:', audioFile, 'audioPlayerRef:', this.audioPlayerRef)
      
      // 更新当前步骤
      this.currentStep = stepIndex
      
      // 处理当前步骤的视觉效果
      this.handleStepVisualEffect(stepKey)
      
      // 播放音频
      if (this.$refs.audioPlayerRef) {
        try {
          this.$refs.audioPlayerRef.play({
            type: 'guide',
            file: audioFile,
            loop: false,
            onComplete: () => {
              // 音频播放完成，进入下一步
              this.handleStepEnd(stepIndex)
            }
          })
          console.log('[Guide] 音频播放方法已调用')
        } catch (error) {
          console.error('[Guide] 音频播放失败:', error)
        }
      } else {
        console.error('[Guide] $refs.audioPlayerRef 不存在，无法播放音频')
      }
    },
    
    // 处理步骤对应的视觉效果
    handleStepVisualEffect(stepKey) {
      switch(stepKey) {
        case 'welcome':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.welcome
          this.highlightedCard = ''
          this.showHand = false
          break
        
        case 'good':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.good
          this.highlightedCard = ''
          this.showHand = false
          break
        
        case 'start':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.start
          this.showHand = true
          this.handPosition = this.calculateHandPosition('global')
          break
        
        case 'course':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.course
          this.highlightedCard = 'course'
          this.showHand = true
          this.handPosition = this.calculateHandPosition('course')
          break
        
        case 'game':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.game
          this.highlightedCard = 'game'
          this.showHand = true
          this.handPosition = this.calculateHandPosition('game')
          break
        
        case 'write':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.write
          this.highlightedCard = 'handwriting'
          this.showHand = true
          this.handPosition = this.calculateHandPosition('handwriting')
          break
        
        case 'finish':
          this.showBubble = true
          this.bubbleText = this.bubbleTexts.finish
          this.highlightedCard = ''
          this.showHand = false
          break
      }
    },
    
    // 计算小手位置
    calculateHandPosition(target) {
      // 实际项目中应根据元素布局计算坐标
      const positions = {
        global: { x: 100, y: 200 },
        course: { x: 150, y: 300 },
        game: { x: 350, y: 300 },
        handwriting: { x: 250, y: 450 }
      }
      return positions[target] || { x: 0, y: 0 }
    },
    
    // 处理步骤结束
    handleStepEnd(currentIndex) {
      // 隐藏文字气泡（2秒后）
      setTimeout(() => {
        this.showBubble = false
      }, 2000)
      
      // 播放下一步音频
      setTimeout(() => {
        this.playStepAudio(currentIndex + 1)
      }, 2500)
    },
    
    // 完成引导流程
    finishGuide流程() {
      // 显示结束提示
      this.showBubble = true
      this.bubbleText = this.bubbleTexts.finish
      this.highlightedCard = ''
      this.showHand = false
      
      // 延迟隐藏引导
      setTimeout(() => {
        this.isGuideActive = false
        this.showBubble = false
      }, 3000)
      
      console.log('引导流程完成')
    },
    
    // 停止引导
    stopGuide() {
      // 停止当前音频
      if (this.$refs.audioPlayerRef) {
        this.$refs.audioPlayerRef.stop()
        console.log('引导停止')
      }
      
      // 清除长按计时器
      if (this.longPressTimer) {
        clearInterval(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    
    // 长按开始
    onLongPressStart() {
      this.isLongPressing = true
      this.longPressProgress = 0
      
      // 启动长按进度计时器
      this.longPressTimer = setInterval(() => {
        if (this.longPressProgress >= 100) {
          // 长按完成，执行跳过
          this.skipGuide()
          clearInterval(this.longPressTimer)
          this.longPressTimer = null
          return
        }
        // 5秒完成100%进度
        this.longPressProgress += (100 / 50) // 每100ms增加2%
      }, 100)
    },
    
    // 长按结束
    onLongPressEnd() {
      this.isLongPressing = false
      if (this.longPressTimer) {
        clearInterval(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    
    // 跳过引导流程
    skipGuide() {
      // 停止当前引导
      this.stopGuide()
      
      // 快速完成引导
      this.finishGuide流程()
      
      this.isLongPressing = false
      this.longPressProgress = 0
    },
    
    // 处理模块点击
    handleModuleTap(module) {
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
  background-color: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

/* 角色图与文字气泡 */
.guide-role {
  position: fixed;
  top: 40rpx;
  right: 40rpx;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* 小手引导 */
.guide-hand {
  position: fixed;
  z-index: 999;
  animation: handBounce 1s ease-in-out infinite;
}

.hand-image {
  width: 100rpx;
  height: 100rpx;
  transform: rotate(15deg);
}

@keyframes handBounce {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-10rpx) rotate(15deg); }
}

/* 高亮卡片样式 */
.module-card.guide-highlight {
  transform: scale(1.1);
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 61, 0.3);
  border: 2rpx solid #ff6b3d;
  position: relative;
  z-index: 997;
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