const CONFIG = require('../../config')
const { setStorageSync, getStorageSync } = require('../../utils/index')
const app = getApp()

Page({
  data: {
    banners: [
      {id: '1', url: `${CONFIG.host}/static/xcx/wx_banner_1.jpg`},
      {id: '2', url: `${CONFIG.host}/static/xcx/wx_banner_2.jpg`},
      {id: '3', url: `${CONFIG.host}/static/xcx/wx_banner_3.jpg`}
    ],
    swiperCurrent: 0,
  },

  //生命周期函数--监听页面加载
  onLoad(options) {
    this.readConfigVal()
    // 补偿写法
    app.configLoadOK = () => {
      this.readConfigVal()
    }
  },

  readConfigVal() {
    const value = getStorageSync('firstEntry')
    if(value) { // 非第一次进入，直接进入主页
      wx.switchTab({url: '/pages/index/index'})
    }
  },

  swiperchange: function (e) {
    this.setData({swiperCurrent: e.detail.current})
  },

  getUserProfile() {
    wx.requestSubscribeMessage({
      tmplIds: ['rBGQlXNBVlXxlnsIPz2sNcvuI2Zm5QNG09MUBn_M0YM', 'hq6ci9eq3c-y_fmdJU8A-STU3m4VKU_cnErmFsGPeoU'],
      success: async res => {
        await this.authLogin()
      },
      fail: e => {
        console.error(e);
        this.authLogin()
      }
    })
  },

  async authLogin(){
    wx.showLoading({title: '登录中...', mask: true});
    try {
      const {code} = await wx.login();
      // 发送到后端进行登录验证
      wx.request({
        url: `${CONFIG.host}/api/wx/login?code=${code}`,
        success: ({data}) => {
          wx.showLoading({title: JSON.stringify(data), mask: true});
          const {token: openId, show, logined} = data
          if(!logined){
            wx.showToast({
              title: '非内测用户无法使用',
              icon: 'none',
              duration: 5000,
              mask: true
            })
            return
          }
          app.globalData.userInfo = {...app.globalData.userInfo, openId, show};
          setStorageSync('userInfo', app.globalData.userInfo, 30)
          wx.hideLoading();
          this.goToIndex();
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
  },

  // 进入首页
  goToIndex: function (e) {
    if (app.globalData.isConnected) {
      setStorageSync('firstEntry', Date.now(), 1)
      wx.switchTab({url: '/pages/index/index'});
    } else {
      wx.showToast({title: '当前无网络', icon: 'none'})
    }
  }

})