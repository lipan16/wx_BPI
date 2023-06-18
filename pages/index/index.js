const Api = require('apifm-wxapi')
const CONFIG = require("../../config")
const APP = getApp()

Page({
  data: {
    appName: '',
    banners: [], // 轮播图
    feats: [], // 功能列表
    notice: {}, // 公告
  },
  // 监听页面加载
  onLoad() {
    const config = wx.getStorageSync('config')
    this.setData({appName: config.appName})
    this.getHomeBanner()
    this.getFeats()
    Api.noticeLastOne('notice').then(res => {
      this.setData({notice: res.data})
    })
  },
  // 监听页面显示
  onShow() {
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      menuButtonObject: APP.globalData.menuButtonObject //小程序胶囊信息
    })
  },

  // 获取首页轮播图
  getHomeBanner() {
    Api.banners({type: 'index'}).then(res => {
      if (res.code == CONFIG.apiSuccess) {
        this.setData({
          banners: res.data
        })
      }
    })
  },
  // 获取功能列表
  getFeats() {
    Api.goodsCategoryV2(0).then(res => {
      console.log(res);
      if (res.code === CONFIG.apiSuccess) {
        this.setData({
          feats: res.data
        })
      }
    })
  },

  // 事件处理函数
  onClickSearch() { // 点击搜索
    wx.showToast({
      title: '奋力开发中...',
      icon: 'none'
    })
  },
  onClickBanner: function (e) { // 点击banner
    const url = e.currentTarget.dataset.url
    url && wx.navigateTo({
      url
    })
  },
  onClickFeat(e) { // 点击功能
    const item = this.data.feats.find(f => f.id === e.currentTarget.dataset.id)
    const {key, type} = item

    if (type === 'page') {
      wx.navigateTo({
        url: key
      })
    } else if (type === 'tab') {
      wx.switchTab({
        url: key
      })
    } else if(type === 'url'){
      wx.showModal({
        title: '系统提示',
        content: '这是一个外部地址，是否跳转',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            console.log(key);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  gotoNotice(e){ // 点击公告
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/notice/detail?id=' + id,
    })
  }
})