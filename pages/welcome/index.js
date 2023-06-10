Page({
  data: {
    banners: [{
        "id": 1,
        "picUrl": '/images/banner/banner1.jpg',
        "title": "启动图1"
      },
      {
        "id": 2,
        "picUrl": '/images/banner/banner2.jpg',
        "title": "启动图2"
      },
      {
        "id": 3,
        "picUrl": "https://dcdn.it120.cc/2020/01/07/5425289c-fb82-4ab4-a193-933ddba71496.jpg",
        "title": "启动图3"
      }
    ],
    swiperCurrent: 0,
    swiperMaxNumber: 3,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
})