<template>
  <view class="parent-settings-page">
    <!-- 音频播放器组件 -->
    <AudioPlayer ref="audioPlayer" />
    
    <!-- 验证弹窗 -->
    <view v-if="showVerificationModal" class="verification-modal">
      <view class="modal-overlay" @tap="closeVerificationModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">家长验证</text>
          <view class="modal-close" @tap="closeVerificationModal">
            <Icon name="close" size="48rpx" color="#999999" />
          </view>
        </view>
        <view class="modal-body">
          <text class="question-text">AI大模型底层使用哪种编程语言？</text>
          <input 
            type="text" 
            v-model="verificationAnswer" 
            class="answer-input" 
            placeholder="请输入答案"
            @confirm="verifyAnswer"
          />
          <text class="hint-text">提示：可以自行去搜索引擎搜索</text>
          <view v-if="verificationError" class="error-message">
            <Icon name="warning" size="32rpx" color="#FF476F" />
            <text class="error-text">答案错误，请重试</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeVerificationModal">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn btn-confirm" @tap="verifyAnswer">
            <text class="btn-text">确认</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 页面顶部 -->
    <view class="header">
      <text class="page-title">家长设置</text>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 设置项列表 -->
      <view class="settings-list">
        <!-- 学习进度 -->
        <view class="setting-item" @tap="navigateToLearningProgress">
          <view class="setting-icon">
            <Icon name="progress" size="64rpx" color="#FF476F" />
          </view>
          <view class="setting-info">
            <text class="setting-title">学习进度</text>
            <text class="setting-desc">查看孩子的学习情况</text>
          </view>
          <view class="setting-arrow">
            <Icon name="arrow-right" size="48rpx" color="#999999" />
          </view>
        </view>

        <!-- 使用时长 -->
        <view class="setting-item" @tap="navigateToUsageTime">
          <view class="setting-icon">
            <Icon name="clock" size="64rpx" color="#FBBF24" />
          </view>
          <view class="setting-info">
            <text class="setting-title">使用时长</text>
            <text class="setting-desc">设置每日使用时间限制</text>
          </view>
          <view class="setting-arrow">
            <Icon name="arrow-right" size="48rpx" color="#999999" />
          </view>
        </view>

        <!-- 学习内容 -->
        <view class="setting-item" @tap="navigateToLearningContent">
          <view class="setting-icon">
            <Icon name="book" size="64rpx" color="#3B82F6" />
          </view>
          <view class="setting-info">
            <text class="setting-title">学习内容</text>
            <text class="setting-desc">选择适合孩子的学习内容</text>
          </view>
          <view class="setting-arrow">
            <Icon name="arrow-right" size="48rpx" color="#999999" />
          </view>
        </view>

        <!-- 学习报告 -->
        <view class="setting-item" @tap="navigateToLearningReport">
          <view class="setting-icon">
            <Icon name="chart" size="64rpx" color="#8B5CF6" />
          </view>
          <view class="setting-info">
            <text class="setting-title">学习报告</text>
            <text class="setting-desc">查看周报和月报</text>
          </view>
          <view class="setting-arrow">
            <Icon name="arrow-right" size="48rpx" color="#999999" />
          </view>
        </view>

        <!-- 通知设置 -->
        <view class="setting-item" @tap="toggleNotification">
          <view class="setting-icon">
            <Icon name="bell" size="64rpx" color="#10B981" />
          </view>
          <view class="setting-info">
            <text class="setting-title">通知设置</text>
            <text class="setting-desc">接收学习报告和提醒</text>
          </view>
          <view class="setting-switch">
            <switch :checked="notificationEnabled" @change="onNotificationChange" color="#FF476F" />
          </view>
        </view>

        <!-- 关于我们 -->
        <view class="setting-item" @tap="navigateToAbout">
          <view class="setting-icon">
            <Icon name="info" size="64rpx" color="#8B5CF6" />
          </view>
          <view class="setting-info">
            <text class="setting-title">关于我们</text>
            <text class="setting-desc">了解拼音小豆豆</text>
          </view>
          <view class="setting-arrow">
            <Icon name="arrow-right" size="48rpx" color="#999999" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import Icon from '../../src/components/Icon/Icon.vue';
import { useGlobalStore } from '../../src/store/global';
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue';

// 全局状态管理
const globalStore = useGlobalStore();

// 音频播放器引用
const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();

// 设置项状态
const notificationEnabled = ref(true);

// 验证相关状态
const showVerificationModal = ref(false);
const verificationAnswer = ref('');
const verificationError = ref(false);
const isVerified = ref(false);
const pendingAction = ref<(() => void) | null>(null);

// 页面加载时检查用户状态
onLoad(() => {
  checkUserStatus();
  loadSettings();
});

// 页面挂载后初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
});

// 检查用户状态
const checkUserStatus = () => {
  if (!globalStore.openid) {
    uni.reLaunch({
      url: '/pages/login/index'
    });
  }
};

// 加载设置
const loadSettings = () => {
  notificationEnabled.value = globalStore.notificationEnabled;
  isVerified.value = globalStore.parentVerified;
};

// 显示验证弹窗
const showVerification = (action: () => void) => {
  if (isVerified.value) {
    action();
    return;
  }
  
  pendingAction.value = action;
  showVerificationModal.value = true;
  verificationAnswer.value = '';
  verificationError.value = false;
};

// 关闭验证弹窗
const closeVerificationModal = () => {
  showVerificationModal.value = false;
  verificationAnswer.value = '';
  verificationError.value = false;
  pendingAction.value = null;
};

