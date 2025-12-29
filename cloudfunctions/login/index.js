// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, userInfo } = event
  
  try {
    // 1. 获取openid（可以直接从wxContext获取，也可以通过code换取）
    const openid = wxContext.OPENID
    
    // 2. 查询用户是否已存在
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    let user = null
    
    if (userResult.data.length > 0) {
      // 用户已存在，更新用户信息
      user = userResult.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          userInfo: userInfo,
          updateTime: db.serverDate()
        }
      })
    } else {
      // 用户不存在，创建新用户
      const addResult = await db.collection('users').add({
        data: {
          openid: openid,
          userInfo: userInfo,
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          age: 4, // 默认年龄
          usedTime: 0,
          totalScore: 0
        }
      })
      
      // 获取新创建的用户信息
      user = await db.collection('users').doc(addResult._id).get()
      user = user.data
    }
    
    // 3. 返回登录结果
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