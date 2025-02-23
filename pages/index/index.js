const Api = require('apifm-wxapi')
const CONFIG = require("../../config")
const APP = getApp()

Page({
  data: {
    appName: CONFIG.appName,
    banners: [
      {id: '1', url: `${CONFIG.host}/static/1597551240750.jpg`},
      {id: '2', url: `${CONFIG.host}/static/1597550702059.jpg`},
      {id: '3', url: `${CONFIG.host}/static/1597550850648.jpg`}
    ], // 轮播图
    feats: [], // 功能列表
    notice: {}, // 公告
  },
  // 监听页面加载
  onLoad() {
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

  // 获取功能列表
  getFeats() {
    wx.request({
      url: `${CONFIG.host}/api/feat`,
      success: ({data}) => {
        this.setData({feats: data})
      }
    })
  },

  // 事件处理函数
  onClickSearch() { // 点击搜索
    wx.showToast({title: '奋力开发中...', icon: 'none'})
  },
  onClickBanner: function (e) { // 点击banner
    const url = e.currentTarget.dataset.url
    url && wx.navigateTo({url})
  },

  onClickFeat(e) { // 点击功能
    const item = this.data.feats.find(f => f.id === e.currentTarget.dataset.id)
    const {key, type} = item

    if (type === 'page') {
      wx.navigateTo({url: key})
    } else if (type === 'tab') {
      wx.switchTab({url: key})
    } else if(type === 'url'){
      wx.showModal({
        title: '系统提示',
        content: `【${key}】是一个外部地址，是否跳转?`,
        success(res) {
          if (res.confirm) {
            wx.miniapp.openUrl(key)
          }
        }
      })
    }
  },

  gotoNotice(e){ // 点击公告
    const id = e.currentTarget.dataset.id
    wx.navigateTo({url: '/pages/notice/detail?id=' + id})
  }
})