const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { audioFiles, forceUpdate = false } = event

  console.log('=== syncAudioToDB 云函数开始 ===')
  console.log('云环境信息:', wxContext)
  console.log('请求参数:', { audioFilesCount: audioFiles?.length, forceUpdate })

  try {
    const audioCollection = db.collection('audio')
    
    if (!audioFiles || audioFiles.length === 0) {
      console.log('=== 未提供音频文件列表，查询现有数据 ===')
      
      const existingAudio = await audioCollection.get()
      
      return {
        success: true,
        message: '查询成功',
        data: {
          totalProcessed: 0,
          addedCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          existingCount: existingAudio.data.length
        }
      }
    }
    
    console.log('=== 开始处理音频文件列表 ===')
    console.log('待处理音频数量:', audioFiles.length)
    
    const existingAudio = await audioCollection.get()
    const existingFileIds = new Map()
    
    existingAudio.data.forEach(item => {
      existingFileIds.set(item.fileID, item)
    })
    
    console.log('已存在的音频数量:', existingFileIds.size)
    
    const toAdd = []
    const toUpdate = []
    
    for (const audioFile of audioFiles) {
      const { fileID, fileName, audioType, duration, size } = audioFile
      
      if (!fileID) {
        console.warn('跳过无效的音频文件（缺少fileID）:', audioFile)
        continue
      }
      
      const existing = existingFileIds.get(fileID)
      
      if (existing) {
        if (forceUpdate) {
          toUpdate.push({
            _id: existing._id,
            data: {
              fileName: fileName || existing.fileName,
              audioType: audioType || existing.audioType,
              duration: duration || existing.duration,
              size: size || existing.size,
              updateTime: new Date()
            }
          })
        }
      } else {
        toAdd.push({
          fileID: fileID,
          fileName: fileName || fileID.split('/').pop(),
          audioType: audioType || 'unknown',
          duration: duration || 0,
          size: size || 0,
          createTime: new Date(),
          updateTime: new Date()
        })
      }
    }
    
    console.log('待添加数量:', toAdd.length)
    console.log('待更新数量:', toUpdate.length)
    console.log('跳过数量:', audioFiles.length - toAdd.length - toUpdate.length)
    
    let addedCount = 0
    let updatedCount = 0
    
    if (toAdd.length > 0) {
      console.log('=== 开始批量添加音频 ===')
      
      const batchSize = 20
      
      for (let i = 0; i < toAdd.length; i += batchSize) {
        const batch = toAdd.slice(i, i + batchSize)
        
        try {
          const addPromises = batch.map(audio => 
            audioCollection.add({
              data: audio
            })
          )
          
          await Promise.all(addPromises)
          addedCount += batch.length
          
          console.log(`已添加 ${addedCount}/${toAdd.length} 个音频文件`)
        } catch (error) {
          console.error('批量添加失败，尝试逐个添加:', error)
          
          for (const audio of batch) {
            try {
              await audioCollection.add({
                data: audio
              })
              addedCount++
            } catch (singleError) {
              console.error(`添加音频 ${audio.fileName} 失败:`, singleError)
            }
          }
        }
      }
    }
    
    if (toUpdate.length > 0) {
      console.log('=== 开始批量更新音频 ===')
      
      for (const updateItem of toUpdate) {
        try {
          await audioCollection.doc(updateItem._id).update({
            data: updateItem.data
          })
          updatedCount++
          
          if (updatedCount % 20 === 0) {
            console.log(`已更新 ${updatedCount}/${toUpdate.length} 个音频文件`)
          }
        } catch (error) {
          console.error(`更新音频 ${updateItem._id} 失败:`, error)
        }
      }
    }
    
    console.log('=== 音频同步完成 ===')
    console.log('总处理数量:', audioFiles.length)
    console.log('成功添加数量:', addedCount)
    console.log('成功更新数量:', updatedCount)
    console.log('跳过数量:', audioFiles.length - toAdd.length - toUpdate.length)
    
    return {
      success: true,
      message: '音频信息同步成功',
      data: {
        totalProcessed: audioFiles.length,
        addedCount: addedCount,
        updatedCount: updatedCount,
        skippedCount: audioFiles.length - toAdd.length - toUpdate.length
      }
    }
    
  } catch (error) {
    console.error('=== 音频同步失败 ===')
    console.error('错误详情:', error)
    console.error('错误堆栈:', error.stack)
    
    return {
      success: false,
      message: '音频信息同步失败',
      error: error.message
    }
  }
}
