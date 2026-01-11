<template>
  <view class="learning-progress-page">
    <AudioPlayer ref="audioPlayer" />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <Icon name="arrow-left" size="48rpx" color="#FFFFFF" />
      </view>
      <text class="page-title">学习进度</text>
      <view class="header-right"></view>
    </view>

    <view class="main-content">
      <view class="stats-cards">
        <view class="stat-card stat-primary">
          <text class="stat-value">{{ formatTime(stats.totalLearningTime) }}</text>
          <text class="stat-label">总学习时长</text>
        </view>
        <view class="stat-card stat-secondary">
          <text class="stat-value">{{ stats.totalSessions }}</text>
          <text class="stat-label">学习次数</text>
        </view>
        <view class="stat-card stat-tertiary">
          <text class="stat-value">{{ stats.masteredPinyin }}/{{ stats.totalPinyin }}</text>
          <text class="stat-label">掌握拼音</text>
        </view>
        <view class="stat-card stat-quaternary">
          <text class="stat-value">{{ stats.averageAccuracy }}%</text>
          <text class="stat-label">平均准确率</text>
        </view>
      </view>

      <view class="progress-section">
        <view class="section-header">
          <text class="section-title">学习进度</text>
          <text class="section-subtitle">上次学习: {{ formatDate(stats.lastLearningDate) }}</text>
        </view>
        <view class="progress-bar-container">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
          </view>
          <text class="progress-text">{{ progressPercentage }}%</text>
        </view>
      </view>

      <view class="records-section">
        <view class="section-header">
          <text class="section-title">最近学习记录</text>
        </view>
        <view class="records-list">
          <view v-for="record in recentRecords" :key="record.id" class="record-item">
            <view class="record-icon" :class="'record-' + record.type">
              <Icon :name="getTypeIcon(record.type)" size="48rpx" color="#FFFFFF" />
            </view>
            <view class="record-info">
              <text class="record-title">{{ record.content }}</text>
              <text class="record-time">{{ formatDateTime(record.timestamp) }}</text>
            </view>
            <view class="record-stats">
              <text class="record-duration">{{ formatTime(record.duration) }}</text>
              <text v-if="record.accuracy" class="record-accuracy">准确率 {{ record.accuracy }}%</text>
              <text v-if="record.score" class="record-score">得分 {{ record.score }}</text>
            </view>
          </view>
          <view v-if="recentRecords.length === 0" class="empty-state">
            <Icon name="empty" size="120rpx" color="#CCCCCC" />
            <text class="empty-text">暂无学习记录</text>
          </view>
        </view>
      </view>

      <view class="type-stats-section">
        <view class="section-header">
          <text class="section-title">各模块学习统计</text>
        </view>
        <view class="type-stats-grid">
          <view class="type-stat-item type-phonics">
            <Icon name="course" size="64rpx" color="#FF476F" />
            <text class="type-stat-label">拼音启蒙</text>
            <text class="type-stat-value">{{ getTypeStats('phonics').count }}次</text>
            <text class="type-stat-time">{{ formatTime(getTypeStats('phonics').time) }}</text>
          </view>
          <view class="type-stat-item type-games">
            <Icon name="game" size="64rpx" color="#FBBF24" />
            <text class="type-stat-label">游戏训练</text>
            <text class="type-stat-value">{{ getTypeStats('games').count }}次</text>
            <text class="type-stat-time">{{ formatTime(getTypeStats('games').time) }}</text>
          </view>
          <view class="type-stat-item type-workbook">
            <Icon name="course" size="64rpx" color="#3B82F6" />
            <text class="type-stat-label">练习册</text>
            <text class="type-stat-value">{{ getTypeStats('workbook').count }}次</text>
            <text class="type-stat-time">{{ formatTime(getTypeStats('workbook').time) }}</text>
          </view>
          <view class="type-stat-item type-songs">
            <Icon name="music" size="64rpx" color="#10B981" />
            <text class="type-stat-label">儿歌</text>
            <text class="type-stat-value">{{ getTypeStats('songs').count }}次</text>
            <text class="type-stat-time">{{ formatTime(getTypeStats('songs').time) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Icon from '../../src/components/Icon/Icon.vue';
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue';
import { useGlobalStore } from '../../src/store/global';

const globalStore = useGlobalStore();
const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();

const stats = ref({
  totalLearningTime: 0,
  totalSessions: 0,
  masteredPinyin: 0,
  totalPinyin: 63,
  averageAccuracy: 0,
  lastLearningDate: ''
});

const recentRecords = ref<any[]>([]);

const progressPercentage = computed(() => {
  if (stats.value.totalPinyin === 0) return 0;
  return Math.round((stats.value.masteredPinyin / stats.value.totalPinyin) * 100);
});

const getTypeStats = (type: string) => {
  const records = globalStore.learningRecords.filter((r: any) => r.type === type);
  return {
    count: records.length,
    time: records.reduce((sum: number, r: any) => sum + r.duration, 0)
  };
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '暂无';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (days === 1) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    phonics: 'course',
    games: 'game',
    workbook: 'course',
    songs: 'music'
  };
  return iconMap[type] || 'course';
};

const goBack = () => {
  uni.navigateBack();
};

const loadData = () => {
  const records = globalStore.learningRecords || [];
  
  const totalLearningTime = records.reduce((sum: number, r: any) => sum + r.duration, 0);
  const totalSessions = records.length;
  const accuracyRecords = records.filter((r: any) => r.accuracy !== undefined);
  const averageAccuracy = accuracyRecords.length > 0 
    ? Math.round(accuracyRecords.reduce((sum: number, r: any) => sum + (r.accuracy || 0), 0) / accuracyRecords.length)
    : 0;
  
  const lastLearningDate = records.length > 0 
    ? new Date(Math.max(...records.map((r: any) => r.timestamp))).toISOString().split('T')[0]
    : '';

  stats.value = {
    totalLearningTime,
    totalSessions,
    masteredPinyin: 0,
    totalPinyin: 63,
    averageAccuracy,
    lastLearningDate
  };

  recentRecords.value = records
    .sort((a: any, b: any) => b.timestamp - a.timestamp)
    .slice(0, 10);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.learning-progress-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FF476F 0%, #FF6B8A 100%);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 40rpx;
}

.header-left,
.header-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  background: #F5F5F5;
  border-radius: 48rpx 48rpx 0 0;
  padding: 48rpx 32rpx;
  overflow-y: auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-primary {
  border-left: 8rpx solid #FF476F;
}

.stat-secondary {
  border-left: 8rpx solid #FBBF24;
}

.stat-tertiary {
  border-left: 8rpx solid #3B82F6;
}

.stat-quaternary {
  border-left: 8rpx solid #10B981;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.progress-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999999;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.progress-bar {
  flex: 1;
  height: 24rpx;
  background: #F0F0F0;
  border-radius: 12rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF476F, #FF6B8A);
  border-radius: 12rpx;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF476F;
  min-width: 80rpx;
  text-align: right;
}

.records-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
}

.record-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.record-phonics {
  background: #FF476F;
}

.record-games {
  background: #FBBF24;
}

.record-workbook {
  background: #3B82F6;
}

.record-songs {
  background: #10B981;
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.record-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.record-duration {
  font-size: 24rpx;
  color: #666666;
}

.record-accuracy,
.record-score {
  font-size: 24rpx;
  color: #10B981;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
  margin-top: 24rpx;
}

.type-stats-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.type-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.type-stat-item {
  background: #F9F9F9;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.type-stat-label {
  font-size: 24rpx;
  color: #666666;
}

.type-stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333333;
}

.type-stat-time {
  font-size: 24rpx;
  color: #999999;
}
</style>
