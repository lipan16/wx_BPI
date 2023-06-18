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
| queryConfigBatch         | 系统设置 ---> 系统参数 | 获取系统参数 |
| banners         | 系统设置 ---> banner管理 | 类型：type: [app, index] |
| goodsCategoryV2 | 商城管理 ---> 商品分类   | 用于配置功能             |
| noticeLastOne   | CMS模块 ---> 公告管理    | 获取最新的通知           |
| noticeDetail    | CMS模块 ---> 公告管理    | 通知详情                 |
|                 |                          |                          |

