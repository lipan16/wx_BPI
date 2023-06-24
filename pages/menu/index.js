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
    shippingCarInfo: {}, // 购物车
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.getshopInfo() // 获取门店信息
    this.getCategories() // 获取菜单分类
  },
  // 生命周期函数--监听页面显示
  onShow() {
    this.shippingCarInfo() // 获取购物车信息
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
    const index = e.currentTarget.dataset.idx
    const goodsId = this.data.goods[index].id
    wx.navigateTo({
      url: '/pages/goods-details/index?id=' + goodsId,
    })
  },


  // 读取购物车数据
  async shippingCarInfo() {
    const res = await Api.shippingCarInfo(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        shippingCarInfo: res.data
      })
    } else {
      this.setData({
        shippingCarInfo: null,
        showCartPop: false
      })
    }
    this.processBadge()
  },
  // 显示分类和商品数量
  processBadge() {
    const categories = this.data.categories
    const goods = this.data.goods
    const shippingCarInfo = this.data.shippingCarInfo
    if (!categories || !goods ) {
      return
    }
    categories.forEach(ele => {
      ele.badge = 0
    })
    goods.forEach(ele => {
      ele.badge = 0
    })
    if (shippingCarInfo) {
      shippingCarInfo.items.forEach(ele => {
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
    const index = e.currentTarget.dataset.index
    const item = this.data.goods[index]
    console.log(index);
  },
  // 加入购物车
  async addToCart(e){
    const token = wx.getStorageSync('token')
    const index = e.currentTarget.dataset.index
    const item = this.data.goods[index]
    wx.showLoading({
      title: '',
    })
    let number = item.minBuyNumber // 加入购物车的数量
    if (this.data.shippingCarInfo && this.data.shippingCarInfo.items) {
      const goods = this.data.shippingCarInfo.items.find(ele => {return ele.goodsId === item.id})
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
    this.shippingCarInfo()
  },
  // 删除
  async cartStepChange(e) {
    const token = wx.getStorageSync('token')
    const index = e.currentTarget.dataset.idx
    const item = this.data.shippingCarInfo.items[index]
    if (e.detail < 1) {
      // 删除商品
      wx.showLoading({
        title: '',
      })
      const res = await WXAPI.shippingCarInfoRemoveItem(token, item.key)
      wx.hideLoading()
      if (res.code == 700) {
        this.setData({
          shippingCarInfo: null,
          showCartPop: false
        })
      } else if (res.code == 0) {
        this.setData({
          shippingCarInfo: res.data
        })
      } else {
        this.setData({
          shippingCarInfo: null,
          showCartPop: false
        })
      }
      this.processBadge()
    } else {
      // 修改数量
      wx.showLoading({
        title: '',
      })
      const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, e.detail)
      wx.hideLoading()
      if (res.code != 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      this.shippingCarInfo()
    }
  },
  // 清空购物车
  async clearCart() {
    wx.showLoading({
      title: '',
    })
    const res = await WXAPI.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
    wx.hideLoading()
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.shippingCarInfo()
  },
})