const APP = getApp()

Page({
  data: {
    banners: [], // 轮播图
    feats: [{
        id: 'order',
        name: '点菜',
        icon: '../../images/default.png',
        url: '',
        type: 'page',
      },
      {
        id: 'welcome',
        name: '欢迎页',
        icon: '../../images/svg/welcome.svg',
        url: '/pages/welcome/index',
        type: 'page',
      },
      {
        id: 'workProgress',
        name: '上班进度',
        icon: '../../images/svg/work.svg',
        url: '/pages/workProgress/index',
        type: 'page',
      },
      {
        id: 'shopCar',
        name: '购物车',
        icon: '../../images/nav/cart-on.png',
        url: '/pages/shopCart/index',
        type: 'tab',
      },
      {
        id: 'voucher',
        name: '兑换券',
        icon: '../../images/nav/voucher.png',
        url: '/pages/voucher/index',
        type: 'tab',
      },
      {
        id: 'test1',
        name: 'test1',
        icon: '../../images/default.png',
        url: '',
        type: 'url',
      }
    ] // 功能列表
  },
  // 监听页面加载
  onLoad() {
    this.getHomeBanner()
  },
  // 监听页面显示
  onShow() {
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      menuButtonObject: APP.globalData.menuButtonObject //小程序胶囊信息
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
    const {id, url, type} = item
    if(id === 'welcome'){
      wx.setStorageSync('showWelcome', true)
    }
    if (url) {
      if(type === 'page'){
        wx.navigateTo({
          url
        })
      } else if(type === 'tab') {
        wx.switchTab({
          url
        })
      } else{
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