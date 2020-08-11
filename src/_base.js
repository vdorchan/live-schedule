/**
 * @class {BaseRender}
 */
export default class BaseRender {
  constructor() {
    /**
     * Instance of Draw.
     * @type {null|Draw}
     */
    this.draw = null

    /**
     * Instance of Table.
     * @type {null|Table}
     */
    this.table = null
  }

  /**
   * Set the draw instance.
   * @param {Draw} draw Draw instance.
   */
  setRenderer(draw) {
    this.draw = draw
  }

  /**
   * Set the table instance.
   * @param {Table} table Table instance.
   */
  setTable(table) {
    this.table = table
  }
}
