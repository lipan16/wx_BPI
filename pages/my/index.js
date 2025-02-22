const CONFIG = require("../../config")
const app = getApp()
import {setStorageSync} from '../../utils/index'

Page({
  data: {
    version: CONFIG.version,
    appName: CONFIG.appName,
    avatarUrl: '',
    nickname: '',
  },
  onShow() {
    this.setData({
      avatarUrl: app.globalData.userInfo?.avatarUrl,
      nickname: app.globalData.userInfo?.nickname,
    })
  },

  onChooseAvatar(e){
    const {avatarUrl} = e.detail
    this.setData({avatarUrl})
    app.globalData.userInfo = {...app.globalData.userInfo, avatarUrl}
    setStorageSync('userInfo', app.globalData.userInfo, 30)
  },
  onChooseNickname(e){
    const that = this
    wx.createSelectorQuery().in(this) // 注意这里要加上 in(this)  
      .select(".userinfo-nickname")
      .fields({properties: ["value"]})
      .exec(res => {
        that.setData({nickname: res[0].value})
        app.globalData.userInfo = {...app.globalData.userInfo, nickname: res[0].value}
        setStorageSync('userInfo', app.globalData.userInfo, 30)
      })
  },
})