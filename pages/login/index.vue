<template>
  <view class="login-container">
    <!-- 装饰元素 -->
    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>
    <view class="decoration decoration-3"></view>
    
    <view class="logo-wrapper">
      <view class="logo-icon">🌟</view>
      <view class="app-title">拼音小豆豆</view>
      <view class="app-subtitle">快乐学习拼音</view>
    </view>
    
    <view class="login-content">
      <view class="login-desc">
        通过微信登录，开始你的拼音学习之旅
      </view>
      
      <button class="wx-login-btn" @getuserinfo="handleLogin" open-type="getUserInfo">
        <text class="btn-icon">💖</text>
        <text>微信授权登录</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { callFunction } from '../../src/services/cloud'
import { useGlobalStore } from '../../src/store/global'
import GlobalAudioManager from '../../src/services/GlobalAudioManager'
const store = useGlobalStore()
const loading = ref(false)
const audioManager = GlobalAudioManager.getInstance()

function recoverLoginState() {
  const isLoggedIn = uni.getStorageSync('isLoggedIn')
  const savedOpenid = uni.getStorageSync('openid')
  const savedUserInfo = uni.getStorageSync('userInfo')
  
  if (isLoggedIn && savedOpenid) {
    store.setOpenId(savedOpenid)
    if (savedUserInfo) {
      store.setUserInfo(savedUserInfo)
    }
    return true
  }
  return false
}

function clearLoginState() {
  uni.removeStorageSync('openid')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('isLoggedIn')
  uni.removeStorageSync('ageLevel')
}

// 处理微信授权登录
const handleLogin = async (e: any) => {
  if (loading.value) return
  
  // 点击登录按钮后开始循环播放音频
  audioManager.startLoop('guide_age_survey_3-8_01', 'guide')
  
  loading.value = true
  try {
    // 从事件对象中获取用户信息
    const userInfo = e.detail.userInfo
    
    if (userInfo) {
      // 调用微信登录接口获取code
      const loginRes = await uni.login()
      
      if (loginRes.code) {
        // 调用云函数进行登录验证
        const cloudRes = await callFunction('login', {
          code: loginRes.code,
          userInfo: userInfo
        })

        // 保存用户信息到全局状态
        store.setUserInfo(userInfo)
        store.setOpenId(cloudRes.result.openid)
        
        // 持久化保存关键数据
        uni.setStorageSync('openid', cloudRes.result.openid)
        uni.setStorageSync('userInfo', userInfo)
        uni.setStorageSync('isLoggedIn', true)
        
        // 注意：不停止音频循环播放，让音频持续到age-select页面
        
        // 跳转到答题验证页面
        await uni.navigateTo({ url: '/pages/quiz/index' })
      } else {
        throw new Error('登录失败，无法获取code')
      }
    } else {
      // 用户拒绝授权
      uni.showToast({
        title: '已取消授权',
        icon: 'none'
      })
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  // 不停止音频，让音频持续到age-select页面
})

// 检查答题状态
const checkQuizStatus = () => {
  const quizCompleted = uni.getStorageSync('quizCompleted')
  if (quizCompleted) {
    // 如果答题已完成，停止音频播放
    audioManager.stopLoop()
    // 清除答题成功标志
    uni.removeStorageSync('quizCompleted')
  }
}

// 页面显示时检查答题状态
onShow(() => {
  checkQuizStatus()
})

</script>

<style scoped>
/* 页面基础样式 - 积木风格纯色背景 */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #FF476F;
  padding: 0 40rpx;
  position: relative;
  overflow: hidden;
}

/* 装饰元素 - 积木风格 */
.decoration {
  position: fixed;
  background: #FF6B3D;
  opacity: 0.6;
  z-index: 0;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

.decoration-1 {
  width: 320rpx;
  height: 320rpx;
  top: -160rpx;
  left: -160rpx;
  transform: rotate(45deg);
}

.decoration-2 {
  width: 240rpx;
  height: 240rpx;
  bottom: -120rpx;
  right: -120rpx;
  transform: rotate(15deg);
}

.decoration-3 {
  width: 160rpx;
  height: 160rpx;
  top: 20%;
  right: 10%;
  transform: rotate(30deg);
}

.logo-wrapper {
  margin-bottom: 120rpx;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.6s ease forwards;
}

.logo-icon {
  font-size: 180rpx;
  margin-bottom: 24rpx;
  animation: sparkle 2s ease-in-out infinite;
  background: #FFFFFF;
  width: 180rpx;
  height: 180rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.2);
  margin: 0 auto 24rpx;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.15) rotate(5deg); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.app-title {
  font-size: 64rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.2);
  animation: fadeUp 0.6s ease 0.2s forwards;
  opacity: 0;
}

.app-subtitle {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  animation: fadeUp 0.6s ease 0.4s forwards;
  opacity: 0;
}

.login-content {
  width: 100%;
  max-width: 600rpx;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.6s ease 0.6s forwards;
  opacity: 0;
}

.login-desc {
  text-align: center;
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 80rpx;
  line-height: 1.8;
  background: #FFFFFF;
  color: #FF476F;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
}

.wx-login-btn {
  width: 100%;
  height: 112rpx;
  background: #FBBF24;
  color: #2d3436;
  font-size: 40rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.2);
  transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.wx-login-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.wx-login-btn:hover {
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.25);
  transform: translateY(-2rpx);
}

.btn-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5rpx); }
}
</style>
