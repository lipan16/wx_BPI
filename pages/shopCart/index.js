const Api = require('apifm-wxapi')

Page({
  data: {
    shoppingCarInfo: {},
  },
  onLoad(options) {
    
  },
  onShow() {
    this.getShoppingCarInfo()
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  // 读取购物车数据
  async getShoppingCarInfo() {
    const res = await Api.shippingCarInfo(wx.getStorageSync('token'))
    console.log(res);
    this.setData({
      shoppingCarInfo:  res.code == 0 ? res.data : null
    })
  },
})