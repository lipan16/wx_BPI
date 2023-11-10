const Api = require('apifm-wxapi')
const CONFIG = require("../../config")

Page({
  data: {
    page: 1,
    vouchers: [], // 兑换券
  },

  onLoad(){
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    this.getFeats()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('onPullDownRefresh');
    this.setData({page: 1})
    this.onLoad()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('onReachBottom');
    this.setData({page: this.data.page + 1})
    this.getFeats()
  },

  // 获取功能列表
  getFeats() {
    Api.goodsv2({
      page: this.data.page,
      categoryId: '381107',
      pageSize: 10,
    }).then(res => {
      if (res.code == 700) {
        if (this.data.page == 1) {
          this.setData({vouchers: null})
        }else{
          this.setData({page: this.data.page - 1})
        }
        return
      }
      if (res.code != CONFIG.apiSuccess) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      if(this.data.page == 1){
        this.setData({vouchers: res.data.result})
      }else{
        this.setData({vouchers: this.data.vouchers.concat(res.data.result)})
      }
    })
  },

  onClickVoucher(e){
    const item = this.data.vouchers.find(f => f.id === e.currentTarget.dataset.id)
    wx.showModal({
      title: item.name,
      content: item.purchaseNotes + '。仅可使用一次，使用完交给女朋友，看心情发放。肖冰版权所有。'
    })
  }
})