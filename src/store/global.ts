import { defineStore } from 'pinia'

interface LearningRecord {
  id: string
  date: string
  type: 'phonics' | 'games' | 'workbook' | 'songs'
  content: string
  duration: number
  accuracy?: number
  score?: number
  timestamp: number
}

interface LearningStats {
  totalLearningTime: number
  totalSessions: number
  masteredPinyin: number
  totalPinyin: number
  averageAccuracy: number
  lastLearningDate: string
}

interface LearningReport {
  id: string
  date: string
  weekRange: string
  totalLearningTime: number
  totalSessions: number
  accuracy: number
  progress: number
  recommendations: string[]
}

interface LearningContentSettings {
  enablePhonics: boolean
  enableGames: boolean
  enableWorkbook: boolean
  enableSongs: boolean
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'auto'
}

interface QuizAttempts {
  attemptsLeft: number
  lastRefillTime: number
}

interface ParentQuizAttempts {
  attemptsLeft: number
  lastRefillTime: number
}

const STORAGE_KEYS = {
  ageLevel: 'ageLevel',
  maxUsageTime: 'maxUsageTime',
  usedTime: 'usedTime',
  unlockedByParent: 'unlockedByParent',
  currentLevel: 'currentLevel',
  userInfo: 'userInfo',
  openid: 'openid',
  ballPosition: 'ballPosition',
  isDocked: 'isDocked',
  isHalfVisible: 'isHalfVisible',
  learningRecords: 'learningRecords',
  learningStats: 'learningStats',
  learningReports: 'learningReports',
  notificationEnabled: 'notificationEnabled',
  dailyStartTime: 'dailyStartTime',
  timeLimitEnabled: 'timeLimitEnabled',
  learningContentSettings: 'learningContentSettings',
  parentVerified: 'parentVerified',
  hasCompletedGuide: 'hasCompletedGuide',
  quizCompleted: 'quizCompleted',
  quizAttempts: 'quizAttempts',
  parentQuizAttempts: 'parentQuizAttempts',
  shengmuProgress: 'shengmu_progress',
  yunmuProgress: 'yunmu_progress',
  zhengtiProgress: 'zhengti_progress'
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
    showFloatingBall: false as boolean,
    ballPosition: loadFromStorage(STORAGE_KEYS.ballPosition, { x: 0, y: 0 }) as {x: number, y: number},
    isDocked: loadBoolean(STORAGE_KEYS.isDocked, false) as boolean,
    isHalfVisible: loadBoolean(STORAGE_KEYS.isHalfVisible, false) as boolean,
    learningRecords: loadFromStorage(STORAGE_KEYS.learningRecords, []) as LearningRecord[],
    learningStats: loadFromStorage(STORAGE_KEYS.learningStats, {
      totalLearningTime: 0,
      totalSessions: 0,
      masteredPinyin: 0,
      totalPinyin: 0,
      averageAccuracy: 0,
      lastLearningDate: ''
    }) as LearningStats,
    learningReports: loadFromStorage(STORAGE_KEYS.learningReports, []) as LearningReport[],
    notificationEnabled: loadBoolean(STORAGE_KEYS.notificationEnabled, true) as boolean,
    dailyStartTime: loadString(STORAGE_KEYS.dailyStartTime, '') as string,
    timeLimitEnabled: loadBoolean(STORAGE_KEYS.timeLimitEnabled, true) as boolean,
    learningContentSettings: loadFromStorage(STORAGE_KEYS.learningContentSettings, {
      enablePhonics: true,
      enableGames: true,
      enableWorkbook: true,
      enableSongs: true,
      difficultyLevel: 'auto'
    }) as LearningContentSettings,
    parentVerified: loadBoolean(STORAGE_KEYS.parentVerified, false) as boolean,
    hasCompletedGuide: loadBoolean(STORAGE_KEYS.hasCompletedGuide, false) as boolean,
    quizCompleted: loadBoolean(STORAGE_KEYS.quizCompleted, false) as boolean,
    quizAttempts: loadFromStorage<QuizAttempts>(STORAGE_KEYS.quizAttempts, {
      attemptsLeft: 5,
      lastRefillTime: 0
    }) as QuizAttempts,
    parentQuizAttempts: loadFromStorage<ParentQuizAttempts>(STORAGE_KEYS.parentQuizAttempts, {
      attemptsLeft: 5,
      lastRefillTime: 0
    }) as ParentQuizAttempts,
    shengmuProgress: loadFromStorage(STORAGE_KEYS.shengmuProgress, []) as any[],
    yunmuProgress: loadFromStorage(STORAGE_KEYS.yunmuProgress, {
      single: [],
      compound: [],
      nasal: []
    }) as any,
    zhengtiProgress: loadFromStorage(STORAGE_KEYS.zhengtiProgress, []) as any[]
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
      this.ballPosition = { x: 0, y: 0 }
      this.isDocked = false
      this.isHalfVisible = false
      
      uni.removeStorageSync(STORAGE_KEYS.ageLevel)
      uni.removeStorageSync(STORAGE_KEYS.maxUsageTime)
      uni.removeStorageSync(STORAGE_KEYS.usedTime)
      uni.removeStorageSync(STORAGE_KEYS.unlockedByParent)
      uni.removeStorageSync(STORAGE_KEYS.currentLevel)
      uni.removeStorageSync(STORAGE_KEYS.userInfo)
      uni.removeStorageSync(STORAGE_KEYS.openid)
      uni.removeStorageSync('isLoggedIn')
      uni.removeStorageSync(STORAGE_KEYS.ballPosition)
      uni.removeStorageSync(STORAGE_KEYS.isDocked)
      uni.removeStorageSync(STORAGE_KEYS.isHalfVisible)
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
    },
    setBallPosition(position: {x: number, y: number}) {
      this.ballPosition = position
      uni.setStorageSync(STORAGE_KEYS.ballPosition, JSON.stringify(position))
    },
    setIsDocked(docked: boolean) {
      this.isDocked = docked
      uni.setStorageSync(STORAGE_KEYS.isDocked, docked)
    },
    setIsHalfVisible(halfVisible: boolean) {
      this.isHalfVisible = halfVisible
      uni.setStorageSync(STORAGE_KEYS.isHalfVisible, halfVisible)
    },
    addLearningRecord(record: LearningRecord) {
      this.learningRecords.push(record)
      uni.setStorageSync(STORAGE_KEYS.learningRecords, JSON.stringify(this.learningRecords))
      this.updateLearningStats()
    },
    updateLearningStats() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const todayRecords = this.learningRecords.filter(r => {
        const recordDate = new Date(r.timestamp)
        return recordDate >= today
      })
      
      const totalLearningTime = todayRecords.reduce((sum, r) => sum + r.duration, 0)
      const totalSessions = todayRecords.length
      const accuracyRecords = todayRecords.filter(r => r.accuracy !== undefined)
      const averageAccuracy = accuracyRecords.length > 0 
        ? Math.round(accuracyRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) / accuracyRecords.length)
        : 0
      
      this.learningStats = {
        totalLearningTime,
        totalSessions,
        masteredPinyin: this.learningStats.masteredPinyin,
        totalPinyin: this.learningStats.totalPinyin,
        averageAccuracy,
        lastLearningDate: todayRecords.length > 0 
          ? new Date(Math.max(...todayRecords.map(r => r.timestamp))).toISOString().split('T')[0]
          : this.learningStats.lastLearningDate
      }
      
      uni.setStorageSync(STORAGE_KEYS.learningStats, JSON.stringify(this.learningStats))
    },
    addLearningReport(report: LearningReport) {
      this.learningReports.push(report)
      uni.setStorageSync(STORAGE_KEYS.learningReports, JSON.stringify(this.learningReports))
    },
    setNotificationEnabled(enabled: boolean) {
      this.notificationEnabled = enabled
      uni.setStorageSync(STORAGE_KEYS.notificationEnabled, enabled)
    },
    setDailyStartTime(time: string) {
      this.dailyStartTime = time
      uni.setStorageSync(STORAGE_KEYS.dailyStartTime, time)
    },
    setTimeLimitEnabled(enabled: boolean) {
      this.timeLimitEnabled = enabled
      uni.setStorageSync(STORAGE_KEYS.timeLimitEnabled, enabled)
    },
    setMaxUsageTime(minutes: number) {
      this.maxUsageTime = minutes
      uni.setStorageSync(STORAGE_KEYS.maxUsageTime, minutes)
    },
    setLearningContentSettings(settings: LearningContentSettings) {
      this.learningContentSettings = settings
      uni.setStorageSync(STORAGE_KEYS.learningContentSettings, JSON.stringify(settings))
    },
    setParentVerified(verified: boolean) {
      this.parentVerified = verified
      uni.setStorageSync(STORAGE_KEYS.parentVerified, verified)
    },
    setHasCompletedGuide(completed: boolean) {
      this.hasCompletedGuide = completed
      uni.setStorageSync(STORAGE_KEYS.hasCompletedGuide, completed)
    },
    setQuizCompleted(completed: boolean) {
      this.quizCompleted = completed
      uni.setStorageSync(STORAGE_KEYS.quizCompleted, completed)
    },
    setQuizAttempts(attempts: QuizAttempts) {
      this.quizAttempts = attempts
      uni.setStorageSync(STORAGE_KEYS.quizAttempts, JSON.stringify(attempts))
    },
    clearQuizAttempts() {
      this.quizAttempts = {
        attemptsLeft: 5,
        lastRefillTime: 0
      }
      uni.removeStorageSync(STORAGE_KEYS.quizAttempts)
    },
    setParentQuizAttempts(attempts: ParentQuizAttempts) {
      this.parentQuizAttempts = attempts
      uni.setStorageSync(STORAGE_KEYS.parentQuizAttempts, JSON.stringify(attempts))
    },
    clearParentQuizAttempts() {
      this.parentQuizAttempts = {
        attemptsLeft: 5,
        lastRefillTime: 0
      }
      uni.removeStorageSync(STORAGE_KEYS.parentQuizAttempts)
    },
    setShengmuProgress(progress: any[]) {
      this.shengmuProgress = progress
      uni.setStorageSync(STORAGE_KEYS.shengmuProgress, progress)
    },
    setYunmuProgress(progress: any) {
      this.yunmuProgress = progress
      uni.setStorageSync(STORAGE_KEYS.yunmuProgress, progress)
    },
    setZhengtiProgress(progress: any[]) {
      this.zhengtiProgress = progress
      uni.setStorageSync(STORAGE_KEYS.zhengtiProgress, progress)
    },
    clearLearningData() {
      this.learningRecords = []
      this.learningStats = {
        totalLearningTime: 0,
        totalSessions: 0,
        masteredPinyin: 0,
        totalPinyin: 0,
        averageAccuracy: 0,
        lastLearningDate: ''
      }
      this.learningReports = []
      
      uni.removeStorageSync(STORAGE_KEYS.learningRecords)
      uni.removeStorageSync(STORAGE_KEYS.learningStats)
      uni.removeStorageSync(STORAGE_KEYS.learningReports)
    }
  }
})


