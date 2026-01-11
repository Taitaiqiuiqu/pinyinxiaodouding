<template>
  <view class="learning-report-page">
    <AudioPlayer ref="audioPlayer" />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <Icon name="arrow-left" size="48rpx" color="#FFFFFF" />
      </view>
      <text class="page-title">学习报告</text>
      <view class="header-right"></view>
    </view>

    <view class="main-content">
      <view class="report-tabs">
        <view 
          class="tab-item"
          :class="{ active: currentTab === 'week' }"
          @tap="switchTab('week')"
        >
          <text class="tab-label">周报</text>
        </view>
        <view 
          class="tab-item"
          :class="{ active: currentTab === 'month' }"
          @tap="switchTab('month')"
        >
          <text class="tab-label">月报</text>
        </view>
      </view>

      <view v-if="currentTab === 'week'" class="week-report">
        <view class="report-header-card">
          <view class="report-title">
            <text class="title-text">本周学习报告</text>
            <text class="title-date">{{ getCurrentWeekRange() }}</text>
          </view>
          <view class="report-summary">
            <view class="summary-item">
              <text class="summary-value">{{ weekStats.totalLearningTime }}</text>
              <text class="summary-label">学习时长(分钟)</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ weekStats.totalSessions }}</text>
              <text class="summary-label">学习次数</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ weekStats.accuracy }}%</text>
              <text class="summary-label">准确率</text>
            </view>
          </view>
        </view>

        <view class="progress-card">
          <view class="card-header">
            <text class="card-title">学习进度</text>
          </view>
          <view class="progress-bar-container">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: weekStats.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ weekStats.progress }}%</text>
          </view>
          <text class="progress-desc">本周完成度</text>
        </view>

        <view class="recommendations-card">
          <view class="card-header">
            <Icon name="lightbulb" size="48rpx" color="#FBBF24" />
            <text class="card-title">学习建议</text>
          </view>
          <view class="recommendations-list">
            <view v-for="(rec, index) in weekStats.recommendations" :key="index" class="recommendation-item">
              <view class="recommendation-number">{{ index + 1 }}</view>
              <text class="recommendation-text">{{ rec }}</text>
            </view>
            <view v-if="weekStats.recommendations.length === 0" class="empty-recommendations">
              <text class="empty-text">暂无学习建议</text>
            </view>
          </view>
        </view>

        <view class="daily-chart-card">
          <view class="card-header">
            <Icon name="chart" size="48rpx" color="#3B82F6" />
            <text class="card-title">每日学习时长</text>
          </view>
          <view class="daily-chart">
            <view v-for="(day, index) in dailyData" :key="index" class="chart-bar">
              <view 
                class="bar-fill" 
                :style="{ height: (day.percentage || 0) + '%' }"
              ></view>
              <text class="bar-label">{{ day.label }}</text>
              <text class="bar-value">{{ day.time }}分钟</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentTab === 'month'" class="month-report">
        <view class="report-header-card">
          <view class="report-title">
            <text class="title-text">本月学习报告</text>
            <text class="title-date">{{ getCurrentMonthRange() }}</text>
          </view>
          <view class="report-summary">
            <view class="summary-item">
              <text class="summary-value">{{ monthStats.totalLearningTime }}</text>
              <text class="summary-label">学习时长(分钟)</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ monthStats.totalSessions }}</text>
              <text class="summary-label">学习次数</text>
            </view>
            <view class="summary-item">
              <text class="summary-value">{{ monthStats.accuracy }}%</text>
              <text class="summary-label">准确率</text>
            </view>
          </view>
        </view>

        <view class="progress-card">
          <view class="card-header">
            <text class="card-title">学习进度</text>
          </view>
          <view class="progress-bar-container">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: monthStats.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ monthStats.progress }}%</text>
          </view>
          <text class="progress-desc">本月完成度</text>
        </view>

        <view class="recommendations-card">
          <view class="card-header">
            <Icon name="lightbulb" size="48rpx" color="#FBBF24" />
            <text class="card-title">学习建议</text>
          </view>
          <view class="recommendations-list">
            <view v-for="(rec, index) in monthStats.recommendations" :key="index" class="recommendation-item">
              <view class="recommendation-number">{{ index + 1 }}</view>
              <text class="recommendation-text">{{ rec }}</text>
            </view>
            <view v-if="monthStats.recommendations.length === 0" class="empty-recommendations">
              <text class="empty-text">暂无学习建议</text>
            </view>
          </view>
        </view>

        <view class="weekly-comparison-card">
          <view class="card-header">
            <Icon name="trend" size="48rpx" color="#10B981" />
            <text class="card-title">每周对比</text>
          </view>
          <view class="weekly-comparison">
            <view v-for="(week, index) in weeklyComparison" :key="index" class="week-item">
              <text class="week-label">{{ week.label }}</text>
              <view class="week-bar">
                <view 
                  class="week-bar-fill" 
                  :style="{ width: week.percentage + '%' }"
                ></view>
              </view>
              <text class="week-value">{{ week.time }}分钟</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentTab === 'week' && weekStats.recommendations.length === 0 && weekStats.totalSessions === 0" class="empty-state">
        <Icon name="empty" size="120rpx" color="#CCCCCC" />
        <text class="empty-text">本周暂无学习记录</text>
        <text class="empty-desc">开始学习后，这里将显示详细的学习报告</text>
      </view>

      <view v-if="currentTab === 'month' && monthStats.recommendations.length === 0 && monthStats.totalSessions === 0" class="empty-state">
        <Icon name="empty" size="120rpx" color="#CCCCCC" />
        <text class="empty-text">本月暂无学习记录</text>
        <text class="empty-desc">开始学习后，这里将显示详细的学习报告</text>
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

