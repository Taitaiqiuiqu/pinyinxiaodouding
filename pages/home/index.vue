<template>
  <view class="home-page">
    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayer" />
    <!-- 悬浮小球组件 -->
    <FloatingBall />
    <!-- 页面顶部 -->
    <view class="header">
      <text class="page-title">拼音学习乐园</text>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 功能模块卡片 -->
      <view class="module-grid">
        <!-- 拼音启蒙卡片 -->
        <view id="card1" class="module-card card-primary" @tap="navigateTo('/pages/phonics/index')" ref="card1">
          <view class="card-content">
            <Icon name="course" size="100rpx" color="#FFFFFF" />
            <text class="card-title">拼音启蒙</text>
            <text class="card-desc">拼音跟读、拼音儿歌</text>
          </view>
        </view>

        <!-- 游戏训练卡片 -->
        <view id="card2" class="module-card card-secondary" @tap="navigateTo('/pages/games/index')" ref="card2">
          <view class="card-content">
            <Icon name="game" size="100rpx" color="#FFFFFF" />
            <text class="card-title">游戏训练</text>
            <text class="card-desc">分龄游戏、寓教于乐</text>
          </view>
        </view>

        <!-- 手写练习卡片 -->
        <view id="card3" class="module-card card-tertiary" @tap="showComingSoon('手写练习')" ref="card3">
          <view class="card-content">
            <Icon name="write" size="100rpx" color="#FFFFFF" />
            <text class="card-title">手写练习</text>
            <text class="card-desc">拼音书写、笔顺练习</text>
          </view>
        </view>

        <!-- 家长设置卡片 -->
        <view id="card4" class="module-card card-quaternary" @tap="navigateTo('/pages/parent-settings/index')" ref="card4">
          <view class="card-content">
            <Icon name="parent" size="100rpx" color="#FFFFFF" />
            <text class="card-title">家长设置</text>
            <text class="card-desc">学习进度、使用时长</text>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text class="tip-text">点击卡片开始学习之旅 ✨</text>
      </view>
      
      <!-- 开发测试：重置引导流程按钮 -->
      <view class="dev-reset-btn" @tap="resetGuide">重置引导流程</view>
    </view>

    <!-- 新手引导遮罩层 -->
    <view v-if="showGuide" class="guide-overlay" @tap="isAudioPlaying ? null : nextGuideStep">
      <!-- 角色显示 - 根据step配置动态调整位置和大小 -->
      <view v-if="guideSteps[currentStep].type === 'fullscreen'" class="guide-fullscreen-role" :style="roleStyle">
        <RoleGuide :size="guideSteps[currentStep].rolePosition?.size || '240rpx'" emotion="welcome" />
      </view>
      
      <view :style="currentGuideStyle" class="guide-highlight"></view>
      
      <view :style="guideTextStyle" class="guide-text-box">
        <!-- 非全屏模式下，角色显示在文本框内 -->
        <view v-if="guideSteps[currentStep].type !== 'fullscreen'" class="guide-role">
          <RoleGuide size="120rpx" emotion="welcome" />
        </view>
        <text class="guide-title">{{ guideSteps[currentStep].title }}</text>
        <text class="guide-content">{{ guideSteps[currentStep].content }}</text>
        <view class="guide-controls">
          <view v-if="showSkip" class="guide-button skip-button" @tap.stop="skipGuide">跳过</view>
        </view>
      </view>
      
      <!-- 手势引导 - 非全屏模式下显示 -->
      <HandGuide 
        type="click" 
        :show="showGuide && guideSteps[currentStep].type === 'highlight'" 
        :position="handPosition" 
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import Icon from '../../src/components/Icon/Icon.vue';
import { useGlobalStore } from '../../src/store/global';
import HandGuide from '../../src/components/HandGuide/HandGuide.vue';
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue';
import RoleGuide from '../../src/components/RoleGuide/RoleGuide.vue';
import FloatingBall from '../../src/components/FloatingBall/FloatingBall.vue';

// 全局状态管理
const globalStore = useGlobalStore();

// 卡片引用
const card1 = ref<HTMLElement>();
const card2 = ref<HTMLElement>();
const card3 = ref<HTMLElement>();
const card4 = ref<HTMLElement>();

// 音频播放器引用
const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();

