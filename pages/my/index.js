import AUTH from '../../utils/auth'
import Api from 'apifm-wxapi'
const app = getApp();
Page({
  data: {
    canIUseGetUserProfile: false,
    userInfo: {},
    hasMobile: '',
    version: '',
    appName: ''
  },
  onLoad(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    const config = wx.getStorageSync('config')
    if(!userInfo){
      this.setData({
        userInfo: {
          nickName: '可燃冰',
          avatarUrl: 'https://platform-wxmall.oss-cn-beijing.aliyuncs.com/upload/20180727/150547696d798c.png'
        }
      })
    }else{
      this.setData({
        userInfo
      })
    }

    this.setData({
      version: config.version,
      appName: config.appName
    })
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (resp) => {
          this.setData({
            userInfo: resp.userInfo,
          })
          wx.setStorageSync('userInfo', resp.userInfo)
        }
    })
  },
  bindGetUserInfo(e) {
      let userInfo = wx.getStorageSync('userInfo');
      let token = wx.getStorageSync('token');
      if (userInfo && token) {
          return;
      }
      //用户按了允许授权按钮
      this.loginByWeixin(e.detail).then(res => {
          this.setData({
              userInfo: res.userInfo
          });
          wx.setStorageSync('userInfo', res.userInfo)
          app.globalData.userInfo = res.userInfo;
      }).catch((err) => {
          console.log(err)
      });
  },

  loginByWeixin(userInfo) {
    let code = null
    return new Promise(function (resolve, reject) {
      return AUTH.login().then(res => {
        code = res.code
        resolve(userInfo)
      }).catch(err => {
        reject(err)
      })
    })
  },

})