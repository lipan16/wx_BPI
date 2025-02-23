const Api = require('apifm-wxapi')
const CONFIG = require('../../config')
const AUTH = require('../../utils/auth')
import {sendNotice} from '../../utils/index'
const APP = getApp()

Page({
  data: {
    page: 1, // 列表请求下标
    scrolltop: 0, // 设置竖向滚动条位置
    categories: [], // 侧边菜单分类 goodsCategoryV2 69049
    categorySelected: {}, // 选中的菜单分类
    goods: [], // 菜品列表
    shoppingCarInfo: {}, // 购物车
    token: wx.getStorageSync('token')
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.getCategories() // 获取菜单分类
    this.getShoppingCarInfo() // 获取购物车信息
  },

  // 获取菜单分类
  getCategories(){
    Api.goodsCategoryV2('69049').then(res => {
      if(res.code === CONFIG.apiSuccess){
        this.setData({categories: res.data, categorySelected: res.data[0]})
        this.getGoodsList()
      }
    })
  },

  // 点击侧菜单分类
  onCLickCategory(e) {
    const index = e.currentTarget.dataset.id
    const categorySelected = this.data.categories[index]
    this.setData({page: 1, categorySelected, scrolltop: 0})
    this.getGoodsList()
  },

  // 菜单内容 滚动到底部/右边时触发
  _onReachBottom() {
    console.log('_onReachBottom');
    this.data.page++
    this.getGoodsList()
  },

  // 获取商品列表
  async getGoodsList(){
    const res = await Api.goodsv2({
      page: this.data.page,
      categoryId: this.data.categorySelected.id,
      pageSize: 20,
    })
    if (res.code == 700) {
      if (this.data.page == 1) {
        this.setData({goods: null})
      }
      return
    }
    if (res.code != CONFIG.apiSuccess) {
      wx.showToast({title: res.msg, icon: 'none'})
      return
    }
    if(this.data.page == 1){
      this.setData({goods: res.data.result})
    }else{
      this.setData({goods: this.data.goods.concat(res.data.result)})
    }
    this.processBadge()
  },
  // 进入详情
  goGoodsDetail(e) {
    wx.navigateTo({url: '/pages/dishes/index?id=' +  e.currentTarget.dataset.id})
  },

  // 读取购物车数据
  async getShoppingCarInfo() {
    const res = await Api.shippingCarInfo(this.data.token)
    this.setData({shoppingCarInfo: res.code == 0 ? res.data : null})
    this.processBadge()
  },

  // 显示分类和商品数量
  processBadge() {
    const categories = this.data.categories
    const goods = this.data.goods
    const shoppingCarInfo = this.data.shoppingCarInfo
    if (!categories || !goods ) {
      return
    }
    categories.forEach(ele => {ele.badge = 0})
    goods.forEach(ele => {ele.badge = 0})
    if (shoppingCarInfo) {
      shoppingCarInfo.items.forEach(ele => {
        if (ele.categoryId) { // 计算分类数量
          const category = categories.find(a => a.id == ele.categoryId)
          if (category) {
            category.badge += ele.number
          }
        }
        if (ele.goodsId) { // 计算菜品数量
          const _goods = goods.find(a => a.id == ele.goodsId)
          if (_goods) {
            _goods.badge += ele.number
          }
        }
      })
    }
    this.setData({categories, goods})
  },

  // 加入购物车
  async addToCart(e){
    const item = this.data.goods.find(f => f.id === e.currentTarget.dataset.id)
    if (!item) {
      return
    }
    if (item.stores <= 0) {
      wx.showToast({title: '已售罄~', icon: 'none'})
      return
    }
    wx.showLoading({title: ''})
    let number = item.minBuyNumber // 加入购物车的最小数量
    if (this.data.shoppingCarInfo && this.data.shoppingCarInfo.items) { // 在购物车中每次只能+1
      const goods = this.data.shoppingCarInfo.items.find(ele =>ele.goodsId === item.id)
      if (goods) {
        number = 1
      }
    }
    const res = await Api.shippingCarInfoAddItem(this.data.token, item.id, number, [], [])
    wx.hideLoading()
    if (res.code == 2000) {
      AUTH.login(this)
      return
    }
    if (res.code != 0) {
      wx.showToast({title: res.msg, icon: 'none'})
      return
    }
    this.getShoppingCarInfo()
  },
  // 删除
  async subFromCart(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.shoppingCarInfo.items.find(f => f.goodsId === id)
    if (item.number <= 1) { // 删除商品
      wx.showLoading({title: ''})
      const res = await Api.shippingCarInfoRemoveItem(this.data.token, item.key)
      wx.hideLoading()
      this.setData({shoppingCarInfo: res.code == 0 ? res.data : null})
      this.processBadge()
    } else { // 修改数量
      wx.showLoading({title: ''})
      const res = await Api.shippingCarInfoModifyNumber(this.data.token, item.key, --item.number)
      wx.hideLoading()
      if (res.code != 0) {
        wx.showToast({title: res.msg, icon: 'none'})
        return
      }
      this.getShoppingCarInfo()
    }
  },
  
  // 下单成功后清空购物车
  async clearCart() {
    wx.showLoading({title: '加载中...'})
    const res = await Api.shippingCarInfoRemoveAll(this.data.token)
    wx.hideLoading()
    if (res.code === 0) {
      wx.showToast({title: '下单成功', icon: 'success'})
    }
    this.getShoppingCarInfo()
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