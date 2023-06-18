const Api = require('apifm-wxapi');
const CONFIG = require('../../config');

Page({
  data: {},
  onLoad: function (options) {
    Api.noticeDetail(options.id).then(res => {
      if (res.code == CONFIG.apiSuccess) {
        this.setData({
          notice: res.data
        })
      }
    })
  },

  onShareTimeline() {
    return {
      title: this.data.notice.title,
      query: 'id=' + this.data.notice.id,
      // imageUrl: wx.getStorageSync('share_pic')
    }
  },
})
