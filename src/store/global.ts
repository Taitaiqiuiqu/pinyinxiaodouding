import { defineStore } from 'pinia'

const STORAGE_KEYS = {
  ageLevel: 'ageLevel',
  maxUsageTime: 'maxUsageTime',
  usedTime: 'usedTime',
  unlockedByParent: 'unlockedByParent',
  currentLevel: 'currentLevel',
  userInfo: 'userInfo',
  openid: 'openid'
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    // 小程序中，uni.getStorageSync 在 key 不存在时返回 ""，而不是 null 或 undefined
    const raw = uni.getStorageSync(key)
    if (raw !== '' && raw !== null && raw !== undefined) {
      // 在小程序中，JSON.parse 处理非字符串可能会报错，需要先检查类型
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as T
        } catch (parseError) {
          // 如果解析失败，可能是直接存储的字符串值
          return raw as unknown as T
        }
      }
      return raw as T
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage:`, e)
  }
  return defaultValue
}

function loadNumber(key: string, defaultValue: number = 0): number {
  try {
    const raw = uni.getStorageSync(key)
    if (raw !== '' && raw !== null && raw !== undefined) {
      return Number(raw)
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage:`, e)
  }
  return defaultValue
}

function loadBoolean(key: string, defaultValue: boolean = false): boolean {
  try {
    const raw = uni.getStorageSync(key)
    if (raw !== '' && raw !== null && raw !== undefined) {
      // 小程序中，存储的布尔值可能是字符串 "true" 或 "false"
      if (typeof raw === 'string') {
        return raw.toLowerCase() === 'true'
      }
      return Boolean(raw)
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage:`, e)
  }
  return defaultValue
}

function loadString(key: string, defaultValue: string = ''): string {
  try {
    const raw = uni.getStorageSync(key)
    if (raw !== '' && raw !== null && raw !== undefined) {
      return String(raw)
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage:`, e)
  }
  return defaultValue
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    ageLevel: loadNumber(STORAGE_KEYS.ageLevel, 1) as number,
    maxUsageTime: loadNumber(STORAGE_KEYS.maxUsageTime, 30) as number,
    usedTime: loadNumber(STORAGE_KEYS.usedTime, 0) as number,
    unlockedByParent: loadBoolean(STORAGE_KEYS.unlockedByParent, false) as boolean,
    currentLevel: loadString(STORAGE_KEYS.currentLevel, '') as string,
    userInfo: loadFromStorage(STORAGE_KEYS.userInfo, null) as any,
    openid: loadString(STORAGE_KEYS.openid, '') as string,
    songPlaying: false as boolean,
    currentSongIndex: -1 as number,
    currentSongTitle: '' as string,
    showFloatingBall: false as boolean
  }),
  getters: {
    ageGroup: (state) => {
      const level = state.ageLevel
      if (level === 1) return '3-4'
      if (level === 2) return '4-5'
      if (level === 3) return '5-6'
      if (level === 4) return '6-8'
      return ''
    },
    isLoggedIn: (state) => !!state.openid
  },
  actions: {
    setAgeLevel(level: number) {
      this.ageLevel = level
      uni.setStorageSync(STORAGE_KEYS.ageLevel, level)
    },
    incrementUsedTime(minutes: number = 1) {
      this.usedTime += minutes
      uni.setStorageSync(STORAGE_KEYS.usedTime, this.usedTime)
    },
    resetDailyUsage() {
      this.usedTime = 0
      uni.setStorageSync(STORAGE_KEYS.usedTime, 0)
    },
    setUnlockedByParent(value: boolean) {
      this.unlockedByParent = value
      uni.setStorageSync(STORAGE_KEYS.unlockedByParent, value)
    },
    setCurrentLevel(level: string) {
      this.currentLevel = level
      uni.setStorageSync(STORAGE_KEYS.currentLevel, level)
    },
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
      uni.setStorageSync(STORAGE_KEYS.userInfo, userInfo)
    },
    setOpenId(openid: string) {
      this.openid = openid
      uni.setStorageSync(STORAGE_KEYS.openid, openid)
    },
    clearAllData() {
      this.ageLevel = 1
      this.maxUsageTime = 30
      this.usedTime = 0
      this.unlockedByParent = false
      this.currentLevel = ''
      this.userInfo = null
      this.openid = ''
      this.songPlaying = false
      this.currentSongIndex = -1
      this.currentSongTitle = ''
      this.showFloatingBall = false
      
      uni.removeStorageSync(STORAGE_KEYS.ageLevel)
      uni.removeStorageSync(STORAGE_KEYS.maxUsageTime)
      uni.removeStorageSync(STORAGE_KEYS.usedTime)
      uni.removeStorageSync(STORAGE_KEYS.unlockedByParent)
      uni.removeStorageSync(STORAGE_KEYS.currentLevel)
      uni.removeStorageSync(STORAGE_KEYS.userInfo)
      uni.removeStorageSync(STORAGE_KEYS.openid)
      uni.removeStorageSync('isLoggedIn')
    },
    setSongPlaying(playing: boolean) {
      this.songPlaying = playing
    },
    setCurrentSongIndex(index: number) {
      this.currentSongIndex = index
    },
    setCurrentSongTitle(title: string) {
      this.currentSongTitle = title
    },
    setShowFloatingBall(show: boolean) {
      this.showFloatingBall = show
    }
  }
})


