// 程序主入口文件
// 引入 createApp 函数 创建对应应用 产生应用实例对象
import { createApp } from 'vue'
// 引用 App 组件( 所有组件的父组件 )
import App from './App.vue'
// 创建 App 应用 返回对应的实例对象 调用 mount 方法进行挂载
createApp(App).mount('#app')
