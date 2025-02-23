const Api = require('apifm-wxapi')
const CONFIG = require('config.js')
import { getStorageSync } from './utils/index'
import AUTH from './utils/auth'

App({
  globalData: {
    isConnected: true, // 网络状态
    userInfo: null, // 用户信息
  },

  onLaunch() {
    wx.setEnableDebug({enableDebug: true})

    const that = this
    // 初始化请求
    Api.init(CONFIG.subDomain)

    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    /**
     * 获取授权
     */
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        console.log('wx.getSetting', res);
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({scope: 'scope.userLocation'})
        }
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {console.log('申请scope.userInfo 成功')}
          })
        }
      }
    })

    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    })

    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    })

    // 检测navbar高度
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    console.log("小程序胶囊信息", menuButtonObject)
    const res = wx.getWindowInfo()
    let statusBarHeight = res.statusBarHeight; // 手机状态栏高度
    const navTop = menuButtonObject.top; //胶囊按钮与顶部的距离
    const navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight); //导航高度
    this.globalData.statusBarHeight = statusBarHeight;
    this.globalData.navHeight = navHeight;
    this.globalData.navTop = navTop;
    this.globalData.menuButtonObject = menuButtonObject;

    this.globalData.userInfo = getStorageSync('userInfo')
  },

  onShow(e) { 
    AUTH.checkHasLogined().then(isLogined => { // 检查登录状态 
      if (!isLogined) { 
        AUTH.authorize().then(res => { // 授权 
          wx.setStorageSync('token', res.token)
          // wx.setStorageSync('uid', res.uid)
        }) 
      } 
    })
  }
})