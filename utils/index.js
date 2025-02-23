const CONFIG = require("../config")

/**
 * 使用本地缓存
 * @param {string} key 
 * @param {any} value 
 * @param {number} expire 过期天数
 */
export const setStorageSync = (key, value, expire) => {
  const val = {
    time: Date.now(),
    expire: Date.now() + expire * 60 * 60 * 1000,
    value
  }
  wx.setStorageSync(key, val)
}

/**
 * 返回有效期内的数据
 * @param {string} key 
 */
export const getStorageSync = key => {
  const {expire, value} = wx.getStorageSync(key)
  return Date.now() < expire ? value : null
}

/**
 * auth, userOpenId, id, money, time, title, remark
 * 所有者、下单人、订单id、金额、时间、名称、备注
 */
export const sendNotice = ({auth, userOpenId, id, money, time, title, remark}) => {
  wx.request({
    url: `${CONFIG.host}/api/notice`,
    method: 'POST',
    data: {auth, userOpenId, id, money: `${money}元`, time, title, remark},
    success: ({data}) => {
      console.log('notice res: ', data);
    }
  })
}
    