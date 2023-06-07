const APP = getApp()

Page({
  data: {
    banners: [], // 轮播图
  },
  // 监听页面加载
  onLoad() {
    this.getHomeBanner()
    if (wx.getUserProfile) {
      this.getUserProfile()
    }
  },
  // 监听页面显示
  onShow() {
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      menuButtonObject: APP.globalData.menuButtonObject //小程序胶囊信息
    })
  },

  // 获取数据
  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        console.log('getUserProfile', res.cloudID)
        console.log('userInfo', res.userInfo)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getHomeBanner() {
    const banners = [{
        "id": 1,
        "picUrl": "https://dcdn.it120.cc/2019/12/29/8396f65d-d615-46d8-b2e5-aa41820b9fe5.png",
      },
      {
        "id": 2,
        "picUrl": "https://dcdn.it120.cc/2019/12/29/daca65ee-4347-4792-a490-ccbac4b3c1d7.png",
      },
      {
        "id": 3,
        "picUrl": "https://dcdn.it120.cc/2019/12/29/2e79921a-92b3-4d1d-8182-cb3d524be5fb.png",
      }
    ]
    this.setData({
      banners
    })
  },

  // 事件处理函数
  onClickSearch() {
    wx.showToast({
      title: '奋力开发中...',
      icon: 'none'
    })
  },
  onClickBanner: function (e) {
    const url = e.currentTarget.dataset.url
    url && wx.navigateTo({
      url
    })
  },
  bindTapBanner() {
    wx.navigateTo({
      url: '/pages/banner/index'
    })
  },
})