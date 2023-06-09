const APP = getApp()

Page({
  data: {
    banners: [], // 轮播图
    feats: [{
        id: 'order',
        name: '点菜',
        icon: '../../images/default.png',
        url: '',
        isPage: true
      },
      {
        id: 'banner',
        name: 'banner',
        icon: '../../images/default.png',
        url: '/pages/banner/index',
        isPage: true
      },
      {
        id: 'workProgress',
        name: '上班进度',
        icon: '../../images/default.png',
        url: '/pages/workProgress/index',
        isPage: true
      },
      {
        id: 'progress2',
        name: 'test1',
        icon: '../../images/default.png',
        url: '',
        isPage: false
      },
      {
        id: 'progress3',
        name: 'test2',
        icon: '../../images/default.png',
        url: '',
        isPage: false
      }
    ] // 功能列表
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
        'id': 1,
        'picUrl': 'https://dcdn.it120.cc/2019/12/29/8396f65d-d615-46d8-b2e5-aa41820b9fe5.png'
      },
      {
        'id': 2,
        'picUrl': 'https://dcdn.it120.cc/2019/12/29/daca65ee-4347-4792-a490-ccbac4b3c1d7.png'
      },
      {
        'id': 3,
        'picUrl': 'https://dcdn.it120.cc/2019/12/29/2e79921a-92b3-4d1d-8182-cb3d524be5fb.png'
      }
    ]
    this.setData({
      banners
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
    console.log(item)
    const {
      url,
      isPage
    } = item
    if (url) {
      if (isPage) {
        wx.navigateTo({
          url
        })
      } else {
        wx.showModal({
          title: '系统提示',
          content: '这是一个外部地址，是否跳转',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    } else {
      wx.showToast({
        title: '奋力开发中...',
        icon: 'none'
      })
    }
  }
})