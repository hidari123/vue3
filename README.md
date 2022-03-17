# vue3

## setup()
1. 新的`option`, 所有的组合`API`函数都在此使用，只在初始化时执行一次
2. 如果返回对象，对象中的属性或方法，模板中可以直接使用
3. `setup()`是组合`API`的入口函数
```js
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  setup () {
    const number = 10
    return {
      number
    }
  }
})
```

## ref
1. ref 是一个函数 定义一个响应式的数据 返回一个 Ref 对象
2. 如果需要对数据进行操作，需要使用该 Ref 对象调用 value 属性的方式进行数据的操作
3. html 模板中不需要使用 .value 属性
4. 一般用于定义一个基本类型的响应式数据
```js
import { defineComponent, ref } from 'vue'

export default defineComponent({
	name: 'App',
	setup () {
		// 变量
		// let count = 0 // 此时的数据不是响应式的数据
		const count = ref(0)
		// function
		const updateCount = () => {
			// count 是一个 ref 对象，不能直接 ++
			count.value++
		}
		return {
			// 属性
			count,
			// 方法
			updateCount
		}
	}
})
```

## reactive
1. 定义多个数据的响应式
2. `const proxy = reative(obj)`接收一个普通对象，返回该普通对象的响应式代理对象
3. 响应式转换是“深层的”，会影响对象内部所有嵌套的属性
4. 内部基于 ES6 的`Proxy`实现，通过代理对象操作源对象内部数据都是响应式的
```js

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
```