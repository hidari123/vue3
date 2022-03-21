<template>
  <h2>Child子级组件</h2>
  <h2>msg: {{msg}}</h2>
  <hr>
  <button @click="update">更新</button>
</template>

<script lang='ts'>
import {
  ref,
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount,
  defineComponent
} from 'vue'
export default defineComponent({
  name: 'child',
  // vue2.x 中的生命周期钩子
  beforeCreate () {
    console.log('2.x 中 beforeCreate')
  },
  created () {
    console.log('2.x 中 created')
  },
  beforeMount () {
    console.log('2.x 中 beforeMount')
  },
  mounted () {
    console.log('2.x 中 mounted')
  },
  beforeUpdate () {
    console.log('2.x 中 beforeUpdate')
  },
  updated () {
    console.log('2.x 中 updated')
  },
  // beforeDestroy 和 destroyed 3.x中已经改名，不能再用
  beforeUnmount () {
    console.log('2.x 中 beforeUnmount')
  },
  unmounted () {
    console.log('2.x 中 unmounted')
  },
  setup () {
    console.log('--setup')

    const msg = ref('abc')

    const update = () => {
      msg.value += '--'
    }

    onBeforeMount(() => {
      console.log('--onBeforeMount')
    })

    onMounted(() => {
      console.log('--onMounted')
    })

    onBeforeUpdate(() => {
      console.log('--onBeforeUpdate')
    })

    onUpdated(() => {
      console.log('--onUpdated')
    })

    onBeforeUnmount(() => {
      console.log('--onBeforeUnmount')
    })

    onUnmounted(() => {
      console.log('--onUnmounted')
    })

    return {
      msg,
      update
    }
  }
})
</script>

<style>

</style>
