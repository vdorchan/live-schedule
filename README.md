# Schedule

> 日程排期表
>

## [功能](#功能)

- [x] 滑动选择
- [x] 响应式
- [x] 多列选择
- [ ] 键盘操作（del、ctrl、shift）
- [ ] 跨天
- [x] 行调整
- [ ] 右键上下文菜单
- [ ] 悬浮提示
- [ ] 时间比例
- [ ] 行重新调整
- [x] 导入数据
- [ ] 导出数据
- [ ] 事件监听

## 开发

```bash
# 安装依赖
yarn

# 然后
yarn start
# 或
yarn dev
```

## 构建

```bash
# 安装依赖
yarn

# 然后
yarn build
```

##   类构造方法

Schedule(rootNode, userSettings)

rootNode: html element
userSettings: Object 定义如下：


```
{
      // 初始化数据，来自数据库
      data: [
          { "id": 10958, 
          "startTime": "2020-07-05 03:00:00", 
          "endTime": "2020-07-05 10:00:00", 
          "liveNumber": null, 
          "liveDuration": null,
           "slAnchors": [], -- // 显示的文字，可多行，放入数组中
           "anchorLevel": "L2", // --  颜色相关
           "operationUser": null, 
           "operationUserId": null,
            "controlUser": null, 
            "controlUserId": null, 
            "platform": null, // -- 根据平台不同显示不同的图标
            "storeId": null, 
            "storeName": null }, 
          { "id": 10959, "startTime": "2020-07-09 01:00:00", "endTime": "2020-07-09 09:00:00", "liveNumber": null, "liveDuration": null, "slAnchors": [], "anchorLevel": "L1", "operationUser": null, "operationUserId": null, "controlUser": null, "controlUserId": null, "platform": null, "storeId": null, "storeName": null },
          ...
          ],

      // 这三个key,是根据以上data中的字段名进行转义，由于数据库存的字段名与前端字段名不一致。
      // 如果不写，则data数据中按以下字段名：'color','icon','texts'
      colorKey: 'anchorLevel',
      iconKey: 'platform',
      textsKey: 'slAnchors',

      // 定制个性化(是否可以用css,而不是在js代码中写？是否有default值)
      // 1. 时间条的颜色
      // 2. 图标的url
      dataMaps: {
        color: [
          { key: 'L1', value: '#64C42D' },
          { key: 'L2', value: '#E8A32F' },
          { key: 'L3', value: '#F76B69' },
          { key: 'L4', value: '#2A8DF8' },
          { key: 'L5', value: '#442BB0' },
        ],
        icon: [
          { key: "taobao", value: "https://live.baowenonline.com/platform-icons/taobao.png" },
          { key: "jd", value: "https://live.baowenonline.com/platform-icons/jd.png" },
          { key: "douyin", value: "https://live.baowenonline.com/platform-icons/douyin.png" },
          { key: "suning", value: "https://live.baowenonline.com/platform-icons/suning.png" },
          { key: "wx", value: "https://live.baowenonline.com/platform-icons/wx.png" },
          { key: "lazada", value: "https://live.baowenonline.com/platform-icons/lazada.png" },
          { key: "tiktok", value: "https://live.baowenonline.com/platform-icons/tiktok.png" },
          { key: "shopee", value: "https://live.baowenonline.com/platform-icons/shopee.png" },
          { key: "facebook", value: "https://live.baowenonline.com/platform-icons/facebook.png" },
          { key: "ins", value: "https://live.baowenonline.com/platform-icons/ins.png" },
          { key: "youtube", value: "https://live.baowenonline.com/platform-icons/youtube.png" },
          { key: "qita", value: "https://live.baowenonline.com/platform-icons/qita.png" }
        ]
      }
}

```

## TO-DO

1. 增量修改data的方法, 当对方修改了增量部分时调用
2. 全量更新data的方法, 全量更新时不影响当前选择的时段
3. 有一个方法进行保存,最好在userSettings中有一个callback 返回当前操作的增量数据。
