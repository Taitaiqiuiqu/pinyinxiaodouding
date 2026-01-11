<template>
  <view class="learning-content-page">
    <AudioPlayer ref="audioPlayer" />
    
    <view class="header">
      <view class="header-left" @tap="goBack">
        <Icon name="arrow-left" size="48rpx" color="#FFFFFF" />
      </view>
      <text class="page-title">学习内容</text>
      <view class="header-right"></view>
    </view>

    <view class="main-content">
      <view class="difficulty-card">
        <view class="card-header">
          <Icon name="star" size="64rpx" color="#FF476F" />
          <text class="card-title">难度级别</text>
        </view>
        <view class="difficulty-selector">
          <view 
            v-for="level in difficultyLevels" 
            :key="level.value"
            class="difficulty-item"
            :class="{ active: currentDifficulty === level.value }"
            @tap="selectDifficulty(level.value)"
          >
            <view class="difficulty-icon" :style="{ background: level.color }">
              <Icon :name="level.icon" size="48rpx" color="#FFFFFF" />
            </view>
            <text class="difficulty-label">{{ level.label }}</text>
            <text class="difficulty-desc">{{ level.desc }}</text>
          </view>
        </view>
      </view>

      <view class="modules-card">
        <view class="card-header">
          <Icon name="grid" size="64rpx" color="#3B82F6" />
          <text class="card-title">学习模块</text>
        </view>
        <view class="modules-list">
          <view 
            v-for="module in learningModules" 
            :key="module.key"
            class="module-item"
            :class="{ disabled: !module.enabled }"
          >
            <view class="module-icon" :style="{ background: module.color }">
              <Icon :name="module.icon" size="48rpx" color="#FFFFFF" />
            </view>
            <view class="module-info">
              <text class="module-title">{{ module.title }}</text>
              <text class="module-desc">{{ module.desc }}</text>
            </view>
            <switch 
              :checked="module.enabled" 
              @change="onModuleChange(module.key, $event)"
              color="#3B82F6"
            />
          </view>
        </view>
      </view>

      <view class="age-level-card">
        <view class="card-header">
          <Icon name="user" size="64rpx" color="#FBBF24" />
          <text class="card-title">年龄阶段</text>
        </view>
        <view class="age-level-selector">
          <view 
            v-for="age in ageLevels" 
            :key="age.value"
            class="age-level-item"
            :class="{ active: currentAgeLevel === age.value }"
            @tap="selectAgeLevel(age.value)"
          >
            <text class="age-level-label">{{ age.label }}</text>
            <text class="age-level-desc">{{ age.desc }}</text>
          </view>
        </view>
      </view>

      <view class="content-preview-card">
        <view class="card-header">
          <Icon name="eye" size="64rpx" color="#10B981" />
          <text class="card-title">当前配置预览</text>
        </view>
        <view class="preview-content">
          <view class="preview-item">
            <text class="preview-label">难度级别</text>
            <text class="preview-value">{{ getCurrentDifficultyLabel() }}</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">年龄阶段</text>
            <text class="preview-value">{{ getCurrentAgeLabel() }}</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">启用模块</text>
            <text class="preview-value">{{ getEnabledModulesCount() }}个模块</text>
          </view>
        </view>
      </view>

      <view class="save-tips">
        <Icon name="info" size="32rpx" color="#999999" />
        <text class="tips-text">设置将自动保存，下次启动时生效</text>
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

const currentDifficulty = ref('auto');
const currentAgeLevel = ref('4-6');

const difficultyLevels = [
  { 
    label: '简单', 
    value: 'easy', 
    icon: 'smile',
    desc: '适合初学者',
    color: '#10B981'
  },
  { 
    label: '中等', 
    value: 'medium', 
    icon: 'star',
    desc: '适合有一定基础',
    color: '#FBBF24'
  },
  { 
    label: '困难', 
    value: 'hard', 
    icon: 'fire',
    desc: '适合进阶学习',
    color: '#FF476F'
  },
  { 
    label: '自动', 
    value: 'auto', 
    icon: 'magic',
    desc: '根据进度自动调整',
    color: '#8B5CF6'
  }
];

