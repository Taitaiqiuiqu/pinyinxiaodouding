<template>
  <view class="usage-time-page">
    <AudioPlayer ref="audioPlayer" />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <Icon name="arrow-left" size="48rpx" color="#FFFFFF" />
      </view>
      <text class="page-title">使用时长</text>
      <view class="header-right"></view>
    </view>

    <view class="main-content">
      <view class="time-limit-card">
        <view class="card-header">
          <Icon name="clock" size="64rpx" color="#FF476F" />
          <text class="card-title">每日使用时长限制</text>
        </view>
        <view class="limit-toggle">
          <text class="toggle-label">启用时长限制</text>
          <switch :checked="timeLimitEnabled" @change="onTimeLimitChange" color="#FF476F" />
        </view>
        <view v-if="timeLimitEnabled" class="limit-input">
          <text class="input-label">每日最长使用时间</text>
          <view class="time-selector">
            <view class="time-input-group">
              <input 
                type="number" 
                v-model="maxUsageHours" 
                class="time-input" 
                @input="onMaxUsageTimeChange"
              />
              <text class="time-unit">小时</text>
            </view>
            <view class="time-input-group">
              <input 
                type="number" 
                v-model="maxUsageMinutes" 
                class="time-input" 
                @input="onMaxUsageTimeChange"
              />
              <text class="time-unit">分钟</text>
            </view>
          </view>
        </view>
      </view>

      <view class="daily-start-card">
        <view class="card-header">
          <Icon name="sun" size="64rpx" color="#FBBF24" />
          <text class="card-title">每日开始时间</text>
        </view>
        <view class="start-time-selector">
          <picker 
            mode="time" 
            :value="dailyStartTime" 
            @change="onDailyStartTimeChange"
          >
            <view class="picker-display">
              <text class="picker-value">{{ dailyStartTime }}</text>
              <Icon name="arrow-right" size="32rpx" color="#999999" />
            </view>
          </picker>
        </view>
        <text class="start-time-desc">设置每天开始计算使用时间的起始点</text>
      </view>

      <view class="today-stats-card">
        <view class="card-header">
          <Icon name="chart" size="64rpx" color="#3B82F6" />
          <text class="card-title">今日使用统计</text>
        </view>
        <view class="stats-content">
          <view class="stat-row">
            <text class="stat-label">已使用时间</text>
            <text class="stat-value primary">{{ formatTime(usedTime) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">剩余时间</text>
            <text class="stat-value" :class="{ warning: remainingTime <= 300, danger: remainingTime <= 60 }">
              {{ timeLimitEnabled ? formatTime(remainingTime) : '无限制' }}
            </text>
          </view>
          <view class="progress-section">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :class="{ 
                  warning: usagePercentage >= 80, 
                  danger: usagePercentage >= 90 
                }"
                :style="{ width: usagePercentage + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ usagePercentage }}%</text>
          </view>
        </view>
      </view>

      <view class="weekly-stats-card">
        <view class="card-header">
          <Icon name="calendar" size="64rpx" color="#10B981" />
          <text class="card-title">本周使用统计</text>
        </view>
        <view class="weekly-chart">
          <view v-for="(day, index) in weeklyData" :key="index" class="chart-bar">
            <view 
              class="bar-fill" 
              :style="{ height: (day.percentage || 0) + '%' }"
            ></view>
            <text class="bar-label">{{ day.label }}</text>
          </view>
        </view>
        <view class="weekly-summary">
          <view class="summary-item">
            <text class="summary-label">本周总时长</text>
            <text class="summary-value">{{ formatTime(weeklyTotalTime) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">日均时长</text>
            <text class="summary-value">{{ formatTime(Math.round(weeklyTotalTime / 7)) }}</text>
          </view>
        </view>
      </view>

      <view class="quick-presets">
        <text class="presets-title">快速设置</text>
        <view class="presets-grid">
          <view 
            v-for="preset in timePresets" 
            :key="preset.value" 
            class="preset-item"
            :class="{ active: currentPreset === preset.value }"
            @tap="applyPreset(preset)"
          >
            <text class="preset-label">{{ preset.label }}</text>
            <text class="preset-time">{{ preset.time }}</text>
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

const timeLimitEnabled = ref(true);
const maxUsageHours = ref(1);
const maxUsageMinutes = ref(30);
const dailyStartTime = ref('08:00');
const usedTime = ref(0);
const currentPreset = ref(90);

const weeklyData = ref([
  { label: '周一', time: 0, percentage: 0 },
  { label: '周二', time: 0, percentage: 0 },
  { label: '周三', time: 0, percentage: 0 },
  { label: '周四', time: 0, percentage: 0 },
  { label: '周五', time: 0, percentage: 0 },
  { label: '周六', time: 0, percentage: 0 },
  { label: '周日', time: 0, percentage: 0 }
]);

const timePresets = [
  { label: '30分钟', time: '30分钟', value: 30 },
  { label: '1小时', time: '1小时', value: 60 },
  { label: '1.5小时', time: '1.5小时', value: 90 },
  { label: '2小时', time: '2小时', value: 120 }
];

const maxUsageTime = computed(() => {
  return maxUsageHours.value * 3600 + maxUsageMinutes.value * 60;
});

const remainingTime = computed(() => {
  if (!timeLimitEnabled.value) return Infinity;
  return Math.max(0, maxUsageTime.value - usedTime.value);
});

const usagePercentage = computed(() => {
  if (!timeLimitEnabled.value) return 0;
  if (maxUsageTime.value === 0) return 0;
  return Math.min(100, Math.round((usedTime.value / maxUsageTime.value) * 100));
});

const weeklyTotalTime = computed(() => {
  return weeklyData.value.reduce((sum, day) => sum + day.time, 0);
});

const formatTime = (seconds: number) => {
  if (seconds === Infinity || seconds >= 86400) return '无限制';
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
};

const goBack = () => {
  uni.navigateBack();
};

const onTimeLimitChange = (e: any) => {
  timeLimitEnabled.value = e.detail.value;
  globalStore.setTimeLimitEnabled(timeLimitEnabled.value);
  
  uni.showToast({
    title: timeLimitEnabled.value ? '时长限制已启用' : '时长限制已关闭',
    icon: 'success',
    duration: 1500
  });
};

const onMaxUsageTimeChange = () => {
  const totalMinutes = maxUsageHours.value * 60 + maxUsageMinutes.value;
  globalStore.setMaxUsageTime(totalMinutes);
  
  currentPreset.value = totalMinutes;
};

const onDailyStartTimeChange = (e: any) => {
  dailyStartTime.value = e.detail.value;
  globalStore.setDailyStartTime(dailyStartTime.value);
  
  uni.showToast({
    title: '开始时间已更新',
    icon: 'success',
    duration: 1500
  });
};

const applyPreset = (preset: any) => {
  maxUsageHours.value = Math.floor(preset.value / 60);
  maxUsageMinutes.value = preset.value % 60;
  currentPreset.value = preset.value;
  
  globalStore.setMaxUsageTime(preset.value);
  
  uni.showToast({
    title: `已设置为${preset.time}`,
    icon: 'success',
    duration: 1500
  });
};

const loadData = () => {
  timeLimitEnabled.value = globalStore.timeLimitEnabled;
  
  const totalMinutes = globalStore.maxUsageTime;
  maxUsageHours.value = Math.floor(totalMinutes / 60);
  maxUsageMinutes.value = totalMinutes % 60;
  currentPreset.value = totalMinutes;
  
  dailyStartTime.value = globalStore.dailyStartTime;
  usedTime.value = globalStore.usedTime;

  loadWeeklyData();
};

const loadWeeklyData = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const records = globalStore.learningRecords || [];
  
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
    weeklyData.value[i].time = dayTime;
    weeklyData.value[i].percentage = Math.min(100, Math.round((dayTime / 3600) * 100));
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.usage-time-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FBBF24 0%, #FCD34D 100%);
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

.time-limit-card,
.daily-start-card,
.today-stats-card,
.weekly-stats-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.limit-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
}

.toggle-label {
  font-size: 28rpx;
  color: #333333;
}

.limit-input {
  margin-top: 24rpx;
}

.input-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 16rpx;
}

.time-selector {
  display: flex;
  gap: 24rpx;
}

.time-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background: #F9F9F9;
  border-radius: 12rpx;
  padding: 16rpx;
}

