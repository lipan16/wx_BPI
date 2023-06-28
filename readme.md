# 未来可燃冰小程序新上线

### 功能
* 点菜（开发中）
* 上班进度
* 购物车（待开发）
* 兑换券（待开发）

### 依赖
* @vant/weapp: ui
* apifm-wxapi: api,
* moment: 时间,
* mp-html: 渲染富文本


#### api指引
| api             | 路径                     | 备注                     |
| --------------- | ------------------------ | ------------------------ |
| authorize         |  | 授权获取token |
| checkToken         |  | 检测token是否有效 |
| queryConfigBatch         | 系统设置 ---> 系统参数 | 获取系统参数 |
| banners         | 系统设置 ---> banner管理 | 类型：type: [app, index] |
| noticeLastOne   | CMS模块 ---> 公告管理    | 获取最新的通知           |
| noticeDetail    | CMS模块 ---> 公告管理    | 通知详情                 |
| goodsCategoryV2 | 商城管理 ---> 商品分类 | 用于配置功能、点菜菜单分类 |
| goodsv2 | 商城管理 ---> 商品管理 | 菜单分类的列表 |
| shippingCarInfoAddItem |  | 加入购物车 |
| shippingCarInfo |  | 读取购物车数据 |
| shippingCarInfoRemoveItem |  | 删除购物车商品 |
| shippingCarInfoModifyNumber |  | 修改购物车商品数量 |
| orderCreate | 商城管理 ---> 订单列表 | 下单 |
| orderPay | 商城管理 ---> 订单列表 | 支付 |
| orderList | 商城管理 ---> 订单列表 | 订单列表 |
| orderDelete | 商城管理 ---> 订单列表 | 删除订单 |

|  |财务管理 ---》 用户资产管理  | 调整用户余额 |

