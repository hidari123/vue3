<template>
	<div class="todo-container">
		<div class="todo-wrap">
			<Header :addTodo="addTodo" />
			<List :todos="todos" :deleteTodo="deleteTodo" :updateTodo="updateTodo"/>
			<Footer :todos="todos" :checkAll="checkAll" :cleanUpAllCompletedTodos="cleanUpAllCompletedTodos" />
		</div>
	</div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
// 引入子级组件
import Header from './compontents/Header.vue'
import Footer from './compontents/Footer.vue'
import List from './compontents/List.vue'
// 引入接口
import { Todo } from './types/todo'
// 导入浏览器缓存读取数据方法
import { saveTodos, readTodos } from './utils/localStorageUtils'

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
    List
  },
  setup () {
    // 数据应该用数组存储，数组中每个数据是一个对象，包含三个属性（id，title，isCompleted）
    // 数据共用，定义在 App 父级组件
    const state = reactive<{todos: Todo []}>({
      todos: [
        // { id: 1, title: 'benz', isCompleted: false },
        // { id: 2, title: 'bmw', isCompleted: true },
        // { id: 3, title: 'toyota', isCompleted: false }
      ]
    })

    // 页面加载完毕后过了一会儿再读取数据
    onMounted(() => {
      setTimeout(() => {
        state.todos = readTodos()
      }, 2000)
    })

    // 添加数据
    const addTodo = (todo: Todo) => {
      state.todos.unshift(todo)
    }

    // 删除数据 数据在哪里 方法就写在哪里 把方法传递给子组件
    const deleteTodo = (index: number) => {
      state.todos.splice(index, 1)
    }

    // 修改 todo 的 isCompleted 属性的状态
    const updateTodo = (todo: Todo, isCompleted: boolean) => {
      todo.isCompleted = isCompleted
      console.log(todo.isCompleted)
    }

    // 全选或全不选的方法
    const checkAll = (isCompleted: boolean) => {
      // 遍历数组
      state.todos.forEach(todo => {
        todo.isCompleted = isCompleted
      })
    }

    // 清除所有选中数据
    const cleanUpAllCompletedTodos = () => {
      state.todos = state.todos.filter(todo => !todo.isCompleted)
    }

    // // 监视操作：如果 todos 数组数据变化，直接存储到浏览器缓存中
    // watch(() => state.todos, (value) => {
    //   // 保存在浏览器缓存中
    // localStorage.setItem('todos_key', JSON.stringify(value))
    //   saveTodos(value)
    // }, { deep: true })
    // =>

    // 监视操作：如果 todos 数组数据变化，直接存储到浏览器缓存中
    watch(() => state.todos, saveTodos, { deep: true })
    return {
      ...toRefs(state),
      addTodo,
      deleteTodo,
      updateTodo,
      checkAll,
      cleanUpAllCompletedTodos
    }
  }
})
</script>

<style scoped>
.todo-container {
	width: 600px;
	margin: 0 auto;
}
.todo-container .todo-wrap {
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 5px;
}
</style>
