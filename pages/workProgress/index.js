import moment from 'moment';
Page({
  data: {
    showTimeId: null, // 下班时间id
    workTimeId: null, // 工作时间 id
    money: 0.00,
    startTime: '9:00:00', // 上班时间
    endTime: '23:59:00', // 下班时间
    workTime: 0, // 已工作时间
    showTime: '', //
  },

  //生命周期函数--监听页面加载
  onLoad(options) {
    const data = wx.getStorageSync('workProgress')
    if(data){
      this.setData({...data})
    }
  },

  // 生命周期函数--监听页面显示
  onShow() {
    const showTimeId = setInterval(() => {
      const time = moment(this.data.endTime, 'HH:mm:ss') - moment()
      const mdt = moment.duration(time)
      const showTime = time > 0 ? `${mdt.hours()}:${mdt.minutes()}:${mdt.seconds()}` : '已下班'
      let money = (Number(this.data.money) + 0.09).toFixed(2)
      this.setData({
        showTime,
        money
      })
      if (time < 0) {
        clearInterval(showTimeId)
      }
    }, 1000)

    const workTimeId = setInterval(() => {
      const workTime = this.data.workTime + 1000
      this.setData({
        workTime
      })
    }, 1000)
    this.setData({
      showTimeId,
      workTimeId
    })
  },
  // 生命周期函数--监听页面隐藏
  onHide() {
    clearInterval(this.data.workTimeId)
    this.setData({
      workTimeId: null
    })
  },
  // 生命周期函数--监听页面卸载
  onUnload() {
    wx.setStorageSync('workProgress', {money: this.data.money, workTime: this.data.workTime})
    clearInterval(this.data.showTimeId)
    this.setData({
      showTimeId: null
    })
  },
})