const currentTab = ref('week');

const weekStats = ref({
  totalLearningTime: 0,
  totalSessions: 0,
  accuracy: 0,
  progress: 0,
  recommendations: [] as string[]
});

const monthStats = ref({
  totalLearningTime: 0,
  totalSessions: 0,
  accuracy: 0,
  progress: 0,
  recommendations: [] as string[]
});

const dailyData = ref([
  { label: '周一', time: 0, percentage: 0 },
  { label: '周二', time: 0, percentage: 0 },
  { label: '周三', time: 0, percentage: 0 },
  { label: '周四', time: 0, percentage: 0 },
  { label: '周五', time: 0, percentage: 0 },
  { label: '周六', time: 0, percentage: 0 },
  { label: '周日', time: 0, percentage: 0 }
]);

const weeklyComparison = ref([
  { label: '第1周', time: 0, percentage: 0 },
  { label: '第2周', time: 0, percentage: 0 },
  { label: '第3周', time: 0, percentage: 0 },
  { label: '第4周', time: 0, percentage: 0 }
]);

const getCurrentWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return `${monday.getMonth() + 1}月${monday.getDate()}日 - ${sunday.getMonth() + 1}月${sunday.getDate()}日`;
};

const getCurrentMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return `${firstDay.getMonth() + 1}月${firstDay.getDate()}日 - ${lastDay.getMonth() + 1}月${lastDay.getDate()}日`;
};

const goBack = () => {
  uni.navigateBack();
};

const switchTab = (tab: string) => {
  currentTab.value = tab;
};

const loadWeekData = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const records = globalStore.learningRecords || [];
  let totalLearningTime = 0;
  let totalSessions = 0;
  let totalAccuracy = 0;
  let accuracyCount = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(dayDate);
    nextDay.setDate(dayDate.getDate() + 1);
    
    const dayRecords = records.filter((r: any) => {
      const recordDate = new Date(r.timestamp);
      return recordDate >= dayDate && recordDate < nextDay;
    });
    
    const dayTime = dayRecords.reduce((sum: number, r: any) => sum + r.duration, 0);
    dailyData.value[i].time = Math.round(dayTime / 60);
    dailyData.value[i].percentage = Math.min(100, Math.round((dayTime / 3600) * 100));
    
    totalLearningTime += dayTime;
    totalSessions += dayRecords.length;
    
    dayRecords.forEach((r: any) => {
      if (r.accuracy) {
        totalAccuracy += r.accuracy;
        accuracyCount++;
      }
    });
  }

  weekStats.value.totalLearningTime = Math.round(totalLearningTime / 60);
  weekStats.value.totalSessions = totalSessions;
  weekStats.value.accuracy = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  weekStats.value.progress = Math.min(100, Math.round((totalLearningTime / (7 * 1800)) * 100));
  weekStats.value.recommendations = generateRecommendations(weekStats.value);
};

