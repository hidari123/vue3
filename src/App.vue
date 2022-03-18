<template>
    <h2>计算属性和监视</h2>
    <fieldset>
        <legend>姓名操作</legend>
        <span>姓氏：</span><input type="text" placeholder="请输入姓氏" v-model="user.firstName"><br>
        <span>名字：</span><input type="text" placeholder="请输入名字" v-model="user.lastName"><br>
    </fieldset>
    <fieldset>
        <legend>计算属性和监视</legend>
        <span>姓名：</span><input type="text" placeholder="显示姓名" v-model="fullName1"><br>
        <span>姓名：</span><input type="text" placeholder="显示姓名" v-model="fullName2"><br>
        <span>姓名：</span><input type="text" placeholder="显示姓名" v-model="fullName3"><br>
    </fieldset>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch, watchEffect } from 'vue'

export default defineComponent({
  name: 'App',
  setup () {
    const user = reactive({
      firstName: '孟',
      lastName: '知返'
    })
    // 通过计算属性的方式实现第一个姓名的显示

    // fullName1
    // 计算数学的函数中如果只传入一个回调函数，表示的是 get
    const fullName1 = computed(() => {
      return user.firstName + ' ' + user.lastName
    })
    // 返回一个 Ref 类型对象
    // console.log(fullName1)

    // fullName2
    // 有 get 和 set 操作 返回的是一个对象
    const fullName2 = computed({
      get () {
        return user.firstName + ' ' + user.lastName
      },
      set (val: string) {
        const names = val.split(' ')
        user.firstName = names[0]
        user.lastName = names[1]
      }
    })

    // fullName3
    const fullName3 = ref('')
    // 监视 监视指定的数据
    watch(user, ({ firstName, lastName }) => {
      fullName3.value = firstName + ' ' + lastName
    }, { immediate: true, deep: true })
    // immediate: true 刚开始就执行一次 watch
    // deep 深度监视

    // 监视 不需要配置 immediate 本身默认就会进行监视（默认执行一次）
    watchEffect(() => {
      fullName3.value = user.firstName + ' ' + user.lastName
    })

    // 监视 fullName3 的数据，改变 firstName 和 lastName
    watchEffect(() => {
      const names = fullName3.value.split(' ')
      user.firstName = names[0]
      user.lastName = names[1]
    })

    // watch 可以监视多个数据
    // user.firstName & user.lastName 没有执行下面的代码
    // fullName3 执行了
    // 因为 fullName3 是响应式数据
    // 当使用 watch 监视飞翔影视数据时 需要做改动
    /*
    watch多个数据:
      使用数组来指定
      如果是ref对象, 直接指定
      如果是reactive对象中的属性,  必须通过函数来指定
    */
    watch([() => user.firstName, () => user.lastName, fullName3], (values) => {
      console.log('监视多个数据', values)
    })
    return {
      user,
      fullName1,
      fullName2,
      fullName3
    }
  }
})
</script>
