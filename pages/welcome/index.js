const Api = require('apifm-wxapi')

Page({
  data: {
    banners: [],
    swiperCurrent: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getBanners()
    this.readConfigVal()
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
  },

  readConfigVal(){
    const showWelcome = wx.getStorageSync('showWelcome')
    if(!showWelcome){
      wx.switchTab({
        url: '/pages/index/index',
      });
    }
  },

  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  // 进入首页
  goToIndex: function (e) {
    if (getApp().globalData.isConnected) {
      wx.setStorageSync('showWelcome', false)
      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  getBanners(){
    Api.banners({type: 'app'}).then(res => {
      if (res.code == 0) {
        this.setData({
          banners: res.data,
        })
      }
    })
  }
})