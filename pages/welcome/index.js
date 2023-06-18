const Api = require('apifm-wxapi')
const CONFIG = require('../../config')

Page({
  data: {
    banners: [],
    swiperCurrent: 0,
  },

  //生命周期函数--监听页面加载
  onLoad(options) {
    this.getBanners()
    this.readConfigVal()
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
  },

  readConfigVal() {
    const {showWelcome} = wx.getStorageSync('config')
    if (showWelcome === '1') {
      const {expire, value} = wx.getStorageSync('isFirstEntry')
      if (Date.now() < expire && !value) { // 非第一次进入，显示banner页
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    } else {
      wx.switchTab({
        url: '/pages/index/index',
      })
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
      const isFirstEntry = {
        time: Date.now(),
        expire: Date.now() + 24 * 60 * 60 * 1000,
        value: false
      }
      wx.setStorageSync('isFirstEntry', isFirstEntry)
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
  getBanners() {
    Api.banners({type: 'app'}).then(res => {
      if (res.code == CONFIG.apiSuccess) {
        this.setData({
          banners: res.data,
        })
      }
    })
  }
})