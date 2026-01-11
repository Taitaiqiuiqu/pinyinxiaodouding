import { useGlobalStore } from '../store/global'

class TimeTracker {
  private static instance: TimeTracker | null = null
  private startTime: number = 0
  private elapsedTime: number = 0
  private timerInterval: number | null = null
  private saveInterval: number | null = null
  private isTracking: boolean = false
  private globalStore: any = null
  private lastSaveDate: string = ''
  private dailyStartTime: string = '08:00'
  private timeLimitEnabled: boolean = true
  private maxUsageTime: number = 5400 // 默认90分钟

  private constructor() {
    this.globalStore = useGlobalStore()
    this.loadSettings()
  }

  static getInstance(): TimeTracker {
    if (!TimeTracker.instance) {
      TimeTracker.instance = new TimeTracker()
    }
    return TimeTracker.instance
  }

  private loadSettings() {
    this.dailyStartTime = this.globalStore.dailyStartTime || '08:00'
    this.timeLimitEnabled = this.globalStore.timeLimitEnabled !== false
    this.maxUsageTime = (this.globalStore.maxUsageTime || 30) * 60 // 转换为秒
    this.elapsedTime = this.globalStore.usedTime || 0
    this.lastSaveDate = ''

    this.checkDailyReset()
  }

  private checkDailyReset() {
    const now = new Date()
    const today = now.toDateString()

    if (this.lastSaveDate && this.lastSaveDate !== today) {
      const lastSaveDateTime = new Date(this.lastSaveDate)
      const [startHour, startMinute] = this.dailyStartTime.split(':').map(Number)
      
      const todayStart = new Date(now)
      todayStart.setHours(startHour, startMinute, 0, 0)
      
      const yesterdayStart = new Date(todayStart)
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)

      if (lastSaveDateTime < yesterdayStart || lastSaveDateTime >= todayStart) {
        this.resetDailyUsage()
      }
    }
  }

  private resetDailyUsage() {
    console.log('[TimeTracker] 重置每日使用时长')
    this.elapsedTime = 0
    this.globalStore.usedTime = 0
    this.globalStore.resetDailyUsage()
    this.lastSaveDate = new Date().toDateString()
  }

  start() {
    if (this.isTracking) {
      console.log('[TimeTracker] 时间追踪已在运行中')
      return
    }

    console.log('[TimeTracker] 开始时间追踪')
    this.isTracking = true
    this.startTime = Date.now()
    
    this.timerInterval = setInterval(() => {
      this.updateElapsedTime()
    }, 1000) // 每秒更新一次

    this.saveInterval = setInterval(() => {
      this.saveElapsedTime()
    }, 30000) // 每30秒保存一次
  }

  stop() {
    if (!this.isTracking) {
      console.log('[TimeTracker] 时间追踪未运行')
      return
    }

    console.log('[TimeTracker] 停止时间追踪')
    this.isTracking = false
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    if (this.saveInterval) {
      clearInterval(this.saveInterval)
      this.saveInterval = null
    }

    this.updateElapsedTime()
    this.saveElapsedTime()
  }

  private updateElapsedTime() {
    const now = Date.now()
    const sessionTime = Math.floor((now - this.startTime) / 1000)
    this.elapsedTime += sessionTime
    this.startTime = now

    this.globalStore.usedTime = this.elapsedTime
  }

  private saveElapsedTime() {
    const now = new Date()
    const today = now.toDateString()

    this.checkDailyReset()

    this.globalStore.usedTime = this.elapsedTime
    this.lastSaveDate = today

    console.log('[TimeTracker] 保存使用时长:', this.elapsedTime, '秒')
  }

  getElapsedTime(): number {
    return this.elapsedTime
  }

  getRemainingTime(): number {
    if (!this.timeLimitEnabled) {
      return Infinity
    }

    const remaining = Math.max(0, this.maxUsageTime - this.elapsedTime)
    return remaining
  }

  isTimeLimitReached(): boolean {
    if (!this.timeLimitEnabled) {
      return false
    }

    return this.elapsedTime >= this.maxUsageTime
  }

  isTimeLimitWarning(): boolean {
    if (!this.timeLimitEnabled) {
      return false
    }

    const warningThreshold = this.maxUsageTime * 0.8 // 80%时警告
    return this.elapsedTime >= warningThreshold && this.elapsedTime < this.maxUsageTime
  }

  updateSettings(settings: {
    dailyStartTime?: string
    timeLimitEnabled?: boolean
    maxUsageTime?: number
  }) {
    if (settings.dailyStartTime !== undefined) {
      this.dailyStartTime = settings.dailyStartTime
    }

    if (settings.timeLimitEnabled !== undefined) {
      this.timeLimitEnabled = settings.timeLimitEnabled
    }

    if (settings.maxUsageTime !== undefined) {
      this.maxUsageTime = settings.maxUsageTime * 60 // 转换为秒
    }

    this.checkDailyReset()
  }

  forceReset() {
    this.resetDailyUsage()
  }
}

export default TimeTracker
