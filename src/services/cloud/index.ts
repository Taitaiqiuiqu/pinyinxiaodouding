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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // Note: dynamic import for db reference
  // @ts-ignore
  if (typeof wx !== 'undefined' && wx.cloud) {
    // @ts-ignore
    return wx.cloud.database()
  }
  // #endif
  return null
}


