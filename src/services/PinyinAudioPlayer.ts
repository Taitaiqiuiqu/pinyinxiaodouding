import { getPinyinAudioFileID, getPinyinAllTonesFileIDs, PinyinAudioOptions } from './pinyinAudio'

export interface PlayOptions {
  pinyin: string
  tone?: 0 | 1 | 2 | 3 | 4
  onComplete?: () => void
  onError?: (error: any) => void
}

export interface PlayAllTonesOptions {
  pinyin: string
  interval?: number
  onComplete?: () => void
  onError?: (error: any) => void
}

export interface PlaySequenceOptions {
  pinyinList: Array<{ pinyin: string; tone?: 0 | 1 | 2 | 3 | 4 }>
  interval?: number
  onComplete?: () => void
  onError?: (error: any) => void
}

export class PinyinAudioPlayer {
  private currentAudio: UniApp.InnerAudioContext | null = null
  private isPlaying: boolean = false

  play(options: PlayOptions): void {
    const { pinyin, tone = 0, onComplete, onError } = options
    
    if (this.isPlaying && this.currentAudio) {
      this.currentAudio.stop()
    }
    
    let fileID = getPinyinAudioFileID({ pinyin, tone })
    
    if (!fileID) {
      console.warn(`音频文件不存在: ${pinyin}${tone === 0 ? '' : tone}.mp3，使用默认音频 a.mp3`)
      fileID = getPinyinAudioFileID({ pinyin: 'a', tone: 0 })
      
      if (!fileID) {
        const error = new Error('默认音频 a.mp3 也不存在')
        console.error(error.message)
        onError?.(error)
        return
      }
    }
    
    this.currentAudio = uni.createInnerAudioContext()
    this.currentAudio.src = fileID
    
    this.currentAudio.onCanplay(() => {
      this.isPlaying = true
      this.currentAudio?.play()
    })
    
    this.currentAudio.onEnded(() => {
      this.isPlaying = false
      onComplete?.()
      this.cleanup()
    })
    
    this.currentAudio.onError((error) => {
      this.isPlaying = false
      console.error('播放拼音音频失败:', error)
      onError?.(error)
      this.cleanup()
    })
  }

  async playAsync(options: PlayOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.play({
        ...options,
        onComplete: () => {
          options.onComplete?.()
          resolve()
        },
        onError: (error) => {
          options.onError?.(error)
          reject(error)
        }
      })
    })
  }

  async playAllTones(options: PlayAllTonesOptions): Promise<void> {
    const { pinyin, interval = 500, onComplete, onError } = options
    
    const fileIDs = getPinyinAllTonesFileIDs(pinyin)
    
    for (let i = 0; i < fileIDs.length; i++) {
      try {
        const tone = i === 0 ? 0 : (i as 1 | 2 | 3 | 4)
        
        if (fileIDs[i] === null) {
          console.warn(`拼音 ${pinyin} 的声调 ${tone} 音频不存在，使用默认音频 a.mp3`)
          await this.playAsync({
            pinyin: 'a',
            tone: 0
          })
        } else {
          await this.playAsync({
            pinyin,
            tone
          })
        }
        
        if (i < fileIDs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, interval))
        }
      } catch (error) {
        onError?.(error)
        throw error
      }
    }
    
    onComplete?.()
  }

  private async playLocalAudio(localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isPlaying && this.currentAudio) {
        this.currentAudio.stop()
      }
      
      this.currentAudio = uni.createInnerAudioContext()
      this.currentAudio.src = localPath
      
      console.log('准备播放本地音频:', localPath)
      
      this.currentAudio.onCanplay(() => {
        console.log('音频准备就绪，开始播放')
        this.isPlaying = true
        this.currentAudio?.play()
      })
      
      this.currentAudio.onEnded(() => {
        console.log('音频播放完成')
        this.isPlaying = false
        this.cleanup()
        resolve()
      })
      
      this.currentAudio.onError((error) => {
        console.error('播放本地音频失败:', error)
        this.isPlaying = false
        this.cleanup()
        reject(error)
      })
      
      this.currentAudio.onPlay(() => {
        console.log('音频开始播放')
      })
    })
  }

  async playSequence(options: PlaySequenceOptions): Promise<void> {
    const { pinyinList, interval = 0, onComplete, onError } = options
    
    const audioUrls: string[] = []
    
    try {
      for (const item of pinyinList) {
        const { pinyin, tone = 0 } = item
        let fileID = getPinyinAudioFileID({ pinyin, tone })
        
        if (!fileID) {
          console.warn(`音频文件不存在: ${pinyin}${tone === 0 ? '' : tone}.mp3，使用默认音频 a.mp3`)
          fileID = getPinyinAudioFileID({ pinyin: 'a', tone: 0 })
          
          if (!fileID) {
            console.error('默认音频 a.mp3 也不存在')
            continue
          }
        }
        
        audioUrls.push(fileID)
      }
      
      if (audioUrls.length === 0) {
        console.warn('没有有效的音频URL')
        onComplete?.()
        return
      }
      
      console.log('开始播放音频序列:', audioUrls)
      
      for (let i = 0; i < audioUrls.length; i++) {
        try {
          await this.playCloudAudio(audioUrls[i])
          
          if (i < audioUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, interval))
          }
        } catch (error) {
          onError?.(error)
          throw error
        }
      }
      
      onComplete?.()
    } catch (error) {
      onError?.(error)
      throw error
    }
  }

  private async playCloudAudio(cloudUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isPlaying && this.currentAudio) {
        this.currentAudio.stop()
      }
      
      this.currentAudio = uni.createInnerAudioContext()
      this.currentAudio.src = cloudUrl
      
      console.log('准备播放云存储音频:', cloudUrl)
      
      this.currentAudio.onCanplay(() => {
        console.log('音频准备就绪，开始播放')
        this.isPlaying = true
        this.currentAudio?.play()
      })
      
      this.currentAudio.onEnded(() => {
        console.log('音频播放完成')
        this.isPlaying = false
        this.cleanup()
        resolve()
      })
      
      this.currentAudio.onError((error) => {
        console.error('播放云存储音频失败:', error)
        this.isPlaying = false
        this.cleanup()
        reject(error)
      })
      
      this.currentAudio.onPlay(() => {
        console.log('音频开始播放')
      })
    })
  }

  stop(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.stop()
      this.isPlaying = false
      this.cleanup()
    }
  }

  pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause()
    }
  }

  resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play()
      this.isPlaying = true
    }
  }

  private cleanup(): void {
    if (this.currentAudio) {
      this.currentAudio.destroy()
      this.currentAudio = null
    }
  }

  destroy(): void {
    this.stop()
    this.cleanup()
  }
}

export const pinyinAudioPlayer = new PinyinAudioPlayer()

export async function playPinyinAudio(options: PlayOptions): Promise<void> {
  return pinyinAudioPlayer.playAsync(options)
}

export async function playPinyinAllTones(options: PlayAllTonesOptions): Promise<void> {
  return pinyinAudioPlayer.playAllTones(options)
}

export async function playPinyinSequence(options: PlaySequenceOptions): Promise<void> {
  return pinyinAudioPlayer.playSequence(options)
}