.time-input {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  text-align: center;
}

.time-unit {
  font-size: 24rpx;
  color: #666666;
  margin-left: 8rpx;
}

.start-time-selector {
  margin-top: 16rpx;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
}

.picker-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.start-time-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
  display: block;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 28rpx;
  color: #666666;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
}

.stat-value.primary {
  color: #3B82F6;
}

.stat-value.warning {
  color: #FBBF24;
}

.stat-value.danger {
  color: #FF476F;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 20rpx;
  background: #F0F0F0;
  border-radius: 10rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
  border-radius: 10rpx;
  transition: width 0.5s ease;
}

.progress-fill.warning {
  background: linear-gradient(90deg, #FBBF24, #FCD34D);
}

.progress-fill.danger {
  background: linear-gradient(90deg, #FF476F, #FF6B8A);
}

.progress-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #3B82F6;
  min-width: 60rpx;
  text-align: right;
}

.weekly-chart {
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
  gap: 12rpx;
}

.bar-fill {
  width: 40rpx;
  background: linear-gradient(180deg, #10B981, #34D399);
  border-radius: 8rpx 8rpx 0 0;
  min-height: 8rpx;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 20rpx;
  color: #666666;
}

.weekly-summary {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.summary-item {
  flex: 1;
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  text-align: center;
}

.summary-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #10B981;
}

.quick-presets {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.presets-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.preset-item {
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.preset-item.active {
  background: #FBBF24;
  border-color: #F59E0B;
}

.preset-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.preset-item.active .preset-label {
  color: #FFFFFF;
}

.preset-time {
  font-size: 24rpx;
  color: #666666;
}

.preset-item.active .preset-time {
  color: rgba(255, 255, 255, 0.8);
}
</style>
