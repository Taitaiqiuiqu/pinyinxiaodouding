import { callFunction } from './index'

/**
 * 从云端获取音频信息
 * @param audioId 音频ID，如 'age-select/guide_age_survey_3-8_01'
 * @param audioType 音频类型，如 'guide', 'phonics' 等
 * @returns Promise 包含音频信息
 */
export async function getAudioInfo(audioId: string, audioType: string = 'guide') {
  try {
    console.log('[AudioService] 开始获取音频信息 ====== START ======')
    console.log('[AudioService] 请求参数:', { audioId, audioType })
    console.log('[AudioService] 调用云函数: getAudio')
    
    const startTime = Date.now()
    const cloudRes = await callFunction('getAudio', {
      audioId,
      audioType
    })
    const endTime = Date.now()
    
    console.log('[AudioService] 云函数调用耗时:', endTime - startTime, 'ms')
    console.log('[AudioService] 云函数返回原始结果:', JSON.stringify(cloudRes, null, 2))
    
    // 正确处理云函数返回的结果格式
    const result = cloudRes.result || cloudRes
    console.log('[AudioService] 处理后的云函数结果:', JSON.stringify(result, null, 2))
    
    if (result.success && result.data) {
      console.log('[AudioService] 获取音频信息成功:', result.data)
      
      // 检查是否有临时链接
      if (result.data.tempFileURL) {
        console.log('[AudioService] ✅ 获取到云端临时链接:', result.data.tempFileURL)
        return result.data
      } else if (result.data.fileID) {
        console.log('[AudioService] ⚠️  有fileID但无临时链接，将尝试获取临时链接')
        // 尝试获取临时链接
        try {
          console.log('[AudioService] 调用getAudioTempURL获取临时链接')
          const tempURL = await getAudioTempURL(result.data)
          if (tempURL) {
            result.data.tempFileURL = tempURL
            console.log('[AudioService] ✅ 成功获取临时链接:', tempURL)
            return result.data
          } else {
            console.log('[AudioService] ⚠️  getAudioTempURL未返回临时链接')
          }
        } catch (tempError) {
          console.error('[AudioService] ❌ 获取临时链接失败:', tempError)
          if (typeof tempError === 'object' && tempError !== null && 'stack' in tempError) {
            console.error('[AudioService] 临时链接错误详情:', (tempError as Error).stack)
          }
        }
      }
      
      // 如果有回退标记或无法获取临时链接，返回信息但标记需要回退
      if (result.data.fallbackToLocal) {
        console.log('[AudioService] ⚠️  标记为需要回退到本地音频')
        return result.data
      }
      
      console.log('[AudioService] ✅ 音频信息获取完成:', result.data)
      return result.data
    } else {
      const errorMsg = result.error || result.message || '未知错误'
      console.error('[AudioService] ❌ 获取音频信息失败 - 云函数返回success=false')
      console.error('[AudioService] 失败原因:', errorMsg)
      console.error('[AudioService] 云函数返回详情:', JSON.stringify(result, null, 2))
      // 直接抛出错误，不重复包装
      throw new Error(errorMsg)
    }
  } catch (error: any) {
    console.error('[AudioService] ❌ 调用云函数失败 - 异常捕获')
    console.error('[AudioService] 错误类型:', typeof error)
    console.error('[AudioService] 错误对象:', error)
    
    // 提供更详细的错误信息
    if (error.errCode) {
      console.error('[AudioService] 错误代码:', error.errCode)
    }
    if (error.errMsg) {
      console.error('[AudioService] 错误消息:', error.errMsg)
    }
    if (error.stack) {
      console.error('[AudioService] 错误堆栈:', error.stack)
    }
    
    console.error('[AudioService] 音频信息获取结束 ====== ERROR ======')
    
    // 检查是否已经是Error对象，如果是直接抛出，避免重复包装
    if (error instanceof Error) {
      throw error
    }
    
    // 否则，创建新的Error对象
    throw new Error(error.message || error.errMsg || '调用云函数失败')
  }
}



/**
 * 获取音频文件的临时下载链接
 * @param audioInfo 音频信息对象
 * @returns 临时下载链接或null
 */
export async function getAudioTempURL(audioInfo: any): Promise<string | null> {
  try {
    console.log('[AudioService] 开始获取音频临时链接 ====== START ======')
    console.log('[AudioService] 音频信息:', audioInfo)
    
    if (!audioInfo || !audioInfo.fileID) {
      console.log('[AudioService] ⚠️  缺少必要参数：audioInfo 或 fileID')
      console.log('[AudioService] 音频临时链接获取结束 ====== END ======')
      return null
    }
    
    // 如果已经有临时链接，直接返回
    if (audioInfo.tempFileURL) {
      console.log('[AudioService] ✅ 已有临时链接，直接返回:', audioInfo.tempFileURL)
      console.log('[AudioService] 音频临时链接获取结束 ====== END ======')
      return audioInfo.tempFileURL
    }
    
    console.log('[AudioService] ⚠️  没有临时链接，且当前不支持直接获取，返回null')
    console.log('[AudioService] 音频临时链接获取结束 ====== END ======')
    // 如果需要，可以在这里添加直接获取临时链接的逻辑
    // 目前逻辑已移至getAudioInfo函数中，这里仅作为后备
    return null
  } catch (error: any) {
    console.error('[AudioService] ❌ 获取音频临时链接失败 - 异常捕获')
    console.error('[AudioService] 错误类型:', typeof error)
    console.error('[AudioService] 错误对象:', error)
    
    // 提供更详细的错误信息
    if (error.errCode) {
      console.error('[AudioService] 错误代码:', error.errCode)
    }
    if (error.errMsg) {
      console.error('[AudioService] 错误消息:', error.errMsg)
    }
    if (error.stack) {
      console.error('[AudioService] 错误堆栈:', error.stack)
    }
    
    console.error('[AudioService] 音频临时链接获取结束 ====== ERROR ======')
    return null
  }
}