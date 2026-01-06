<template>
  <view class="shengmu-page">
    <!-- 积木风格装饰元素 -->
    <view class="decoration-block decoration-1"></view>
    <view class="decoration-block decoration-2"></view>
    <view class="decoration-block decoration-3"></view>
    
    <!-- 页面头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text>返回</text>
      </view>
      <text class="page-title">声母学习</text>
      <view class="progress-info">
        <text class="progress-text">{{ learnedCount }}/23</text>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 声母网格 -->
      <view class="shengmu-grid">
        <view 
          v-for="(item, index) in shengmuList" 
          :key="index"
          class="shengmu-item"
          :class="getShengmuClass(item.status)"
          @click="goToStudy(item)"
        >
          <view class="item-content">
            <text class="shengmu-text">{{ item.name }}</text>
            <view class="status-icon">
              <text v-if="item.status === 'mastered'" class="icon-star">⭐</text>
              <text v-else-if="item.status === 'learning'" class="icon-clock">🕐</text>
              <text v-else-if="item.status === 'review'" class="icon-review">🔄</text>
              <text v-else class="icon-lock">🔒</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部操作区 -->
      <view class="bottom-actions">
        <view class="action-btn" @click="resetProgress">
          <text class="btn-text">重置进度</text>
        </view>
        <view class="action-btn" @click="reviewAll">
          <text class="btn-text">全部复习</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShengmuPage',
  data() {
    return {
      shengmuList: [
        { name: 'b', status: 'locked' },
        { name: 'p', status: 'locked' },
        { name: 'm', status: 'locked' },
        { name: 'f', status: 'locked' },
        { name: 'd', status: 'locked' },
        { name: 't', status: 'locked' },
        { name: 'n', status: 'locked' },
        { name: 'l', status: 'locked' },
        { name: 'g', status: 'locked' },
        { name: 'k', status: 'locked' },
        { name: 'h', status: 'locked' },
        { name: 'j', status: 'locked' },
        { name: 'q', status: 'locked' },
        { name: 'x', status: 'locked' },
        { name: 'zh', status: 'locked' },
        { name: 'ch', status: 'locked' },
        { name: 'sh', status: 'locked' },
        { name: 'r', status: 'locked' },
        { name: 'z', status: 'locked' },
        { name: 'c', status: 'locked' },
        { name: 's', status: 'locked' },
        { name: 'y', status: 'locked' },
        { name: 'w', status: 'locked' }
      ]
    };
  },
  computed: {
    learnedCount() {
      return this.shengmuList.filter(item => 
        item.status === 'mastered' || item.status === 'learning' || item.status === 'review'
      ).length;
    }
  },
  onLoad() {
    this.loadProgress();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToStudy(item) {
      // 如果是锁定状态，不执行任何操作
      if (item.status === 'locked') {
        return;
      }
      
      // 导航到学习页面
      uni.navigateTo({
        url: `/pages/phonics/pronunciation/study?type=shengmu&name=${item.name}`
      });
    },
    getShengmuClass(status) {
      return {
        'status-locked': status === 'locked',
        'status-learning': status === 'learning',
        'status-mastered': status === 'mastered',
        'status-review': status === 'review'
      };
    },
    loadProgress() {
      try {
        const savedProgress = uni.getStorageSync('shengmu_progress');
        if (savedProgress) {
          this.shengmuList = savedProgress;
        } else {
          // 初始化第一个声母为学习中状态
          this.shengmuList[0].status = 'learning';
          this.saveProgress();
        }
      } catch (e) {
        console.error('加载进度失败', e);
      }
    },
    saveProgress() {
      try {
        uni.setStorageSync('shengmu_progress', this.shengmuList);
      } catch (e) {
        console.error('保存进度失败', e);
      }
    },
    resetProgress() {
      uni.showModal({
        title: '提示',
        content: '确定要重置所有学习进度吗？',
        success: (res) => {
          if (res.confirm) {
            this.shengmuList.forEach(item => {
              item.status = 'locked';
            });
            this.shengmuList[0].status = 'learning';
            this.saveProgress();
            uni.showToast({
              title: '重置成功',
              icon: 'success'
            });
          }
        }
      });
    },
    reviewAll() {
      // 将所有已学过的声母标记为需要复习
      let hasReviewItems = false;
      this.shengmuList.forEach(item => {
        if (item.status === 'mastered' || item.status === 'learning') {
          item.status = 'review';
          hasReviewItems = true;
        }
      });
      
      if (hasReviewItems) {
        this.saveProgress();
        uni.showToast({
          title: '已标记复习',
          icon: 'success'
        });
      } else {
        uni.showToast({
          title: '暂无复习内容',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
/* 页面基础样式 */
.shengmu-page {
  min-height: 100vh;
  background: #FF476F;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.decoration-block {
  position: absolute;
  border-radius: 24rpx;
  z-index: 0;
}

.decoration-1 {
  top: 20rpx;
  right: 20rpx;
  width: 160rpx;
  height: 160rpx;
  background: #FBBF24;
  transform: rotate(15deg);
  animation: float-left 8s ease-in-out infinite reverse;
}

.decoration-2 {
  top: 200rpx;
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  transform: rotate(-8deg);
  animation: float 6s ease-in-out infinite;
}

.decoration-3 {
  bottom: 100rpx;
  right: 50rpx;
  width: 80rpx;
  height: 80rpx;
  background: #10B981;
  transform: rotate(12deg);
  animation: float-right 7s ease-in-out infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-20rpx) rotate(-12deg); }
}

@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

@keyframes float-right {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-15rpx) rotate(18deg); }
}

/* 页面头部 */
.header {
  padding: 60rpx 32rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.back-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
}

.progress-info {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
}

.progress-text {
  font-weight: bold;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 20rpx 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* 声母网格 */
.shengmu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

/* 声母项 */
.shengmu-item {
  aspect-ratio: 1;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.shengmu-item:active {
  transform: scale(0.95);
}

/* 不同状态的样式 */
.status-locked {
  background: #3B82F6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.status-learning {
  background: #FF476F;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #E53E5F;
}

.status-mastered {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.status-review {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

/* 声母项内容 */
.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.shengmu-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.status-icon {
  font-size: 24rpx;
}

/* 底部操作区 */
.bottom-actions {
  display: flex;
  gap: 32rpx;
  margin-top: 20rpx;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.btn-text {
  font-weight: bold;
}
</style>