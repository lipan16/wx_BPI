const Api = require('apifm-wxapi')

Page({
  data: {
    id: '',
    detail: {}
  },

  onLoad(options) {
    this.setData({id: options.id})
  },

  onShow() {
    this.getDetail()
  },

  onPullDownRefresh() {
    this.getDetail()
  },

  getDetail(){
    Api.goodsDetail(this.data.id, wx.getStorageSync('token')).then(res => {
      if(res.code === 0){
        this.setData({detail: res.data})
      }
    })
  },

  // 用户点击右上角分享
  onShareAppMessage() {
  }
})