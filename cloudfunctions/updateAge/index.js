const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { openid, ageLevel } = event

  if (!openid) {
    return {
      success: false,
      message: '缺少 openid'
    }
  }

  if (!ageLevel || ageLevel < 1 || ageLevel > 4) {
    return {
      success: false,
      message: '年龄等级必须在 1-4 之间'
    }
  }

  try {
    const result = await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        ageLevel: ageLevel,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '年龄等级更新成功',
      data: result
    }
  } catch (error) {
    console.error('更新年龄等级失败:', error)
    return {
      success: false,
      message: '更新失败',
      error: error.message
    }
  }
}
