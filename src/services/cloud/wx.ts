// 微信小程序平台的 cloud 实现（仅在 MP-WEIXIN 环境使用）
import { config } from '@/src/config'

export function initCloud(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      if (typeof wx !== 'undefined' && wx.cloud) {
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
}

export function callFunction(name: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // 确保name参数是字符串类型且不为空
      const functionName = String(name || '').trim()
      if (!functionName) {
        throw new Error('Function name is empty')
      }
      
      console.log('=== Cloud Function Call Start ===')
      console.log('Function name raw:', name)
      console.log('Function name processed:', functionName)
      console.log('Function name type:', typeof functionName)
      console.log('Function name length:', functionName.length)
      console.log('Function name char codes:', Array.from(functionName).map(c => c.charCodeAt(0)))
      console.log('Data:', data)
      console.log('wx.cloud available:', typeof wx !== 'undefined' && wx.cloud)
      
      // @ts-ignore
      const wxInstance = wx
      if (!wxInstance || !wxInstance.cloud) {
        throw new Error('wx.cloud is not available')
      }
      
      // 确保callFunction方法存在
      if (typeof wxInstance.cloud.callFunction !== 'function') {
        throw new Error('wx.cloud.callFunction is not a function')
      }
      
      // 创建最简单的参数对象
      const params = {
        name: functionName,
        data: data || {}
      }
      
      // 只在有环境配置时添加env参数
      if (config.cloud.env) {
        params.env = config.cloud.env
        console.log('Adding env parameter:', config.cloud.env)
      }
      
      console.log('Final call parameters:', JSON.stringify(params, null, 2))
      
      // 使用标准的Promise方式调用
      console.log('Calling wx.cloud.callFunction...')
      wxInstance.cloud.callFunction(params)
        .then((res: any) => {
          console.log('=== Cloud Function Call Success ===')
          console.log('Result:', JSON.stringify(res, null, 2))
          resolve(res)
        })
        .catch((err: any) => {
          console.error('=== Cloud Function Call Error ===')
          console.error('Error object:', JSON.stringify(err, null, 2))
          console.error('Error message:', err.errMsg)
          console.error('Error code:', err.errCode)
          reject(err)
        })
    } catch (err) {
      console.error('=== Cloud Function Call Exception ===')
      console.error('Exception:', err)
      console.error('Exception message:', err.message)
      reject(err)
    }
  })
}


