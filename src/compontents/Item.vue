<template>
  <li @mouseenter="mouseHandler(true)" @mouseleave="mouseHandler(false)" :style="{backgroundColor: bgColor, color: myColor}">
      <label>
          <input type="checkbox" v-model="isCompleted" />
          <span>{{ todo.title }}</span>
      </label>
      <button class="btn btn-danger" v-show="isShow" @click="delTodo">删除</button>
  </li>
</template>

<script lang='ts'>
import { computed, defineComponent, ref } from 'vue'
import { Todo } from '../types/todo'
export default defineComponent({
  name: 'Item',
  props: {
    todo: {
      type: Object as () => Todo, // 函数返回的是 Todo 类型
      required: true
    },
    deleteTodo: {
      type: Function,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    updateTodo: {
      type: Function,
      required: true
    }
  },
  setup (props) {
    //   setup (props, context) {
    // 计算属性 双向绑定 props
    // const todoValue = computed({
    //   get: () => props.todo || '',
    //   set: val => {
    //     context.emit('todos', val)
    //   }
    // })

    // 计算数学的方式---来让当前的复选框选中/不选中
    const isCompleted = computed({
      get: () => props.todo.isCompleted,
      set: val => props.updateTodo(props.todo, val)
    })
    const bgColor = ref('white')
    const myColor = ref('black')
    const isShow = ref(false)
    // 鼠标进入和离开事件的回调函数
    const mouseHandler = (flag: boolean) => {
      if (flag) {
        // 鼠标进入
        bgColor.value = 'pink'
        myColor.value = 'green'
        isShow.value = true
      } else {
        // 鼠标离开
        bgColor.value = 'white'
        myColor.value = 'black'
        isShow.value = false
      }
    }

    // 删除数据方法
    const delTodo = () => {
      // 提示
      if (window.confirm('确定要删除吗？')) {
        props.deleteTodo(props.index)
      }
    }

    return {
    //   todoValue,
      mouseHandler,
      bgColor,
      myColor,
      isShow,
      delTodo,
      isCompleted
    }
  }
})
</script>

<style scoped>
li {
    list-style: none;
    height: 36px;
    line-height: 36px;
    padding: 0 5px;
    border-bottom: 1px solid #ddd;
}
li label {
    float: left;
    cursor: pointer;
}
li label li input {
    vertical-align: middle;
    margin-right: 6px;
    position: relative;
    top: -1px;
}
li button {
    float: right;
    margin-top: 3px;
}
li:before {
    content: initial;
}
li:last-child {
    border-bottom:  none;
}
</style>
