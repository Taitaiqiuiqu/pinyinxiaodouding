// Mock 实现，用于 H5 / 本地调试环境（不依赖 wx.cloud）
export function initCloud(): Promise<any> {
  return Promise.resolve(true)
}

export function callFunction(name: string, data?: any): Promise<any> {
  // 简单 mock：在开发环境可以根据函数名返回示例数据
  return new Promise((resolve) => {
    console.warn(`[mock cloud] callFunction: ${name}`, data)
    resolve({ result: null, mock: true, function: name })
  })
}


