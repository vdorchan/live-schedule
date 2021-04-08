<template>
  <div
    class="schedule"
    ref="schedule"
  >
    <slot></slot>
  </div>
</template>

<script>
import Schedule from '../index'
import { events } from '../mixins/event'

export default {
  name: 'Schedule',
  props: (() => {
    const props = {}
    const settings = Schedule.settingsFactory()
    Object.keys(settings).forEach((key) => {
      props[key] = {
        default: settings[key],
      }
    })
    return props
  })(),

  methods: {
    init () {
      this.schedule = new Schedule(this.$refs.schedule, this.$props || {})
      Object.values(events).forEach(eventName => this.schedule.on(eventName, (...args) => this.$emit(eventName, ...args)))

      this.$watch('data', data => {
        this.setData(data)
      })
    },

    setData (data) {
      this.schedule.setData(data)
    },

    setDataAtSelectedCell (...args) {
      return this.schedule.setDataAtSelectedCell(...args)
    },

    renderHeader (...args) {
      return this.schedule.renderHeader(...args)
    },

    getCanvas () {
      return this.schedule.getCanvas()
    }
  },

  mounted () {
    this.init()
  },

  beforeDestroy () {
    this.schedule.destroy()
  },
}
</script>

<style lang="scss" scoped>
.schedule {
  width: 100%;
  height: 100%;
}
</style>