const learningModules = ref([
  {
    key: 'enablePhonics',
    title: '拼音启蒙',
    desc: '声母、韵母、整体认读音节',
    icon: 'course',
    color: '#FF476F',
    enabled: true
  },
  {
    key: 'enableGames',
    title: '游戏训练',
    desc: '听音猜字、连连看、拼写练习',
    icon: 'game',
    color: '#FBBF24',
    enabled: true
  },
  {
    key: 'enableWorkbook',
    title: '练习册',
    desc: '填空、连线、排序、分类',
    icon: 'course',
    color: '#3B82F6',
    enabled: true
  },
  {
    key: 'enableSongs',
    title: '儿歌',
    desc: '拼音儿歌、童谣',
    icon: 'music',
    color: '#10B981',
    enabled: true
  }
]);

const ageLevels = [
  { 
    label: '3-4岁', 
    value: '3-4', 
    desc: '启蒙阶段，注重兴趣培养' 
  },
  { 
    label: '4-6岁', 
    value: '4-6', 
    desc: '基础阶段，系统学习拼音' 
  },
  { 
    label: '6-8岁', 
    value: '6-8', 
    desc: '提高阶段，强化应用能力' 
  }
];

const getCurrentDifficultyLabel = () => {
  const level = difficultyLevels.find(l => l.value === currentDifficulty.value);
  return level ? level.label : '自动';
};

const getCurrentAgeLabel = () => {
  const age = ageLevels.find(a => a.value === currentAgeLevel.value);
  return age ? age.label : '4-6岁';
};

const getEnabledModulesCount = () => {
  return learningModules.value.filter(m => m.enabled).length;
};

const goBack = () => {
  uni.navigateBack();
};

const selectDifficulty = (value: string) => {
  currentDifficulty.value = value;
  saveSettings();
  
  uni.showToast({
    title: '难度已更新',
    icon: 'success',
    duration: 1500
  });
};

const selectAgeLevel = (value: string) => {
  currentAgeLevel.value = value;
  globalStore.setAgeLevel(value);
  
  uni.showToast({
    title: '年龄阶段已更新',
    icon: 'success',
    duration: 1500
  });
};

const onModuleChange = (key: string, e: any) => {
  const module = learningModules.value.find(m => m.key === key);
  if (module) {
    module.enabled = e.detail.value;
    saveSettings();
    
    const enabledCount = getEnabledModulesCount();
    if (enabledCount === 0) {
      uni.showToast({
        title: '至少需要启用一个模块',
        icon: 'none',
        duration: 2000
      });
      module.enabled = true;
      saveSettings();
      return;
    }
    
    uni.showToast({
      title: module.enabled ? '模块已启用' : '模块已禁用',
      icon: 'success',
      duration: 1500
    });
  }
};

const saveSettings = () => {
  const settings = {
    enablePhonics: learningModules.value[0].enabled,
    enableGames: learningModules.value[1].enabled,
    enableWorkbook: learningModules.value[2].enabled,
    enableSongs: learningModules.value[3].enabled,
    difficultyLevel: currentDifficulty.value
  };
  
  globalStore.setLearningContentSettings(settings);
};

const loadData = () => {
  const settings = globalStore.learningContentSettings;
  if (settings) {
    learningModules.value[0].enabled = settings.enablePhonics ?? true;
    learningModules.value[1].enabled = settings.enableGames ?? true;
    learningModules.value[2].enabled = settings.enableWorkbook ?? true;
    learningModules.value[3].enabled = settings.enableSongs ?? true;
    currentDifficulty.value = settings.difficultyLevel || 'auto';
  }

  currentAgeLevel.value = globalStore.ageGroup;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.learning-content-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%);
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

.difficulty-card,
.modules-card,
.age-level-card,
.content-preview-card {
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

.difficulty-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.difficulty-item {
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.difficulty-item.active {
  background: #FF476F;
  border-color: #E53E5F;
}

.difficulty-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16rpx;
}

.difficulty-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.difficulty-item.active .difficulty-label {
  color: #FFFFFF;
}

.difficulty-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.difficulty-item.active .difficulty-desc {
  color: rgba(255, 255, 255, 0.8);
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.module-item.disabled {
  opacity: 0.5;
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.module-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.age-level-selector {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.age-level-item {
  padding: 24rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.age-level-item.active {
  background: #FBBF24;
  border-color: #F59E0B;
}

.age-level-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.age-level-item.active .age-level-label {
  color: #FFFFFF;
}

.age-level-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.age-level-item.active .age-level-desc {
  color: rgba(255, 255, 255, 0.8);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 28rpx;
  color: #666666;
}

.preview-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.save-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-top: 16rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
