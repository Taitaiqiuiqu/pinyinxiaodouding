<template>
  <view 
    v-if="visible"
    class="floating-ball"
    :class="{ 'docked': isDocked, 'half-visible': isHalfVisible, 'dragging': isDragging, 'playing': isPlaying, 'pressed': isPressed }"
    :style="ballStyle"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <view class="ball-content">
      <view class="ball-icon-wrapper">
        <text class="ball-icon" :style="{ fontSize: `${iconSize.value}px` }">{{ isPlaying ? '🎵' : '▶' }}</text>
      </view>
      <view class="ball-ripple" v-if="isPlaying"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGlobalStore } from '../../store/global'
import GlobalAudioManager from '../../services/GlobalAudioManager'

const globalStore = useGlobalStore()
const audioManager = GlobalAudioManager.getInstance()

console.log('[FloatingBall] Component initialized')

const visible = computed(() => {
  const isVisible = globalStore.showFloatingBall
  console.log('[FloatingBall] visible computed:', isVisible, 'showFloatingBall:', globalStore.showFloatingBall)
  return isVisible
})

const isPlaying = computed(() => globalStore.songPlaying)

watch(() => globalStore.showFloatingBall, (newVal) => {
  console.log('[FloatingBall] showFloatingBall changed:', newVal)
})

watch(() => globalStore.songPlaying, (newVal) => {
  console.log('[FloatingBall] songPlaying changed:', newVal)
})

const ballPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const isDocked = ref(false)
const isHalfVisible = ref(false)
const dockTimer = ref<number | null>(null)
const hasMoved = ref(false)
const isPressed = ref(false)
const screenWidth = ref(375)
const screenHeight = ref(667)

const ballSize = computed(() => {
  return Math.floor(screenWidth.value * 0.175)
})

const ballStyle = computed(() => {
  const { x, y } = ballPosition.value
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${ballSize.value}px`,
    height: `${ballSize.value}px`
  }
})

const iconSize = computed(() => {
  return Math.floor(ballSize.value * 0.45)
})

let startX = 0
let startY = 0
let lastX = 0
let lastY = 0

const onTouchStart = (e: any) => {
  hasMoved.value = false
  isDragging.value = true
  isPressed.value = true
  
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  
  if (isDocked.value) {
    const safeArea = 20
    if (ballPosition.value.x < 0) {
      lastX = safeArea
    } else {
      lastX = screenWidth.value - ballSize.value - safeArea
    }
  } else {
    lastX = ballPosition.value.x
  }
  
  lastY = ballPosition.value.y
  
  isDocked.value = false
  isHalfVisible.value = false
  
  resetDockTimer()
}

const onTouchMove = (e: any) => {
  if (!isDragging.value) return
  
  const deltaX = e.touches[0].clientX - startX
  const deltaY = e.touches[0].clientY - startY
  
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    hasMoved.value = true
  }
  
  const safeArea = 10
  const maxX = screenWidth.value - ballSize.value - safeArea
  const maxY = screenHeight.value - ballSize.value - safeArea
  
  ballPosition.value.x = Math.max(safeArea, Math.min(lastX + deltaX, maxX))
  ballPosition.value.y = Math.max(safeArea, Math.min(lastY + deltaY, maxY))
  
  resetDockTimer()
}

const onTouchEnd = () => {
  isDragging.value = false
  isPressed.value = false
  
  if (!hasMoved.value) {
    handleTap()
    resetDockTimer()
    return
  }
  
  dockToEdge()
  startDockTimer()
}

const handleTap = () => {
  ensureFullyVisible()
  togglePlayPause()
}

const ensureFullyVisible = () => {
  const safeArea = 20
  const maxX = screenWidth.value - ballSize.value - safeArea
  
  if (ballPosition.value.x < 0) {
    ballPosition.value.x = safeArea
  } else if (ballPosition.value.x > maxX) {
    ballPosition.value.x = maxX
  }
  
  isDocked.value = false
  isHalfVisible.value = false
}

const togglePlayPause = () => {
  console.log('[FloatingBall] togglePlayPause called, isPlaying:', isPlaying.value)
  
  if (isPlaying.value) {
    console.log('[FloatingBall] Pausing song')
    audioManager.pauseSong()
    globalStore.setSongPlaying(false)
  } else {
    console.log('[FloatingBall] Resuming song')
    audioManager.resumeSong()
    globalStore.setSongPlaying(true)
  }
}

const startDockTimer = () => {
  if (dockTimer.value) {
    clearTimeout(dockTimer.value)
  }
  
  dockTimer.value = setTimeout(() => {
    dockToEdge()
  }, 8000) as unknown as number
}

const resetDockTimer = () => {
  if (dockTimer.value) {
    clearTimeout(dockTimer.value)
    dockTimer.value = null
  }
  
  isDocked.value = false
  isHalfVisible.value = false
}

const dockToEdge = () => {
  const { x, y } = ballPosition.value
  
  console.log('[FloatingBall] Dock to edge - Current position:', { x, y, screenWidth: screenWidth.value, screenHeight: screenHeight.value })
  
  let newX = x
  let newY = y
  
  const centerX = screenWidth.value / 2
  const safeArea = 0
  
  if (x < centerX) {
    newX = -ballSize.value / 2
    console.log('[FloatingBall] Docking to left edge, half visible')
  } else {
    newX = screenWidth.value - ballSize.value / 2
    console.log('[FloatingBall] Docking to right edge, half visible')
  }
  
  const maxY = screenHeight.value - ballSize.value - safeArea
  newY = Math.max(safeArea, Math.min(y, maxY))
  
  console.log('[FloatingBall] Dock to edge - New position:', { newX, newY, ballSize: ballSize.value })
  
  ballPosition.value = { x: newX, y: newY }
  isDocked.value = true
  isHalfVisible.value = true
}

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  screenWidth.value = systemInfo.screenWidth || systemInfo.windowWidth || 375
  screenHeight.value = systemInfo.screenHeight || systemInfo.windowHeight || 667
  const pixelRatio = systemInfo.pixelRatio || 2
  
  console.log('[FloatingBall] Screen size:', { 
    screenWidth: screenWidth.value, 
    screenHeight: screenHeight.value, 
    pixelRatio,
    ballSize: ballSize.value,
    iconSize: iconSize.value
  })
  
  const safeArea = 20
  
  ballPosition.value = {
    x: screenWidth.value - ballSize.value - safeArea,
    y: screenHeight.value - ballSize.value - 150
  }
  
  console.log('[FloatingBall] Initial position:', ballPosition.value)
})

onUnmounted(() => {
  if (dockTimer.value) {
    clearTimeout(dockTimer.value)
  }
})
</script>

<style scoped>
.floating-ball {
  position: fixed;
  border-radius: 50%;
  background: #FBBF24;
  border: 8px solid #FFFFFF;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 12px 0 #D97706;
  z-index: 9999;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.floating-ball.docked {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-ball.dragging {
  transition: none;
  transform: scale(1.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 15px 0 #D97706;
}

.floating-ball.pressed {
  transform: scale(0.92);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2), 0 8px 0 #D97706;
}

.floating-ball.half-visible {
  opacity: 0.65;
}

.ball-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.ball-icon-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.ball-icon {
  color: #FFFFFF;
  line-height: 1;
  user-select: none;
  -webkit-user-select: none;
}

.floating-ball.playing .ball-icon {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.ball-ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: ripple 1.5s ease-in-out infinite;
  z-index: 1;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

.floating-ball:active {
  transform: scale(0.95);
}
</style>
