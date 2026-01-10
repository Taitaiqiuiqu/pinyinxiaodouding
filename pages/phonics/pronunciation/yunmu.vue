<template>
  <view class="yunmu-page">
    <!-- 页面头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text>返回</text>
      </view>
      <text class="page-title">韵母学习</text>
      <view class="progress-info">
        <text class="progress-text">{{ learnedCount }}/24</text>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 韵母分类标签 -->
      <view class="category-tabs">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="tab-item"
          :class="{ active: currentCategory === category.type }"
          @click="switchCategory(category.type)"
        >
          <text class="tab-text">{{ category.name }}</text>
        </view>
      </view>
      
      <!-- 韵母网格 -->
      <view class="yunmu-grid">
        <view 
          v-for="(item, index) in currentYunmuList" 
          :key="index"
          class="yunmu-item"
          :class="getYunmuClass(item.status)"
          @click="goToStudy(item)"
        >
          <view class="item-content">
            <text class="yunmu-text">{{ item.name }}</text>
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
  name: 'YunmuPage',
  data() {
    return {
      currentCategory: 'single',
      categories: [
        { name: '单韵母', type: 'single' },
        { name: '复韵母', type: 'compound' },
        { name: '鼻韵母', type: 'nasal' },
        { name: '特殊韵母', type: 'special' }
      ],
      yunmuData: {
        single: [
          { name: 'a', status: 'locked' },
          { name: 'o', status: 'locked' },
          { name: 'e', status: 'locked' },
          { name: 'i', status: 'locked' },
          { name: 'u', status: 'locked' },
          { name: 'ü', status: 'locked' }
        ],
        compound: [
          { name: 'ai', status: 'locked' },
          { name: 'ei', status: 'locked' },
          { name: 'ui', status: 'locked' },
          { name: 'ao', status: 'locked' },
          { name: 'ou', status: 'locked' },
          { name: 'iu', status: 'locked' },
          { name: 'ie', status: 'locked' },
          { name: 'üe', status: 'locked' },
          { name: 'er', status: 'locked' }
        ],
        nasal: [
          { name: 'an', status: 'locked' },
          { name: 'en', status: 'locked' },
          { name: 'in', status: 'locked' },
          { name: 'un', status: 'locked' },
          { name: 'ün', status: 'locked' },
          { name: 'ang', status: 'locked' },
          { name: 'eng', status: 'locked' },
          { name: 'ing', status: 'locked' },
          { name: 'ong', status: 'locked' }
        ]
      }
    };
  },
  computed: {
    currentYunmuList() {
      return this.yunmuData[this.currentCategory] || [];
    },
    learnedCount() {
      let count = 0;
      Object.values(this.yunmuData).forEach(category => {
        count += category.filter(item => 
          item.status === 'mastered' || item.status === 'learning' || item.status === 'review'
        ).length;
      });
      return count;
    }
  },
  onLoad() {
    this.loadProgress();
  },
  onShow() {
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
        url: `/pages/phonics/pronunciation/study?type=yunmu&name=${item.name}`
      });
    },
    switchCategory(type) {
      this.currentCategory = type;
    },
    getYunmuClass(status) {
      return {
        'status-locked': status === 'locked',
        'status-learning': status === 'learning',
        'status-mastered': status === 'mastered',
        'status-review': status === 'review'
      };
    },
    loadProgress() {
      try {
        const savedProgress = uni.getStorageSync('yunmu_progress');
        if (savedProgress) {
          this.yunmuData = savedProgress;
        } else {
          // 初始化第一个韵母为学习中状态
          this.yunmuData.single[0].status = 'learning';
          this.saveProgress();
        }
      } catch (e) {
        console.error('加载进度失败', e);
      }
    },
    saveProgress() {
      try {
        uni.setStorageSync('yunmu_progress', this.yunmuData);
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
            Object.values(this.yunmuData).forEach(category => {
              category.forEach(item => {
                item.status = 'locked';
              });
            });
            this.yunmuData.single[0].status = 'learning';
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
      // 将所有已学过的韵母标记为需要复习
      let hasReviewItems = false;
      Object.values(this.yunmuData).forEach(category => {
        category.forEach(item => {
          if (item.status === 'mastered' || item.status === 'learning') {
            item.status = 'review';
            hasReviewItems = true;
          }
        });
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
.yunmu-page {
  min-height: 100vh;
  background: #FBBF24;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 积木风格装饰元素 */
.yunmu-page::before {
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

.yunmu-page::after {
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

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
  width: 100%;
  overflow-x: auto;
}

.tab-item {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 26rpx;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item.active {
  background: rgba(255, 255, 255, 0.4);
  border: 2rpx solid #FFFFFF;
}

.tab-item:active {
  transform: scale(0.95);
}

.tab-text {
  font-weight: bold;
}

/* 韵母网格 */
.yunmu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

/* 韵母项 */
.yunmu-item {
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

.yunmu-item:active {
  transform: scale(0.95);
}

/* 不同状态的样式 */
.status-locked {
  background: #3B82F6;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #1D4ED8;
}

.status-learning {
  background: #FBBF24;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.status-mastered {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.status-review {
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

/* 韵母项内容 */
.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.yunmu-text {
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