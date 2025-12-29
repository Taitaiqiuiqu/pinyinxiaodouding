import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    childAge: 4 as number,         // 儿童年龄
    maxUsageTime: 30 as number,    // 每日最大使用时长(分钟)
    usedTime: 0 as number,         // 今日已使用时长
    unlockedByParent: false as boolean, // 是否被家长解锁
    currentLevel: '' as string,    // 当前课程级别
    userInfo: null as any,         // 用户信息
    openid: '' as string,          // 用户openid
  }),
  getters: {
    ageGroup: (state) => {
      const age = state.childAge
      if (age >= 3 && age <= 4) return '3-4'
      if (age >= 4 && age <= 5) return '4-5'
      if (age >= 5 && age <= 6) return '5-6'
      if (age >= 6 && age <= 8) return '6-8'
      return ''
    }
  },
  actions: {
    setChildAge(age: number) {
      this.childAge = age
    },
    incrementUsedTime(minutes: number = 1) {
      this.usedTime += minutes
    },
    resetDailyUsage() {
      this.usedTime = 0
    },
    setUnlockedByParent(value: boolean) {
      this.unlockedByParent = value
    },
    setCurrentLevel(level: string) {
      this.currentLevel = level
    },
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },
    setOpenId(openid: string) {
      this.openid = openid
    }
  }
})


