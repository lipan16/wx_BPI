const Api = require('apifm-wxapi')
const CONFIG = require('../../config')
import {sendNotice, getStorageSync} from '../../utils/index'
const APP = getApp()

Page({
  data: {
    shoppingCarInfo: {},
    token: wx.getStorageSync('token'),
    show: false
  },
  onLoad(){
    const {show} = getStorageSync('userInfo')
    this.setData({show})
  },
  onShow() {
    this.getShippingCarInfo()
  },
 
  toIndexPage: function () {
    wx.navigateTo({url: "/pages/menu/index"})
  },
  
  // 获取购物车数据
  async getShippingCarInfo() {
    const res = await Api.shippingCarInfo(this.data.token)
    console.log('getShippingCarInfo', res.data);
    this.setData({shoppingCarInfo:  res.code == 0 ? res.data : null})
  },
 
  delItemApi(key) {
    // 弹出删除确认
    wx.showModal({
      content: '确定要删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          const res = await Api.shippingCarInfoRemoveItem(this.data.token, key)
          if (res.code != 0 && res.code != 700) {
            wx.showToast({title: res.msg, icon: 'none'})
          } else {
            this.getShippingCarInfo()
          }
        }
      }
    })
  },

  async delItemTap(e) {
    const key = e.currentTarget.dataset.key
    this.delItemApi(key)
  },
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shoppingCarInfo.items[index]
    const number = item.number + 1
    await Api.shippingCarInfoModifyNumber(this.data.token, item.key, number)
    this.getShippingCarInfo()
  },
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shoppingCarInfo.items[index]
    const number = item.number - 1
    if (number <= 0) {
      this.delItemApi(item.key)
      return
    }
    
    await Api.shippingCarInfoModifyNumber(this.data.token, item.key, number)  
    this.getShippingCarInfo()
  },
  changeCarNumber(e) {
    const key = e.currentTarget.dataset.key
    const num = e.detail.value
    
    Api.shippingCarInfoModifyNumber(this.data.token, key, num).then(res => {
      this.getShippingCarInfo()
    })
  },
  async radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.shoppingCarInfo.items[index]
    if (!item.stores || item.status == 1) {
      return
    }
    await Api.shippingCartSelected(this.data.token, item.key, !item.selected)
    this.getShippingCarInfo()
  },

   // 下单成功后清空购物车
   async clearCart() {
    wx.showLoading({title: '加载中...'})
    const res = await Api.shippingCarInfoRemoveAll(this.data.token)
    wx.hideLoading()
    if (res.code === 0) {
      wx.showToast({title: '下单成功', icon: 'success'})
    }
    this.getShippingCarInfo()
  },

  // 提交接口
  async submitApi(){
    const goodsJsonStr = JSON.stringify(this.data.shoppingCarInfo.items) // 菜品列表
    const names = this.data.shoppingCarInfo.items.map(m => m.name)
    const res = await Api.orderCreate({
      token: this.data.token,
      goodsJsonStr,
      calculate: 'false' // 预下单
    })
    console.log('res', res);
    if(res.data.id && res.data.id !== ''){ // 下单成功
      Api.orderPay(this.data.token, res.data.id).then(response => { // 支付成功
        wx.showModal({
          title: '可燃冰食堂提醒',
          content: `下单成功，自动扣款${res.data.amountReal}元，单号：${res.data.id}`,
          duration: 100000,
          success: res => {
            if(res.confirm){
              this.clearCart()
            }
          }
        })
        const title = `【${names.join('、')}】的订单`.substring(0, 17)
        sendNotice({
          auth: CONFIG.auth,
          userOpenId: APP.globalData.userInfo.openId,
          id: res.data.id,
          money: res.data.amountReal,
          time: res.data.dateAdd,
          title,
          remark: '菜品原料明细'
        })
      })
    }
  },

  // 点击提交订单
  onClickSubmit(){
    wx.showModal({
      title: '可燃冰食堂提醒',
      content: '确定提交订单吗？',
      success: res => {
        if(res.confirm){
          this.submitApi()
        }
      }
    })
  },
})