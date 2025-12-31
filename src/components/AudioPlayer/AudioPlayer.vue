<template>
  <!-- AudioPlayer组件 -->
</template>

<script setup lang="ts">
import GlobalAudioManager from '../../services/GlobalAudioManager'

const audioManager = GlobalAudioManager.getInstance()

/**
 * 播放音频方法
 * @param params 音频参数
 */
const play = (params: { type: string; file: string; loop?: boolean; onComplete?: () => void }) => {
  const { type, file, loop = false, onComplete } = params
  
  if (loop) {
    audioManager.startLoop(file, type)
  } else {
    // 直接将onComplete回调传递给playOnce方法，由GlobalAudioManager在音频真正结束时调用
    audioManager.playOnce(file, type, onComplete)
  }
}

/**
 * 停止音频播放方法
 */
const stop = () => {
  // 停止循环播放
  audioManager.stopLoop()
  // 由于GlobalAudioManager没有提供停止单次播放的方法，这里可以考虑扩展
  console.log('[AudioPlayer] 音频已停止')
}

defineExpose({
  play,
  stop
})
</script>

<style scoped>
/* 组件样式 */
</style>