// 验证答案
const verifyAnswer = () => {
  const answer = verificationAnswer.value.trim().toLowerCase();
  if (answer === 'python') {
    verificationError.value = false;
    isVerified.value = true;
    globalStore.setParentVerified(true);
    showVerificationModal.value = false;
    uni.showToast({
      title: '验证成功',
      icon: 'success',
      duration: 1500
    });
    
    // 执行待处理的操作
    if (pendingAction.value) {
      pendingAction.value();
      pendingAction.value = null;
    }
  } else {
    verificationError.value = true;
    uni.showToast({
      title: '答案错误',
      icon: 'none',
      duration: 1500
    });
  }
};

// 导航到学习进度页面
const navigateToLearningProgress = () => {
  showVerification(() => {
    uni.navigateTo({
      url: '/pages/learning-progress/index'
    });
  });
};

// 导航到使用时长页面
const navigateToUsageTime = () => {
  showVerification(() => {
    uni.navigateTo({
      url: '/pages/usage-time/index'
    });
  });
};

// 导航到学习内容页面
const navigateToLearningContent = () => {
  showVerification(() => {
    uni.navigateTo({
      url: '/pages/learning-content/index'
    });
  });
};

// 导航到学习报告页面
const navigateToLearningReport = () => {
  showVerification(() => {
    uni.navigateTo({
      url: '/pages/learning-report/index'
    });
  });
};

// 切换通知设置
const toggleNotification = () => {
  showVerification(() => {
    notificationEnabled.value = !notificationEnabled.value;
    globalStore.setNotificationEnabled(notificationEnabled.value);
    
    uni.showToast({
      title: notificationEnabled.value ? '通知已开启' : '通知已关闭',
      icon: 'success',
      duration: 1500
    });
  });
};

// 通知设置变化处理
const onNotificationChange = (e: any) => {
  const value = e.detail.value;
  notificationEnabled.value = value;
  globalStore.setNotificationEnabled(value);
  
  uni.showToast({
    title: value ? '通知已开启' : '通知已关闭',
    icon: 'success',
    duration: 1500
  });
};

// 导航到关于我们页面
const navigateToAbout = () => {
  uni.showToast({
    title: '关于我们功能正在开发中，敬请期待！',
    icon: 'none',
    duration: 2000
  });
};
</script>

<style scoped>
/* 页面基础样式 */
.parent-settings-page {
  min-height: 100vh;
  background: #FF476F;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.parent-settings-page::before {
  content: '';
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FBBF24;
  border-radius: 24rpx;
  transform: rotate(15deg);
  z-index: 0;
  animation: float-left 8s ease-in-out infinite reverse;
}

.parent-settings-page::after {
  content: '';
  position: absolute;
  bottom: 40rpx;
  left: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: #3B82F6;
  border-radius: 24rpx;
  transform: rotate(-10deg);
  z-index: 0;
  animation: float 6s ease-in-out infinite;
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
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* 设置项列表 */
.settings-list {
  width: 100%;
  max-width: 680rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 设置项基础样式 - 积木风格卡片 */
.setting-item {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: #FFFFFF;
  border: 8rpx solid #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 12rpx 0 #E5E5E5;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

/* 设置项点击效果 */
.setting-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 8rpx 0 #E5E5E5;
}

/* 设置项图标 */
.setting-icon {
  margin-right: 32rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 71, 111, 0.1);
  border-radius: 20rpx;
}

/* 设置项信息 */
.setting-info {
  flex: 1;
}

/* 设置项标题 */
.setting-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

/* 设置项描述 */
.setting-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

/* 设置项箭头 */
.setting-arrow {
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 设置项开关 */
.setting-switch {
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 设置项颜色变体 - 积木风格纯色 */
.setting-item:nth-child(1) {
  background: #FF476F;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.setting-item:nth-child(1) .setting-title,
.setting-item:nth-child(1) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(1) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

.setting-item:nth-child(2) {
  background: #FBBF24;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.setting-item:nth-child(2) .setting-title,
.setting-item:nth-child(2) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(2) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

.setting-item:nth-child(3) {
  background: #3B82F6;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.setting-item:nth-child(3) .setting-title,
.setting-item:nth-child(3) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(3) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

.setting-item:nth-child(4) {
  background: #10B981;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #059669;
}

.setting-item:nth-child(4) .setting-title,
.setting-item:nth-child(4) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(4) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

.setting-item:nth-child(5) {
  background: #8B5CF6;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #7C3AED;
}

.setting-item:nth-child(5) .setting-title,
.setting-item:nth-child(5) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(5) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

.setting-item:nth-child(6) {
  background: #8B5CF6;
  border-color: #FFFFFF;
  box-shadow: 0 12rpx 0 #7C3AED;
}

.setting-item:nth-child(6) .setting-title,
.setting-item:nth-child(6) .setting-desc {
  color: #FFFFFF;
}

.setting-item:nth-child(6) .setting-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* 验证弹窗样式 */
.verification-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 640rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
}

.modal-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F5F5F5;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.question-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.6;
}

.answer-input {
  width: 100%;
  padding: 24rpx;
  background: #F5F5F5;
  border: 2rpx solid #E0E0E0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333333;
}

.answer-input:focus {
  border-color: #FF476F;
  outline: none;
}

.hint-text {
  font-size: 24rpx;
  color: #999999;
  font-style: italic;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #FFF0F0;
  border-radius: 12rpx;
  border-left: 4rpx solid #FF476F;
}

.error-text {
  font-size: 24rpx;
  color: #FF476F;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #F5F5F5;
  border: 2rpx solid #E0E0E0;
}

.btn-cancel .btn-text {
  color: #666666;
}

.btn-confirm {
  background: #FF476F;
  border: 2rpx solid #FF476F;
}

.btn-confirm .btn-text {
  color: #FFFFFF;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.btn:active {
  transform: scale(0.98);
}
</style>