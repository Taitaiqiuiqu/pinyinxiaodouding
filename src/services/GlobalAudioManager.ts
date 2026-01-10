import { getAudioInfo } from './cloud/audio'

class GlobalAudioManager {
  private static instance: GlobalAudioManager | null = null
  private ctx: UniApp.InnerAudioContext | null = null
  private isPlaying: boolean = false
  private currentAudioFile: string = ''
  private audioType: string = ''
  private onCompleteCallback: (() => void) | null = null
  private audioCache: Map<string, string> = new Map()
  private songPaused: boolean = false
  private currentSongFile: string = ''
  private currentSongType: string = '' // 音频URL缓存

  private constructor() {
    this.init()
  }

  static getInstance(): GlobalAudioManager {
    if (!GlobalAudioManager.instance) {
      GlobalAudioManager.instance = new GlobalAudioManager()
    }
    return GlobalAudioManager.instance
  }

  private init() {
    if (uni && typeof uni.createInnerAudioContext === 'function') {
      this.ctx = uni.createInnerAudioContext()
      // 在小程序中，需要设置 autoplay: false 来避免自动播放问题
      this.ctx.autoplay = false
      // 设置音量，默认音量可能过小
      this.ctx.volume = 1
      this.ctx.onEnded(() => this.onEnded())
      this.ctx.onError((e) => this.onError(e))
      this.ctx.onCanplay(() => this.onCanplay())
      this.ctx.onPlay(() => this.onPlay())
      this.ctx.onWaiting(() => this.onWaiting())
      this.ctx.onStop(() => this.onStop())
      console.log('[GlobalAudioManager] context created')
    } else {
      console.error('[GlobalAudioManager] uni.createInnerAudioContext not available')
    }
  }

  private async loadAudioFromCloud(audioId: string, audioType: string): Promise<string | null> {
    try {
      console.log('[GlobalAudioManager] 开始从云端加载音频 ====== START ======')
      console.log('[GlobalAudioManager] 音频ID:', audioId)
      console.log('[GlobalAudioManager] 音频类型:', audioType)
      
      // 使用统一的云服务获取音频信息
      const startTime = Date.now()
      const audioInfo = await getAudioInfo(audioId, audioType)
      const endTime = Date.now()
      
      console.log('[GlobalAudioManager] 调用getAudioInfo耗时:', endTime - startTime, 'ms')
      
      if (!audioInfo) {
        console.warn('[GlobalAudioManager] ⚠️  未找到音频ID', audioId, '对应的信息')
        console.log('[GlobalAudioManager] 从云端加载音频结束 ====== END ======')
        return null
      }
      
      console.log('[GlobalAudioManager] 获取到音频信息:', audioInfo)
      
      // 使用audioInfo中的tempFileURL，getAudioInfo已经处理了临时链接获取
      if (audioInfo.tempFileURL) {
        console.log('[GlobalAudioManager] ✅ 成功获取云端音频临时链接:', audioInfo.tempFileURL)
        console.log('[GlobalAudioManager] 从云端加载音频结束 ====== END ======')
        return audioInfo.tempFileURL
      }
      
      console.error('[GlobalAudioManager] ❌ 无法获取音频临时链接')
      console.error('[GlobalAudioManager] 从云端加载音频结束 ====== ERROR ======')
      return null
    } catch (error: any) {
      console.error('[GlobalAudioManager] ❌ 从云端加载音频失败 - 异常捕获')
      console.error('[GlobalAudioManager] 错误类型:', typeof error)
      console.error('[GlobalAudioManager] 错误对象:', error)
      if (error.stack) {
        console.error('[GlobalAudioManager] 错误堆栈:', error.stack)
      }
      console.error('[GlobalAudioManager] 从云端加载音频结束 ====== ERROR ======')
      return null
    }
  }

  private async playAudio() {
    if (!this.ctx) {
      console.warn('[GlobalAudioManager] audio context unavailable')
      return
    }
    
    console.log('[GlobalAudioManager] 开始播放音频:', this.currentAudioFile)
    
    // 生成缓存键
    const cacheKey = `${this.audioType}_${this.currentAudioFile}`
    
    // 检查缓存
    let audioURL = this.audioCache.get(cacheKey)
    
    // 如果缓存中没有，从云端加载
    if (!audioURL) {
      const tempAudioURL = await this.loadAudioFromCloud(this.currentAudioFile, this.audioType)
      
      if (!tempAudioURL) {
        console.error('[GlobalAudioManager] 云端音频加载失败，无法播放音频:', this.currentAudioFile)
        return
      }
      
      audioURL = tempAudioURL
      // 缓存音频URL
      this.audioCache.set(cacheKey, audioURL)
      console.log('[GlobalAudioManager] 音频URL已缓存:', cacheKey)
    } else {
      console.log('[GlobalAudioManager] 从缓存获取音频URL:', cacheKey)
    }
    
    console.log('[GlobalAudioManager] 设置音频源 src:', audioURL)
    this.ctx.src = audioURL
    
    console.log('[GlobalAudioManager] src 设置完成，完整路径:', this.ctx.src)
    
    console.log('[GlobalAudioManager] 开始调用 play()...')
    this.ctx.play()
    console.log('[GlobalAudioManager] play() 调用完成')
  }

