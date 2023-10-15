const Api = require('apifm-wxapi')
const CONFIG = require("../../config")

Page({
  data: {
    page: 1,
    vouchers: [], // 兑换券
  },

  onLoad(){
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getFeats()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },
   // 菜单内容 滚动到底部/右边时触发
   _onReachBottom() {
    console.log('_onReachBottom');
    this.data.page++
    this.getFeats()
  },

  // 获取功能列表
  getFeats() {
    Api.goodsv2({
      page: this.data.page,
      categoryId: '381107',
      pageSize: 20,
    }).then(res => {
      console.log(res);
      if (res.code == 700) {
        if (this.data.page == 1) {
          this.setData({
            vouchers: null
          })
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

})