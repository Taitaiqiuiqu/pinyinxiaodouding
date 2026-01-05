// 微信小程序平台的 cloud 实现（仅在 MP-WEIXIN 环境使用）
import { config } from '../../../src/config'

export function initCloud(): Promise<any> {
  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      if (wx && wx.cloud) {
        // @ts-ignore
        wx.cloud.init({
          env: config.cloud.env
        })
        resolve(true)
      } else {
        reject(new Error('wx.cloud is not available in this environment'))
      }
    } catch (err) {
      reject(err)
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  return Promise.reject(new Error('Not in MP-WEIXIN environment'))
  // #endif
}

export function callFunction(name: string, data?: any): Promise<any> {
  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => {
    try {
      // 确保name参数是字符串类型且不为空
      const functionName = String(name || '').trim()
      if (!functionName) {
        throw new Error('Function name is empty')
      }
      
      // @ts-ignore
      const wxInstance = wx
      if (!wxInstance || !wxInstance.cloud || typeof wxInstance.cloud.callFunction !== 'function') {
        throw new Error('wx.cloud.callFunction is not available')
      }
      
      // 创建参数对象
      const params: any = {
        name: functionName,
        data: data || {}
      }
      
      // 只在有环境配置时添加env参数
      if (config.cloud.env) {
        params.env = config.cloud.env
      }
      
      wxInstance.cloud.callFunction(params)
        .then((res: any) => {
          resolve(res)
        })
        .catch((err: any) => {
          reject(err)
        })
    } catch (err) {
      reject(err)
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  return Promise.reject(new Error('Not in MP-WEIXIN environment'))
  // #endif
}


