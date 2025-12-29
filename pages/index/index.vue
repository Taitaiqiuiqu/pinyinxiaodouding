<template>
	<view class="content">
		<view class="container">
			<view class="logo-wrapper">
				<view class="logo-icon">🌟</view>
			</view>
			<view class="text-area">
				<text class="title">{{title}}</text>
				<text class="subtitle">跟孩子一起快乐学拼音</text>
			</view>

			<view class="action-area">
				<button class="btn-primary start-btn" @tap="start">
					<text class="btn-icon">💖</text>
					<text>开始学习</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {
			start() {
				uni.navigateTo({ url: '/pages/quiz/index' })
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #fff9f5 0%, #ffeef8 100%);
		position: relative;
		overflow: hidden;
	}

	.content::before,
	.content::after {
		content: '';
		position: absolute;
		border-radius: 50%;
		opacity: 0.2;
		z-index: 0;
	}

	.content::before {
		width: 320rpx;
		height: 320rpx;
		background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
		top: -160rpx;
		left: -160rpx;
		animation: float 6s ease-in-out infinite;
	}

	.content::after {
		width: 280rpx;
		height: 280rpx;
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
		bottom: -140rpx;
		right: -140rpx;
		animation: float 5s ease-in-out infinite;
		animation-delay: 2s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-20rpx) rotate(5deg); }
	}

	.container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 40rpx;
	}

	.logo-wrapper {
		margin-top: 100rpx;
		margin-bottom: 24rpx;
	}

	.logo-icon {
		font-size: 180rpx;
		line-height: 1;
		animation: bounce 2s ease-in-out infinite;
		filter: drop-shadow(0 8rpx 20rpx rgba(255,126,179,0.3));
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-16rpx); }
	}

	.text-area {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.title {
		font-size: 48rpx;
		color: #ff7eb3;
		font-weight: 700;
		margin-bottom: 8rpx;
		text-shadow: 2rpx 2rpx 4rpx rgba(255,126,179,0.15);
	}

	.subtitle {
		color: #ff9a56;
		margin-bottom: 32rpx;
		font-size: 20rpx;
		font-weight: 600;
		text-shadow: 1rpx 1rpx 2rpx rgba(255,154,86,0.1);
	}

	.action-area {
		margin-top: 32rpx;
	}

	.start-btn {
		background: linear-gradient(135deg, #ff7eb3 0%, #ff9a56 100%);
		color: #fff;
		padding: 24rpx 64rpx;
		border-radius: 52rpx;
		font-size: 22rpx;
		font-weight: 700;
		box-shadow: 0 12rpx 32rpx rgba(255,126,179,0.35);
		border: none;
		display: flex;
		align-items: center;
		gap: 12rpx;
		transition: transform 150ms ease, box-shadow 150ms ease;
		position: relative;
		overflow: hidden;
	}

	.start-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
		transition: left 0.5s ease;
	}

	.start-btn:active::before {
		left: 100%;
	}

	.start-btn:active {
		transform: scale(0.98);
		box-shadow: 0 8rpx 24rpx rgba(255,126,179,0.25);
	}

	.btn-icon {
		font-size: 28rpx;
	}
</style>
