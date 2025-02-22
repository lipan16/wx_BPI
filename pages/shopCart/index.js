const Api = require('apifm-wxapi')

Page({
  data: {
    shippingCarInfo: {},
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getWindowInfo().windowWidth
      var scale = (750 / 2) / (w / 2)
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad(options) {
    this.initEleWidth();
  },
  onShow() {
    this.getShippingCarInfo()
  },
  toIndexPage: function () {
    wx.navigateTo({
      url: "/pages/menu/index"
    })
  },
  // 读取购物车数据
  async getShippingCarInfo() {
    const res = await Api.shippingCarInfo(wx.getStorageSync('token'))
    console.log(res.data);
    this.setData({
      shippingCarInfo:  res.code == 0 ? res.data : null
    })
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) { //移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      this.data.shippingCarInfo.items[index].left = left
      this.setData({
        shippingCarInfo: this.data.shippingCarInfo
      })
    }
  },
  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      this.data.shippingCarInfo.items[index].left = left
      this.setData({
        shippingCarInfo: this.data.shippingCarInfo
      })
    }
  },
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    this.delItemDone(key)
  },
  async delItemDone(key) {
    const token = wx.getStorageSync('token')
    var res = await Api.shippingCarInfoRemoveItem(token, key)

    if (res.code != 0 && res.code != 700) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    } else {
      this.getShippingCarInfo()
    }
  },
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number + 1
    const token = wx.getStorageSync('token')
    var res = await Api.shippingCarInfoModifyNumber(token, item.key, number)
    this.getShippingCarInfo()
  },
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shippingCarInfo.items[index]
    const number = item.number - 1
    if (number <= 0) {
      // 弹出删除确认
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(item.key)
          }
        }
      })
      return
    }
    const token = wx.getStorageSync('token')
    var res = await Api.shippingCarInfoModifyNumber(token, item.key, number)  
    this.getShippingCarInfo()
  },
  changeCarNumber(e) {
    const key = e.currentTarget.dataset.key
    const num = e.detail.value
    const token = wx.getStorageSync('token')
    Api.shippingCarInfoModifyNumber(token, key, num).then(res => {
      this.getShippingCarInfo()
    })
  },
  async radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.shippingCarInfo.items[index]
    const token = wx.getStorageSync('token')
    if (!item.stores || item.status == 1) {
      return
    }
    var res = await Api.shippingCartSelected(token, item.key, !item.selected)
    this.getShippingCarInfo()
  },

  // 清空购物车
  async clearCart() {
    wx.showLoading({title: '加载中...'})
    const res = await Api.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
    wx.hideLoading()
    if (res.code === 0) {
      wx.showToast({
        title: '下单成功',
        icon: 'success'
      })
    }
    this.getShippingCarInfo()
  },
  // 提交接口
  async submitApi(){
    const token = wx.getStorageSync('token')
    const goodsJsonStr = JSON.stringify(this.data.shippingCarInfo.items) // 菜品列表
    const res = await Api.orderCreate({
      token, 
      goodsJsonStr,
      calculate: 'false' // 预下单
    })
    if(res.data.id && res.data.id !== ''){ // 下单成功
      Api.orderPay(token, res.data.id).then(response => {
        // 支付成功
        wx.showModal({
          title: this.data.shippingCarInfo.shopList[0].name,
          content: `已付款${res.data.amountReal}元，下单成功，单号：${res.data.id}`,
          duration: 100000,
          success: (res) => {
            if (res.confirm) {
              this.clearCart()
            }
          }
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
      title: this.data.shippingCarInfo.shopList[0].name + '提醒',
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