<template>
  <view class="songs-page">
    <AudioPlayer ref="audioPlayer" />
    <FloatingBall />
    
    <view class="decoration-block decoration-1"></view>
    <view class="decoration-block decoration-2"></view>
    
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">拼音儿歌</text>
    </view>
    
    <view class="main-content">
      <view class="songs-list">
        <view 
          v-for="(song, index) in songs" 
          :key="index"
          :id="`song-${index}`"
          class="song-card"
          @click="playSong(index)"
        >
          <view class="song-content">
            <view class="song-icon">
              <text v-if="currentSongIndex === index && isPlaying" class="playing-icon">🎵</text>
              <text v-else class="play-icon">▶</text>
            </view>
            <view class="song-info">
              <text class="song-title">{{ song.title }}</text>
              <text class="song-desc">{{ song.desc }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="bottom-tip">
        <text class="tip-text">点击儿歌开始播放 ✨</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';
import AudioPlayer from '../../src/components/AudioPlayer/AudioPlayer.vue';
import { useGlobalStore } from '../../src/store/global';
import FloatingBall from '../../src/components/FloatingBall/FloatingBall.vue';

const audioPlayer = ref<InstanceType<typeof AudioPlayer>>();
const globalStore = useGlobalStore();
const currentSongIndex = ref(-1);
const isPlaying = ref(false);

const songs = [
  {
    title: '拼音歌',
    desc: 'a o e i u ü',
    audio: 'speak_song'
  },
  {
    title: '字母歌',
    desc: 'b p m f d t n l',
    audio: 'study_songs'
  }
];

const playSong = (index: number) => {
  if (currentSongIndex.value === index && isPlaying.value) {
    stopSong();
    return;
  }
  
  audioPlayer.value?.stopSong();
  currentSongIndex.value = index;
  isPlaying.value = true;
  
  const song = songs[index];
  globalStore.setCurrentSongIndex(index);
  globalStore.setCurrentSongTitle(song.title);
  globalStore.setSongPlaying(true);
  globalStore.setShowFloatingBall(true);
  
  audioPlayer.value?.playSong({
    type: 'songs',
    file: song.audio,
    onComplete: () => {
      isPlaying.value = false;
      globalStore.setSongPlaying(false);
      globalStore.setShowFloatingBall(false);
    }
  });
};

const stopSong = () => {
  audioPlayer.value?.stopSong();
  isPlaying.value = false;
  currentSongIndex.value = -1;
  globalStore.setSongPlaying(false);
  globalStore.setCurrentSongIndex(-1);
  globalStore.setCurrentSongTitle('');
  globalStore.setShowFloatingBall(false);
};

const goBack = () => {
  uni.navigateBack();
};

onShow(() => {
  if (globalStore.currentSongIndex !== -1) {
    currentSongIndex.value = globalStore.currentSongIndex;
    isPlaying.value = globalStore.songPlaying;
  }
});

onHide(() => {
});
</script>

<style scoped>
.songs-page {
  min-height: 100vh;
  background: #FF476F;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

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
  bottom: 100rpx;
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
  background: #3B82F6;
  transform: rotate(-8deg);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-20rpx) rotate(-12deg); }
}

@keyframes float-left {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-25rpx) rotate(20deg); }
}

.header {
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 40rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
}

.main-content {
  flex: 1;
  padding: 0 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.songs-list {
  width: 100%;
  max-width: 680rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.song-card {
  background: #FBBF24;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 8rpx solid #FFFFFF;
  box-shadow: 0 12rpx 0 #D97706;
}

.song-card:active {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.song-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.song-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.play-icon {
  font-size: 32rpx;
  color: #FFFFFF;
}

.playing-icon {
  font-size: 40rpx;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.song-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.song-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.bottom-tip {
  margin-top: 60rpx;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 16rpx 40rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}
</style>
