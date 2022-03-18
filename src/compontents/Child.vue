<template>
  <h2>Child子级组件</h2>
  <h3>{{msg}}</h3>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'child',
  props: ['msg'],
  beforeCreate () {
    console.log('beforeCreate执行了')
  },
  // 界面渲染完毕
  mounted () {
    console.log('mounted执行了')
  },
  setup (props, context) {
    console.log(props)
    console.log(context)

    // setup 是在 beforeCreate 生命周期回调之前就执行，而且只执行一次
    // 由此可以推断出，setup执行的时候，当前组件还没有创建出来，也就意味着组件实例对象 this 根本就不能用
    // this 是 undefined，说明不能通过 this 再调用 data/computed/methods/props 中相关内容
    // 其实所有的 composition API 相关回调函数中也都不可以

    // setup中的返回值是一个对象 内部的属性和方法是给html模板使用的

    // 数据初始化的生命周期回调
    console.log('setup执行了')
    return {
      // setup中一般都是返回一个对象，对象中的属性和方法都可以在 html 模板中直接使用
    }
  }
})
</script>

<style>

</style>
