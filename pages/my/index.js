const CONFIG = require('../../config.js')

Page({
  data: {
    version: '',
    userInfo: {},
  },
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      version: CONFIG.version,
      userInfo
    })
  },

  // 获取数据
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang: 'zh_CN',
      success: res => {
        this.setData({
          userInfo: res.userInfo,
        })
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  },
})