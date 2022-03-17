<template>
<h3>name: {{ user.name }}</h3>
<h3>age: {{ user.age }}</h3>
<h3>wife: {{ user.wife }}</h3>
<hr>
<button @click="updateUser">update data</button>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  name: 'App',
  // 显示用户的相关信息，点击按钮，可以更新用户的相关数据信息
  // setup是组合 API 的入口函数
  setup () {
    const obj = {
      name: 'hidari',
      age: 20,
      wife: {
        name: 'migi',
        age: 18,
        cars: ['benz', 'BMW', 'TOYOTA']
      }
    }
    // 把数据变成响应式的数据
    // 返回的是一个 Proxy 的代理对象 被代理目标对象是 obj 对象
    // user 现在是代理对象，obj是目标对象
    const user = reactive(obj)
    const updateUser = () => {
      // 直接使用目标对象的方式来更新目标对象中的成员的值，是不可能的，只能使用代理对象的方式更新数据（响应式数据）
      // obj,name = 'haha' // 不可以
      user.name = 'haha'
      user.age += 2
    }
    return {
      user,
      updateUser
    }
  }
})
</script>

<style>
</style>
