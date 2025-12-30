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
    audioManager.playOnce(file, type)
    
    // 如果提供了完成回调，根据音频类型设置不同的超时时间
    if (onComplete) {
      // 根据音频类型设置合理的超时时间
      let timeout = 5000 // 默认5秒
      if (type === 'common') {
        timeout = 2000 // 点击音效等短音频
      } else if (type === 'guide') {
        timeout = 15000 // 引导音频
      } else if (type === 'phonics') {
        timeout = 10000 // 拼音音频
      }
      
      setTimeout(onComplete, timeout)
    }
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