// 新手引导状态
const showGuide = ref(false);
const currentStep = ref(0);
const showSkip = ref(true);
const highlightRect = ref({ top: 0, left: 0, width: 0, height: 0 });
const handRect = ref({ top: 0, left: 0, width: 0, height: 0 });

// 引导步骤配置 - 文本与音频匹配
const guideSteps = [
  {
    title: '欢迎来到拼音世界',
    content: '小朋友，想不想和豆丁姐姐一起学习拼音呢？',
    target: 'none',
    type: 'fullscreen',
    rolePosition: { top: '30%', size: '240rpx' },
    position: { top: '50%', left: '50%' },
    audio: 'guide_home_welcome'
  },
  {
    title: '开始体验',
    content: '好的，让我们一起开始拼音启蒙之旅吧！',
    target: 'none',
    type: 'fullscreen',
    rolePosition: { top: '30%', size: '240rpx' },
    position: { top: '50%', left: '50%' },
    audio: 'guide_home_start'
  },
  {
    title: '课程学习',
    content: '小朋友，看向豆丁姐姐的手，这里是课程学习，里面有温柔的老师和好听的儿歌哦！',
    target: 'card1',
    type: 'highlight',
    rolePosition: { top: 'auto', bottom: '5%', size: '120rpx' },
    position: { top: '25%', left: '20%' },
    audio: 'guide_home_course'
  },
  {
    title: '游戏训练',
    content: '豆丁姐姐现在指的是游戏训练，不要玩太久哦，不然爸爸妈妈会担心的！',
    target: 'card2',
    type: 'highlight',
    rolePosition: { top: 'auto', bottom: '5%', size: '120rpx' },
    position: { top: '25%', left: '75%' },
    audio: 'guide_home_game'
  },
  {
    title: '手写练习',
    content: '最后这里是手写练习，快来尝试一下手写拼音吧！',
    target: 'card3',
    type: 'highlight',
    rolePosition: { top: 'auto', bottom: '5%', size: '120rpx' },
    position: { top: '70%', left: '20%' },
    audio: 'guide_home_write'
  }
];



