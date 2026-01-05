// Cloud abstraction entry — 导出统一接口，按平台条件编译选择实现
// 云开发环境初始化状态
let cloudInitialized = false

// #ifdef MP-WEIXIN
import { initCloud as initWxCloud, callFunction as callWxFunc } from './wx'
// #endif
// #ifndef MP-WEIXIN
import { initCloud as initMockCloud, callFunction as callMockFunc } from './mock'
// #endif

export async function initCloud(): Promise<any> {
  let result
  // #ifdef MP-WEIXIN
  result = await initWxCloud()
  // #endif
  // #ifndef MP-WEIXIN
  result = await initMockCloud()
  // #endif
  // 设置云开发环境初始化完成标志
  cloudInitialized = true
  return result
}

export async function callFunction(name: string, data?: any): Promise<any> {
  // 确保云开发环境已经初始化
  if (!cloudInitialized) {
    await initCloud()
  }
  
  // #ifdef MP-WEIXIN
  return callWxFunc(name, data)
  // #endif
  // #ifndef MP-WEIXIN
  return callMockFunc(name, data)
  // #endif
}

export function getDatabase(): any {
  // #ifdef MP-WEIXIN
  // @ts-ignore
  if (wx && wx.cloud && wx.cloud.database) {
    // @ts-ignore
    return wx.cloud.database()
  }
  // #endif
  return null
}

export async function updateAge(ageLevel: number): Promise<{ success: boolean; message: string }> {
  try {
    let openid = ''
    // 小程序环境中动态导入可能有问题，改为直接导入
    const { useGlobalStore } = await import('../../store/global')
    if (useGlobalStore) {
      const store = useGlobalStore()
      openid = store.openid || ''
    }
    if (!openid) {
      openid = uni.getStorageSync('openid') || ''
    }

    if (!openid) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    const cloudRes = await callFunction('updateAge', { openid, ageLevel })
    
    const result = cloudRes.result || cloudRes

    if (result.success) {
      return {
        success: true,
        message: result.message
      }
    } else {
      return {
        success: false,
        message: result.message || '更新失败'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '网络错误'
    }
  }
}