const loadMonthData = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);

  const records = globalStore.learningRecords || [];
  let totalLearningTime = 0;
  let totalSessions = 0;
  let totalAccuracy = 0;
  let accuracyCount = 0;

  const monthRecords = records.filter((r: any) => {
    const recordDate = new Date(r.timestamp);
    return recordDate >= firstDay && recordDate < new Date(today.getFullYear(), today.getMonth() + 1, 1);
  });

  monthRecords.forEach((r: any) => {
    totalLearningTime += r.duration;
    totalSessions++;
    if (r.accuracy) {
      totalAccuracy += r.accuracy;
      accuracyCount++;
    }
  });

  monthStats.value.totalLearningTime = Math.round(totalLearningTime / 60);
  monthStats.value.totalSessions = totalSessions;
  monthStats.value.accuracy = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  monthStats.value.progress = Math.min(100, Math.round((totalLearningTime / (30 * 1800)) * 100));
  monthStats.value.recommendations = generateRecommendations(monthStats.value);

  loadWeeklyComparison(firstDay, records);
};

const loadWeeklyComparison = (firstDay: Date, records: any[]) => {
  const today = new Date();
  const weeksInMonth = 4;

  for (let i = 0; i < weeksInMonth; i++) {
    const weekStart = new Date(firstDay);
    weekStart.setDate(firstDay.getDate() + i * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > today) weekEnd.setTime(today.getTime());

    const weekRecords = records.filter((r: any) => {
      const recordDate = new Date(r.timestamp);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    const weekTime = weekRecords.reduce((sum: number, r: any) => sum + r.duration, 0);
    weeklyComparison.value[i].time = Math.round(weekTime / 60);
    weeklyComparison.value[i].percentage = Math.min(100, Math.round((weekTime / (7 * 1800)) * 100));
  }
};

const generateRecommendations = (stats: any) => {
  const recommendations: string[] = [];

  if (stats.totalSessions === 0) {
    recommendations.push('还没有学习记录，建议每天坚持学习15-30分钟');
    return recommendations;
  }

  if (stats.totalLearningTime < 60) {
    recommendations.push('本周学习时间较少，建议每天增加学习时长');
  }

  if (stats.accuracy < 70) {
    recommendations.push('准确率偏低，建议多复习已学内容');
  }

  if (stats.accuracy >= 90) {
    recommendations.push('准确率很高，可以尝试更高难度的内容');
  }

  if (stats.progress < 30) {
    recommendations.push('学习进度较慢，建议制定学习计划并坚持执行');
  }

  if (stats.progress >= 80) {
    recommendations.push('学习进度很好，继续保持！');
  }

  if (recommendations.length === 0) {
    recommendations.push('学习状态良好，继续保持！');
  }

  return recommendations;
};

onMounted(() => {
  loadWeekData();
  loadMonthData();
});
</script>

<style scoped>
.learning-report-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%);
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

.report-tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: #8B5CF6;
}

.tab-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.tab-item.active .tab-label {
  color: #FFFFFF;
}

.report-header-card,
.progress-card,
.recommendations-card,
.daily-chart-card,
.weekly-comparison-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.report-title {
  margin-bottom: 32rpx;
}

.title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.title-date {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.report-summary {
  display: flex;
  justify-content: space-between;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #8B5CF6;
  display: block;
  margin-bottom: 8rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #666666;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
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
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  border-radius: 12rpx;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #8B5CF6;
  min-width: 80rpx;
  text-align: right;
}

.progress-desc {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx;
  background: #FFF9E6;
  border-radius: 12rpx;
}

.recommendation-number {
  width: 40rpx;
  height: 40rpx;
  background: #FBBF24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #FFFFFF;
  flex-shrink: 0;
}

.recommendation-text {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
  line-height: 1.6;
}

.empty-recommendations {
  text-align: center;
  padding: 40rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

.daily-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200rpx;
  margin-top: 24rpx;
  padding: 0 16rpx;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.bar-fill {
  width: 40rpx;
  background: linear-gradient(180deg, #3B82F6, #60A5FA);
  border-radius: 8rpx 8rpx 0 0;
  min-height: 8rpx;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 20rpx;
  color: #666666;
}

.bar-value {
  font-size: 20rpx;
  color: #999999;
}

.weekly-comparison {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.week-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.week-label {
  width: 80rpx;
  font-size: 24rpx;
  color: #666666;
}

.week-bar {
  flex: 1;
  height: 20rpx;
  background: #F0F0F0;
  border-radius: 10rpx;
  overflow: hidden;
}

.week-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399);
  border-radius: 10rpx;
  transition: width 0.5s ease;
}

.week-value {
  width: 100rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #10B981;
  text-align: right;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-top: 32rpx;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #CCCCCC;
}
</style>
