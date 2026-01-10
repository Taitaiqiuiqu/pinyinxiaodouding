<template>
  <!-- AudioPlayer组件 -->
</template>

<script setup lang="ts">
import GlobalAudioManager from '../../services/GlobalAudioManager'

const audioManager = GlobalAudioManager.getInstance()

const play = (params: { type: string; file: string; loop?: boolean; onComplete?: () => void }) => {
  const { type, file, loop = false, onComplete } = params
  
  if (loop) {
    audioManager.startLoop(file, type)
  } else {
    audioManager.playOnce(file, type, onComplete)
  }
}

const playSong = (params: { type: string; file: string; onComplete?: () => void }) => {
  const { type, file, onComplete } = params
  audioManager.playSong(file, type, onComplete)
}

const pauseSong = () => {
  audioManager.pauseSong()
}

const resumeSong = () => {
  audioManager.resumeSong()
}

const stopSong = () => {
  audioManager.stopSong()
}

const stop = () => {
  audioManager.stopLoop()
  console.log('[AudioPlayer] 音频已停止')
}

defineExpose({
  play,
  playSong,
  pauseSong,
  resumeSong,
  stopSong,
  stop
})
</script>

<style scoped>
/* 组件样式 */
</style>