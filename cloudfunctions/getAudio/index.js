const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 移除数据库依赖，直接使用预定义音频映射
exports.main = async (event, context) => {
  const { audioId, audioType } = event
  const wxContext = cloud.getWXContext()

  console.log('=== getAudio 云函数开始 ===')
  console.log('请求参数:', { audioId, audioType })
  console.log('云环境信息:', wxContext)

  if (!audioId) {
    console.error('缺少音频ID参数')
    return {
      success: false,
      message: '缺少音频ID'
    }
  }

  try {
    // 直接使用预定义的音频文件ID映射，不再查询数据库
    const predefinedAudioMap = {
      'guide_age_survey_3-8_01': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/age_select/guide_age_survey_3-8_01.MP3',
        fileName: 'guide_age_survey_3-8_01.MP3',
        audioType: 'guide'
      },
      'age-select/guide_age_survey_3-8_01.MP3': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/age_select/guide_age_survey_3-8_01.MP3',
        fileName: 'guide_age_survey_3-8_01.MP3',
        audioType: 'guide'
      },
      // Home界面新手引导音频
      'guide_home_welcome': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_welcome.wav',
        fileName: 'guide_home_welcome.wav',
        audioType: 'guide'
      },
      'guide_home_good': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_good.wav',
        fileName: 'guide_home_good.wav',
        audioType: 'guide'
      },
      'guide_home_start': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_start.wav',
        fileName: 'guide_home_start.wav',
        audioType: 'guide'
      },
      'guide_home_course': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_cuorse.wav',
        fileName: 'guide_home_cuorse.wav',
        audioType: 'guide'
      },
      'guide_home_game': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_game.wav',
        fileName: 'guide_home_game.wav',
        audioType: 'guide'
      },
      'guide_home_write': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/home/guide_home_write.wav',
        fileName: 'guide_home_write.wav',
        audioType: 'guide'
      },
      // 儿歌音频
      'speak_song': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/songs/speak_song.MP3',
        fileName: 'speak_song.MP3',
        audioType: 'songs'
      },
      'study_songs': {
        fileID: 'cloud://cloud1-0g2q55rz3fb8f3b8.636c-cloud1-0g2q55rz3fb8f3b8-1392219107/audio/songs/study_songs.MP3',
        fileName: 'study_songs.MP3',
        audioType: 'songs'
      }
    }
    
    let audioInfo = null
    const audioConfig = predefinedAudioMap[audioId]
    
    if (audioConfig) {
      try {
        console.log('=== 获取音频临时链接 ===')
        console.log('音频配置:', audioConfig)
        
        const tempFileURL = await cloud.getTempFileURL({
          fileList: [audioConfig.fileID]
        })
        
        if (tempFileURL.fileList.length > 0 && tempFileURL.fileList[0].tempFileURL) {
          audioInfo = {
            audioId: audioId,
            fileName: audioConfig.fileName,
            fileID: audioConfig.fileID,
            tempFileURL: tempFileURL.fileList[0].tempFileURL,
            audioType: audioType || audioConfig.audioType,
            createTime: new Date(),
            fromCloud: true
          }
          console.log('=== 成功获取临时链接 ===')
          console.log('临时链接:', audioInfo.tempFileURL)
        } else {
          throw new Error('无法获取临时链接')
        }
      } catch (urlError) {
        console.error('获取临时链接失败:', urlError)
        audioInfo = {
          audioId: audioId,
          fileName: audioConfig.fileName,
          fileID: audioConfig.fileID,
          audioType: audioType || audioConfig.audioType,
          createTime: new Date(),
          fallbackToLocal: true,
          fromCloud: false,
          error: urlError.message
        }
      }
    } else {
      // 对于未知的音频ID，返回null
      console.warn(`=== 未找到音频ID: ${audioId}，返回null ===`)
      audioInfo = null
    }

    console.log('=== 获取音频信息成功 ===')
    console.log('音频信息:', audioInfo)
    
    return {
      success: true,
      message: '获取音频信息成功',
      data: audioInfo
    }
  } catch (error) {
    console.error('=== 获取音频信息失败 ===')
    console.error('错误详情:', error)
    console.error('错误堆栈:', error.stack)
    
    return {
      success: false,
      message: '获取音频信息失败',
      error: error.message
    }
  }
}