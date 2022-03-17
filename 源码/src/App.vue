<template>
<!-- vue2 中的 html 模板中必须要有一对根标签 vue3 组建的 html 模板中可以没有根标签 -->
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
</template>

<script lang="ts">
// vue-class-component 是一个支持es6 class风格来开发组件的vue官方库，并使vue组件可以使用继承、混入等特性

// 和之前的@component装饰器一个作用，用来标识这个Typescript类是一个vue组件
// 在@options装饰器中可以填写vue组件内包含的属性
import { Options, Vue } from 'vue-class-component'
import HelloWorld from './components/HelloWorld.vue'

@Options({
  components: {
    HelloWorld
  }
})
/**
 * 任何再该类中声明的普通变量都可视为 data 中的内容。
 * 任何在该类中定义的普通方法都可视为 methods 中的内容（与生命周期钩子函数同名除外）。
 * 任何与生命周期同名的函数都可视为 Vue 生命周期钩子函数。
 * 该类的 get 方法可当作 computed 属性使用。
 */
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
