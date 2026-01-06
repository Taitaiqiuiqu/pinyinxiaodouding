<template>
  <view class="zhengti-page">
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
      <text class="page-title">整体认读</text>
      <view class="progress-info">
        <text class="progress-text">{{ learnedCount }}/16</text>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 整体认读音节网格 -->
      <view class="zhengti-grid">
        <view 
          v-for="(item, index) in zhengtiList" 
          :key="index"
          class="zhengti-item"
          :class="getZhengtiClass(item.status)"
          @click="goToStudy(item)"
        >
          <view class="item-content">
            <text class="zhengti-text">{{ item.name }}</text>
            <text class="pinyin-text">{{ item.pinyin }}</text>
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
  name: 'ZhengtiPage',
  data() {
    return {
      zhengtiList: [
        { name: 'zhi', pinyin: 'zhī', status: 'locked' },
        { name: 'chi', pinyin: 'chī', status: 'locked' },
        { name: 'shi', pinyin: 'shī', status: 'locked' },
        { name: 'ri', pinyin: 'rī', status: 'locked' },
        { name: 'zi', pinyin: 'zī', status: 'locked' },
        { name: 'ci', pinyin: 'cī', status: 'locked' },
        { name: 'si', pinyin: 'sī', status: 'locked' },
        { name: 'yi', pinyin: 'yī', status: 'locked' },
        { name: 'wu', pinyin: 'wū', status: 'locked' },
        { name: 'yu', pinyin: 'yū', status: 'locked' },
        { name: 'ye', pinyin: 'yē', status: 'locked' },
        { name: 'yue', pinyin: 'yuē', status: 'locked' },
        { name: 'yuan', pinyin: 'yuān', status: 'locked' },
        { name: 'yin', pinyin: 'yīn', status: 'locked' },
        { name: 'yun', pinyin: 'yūn', status: 'locked' },
        { name: 'ying', pinyin: 'yīng', status: 'locked' }
      ]
    };
  },
  computed: {
    learnedCount() {
      return this.zhengtiList.filter(item => 
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
        url: `/pages/phonics/pronunciation/study?type=zhengti&name=${item.name}`
      });
    },
    getZhengtiClass(status) {
      return {
        'status-locked': status === 'locked',
        'status-learning': status === 'learning',
        'status-mastered': status === 'mastered',
        'status-review': status === 'review'
      };
    },
    loadProgress() {
      try {
        const savedProgress = uni.getStorageSync('zhengti_progress');
        if (savedProgress) {
          this.zhengtiList = savedProgress;
        } else {
          // 初始化第一个整体认读音节为学习中状态
          this.zhengtiList[0].status = 'learning';
          this.saveProgress();
        }
      } catch (e) {
        console.error('加载进度失败', e);
      }
    },
    saveProgress() {
      try {
        uni.setStorageSync('zhengti_progress', this.zhengtiList);
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
            this.zhengtiList.forEach(item => {
              item.status = 'locked';
            });
            this.zhengtiList[0].status = 'learning';
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
      // 将所有已学过的整体认读音节标记为需要复习
      let hasReviewItems = false;
      this.zhengtiList.forEach(item => {
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
.zhengti-page {
  min-height: 100vh;
  background: #3B82F6;
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
  background: #FF476F;
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

/* 整体认读音节网格 */
.zhengti-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

/* 整体认读音节项 */
.zhengti-item {
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

.zhengti-item:active {
  transform: scale(0.95);
}

/* 不同状态的样式 */
.status-locked {
  background: #FBBF24;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.status-learning {
  background: #3B82F6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.status-mastered {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.status-review {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

/* 整体认读音节项内容 */
.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.zhengti-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.pinyin-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
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