  startLoop(audioFile: string, audioType: string = 'guide') {
    if (this.isPlaying) {
      console.log('[GlobalAudioManager] 音频已在播放中，先停止当前循环')
      this.stopLoop()
    }
    
    this.currentAudioFile = audioFile
    this.audioType = audioType
    this.isPlaying = true
    
    // 立即播放第一次
    this.playAudio()
    
    console.log('[GlobalAudioManager] 开始循环播放音频:', audioFile, '播放完成后等待3秒再播放')
  }

  stopLoop() {
    console.log('[GlobalAudioManager] 停止循环播放')
    this.isPlaying = false
    
    // 停止当前音频播放
    if (this.ctx) {
      this.ctx.stop()
    }
  }

  playOnce(audioFile: string, audioType: string = 'guide', onComplete?: () => void) {
    console.log('[GlobalAudioManager] playOnce called with:', audioFile, audioType)
    this.currentAudioFile = audioFile
    this.audioType = audioType
    this.isPlaying = false
    this.onCompleteCallback = onComplete || null
    this.playAudio()
  }

  playSong(audioFile: string, audioType: string = 'songs', onComplete?: () => void) {
    console.log('[GlobalAudioManager] playSong called with:', audioFile, audioType)
    this.currentSongFile = audioFile
    this.currentSongType = audioType
    this.songPaused = false
    this.currentAudioFile = audioFile
    this.audioType = audioType
    this.isPlaying = false
    this.onCompleteCallback = onComplete || null
    this.playAudio()
  }

  pauseSong() {
    if (this.ctx && this.currentSongFile) {
      console.log('[GlobalAudioManager] 暂停儿歌播放')
      this.ctx.pause()
      this.songPaused = true
    }
  }

  resumeSong() {
    if (this.ctx && this.songPaused && this.currentSongFile) {
      console.log('[GlobalAudioManager] 恢复儿歌播放')
      this.ctx.play()
      this.songPaused = false
    }
  }

  stopSong() {
    if (this.ctx) {
      console.log('[GlobalAudioManager] 停止儿歌播放')
      this.ctx.stop()
      this.songPaused = false
      this.currentSongFile = ''
      this.currentSongType = ''
    }
  }

  isSongPlaying(): boolean {
    return this.currentSongFile !== '' && !this.songPaused
  }

  isSongPaused(): boolean {
    return this.songPaused
  }

  private onEnded() {
    console.log('[GlobalAudioManager] audio ended:', this.ctx?.src)
    
    // 如果正在循环播放，等待指定时间后播放下一次
    if (this.isPlaying) {
      console.log('[GlobalAudioManager] 音频播放完成，等待3秒后播放下一次:', this.currentAudioFile)
      
      setTimeout(() => {
        if (this.isPlaying) {
          console.log('[GlobalAudioManager] 等待完成，开始播放下一次:', this.currentAudioFile)
          this.playAudio()
        }
      }, 3000) // 固定等待3秒
    } else if (this.onCompleteCallback) {
      // 单次播放完成，调用回调函数
      console.log('[GlobalAudioManager] 单次播放完成，调用onComplete回调')
      const callback = this.onCompleteCallback
      this.onCompleteCallback = null // 清空回调，避免重复调用
      callback()
    }
  }

  private onError(e: any) {
    console.error('[GlobalAudioManager] audio error:', e)
    console.error('[GlobalAudioManager] audio error details:', JSON.stringify(e))
  }

  private onCanplay() {
    console.log('[GlobalAudioManager] audio can play:', this.ctx?.src)
  }

  private onPlay() {
    console.log('[GlobalAudioManager] audio playing:', this.ctx?.src)
  }

  private onWaiting() {
    console.log('[GlobalAudioManager] audio waiting:', this.ctx?.src)
  }

  private onStop() {
    console.log('[GlobalAudioManager] audio stopped:', this.ctx?.src)
  }

  destroy() {
    this.stopLoop()
    if (this.ctx) {
      this.ctx.destroy()
      this.ctx = null
    }
    GlobalAudioManager.instance = null
  }
}

export default GlobalAudioManager
