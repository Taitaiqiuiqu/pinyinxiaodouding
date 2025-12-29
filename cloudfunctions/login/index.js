// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

function convertAgeToLevel(age) {
  if (age === null || age === undefined || age === '') {
    return 1
  }
  const ageNum = Number(age)
  if (isNaN(ageNum)) {
    return 1
  }
  if (ageNum <= 4) {
    return 1
  } else if (ageNum <= 5) {
    return 2
  } else if (ageNum <= 6) {
    return 3
  } else {
    return 4
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, userInfo } = event
  
  try {
    const openid = wxContext.OPENID
    
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    let user = null
    
    if (userResult.data.length > 0) {
      user = userResult.data[0]
      
      const updateData = {
        userInfo: userInfo,
        updateTime: db.serverDate()
      }
      
      if (user.ageLevel === undefined || user.ageLevel === null) {
        if (user.age !== undefined && user.age !== null) {
          updateData.ageLevel = convertAgeToLevel(user.age)
          updateData.age = db.command.unset()
        } else {
          updateData.ageLevel = 1
        }
        await db.collection('users').doc(user._id).update({ data: updateData })
        user.ageLevel = updateData.ageLevel
      } else if (typeof user.ageLevel !== 'number' || user.ageLevel < 1 || user.ageLevel > 4) {
        updateData.ageLevel = 1
        await db.collection('users').doc(user._id).update({ data: updateData })
        user.ageLevel = 1
      } else {
        await db.collection('users').doc(user._id).update({ data: updateData })
      }
    } else {
      const addResult = await db.collection('users').add({
        data: {
          openid: openid,
          userInfo: userInfo,
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          ageLevel: 1,
          usedTime: 0,
          totalScore: 0
        }
      })
      
      user = await db.collection('users').doc(addResult._id).get()
      user = user.data
    }
    
    return {
      success: true,
      openid: openid,
      user: user
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
