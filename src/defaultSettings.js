/**
 * @description
 *
 * ## 构造器选项.
 *
 * 构造器选项通过第二个参数传入.
 *
 * ```js
 * new Schedule(document.getElementById('example'), {
 *  data: array,
 *  yearMonth: '2020-01'
 * })
 * ```
 *
 */
export default () => {
  return {
    /**
     * @memberof Options#
     * @param {object[]}
     * @default undefined
     */
    data: void 0,

    /**
     * 当前排期表年月，不传则是当前月，会自动计算出当月天数。
     *
     * @memberof Options#
     * @param {string}
     * @default undefined
     * @example
     * ```js
     * yearMonth: '2015-01'
     * ```
     */
    yearMonth: void 0,

    /**
     * 行数/小时数
     * @param {number}
     * @default 24
     */
    numberOfRows: 24,

    /**
     * 只读模式
     * @param {boolean}
     * @default false
     */
    readOnly: false,

    /**
     * 表格背景色.
     * @param {string}
     * @default '#fff'
     */
    bgColor: '#ffffff',

    /**
     * 格子边框色
     * @param {string}
     * @default '#EBEEF5'
     */
    cellBorderColor: '#EBEEF5',

    /**
     * 格子边框宽度
     * @param {string}
     * @default 1
     */
    cellBorderWidth: 1,

    /**
     * 格子选中背景色
     * @param {string}
     * @default '#EBEEF5'
     */
    cellSelectedColor: '#EBEEF5',

    /**
     * 格子创建颜色
     * @param {string}
     * @default '#D9D6EE'
     */
    cellActiveColor: '#D9D6EE',

    /**
     * 跨天格子透明度
     * @param {number}
     * @default 0.4
     */
    cellCrossColAlpha: 0.4,

    /**
     * 纵轴标题宽度
     * @param {number}
     * @default 50
     */
    colHeaderWidth: 50,

    /**
     * 水平标题高度，不设置将和自动计算的格子高度一致
     * @param {number}
     * @default undefined
     */
    rowHeaderHeight: void 0,

    /**
     * 格子字体大小
     * @param {number}
     * @default 12
     */
    fontSize: 12,

    /**
     * 字体
     * @param {string}
     * @default 'PingFang SC,Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif'
     */
    fontFamily:
      'PingFang SC,Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif',

    fontColor: '#fff',

    /**
     * 行高
     * @param {number}
     * @default 20
     */
    lineHeight: 20,

    /**
     * 格子字体颜色
     * @param {string}
     * @default '#fff'
     */
    cellTextColor: '#fff',

    /**
     * 标题字体颜色
     * @param {string}
     * @default '#606266'
     */
    headerTextColor: '#606266',

    /**
     * 时间范围 key 值
     * @param {string[]}
     * @default 'timeRange'
     */
    timeRangeKey: 'timeRange',

    /**
     * icon 最大宽度
     * @param {number}
     * @default '36'
     */
    iconMaxWidth: 36,

    /**
     * 颜色对应的 key 值
     * @param {number}
     * @default 'color'
     */
    colorKey: 'color',

    /**
     * 图标对应的 key 值
     * @param {number}
     * @default 'icon'
     */
    iconKey: 'icon',

    /**
     * 格子显示的文案 key 值，字符串数组，隔行显示
     * @param {string[]}
     * @default 'texts'
     */
    textsKey: 'texts',

    /**
     * 为 color、icon、texts 设置值映射关系
     * @param {object}
     * @default 'texts'
     * @example
     * ```js
     * dataMaps: {
     *  color: [
     *   { key: 'L1', value: '#64C42D' },
     *   { key: 'L2', value: '#E8A32F' },
     *   { key: 'L3', value: '#F76B69' },
     *  ]
     * }
     * ```
     */
    dataMaps: void 0,

    /**
     * 时间精确度，假如设置为 0.5，则一格为 0.5 小时
     * @param {number}
     * @default 1
     */
    timeScale: 1,

    /**
     * 悬浮 tooltip 背景颜色
     * @param {string}}
     * @default '#707070'
     */
    tooltipColor: '#707070',

    /**
     * 自定义渲染 tooltip 内容，return 一个 html 字符串,
     * 如果使用函数返回，当前格子的 data 将作为参数返回
     * @param {string|Function}}
     * @default undefined
     * @example
     * ```js
     * // 直接设置字符串
     * renderTooltip: '标题'
     *
     * // 通过函数
     * renderTooltip: function (data) {
     *   return `<p>Level: ${data.level}</p>`
     * }
     * ```
     */
    renderTooltip: () => {},

    /**
     * 自定义渲染单元格，return 一个对象，包含 texts数组、color字符串、icon字符串
     * 当前格子的 data 将作为参数返回
     * @param {Function}
     * @default undefined
     */
    renderCell: void 0,

     /**
     * 自定义渲染表头，return 一个对象，包含 label字符串、color字符串、icon对象
     * 当前格子的 data 将作为参数返回
     * @param {Function}
     * @default undefined
     */
    renderColumnHeader: void 0,

    /**
     * 自定义渲染表头，return 一个对象，包含 label字符串、color字符串、icon对象
     * 当前格子的 data 将作为参数返回
     * @param {Function}
     * @default undefined
     */
    renderRowHeader: void 0,

    /**
     * 右键菜单项目列表，然后可以通过 on 方法监听设置事件方法
     * @param {object[]}
     * @default undefined
     * @example
     * ```js
     * contextMenuItems: [
     *   { action: 'setLevel', title: '设置主播' }
     * ]
     * ```
     */
    contextMenuItems: void 0
  }
}
