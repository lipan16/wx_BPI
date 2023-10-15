const Api = require('apifm-wxapi')
const CONFIG = require('../../config')
const AUTH = require('../../utils/auth')

Page({
  data: {
    shopInfo: {}, // 门店信息
    distributionType: 'zq', // zq 自取，wm 外卖
    page: 1, // 列表请求下标
    scrolltop: 0, // 菜单内容 设置竖向滚动条位置
    categories: [], // 菜单分类 goodsCategoryV2 69049
    categorySelected: {}, // 选中的菜单分类
    goods: [], // 菜品列表
    shoppingCarInfo: {}, // 购物车
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.getshopInfo() // 获取门店信息
    this.getCategories() // 获取菜单分类
  },
  // 生命周期函数--监听页面显示
  onShow() {
    this.getShoppingCarInfo() // 获取购物车信息
    // 获取下单消息
    Api.userImList({token: wx.getStorageSync('token'), uid: '8919430'}).then(res => {
      console.log(res.data)
    })
  },

  changeDistributionType(e){ // 切换配送方式
    const type = e.currentTarget.dataset.type
    this.setData({
      distributionType: type
    })
  },

  // 获取菜单分类
  getCategories(){
    Api.goodsCategoryV2(wx.getStorageSync('config').shopId).then(res => {
      if(res.code === CONFIG.apiSuccess){
        this.setData({
          categories: res.data,
          categorySelected: res.data[0]
        })
        this.getGoodsList()
      }
    })
  },

 // 获取商店信息
  getshopInfo(){
    Api.shopSubdetail(wx.getStorageSync('config').shopId).then(res => {
      if(res.code === CONFIG.apiSuccess){
        this.setData({shopInfo: res.data})
      }
    })
  },


  // 点击菜单分类
  onCLickCategory(e) {
    const index = e.currentTarget.dataset.id
    const categorySelected = this.data.categories[index]
    this.setData({
      page: 1,
      categorySelected,
      scrolltop: 0
    })
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
        this.setData({
          goods: null
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
      this.setData({goods: res.data.result})
    }else{
      this.setData({goods: this.data.goods.concat(res.data.result)})
    }
    this.processBadge()
  },
  // 进入详情
  goGoodsDetail(e) {
    wx.navigateTo({
      url: '/pages/dishes/index?id=' +  e.currentTarget.dataset.id,
    })
  },


  // 读取购物车数据
  async getShoppingCarInfo() {
    const res = await Api.shippingCarInfo(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        shoppingCarInfo: res.data
      })
    } else {
      this.setData({
        shoppingCarInfo: null,
        showCartPop: false
      })
    }
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
    categories.forEach(ele => {
      ele.badge = 0
    })
    goods.forEach(ele => {
      ele.badge = 0
    })
    if (shoppingCarInfo) {
      shoppingCarInfo.items.forEach(ele => {
        if (ele.categoryId) { // 计算分类数量
          const category = categories.find(a => {
            return a.id == ele.categoryId
          })
          if (category) {
            category.badge += ele.number
          }
        }
        if (ele.goodsId) { // 计算菜品数量
          const _goods = goods.find(a => {
            return a.id == ele.goodsId
          })
          if (_goods) {
            _goods.badge += ele.number
          }
        }
      })
    }
    this.setData({
      categories,
      goods
    })
  },


  // 选规格
  selectSpecification(e){
    const token = wx.getStorageSync('token')
    const item = this.data.goods.find(f => f.id === e.currentTarget.dataset.id)
    console.log(item);
    wx.showToast({
      title: '开发中',
    })
  },
  // 加入购物车
  async addToCart(e){
    const token = wx.getStorageSync('token')
    const item = this.data.goods.find(f => f.id === e.currentTarget.dataset.id)
    if (!item) {
      return
    }
    if (item.stores <= 0) {
      wx.showToast({
        title: '已售罄~',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '',
    })
    let number = item.minBuyNumber // 加入购物车的最小数量
    if (this.data.shoppingCarInfo && this.data.shoppingCarInfo.items) { // 在购物车中每次只能+1
      const goods = this.data.shoppingCarInfo.items.find(ele =>ele.goodsId === item.id)
      if (goods) {
        number = 1
      }
    }
    const res = await Api.shippingCarInfoAddItem(token, item.id, number, [], [])
    wx.hideLoading()
    if (res.code == 2000) {
      AUTH.login(this)
      return
    }
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.getShoppingCarInfo()
  },
  // 删除
  async subFromCart(e) {
    const token = wx.getStorageSync('token')
    const id = e.currentTarget.dataset.id
    const item = this.data.shoppingCarInfo.items.find(f => f.goodsId === id)
    if (item.number <= 1) { // 删除商品
      wx.showLoading({
        title: '',
      })
      const res = await Api.shippingCarInfoRemoveItem(token, item.key)
      wx.hideLoading()
      if (res.code == 700) {
        this.setData({
          shoppingCarInfo: null,
          showCartPop: false
        })
      } else if (res.code == 0) {
        this.setData({
          shoppingCarInfo: res.data
        })
      } else {
        this.setData({
          shoppingCarInfo: null,
          showCartPop: false
        })
      }
      this.processBadge()
    } else { // 修改数量
      wx.showLoading({
        title: '',
      })
      const res = await Api.shippingCarInfoModifyNumber(token, item.key, --item.number)
      wx.hideLoading()
      if (res.code != 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      this.getShoppingCarInfo()
    }
  },
  // 清空购物车
  async clearCart() {
    wx.showLoading({
      title: '加载中...',
    })
    const res = await Api.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
    wx.hideLoading()
    if (res.code === 0) {
      wx.showToast({
        title: '下单成功',
        icon: 'success'
      })
    }
    this.getShoppingCarInfo()
  },

 // 提交接口
  async submitApi(){
    const token = wx.getStorageSync('token')
    const goodsJsonStr = JSON.stringify(this.data.shoppingCarInfo.items) // 菜品列表
    const res = await Api.orderCreate({
      token, 
      goodsJsonStr,
      calculate: 'false' // 预下单
    })
    if(res.data.id && res.data.id !== ''){ // 下单成功
      Api.orderPay(token, res.data.id).then(response => {
        // 支付成功
        wx.showModal({
          title: this.data.shopInfo.info.name,
          content: `已付款${res.data.amountReal}元，下单成功，单号：${res.data.id}`,
          duration: 100000
        })
        // Api.userImSendmessage(token, '8919430', `我爱你 orderId: ${res.data.id}`).then(msgRes => {
        //   if(msgRes.code === 0){
        //     wx.showToast({
        //       title: '下单成功',
        //     })
        //     this.clearCart()
        //   }
        // })
      })
    }
  },
   // 提交订单
   onClickSubmit(){
    wx.showModal({
      title: this.data.shopInfo.info.name + '提醒',
      content: '确定提交订单吗？',
      success: res => {
        if(res.confirm){
          this.submitApi()
        }else{
          return
        }
      }
    })
  },
})