// 动态获取元素位置
const updateHighlightRect = () => {
  const step = guideSteps[currentStep.value];
  
  if (step.type === 'highlight' && step.target !== 'none') {
    // 使用uni.createSelectorQuery动态获取元素位置
    const query = uni.createSelectorQuery();
    query.select(`#${step.target}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      if (res && res[0]) {
        const rect = res[0];
        const scrollTop = res[1] ? res[1].scrollTop : 0;
        
        const targetTop = rect.top + scrollTop;
        const targetLeft = rect.left;
        const targetWidth = rect.width;
        const targetHeight = rect.height;
        
        highlightRect.value = {
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight
        };
        
        // 小手引导位置：在卡片中心偏右下一点
        handRect.value = {
          top: targetTop + targetHeight * 0.6,
          left: targetLeft + targetWidth * 0.5,
          width: targetWidth,
          height: targetHeight
        };
      }
    });
  }
};

// 手势位置计算 - 使用动态计算的位置
const handPosition = computed(() => {
  const step = guideSteps[currentStep.value];
  
  if (step.type === 'highlight' && step.target !== 'none') {
    // 返回动态计算的位置（在小手中心）
    return {
      top: `${handRect.value.top}px`,
      left: `${handRect.value.left}px`
    };
  }
  
  // 默认位置（居中）
  return {
    top: '50%',
    left: '50%'
  };
});

// 引导高亮区域样式
const currentGuideStyle = computed(() => {
  const step = guideSteps[currentStep.value];
  
  // 全屏模式不显示高亮区域
  if (step.type === 'fullscreen') {
    return {
      display: 'none'
    };
  }
  
  return {
    position: 'absolute',
    top: `${highlightRect.value.top}px`,
    left: `${highlightRect.value.left}px`,
    width: `${highlightRect.value.width}px`,
    height: `${highlightRect.value.height}px`,
    borderRadius: '32rpx',
    background: 'transparent',
    // 精确高亮：区域完全透明，只保留边缘高亮
    boxShadow: `
      0 0 0 9999rpx rgba(0, 0, 0, 0.2),
      0 0 0 10rpx rgba(255, 255, 255, 1),
      0 0 60rpx 20rpx rgba(255, 255, 255, 0.7)
    `,
    zIndex: 9998,
    pointerEvents: 'none'
  };
});

// 角色位置样式
const roleStyle = computed(() => {
  const step = guideSteps[currentStep.value];
  const style: Record<string, any> = {};
  
  if (step.rolePosition) {
    if (step.rolePosition.top) {
      style.top = step.rolePosition.top;
    }
    if (step.rolePosition.bottom) {
      style.bottom = step.rolePosition.bottom;
    }
    if (step.rolePosition.left) {
      style.left = step.rolePosition.left;
    }
    if (step.rolePosition.right) {
      style.right = step.rolePosition.right;
    }
    if (step.rolePosition.size) {
      style.width = step.rolePosition.size;
      style.height = step.rolePosition.size;
    }
  }
  
  return style;
});

// 音频播放状态
const isAudioPlaying = ref(false);
const isAutoProgress = ref(true); // 是否自动进行下一步

// 播放引导音频
const playGuideAudio = (stepIndex: number, autoNext: boolean = true) => {
  const step = guideSteps[stepIndex];
  if (step && step.audio) {
    isAudioPlaying.value = true;
    isAutoProgress.value = autoNext;
    audioPlayer.value?.play({
      type: 'guide',
      file: step.audio,
      loop: false,
      onComplete: () => {
        isAudioPlaying.value = false;
        // 音频播放完成后，自动进入下一步或结束引导
        if (autoNext) {
          if (stepIndex < guideSteps.length - 1) {
            nextGuideStep();
          } else {
            // 最后一步，结束引导
            endGuide();
          }
        }
      }
    });
  } else {
    isAudioPlaying.value = false;
    if (autoNext) {
      if (stepIndex < guideSteps.length - 1) {
        nextGuideStep();
      } else {
        // 最后一步，结束引导
        endGuide();
      }
    }
  }
};

// 停止引导音频
const stopGuideAudio = () => {
  audioPlayer.value?.stop();
};

// 引导文本样式
const guideTextStyle = computed(() => {
  const step = guideSteps[currentStep.value];
  const isFullscreen = step.type === 'fullscreen';
  
  // 根据不同类型设置不同样式
  if (isFullscreen) {
    // 全屏模式：文本框位于屏幕中间，较大尺寸
    return {
      position: 'absolute',
      top: '70%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#FFFFFF',
      borderRadius: '32rpx',
      padding: '40rpx',
      boxShadow: '0 16rpx 48rpx rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      width: '85%',
      maxWidth: '720rpx'
    };
  } else {
    // 高亮模式：文本框位于屏幕底部，较小尺寸
    return {
      position: 'absolute',
      bottom: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#FFFFFF',
      borderRadius: '32rpx',
      padding: '24rpx',
      boxShadow: '0 16rpx 48rpx rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      width: '80%',
      maxWidth: '640rpx'
    };
  }
});

// 页面加载时检查用户状态
onLoad(() => {
  checkUserStatus();
});

// 页面挂载后检查是否需要显示新手引导
onMounted(() => {
  checkNewUser();
});

// 检查用户状态
const checkUserStatus = () => {
  // 如果没有openid，跳转到登录页
  if (!globalStore.openid) {
    const openid = uni.getStorageSync('openid');
    if (openid) {
      globalStore.setOpenId(openid);
    } else {
      uni.reLaunch({
        url: '/pages/login/index'
      });
    }
  }
};

// 检查是否为新用户，决定是否显示新手引导
const checkNewUser = () => {
  // 检查本地存储中是否有引导完成标记
  const hasCompletedGuide = uni.getStorageSync('hasCompletedGuide');
  if (!hasCompletedGuide) {
    // 延迟显示引导，让页面完全渲染
    setTimeout(() => {
      showGuide.value = true;
      // 更新高亮位置
      updateHighlightRect();
      // 播放第一个引导音频
      setTimeout(() => {
        playGuideAudio(currentStep.value);
      }, 500);
    }, 1000);
  }
};

// 下一步引导
const nextGuideStep = () => {
  if (currentStep.value < guideSteps.length - 1) {
    currentStep.value++;
    // 最后一步不显示跳过按钮
    if (currentStep.value === guideSteps.length - 1) {
      showSkip.value = false;
    }
    // 更新高亮位置
    updateHighlightRect();
    // 播放新步骤的音频
    playGuideAudio(currentStep.value);
  } else {
    // 结束引导
    endGuide();
  }
};

// 跳过引导
const skipGuide = () => {
  endGuide();
};

// 结束引导
const endGuide = () => {
  // 停止音频播放
  stopGuideAudio();
  // 隐藏引导界面
  showGuide.value = false;
  // 标记引导完成，下次不再显示
  uni.setStorageSync('hasCompletedGuide', 'true');
};

// 重置引导流程（开发测试用）
const resetGuide = () => {
  // 停止当前音频
  stopGuideAudio();
  // 清除本地存储的引导完成标记
  uni.removeStorageSync('hasCompletedGuide');
  // 重置引导状态
  currentStep.value = 0;
  showSkip.value = true;
  // 立即显示引导
  showGuide.value = true;
  
  // 更新高亮位置
  updateHighlightRect();
  
  // 播放第一个引导音频
  setTimeout(() => {
    playGuideAudio(currentStep.value);
  }, 500);
  
  // 提示重置成功
  uni.showToast({
    title: '引导流程已重置',
    icon: 'success',
    duration: 1500
  });
};

// 页面跳转
const navigateTo = (url: string) => {
  uni.navigateTo({
    url
  });
};

// 显示功能开发中提示
const showComingSoon = (moduleName: string) => {
  uni.showToast({
    title: `${moduleName}功能正在开发中，敬请期待！`,
    icon: 'none',
    duration: 2000
  });
};
</script>

<style scoped>
/* 页面基础样式 */
.home-page {
  min-height: 100vh;
  background: #FFB84D;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.home-page::before {
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

.home-page::after {
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

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-20rpx) rotate(-15deg); }
}

/* 左上角装饰元素浮动动画 */
@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

/* 页面头部 */
.header {
  padding: 60rpx 32rpx 40rpx;
  text-align: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 0 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 功能模块网格 */
.module-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
  width: 100%;
  max-width: 680rpx;
}

/* 模块卡片基础样式 */
.module-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

/* 卡片悬停效果 */
.module-card:active {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
  position: relative;
}

/* 卡片标题 */
.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-top: 20rpx;
  margin-bottom: 8rpx;
}

/* 卡片描述 */
.card-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  line-height: 1.5;
}

/* 卡片颜色变体 - 积木风格纯色 */
.card-primary {
  background: #FF476F;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.card-secondary {
  background: #FBBF24;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.card-tertiary {
  background: #3B82F6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.card-quaternary {
  background: #10B981;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
}

/* 底部提示 */
.bottom-tip {
  margin-top: 60rpx;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 16rpx 40rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 开发测试：重置引导流程按钮 */
.dev-reset-btn {
  margin-top: 20rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  border-radius: 20rpx;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1rpx dashed rgba(255, 255, 255, 0.4);
}

.dev-reset-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}
/* 新手引导遮罩层 */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9997;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 引导高亮区域 */
.guide-highlight {
  position: absolute;
  border-radius: 32rpx;
  pointer-events: none;
}

/* 引导文本框 */
.guide-text-box {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.3);
  z-index: 9999;
  width: 85%;
  max-width: 680rpx;
}

/* 角色图标容器 */
.guide-role {
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;
  animation: bounce 1.5s ease-in-out infinite;
}

/* 引导标题 */
.guide-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #FF476F;
  display: block;
  margin-bottom: 16rpx;
  text-align: center;
}

/* 角色图标弹跳动画 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 引导内容 */
.guide-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  display: block;
  margin-bottom: 32rpx;
  text-align: center;
}

/* 引导控制按钮区域 */
.guide-controls {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 20rpx;
}

/* 引导按钮基础样式 */
.guide-button {
  padding: 16rpx 32rpx;
  border-radius: 28rpx;
  font-size: 28rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
}

/* 跳过按钮样式 */
.skip-button {
  background: rgba(0, 0, 0, 0.1);
  color: #666666;
  border: 1rpx solid rgba(0, 0, 0, 0.2);
}

.skip-button:active {
  background: rgba(0, 0, 0, 0.2);
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 下一步/开始体验按钮样式 */
.next-button {
  background: #FF476F;
  color: #FFFFFF;
  border: 1rpx solid #FF476F;
}

.next-button:active {
  background: #E53E5F;
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(255, 71, 111, 0.3);
}
</style>
