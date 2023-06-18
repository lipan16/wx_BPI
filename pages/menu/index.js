const Api = require('apifm-wxapi')
const CONFIG = require('../../config')

Page({
  data: {
    page: 1, // 列表请求下标
    scrolltop: 0, // 菜单内容 设置竖向滚动条位置
    categories: [], // 菜单分类 goodsCategoryV2 69049
    categorySelected: {}, // 选中的菜单分类
    goods: [], //
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.getCategories()
  },
  // 生命周期函数--监听页面显示
  onShow() {
  },

  // 获取菜单分类
  getCategories(){
    Api.goodsCategoryV2(69049).then(res => {
      if(res.code === CONFIG.apiSuccess){
        this.setData({
          categories: res.data,
          categorySelected: res.data[0]
        })
        this.getGoodsList()
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
    this.data.page++
    this.getGoodsList()
  },

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
  },

  // 加入购物车
  addCart1(){

  },
})