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
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%);
	padding: 0 40rpx;
	position: relative;
	overflow: hidden;
}

/* 装饰元素 */
.decoration {
	position: absolute;
	border-radius: 50%;
	opacity: 0.2;
	z-index: 0;
}

.decoration-1 {
	width: 280rpx;
	height: 280rpx;
	background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
	top: -140rpx;
	left: -140rpx;
	animation: float 6s ease-in-out infinite;
}

.decoration-2 {
	width: 200rpx;
	height: 200rpx;
	background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	bottom: -100rpx;
	right: -100rpx;
	animation: float 5s ease-in-out infinite;
	animation-delay: 2s;
}

.decoration-3 {
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
	top: 20%;
	right: 10%;
	animation: float 4s ease-in-out infinite;
	animation-delay: 1s;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-20rpx); }
}

.logo-wrapper {
	margin-bottom: 100rpx;
	text-align: center;
	position: relative;
	z-index: 1;
}

.logo-icon {
	font-size: 160rpx;
	margin-bottom: 20rpx;
	animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
	0%, 100% { transform: scale(1) rotate(0deg); }
	50% { transform: scale(1.1) rotate(5deg); }
}

.app-title {
	font-size: 56rpx;
	font-weight: bold;
	color: #2d3436;
	margin-bottom: 12rpx;
}

.app-subtitle {
	font-size: 28rpx;
	color: #636e72;
	font-weight: 500;
}

.login-content {
	width: 100%;
	max-width: 600rpx;
	position: relative;
	z-index: 1;
}

.login-desc {
	text-align: center;
	font-size: 32rpx;
	color: #636e72;
	margin-bottom: 60rpx;
	line-height: 1.8;
}

.wx-login-btn {
	width: 100%;
	height: 104rpx;
	background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
	color: #fff;
	font-size: 36rpx;
	border-radius: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.35);
	transition: transform 150ms ease, box-shadow 150ms ease;
	position: relative;
	overflow: hidden;
}

.wx-login-btn:active {
	transform: scale(0.96);
	box-shadow: 0 4rpx 16rpx rgba(255,126,179,0.25);
}

.wx-login-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
	animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
	0% { left: -100%; }
	50%, 100% { left: 100%; }
}

.btn-icon {
	font-size: 40rpx;
	margin-right: 12rpx;
}

.wx-login-btn::after {
	border: none;
}
</style>