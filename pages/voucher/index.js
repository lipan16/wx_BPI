const CONFIG = require("../../config")

Page({
  data: {
    vouchers: [], // 兑换券
  },
  onLoad(){
    this.getFeats()
  },
 
  // 获取功能列表
  getFeats() {
    wx.request({
      url: `${CONFIG.host}/api/wx/voucher`,
      success: ({data}) => {
        this.setData({vouchers: data})
      },
      fail: e => {
        console.error(e);
      }
    })
  },

  onClickVoucher(e){
    const item = this.data.vouchers.find(f => f.key === e.currentTarget.dataset.id)
    console.log(item);
    wx.showModal({
      title: item.name,
      content: item.desc + '。仅可使用一次，使用完交给女朋友，看心情发放。肖冰版权所有。'
    })
  }
})