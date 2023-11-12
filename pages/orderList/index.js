const Api = require('apifm-wxapi')

Page({
  data: {
    page: 1,
    tabIndex: 0,
    statusType: [
      {status: 9999,label: '全部'},
      {status: 0,label: '待付款'},
      {status: 1,label: '待发货'},
      {status: 2,label: '待收货'},
      {status: 3,label: '待评价'},
    ],
    status: 9999,
    hasRefund: false,
    badges: [0, 0, 0, 0, 0]
  },
  onLoad(options) {
  },
  onShow() {
  },
  onPullDownRefresh() {
  },
  onReachBottom() {
  },
  // 获取订单列表
  async orderList(){
    var postData = {
      page: this.data.page,
      pageSize: 10,
      token: wx.getStorageSync('token')
    };
    if (this.data.hasRefund) {
      postData.hasRefund = true
    }
    if (!postData.hasRefund) {
      postData.status = this.data.status;
    }
    if (postData.status == 9999) {
      postData.status = ''
    }
    const res = await Api.orderList(postData)
    wx.hideLoading()
    if (res.code == 0) {
      if (this.data.page == 1) {
        this.setData({
          orderList: res.data.orderList,
          logisticsMap: res.data.logisticsMap,
          goodsMap: res.data.goodsMap
        })
      } else {
        this.setData({
          orderList: this.data.orderList.concat(res.data.orderList),
          logisticsMap: Object.assign(this.data.logisticsMap, res.data.logisticsMap),
          goodsMap: Object.assign(this.data.goodsMap, res.data.goodsMap)
        })
      }
    } else {
      if (this.data.page == 1) {
        this.setData({
          orderList: null,
          logisticsMap: {},
          goodsMap: {}
        })
      } else {
        wx.showToast({
          title: '没有更多了',
          icon: 'none'
        })
      }
    }
  },
})