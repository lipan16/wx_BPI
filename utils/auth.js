const Api = require('apifm-wxapi')

async function wxCode(){
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        return resolve(res.code)
      },
      fail() {
        wx.showToast({
          title: '获取code失败',
          icon: 'none'
        })
        return resolve('获取code失败')
      }
    })
  })
}

async function checkSession(){
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true)
      },
      fail() {
        return resolve(false)
      }
    })
  })
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
  const token = wx.getStorageSync('token')
  if (!token) {
    return false
  }
  const loggined = await checkSession()
  if (!loggined) {
    wx.removeStorageSync('token')
    return false
  }
  const checkTokenRes = await Api.checkToken(token)
  if (checkTokenRes.code != 0) {
    wx.removeStorageSync('token')
    return false
  }
  return true
}

// 授权
async function authorize() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (loginRes) {
        Api.authorize({code: loginRes.code}).then(function (res) {
          if (res.code == 0) {
            resolve(res.data)
          }else if(res.code === 10000){ // 用户注册
            Api.register_simple({code:  loginRes.code}).then(reg => {
              if(reg.code === 0){
                Api.login_wx(loginRes.code).then(res => {
                  resolve(res.data)
                })
              }else{
                reject('注册失败')
              }
            })
          } else {
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
            reject(res.msg)
          }
        })
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

function login() {
  return new Promise(function (resolve, reject) {
      wx.login({
          success: function (res) {
              if (res.code) {
                  resolve(res);
              } else {
                  reject(res);
              }
          },
          fail: function (err) {
              reject(err);
          }
      });
  });
}

function loginOut(){
  wx.removeStorageSync('token')
  wx.removeStorageSync('uid')
}

// 检测并且申请权限
async function checkAndAuthorize (scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              resolve() // 无返回参数
            },
            fail(e){
              wx.showModal({
                title: '无权操作',
                content: '需要获得您的授权',
                showCancel: false,
                confirmText: '立即授权',
                confirmColor: '#e64340',
                success(res) {
                  wx.openSetting();
                },
                fail(e){
                  console.error(e)
                  reject(e)
                },
              })
            }
          })
        } else {
          resolve() // 无返回参数
        }
      },
      fail(e){
        console.error(e)
        reject(e)
      }
    })
  })  
}

module.exports = {
  wxCode,
  checkHasLogined,
  authorize,
  login,
  loginOut,
  checkAndAuthorize
}