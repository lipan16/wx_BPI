const Api = require('apifm-wxapi')
const CONFIG = require('config.js')

App({
  onLaunch() {
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

    // 获取系统变量
    Api.queryConfigBatch('appName,version,description,showWelcome').then(res => {
      if(res.code === CONFIG.apiSuccess){
        const config = {}
        res.data.forEach(m => {
          config[m.key] = m.value
        })
        wx.setStorageSync('config', config)
      }
    })

    // 检测navbar高度
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    console.log("小程序胶囊信息", menuButtonObject)
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight, // 手机状态栏高度
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight); //导航高度
        this.globalData.statusBarHeight = statusBarHeight;
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        // this.globalData.windowHeight = res.windowHeight;
        this.globalData.menuButtonObject = menuButtonObject;
      },
      fail(err) {
        console.log(err);
      }
    })

    // 登录
    wx.login({
      success: res => {
        console.log('login res: ', JSON.stringify(res))
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        } else {
          console.error('登录失败！' + res.errMsg)
        }
      }
    })
  },

  globalData: {
    isConnected: true, // 网络状态
  }
})