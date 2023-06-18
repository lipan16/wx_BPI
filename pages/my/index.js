Page({
  data: {
    version: '',
    userInfo: {},
    appName: ''
  },
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    const config = wx.getStorageSync('config')
    this.setData({
      userInfo,
      version: config.version,
      appName: config.appName
    })
  },

  // 获取用户数据
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