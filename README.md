<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [vue3](#vue3)
  - [Composition API(常用部分)](#composition-api%E5%B8%B8%E7%94%A8%E9%83%A8%E5%88%86)
    - [setup()](#setup)
    - [setup()细节](#setup%E7%BB%86%E8%8A%82)
    - [ref](#ref)
    - [reactive与ref-细节](#reactive%E4%B8%8Eref-%E7%BB%86%E8%8A%82)
    - [reactive](#reactive)
    - [比较 Vue2 和 Vue3 的响应式](#%E6%AF%94%E8%BE%83-vue2-%E5%92%8C-vue3-%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F)
    - [计算属性与监视](#%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E4%B8%8E%E7%9B%91%E8%A7%86)
    - [生命周期](#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
    - [自定义hook函数](#%E8%87%AA%E5%AE%9A%E4%B9%89hook%E5%87%BD%E6%95%B0)
    - [toRefs](#torefs)
    - [ref获取元素](#ref%E8%8E%B7%E5%8F%96%E5%85%83%E7%B4%A0)
  - [Composition API(其它部分)](#composition-api%E5%85%B6%E5%AE%83%E9%83%A8%E5%88%86)
    - [shallowReactive 与 shallowRef](#shallowreactive-%E4%B8%8E-shallowref)
    - [readonly 与 shallowReadonly](#readonly-%E4%B8%8E-shallowreadonly)
    - [toRaw 与 markRaw](#toraw-%E4%B8%8E-markraw)
    - [toRef](#toref)
    - [customRef](#customref)
    - [provide 与 inject](#provide-%E4%B8%8E-inject)
    - [响应式数据的判断](#%E5%93%8D%E5%BA%94%E5%BC%8F%E6%95%B0%E6%8D%AE%E7%9A%84%E5%88%A4%E6%96%AD)
  - [手写组合 API](#%E6%89%8B%E5%86%99%E7%BB%84%E5%90%88-api)
    - [shallowReactive 与 reactive](#shallowreactive-%E4%B8%8E-reactive)
    - [shallowReadonly 与 readonly](#shallowreadonly-%E4%B8%8E-readonly)
    - [shallowRef 与 ref](#shallowref-%E4%B8%8E-ref)
    - [isRef, isReactive 与 isReadonly](#isref-isreactive-%E4%B8%8E-isreadonly)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# vue3

## Composition API(常用部分)
文档:https://composition-api.vuejs.org/zh/api.html
### setup()
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

### setup()细节
1. `setup`执行时机
	1. `setup`是在`beforeCreate`生命周期回调之前就执行，而且只执行一次
	2. 由此可以推断出，`setup`执行的时候，当前组件还没有创建出来，也就意味着组件实例对象 `this`根本就不能用
	3. `this`是`undefined`，说明不能通过`this`再调用`data/computed/methods/props`中相关内容
	4. 其实所有的`composition API`相关回调函数中也都不可以
2. `setup`返回值
	1. `setup`中的返回值是一个对象 内部的属性和方法是给`html`模板使用的
	2. `setup`中的对象内部的属性和`data`函数中的`return`对象的属性都可以在`html`模板中使用
	3. `setup`中的对象中的属性和`data`函数中的对象中的属性会合并为组件对象的属性
	4. `setup`中的 对象中的方法和`methods`对象中的方法会合并为组件对象的方法
	5. 如果有重名，`setup`优先
		1. 在`vue3`中，尽量不要混合使用`data`和`setup`及`methods`和`setup`，因为`methods`中可以访问`setup`提供的属性和方法，但在`setup`方法中不能访问`data`和`methods`（`setup`中不能使用`this`访问实例对象，但是`data`和`methods`需要用`this`调用）
		2. `setup`不能是一个`async`函数，因为返回值不再是`return`的对象，而是`promise`，模板看不到`return`对象中的属性数据
3. `setup`的参数
	1. `props`参数，是一个对象，里面有父级组件向子级组件传递的数据，并且是在子级组件使用props接收到的所有属性对象
	2. `context`参数，是一个对象，里面有`attrs`对象（获取当前组件标签上的所有没有在`props`中声明接收的所有属性的对象，相当于`this.$attrs`），`emit`方法（用来分发自定义事件的函数, 相当于`this.$emit`），`slots`对象（包含所有传入的插槽内容的对象, 相当于`this.$slots`）
```html
<template>
  <div>
    <h3>{{n}}</h3>
    <h3>{{m}}</h3>

    <h3>msg: {{msg}}</h3>
    <h3>msg2: {{$attrs.msg2}}</h3>

    <slot name="xxx"></slot>

    <button @click="update">更新</button>
  </div>
</template>

<script lang="ts">

import {
  ref,
  defineComponent
} from 'vue'

export default defineComponent({
  name: 'child',

  props: ['msg'],

  emits: ['fn'], // 可选的, 声明了更利于程序员阅读, 且可以对分发的事件数据进行校验

  data () {
    console.log('data', this)
    return {
      // n: 1
    }
  },

  beforeCreate () {
    console.log('beforeCreate', this)
  },

  methods: {
    // update () {
    //   this.n++
    //   this.m++
    // }
  },

  // setup (props, context) {
  setup (props, {attrs, emit, slots}) {

    console.log('setup', this)
    console.log(props.msg, attrs.msg2, slots, emit)

    const m = ref(2)
    const n = ref(3)

    function update () {
      // console.log('--', this)
      // this.n += 2 
      // this.m += 2

      m.value += 2
      n.value += 2

      // 分发自定义事件
      emit('fn', '++')
    }

    return {
      m,
      n,
      update,
    }
  },
})
</script>
```


### ref
1. `ref`是一个函数 定义一个响应式的数据 返回一个`Ref`对象
2. 如果需要对数据进行操作，需要使用该`Ref`对象调用`value`属性的方式进行数据的操作
3. `html`模板中不需要使用`.value`属性
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

### reactive与ref-细节
1. 是`Vue3`的 `composition API`中2个最重要的响应式`API`
2. `ref`用来处理基本类型数据, `reactive`用来处理对象(递归深度响应式)
3. 如果用`ref`对象/数组, 内部会自动将对象/数组转换为`reactive`的代理对象
4. `ref`内部: 通过给`value`属性添加`getter/setter`来实现对数据的劫持
5. `reactive`内部: 通过使用`Proxy`来实现对对象内部所有数据的劫持, 并通过`Reflect`操作对象内部数据
6. `ref`的数据操作: 在js中要`.value`, 在模板中不需要(内部解析模板时会自动添加`.value`)



### reactive
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
			user.wife.name += '++'
			// 如果操作代理对象，目标对象中的数据也会随之变化，同时如果想要操作数据的时候界面也要更新渲染，也是操作代理对象
    }
    return {
      user,
      updateUser
    }
  }
})
```

### 比较 Vue2 和 Vue3 的响应式

1. vue2的响应式
	1. 核心：
		1. 对象：通过`defineProperty`对对象的已有属性值的读取和修改进行劫持（监视/拦截）
		2. 数组：通过重写数组更新数组的一系列更新元素的方法来实现元素修改的劫持
		```JS
		// Vue使用 Object.defineProperty 为对象中的每一个属性，设置 get 和 set 方法，进行数据劫持/监听
		// get 值是一个函数,当属性被访问时，会触发 get 函数
		// set 值同样是一个函数，当属性被赋值时，会触发 set 函数；
		var obj={    
				name:Vue是响应式吗？
		}

		Object.defineProperty(obj,"name",{
				get(){        
						console.log("get方法被触发")
				},
				set(val){        
						console.log("set方法被触发")
				}
		})

		var str = obj.name  //get方法被触发
		obj.name = "Vue是响应式的"  // set方法被触发
		// 因而当数据改变时，触发 属性的 set 方法，Vue 就能知道数据有改变；
		```
		3. Vue通过依赖收集去更新视图
			1. 每个`data`声明的属性，都拥有一个的专属依赖收集器`subs`
			2. 依赖收集器`subs`保存的依赖是`watcher`
			3. `watcher`可用于 进行视图更新
				`data`中每个声明的属性都会有一个专属的依赖收集器`dep.subs`数组，当页面使用到某个属性时，触发`ObjectdefineProperty`-`get`函数，页面的`watcher`就会被放到属性的依赖收集器`subs`中进行保存。它知道谁依赖它之后，它就可以在发生改变的时候，通知依赖它的页面，从而让页面完成更新；
				```html
					<template>
						<p> Vue是响应式吗?</p>
						<!--此节点是name的订阅者watch，vue也把此节点存在name的依赖收集器；-->
						<p>{{name}}</p>  
					</template>

					<script>
						export default{
							data() {
								name:"Vue是响应式的"
							}
							mounted() {
								// 当数据发生改变时，vue 会遍历观察者列表（dep.subs），通知所有的watch，
								// 让订阅者执行自己的 update 逻辑,去让页面完成更新
								this.name ="Vue必须是响应式的" 
							}
						}
					</script>
				```
				Vue通过依赖更新时去更新视图
				依赖更新，就是，通知所有的依赖进行更新；
				我们都知道，每个属性都会保存有一个 依赖收集器`subs`，而这个依赖收集器，是用来在 数据变化时，通知更新的；
				关键在于`Object.defineProperty`-`set`，当`name`改变的时候，`name`会遍历自己的依赖收集器`subs`，逐个通知订阅者`watcher`，让 订阅者`watcher`完成更新；这里`name`会通知订阅者节点，节点重新读取新的`name`，然后完成渲染；
	2. 问题
	 1. 对象直接新添加的属性或删除已有属性，界面不会自动更新
	 2. 直接通过下标替换元素或更新`length`，页面不会自动更新
2. Vue3 响应式原理
	1. 核心：
		1. vue3 通过`Proxy`代理实现响应式，拦截对`data`任意属性的任意（13种）操作，包括属性值的读写，属性的添加，属性的删除等
			1. `handler`包含捕捉器（`trap`）的占位符对象，可译为处理对象
			2. `traps`提供属性访问的方法，类似于操作系统中捕获器的概念
			3. `target`被`proxy`代理虚拟化的对象
			```JS
			const P = new Proxy(target, handler)
			// handler.get()
			const p = new Proxy(target, {
				// target 目标对象
				// property 被获取的属性名
				// receiver Proxy 或者继承 Proxy的对象
				get: function(target, property, receiver) {}
			})
			// handler.set()
			```
		2. 通过`Reflect`（反射）动态对被代理的对象的相应属性进行特定操作
		```JS
		const user = {
			name: 'sakura',
			age: 20,
			husband: {
				name: 'sasuke',
				age: 23
			}
		}
		// 把目标对象变成代理对象
		// 参数1： user -> target 目标对象
		// 参数2： handler -> 处理器对象，用来监视数据及数据的操作
		const proxyUser = new Proxy(user, {
			// 获取目标对象的某个属性值
			get(target, prop) {
				console.log('get方法调用了')
				return Reflect.get(target, prop)
			},
			// 修改或添加目标对象的属性值
			set(target, prop, val) {
				console.log('set方法调用了')
				return Reflect.set(target, prop, val)
			},
			// 删除目标对象上的某个属性
			deleteProperty(target, prop) {
				console.log('delete方法调用了')
				return Reflect.deleteProperty(target, prop)
			}
		})
		// 通过代理对象获取目标对象中的某个属性值
		console.log(proxyUser.name)
		// 通过代理对象更新目标对象中的某个属性值
		proxyUser.name = 'naroto'
		// 通过代理对象向目标对象中添加一个新的属性
		proxyUser.gender = 'you guess'
		delete proxyUser.name
		// 更新目标对象中的某个属性中的属性值
		// 调用 get 方法
		proxyUser.husband.name = 'hidari'
		```


### 计算属性与监视
1. `computed`函数
  1. 与`computed`配置功能一致
  2. 只有`getter`：计算属性的函数中如果只传入一个回调函数，表示的是`get`
  3. 有`getter`和`setter`：有`get`和`set`操作，返回的是一个对象
2. `watch`函数
	1. 与watch配置功能一致
	2. 监视指定的一个或多个响应式数据, 一旦数据变化, 就自动执行监视回调
	3. 默认初始时不执行回调, 但可以通过配置`immediate`为`true`, 来指定初始时立即执行第一次
	4. 通过配置`deep`为`true`, 来指定深度监视
3. `watchEffect`函数
	1. 不用直接指定要监视的数据, 回调函数中使用的哪些响应式数据就监视哪些响应式数据
	2. 默认初始时就会执行第一次, 从而可以收集需要监视的数据
	3. 监视数据发生变化时回调
```html
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
    // 计算属性的函数中如果只传入一个回调函数，表示的是 get
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
```


### 生命周期
1. vue2.x的生命周期

![avatar](https://cn.vuejs.org/images/lifecycle.png)

2. vue3的生命周期

![http-bw](https://v3.cn.vuejs.org/images/lifecycle.svg)

3. 与 2.x 版本生命周期相对应的组合式 API

`beforeCreate` -> 使用 `setup()`
`created` -> 使用 `setup()`
`beforeMount` -> `onBeforeMount`
`mounted` -> `onMounted`
`beforeUpdate` -> `onBeforeUpdate`
`updated` -> `onUpdated`
`beforeDestroy` -> `onBeforeUnmount`
`destroyed` -> `onUnmounted`
`errorCaptured` -> `onErrorCaptured`

```vue
<!-- Child.vue -->
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
```

```vue
<!-- App.vue -->
<template>
    <h2>App父级组件</h2>
    <button @click="isShow = !isShow">切换显示</button>
    <hr>
    <child v-if="isShow" />
</template>

<script lang="ts">
// 引入子级组件
import { defineComponent, ref } from 'vue'
import Child from './compontents/Child.vue'

export default defineComponent({
  components: { Child },
  name: 'App',
  setup () {
    const isShow = ref(true)
    return {
      isShow
    }
  }
})
</script>
```

### 自定义hook函数

1. 使用Vue3的组合API封装的可复用的功能函数

2. 自定义hook的作用类似于vue2中的mixin技术
```js
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用混入对象的组件
var Component = Vue.extend({
  mixins: [myMixin]
})

var component = new Component() // => "hello from mixin!"
```
3. 自定义Hook的优势: 很清楚复用功能代码的来源, 更清楚易懂
eg: 收集用户鼠标点击的页面坐标
```js
// hooks/useMousePosition.ts
import { ref, onMounted, onUnmounted } from 'vue'
/* 
收集用户鼠标点击的页面坐标
*/
export default function useMousePosition () {
  // 初始化坐标数据
  const x = ref(-1)
  const y = ref(-1)

  // 用于收集点击事件坐标的函数
  const updatePosition = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  // 挂载后绑定点击监听
  onMounted(() => {
    document.addEventListener('click', updatePosition)
  })

  // 卸载前解绑点击监听
  onUnmounted(() => {
    document.removeEventListener('click', updatePosition)
  })

  return {x, y}
}
```

```vue
<template>
<div>
  <h2>x: {{x}}, y: {{y}}</h2>
</div>
</template>

<script>

import {
  ref
} from "vue"
/* 
在组件中引入并使用自定义hook
自定义hook的作用类似于vue2中的mixin技术
自定义Hook的优势: 很清楚复用功能代码的来源, 更清楚易懂
*/
import useMousePosition from './hooks/useMousePosition'

export default {
  setup() {

    const {x, y} = useMousePosition()

    return {
      x,
      y,
    }
  }
}
</script>
```
4. 利用TS泛型强化类型检查
eg: 封装发ajax请求的hook函数
```js
// /hooks/useRequest.ts
// 引入 axios
import axios from 'axios'
// 发送 ajax 请求
import { ref } from 'vue'
export default function <T> (url: string) {
  // 加载状态
  const loading = ref(true)
  // 请求成功的数据
  const data = ref<T | null>(null)
  // 错误信息
  const errorMsg = ref('')
  // 发送请求
  axios.get(url).then(Response => {
    // 改变加载状态
    loading.value = false
    data.value = Response.data
  }).catch(error => {
    // 改变加载数据
    loading.value = false
    errorMsg.value = error.message || '未知错误'
  })
  return {
    loading,
    data,
    errorMsg
  }
}
```
```vue
<template>
<div>
    <h1 v-if="loading">loading...</h1>
    <h2 v-else-if="errorMsg">{{errorMsg}}</h2>
    <ul v-else>
        <li>{{data.id}}</li>
        <li>{{data.address}}</li>
        <li>{{data.distance}}</li>
    </ul>
    <hr>
    <ul v-for="item in data" :key="item.id">
        <li>{{item.id}}</li>
        <li>{{item.title}}</li>
        <li>{{item.price}}</li>
    </ul>
</div>
</template>

<script lang='ts'>
import { defineComponent, watch } from 'vue'
import useRequest from './hooks/useRequest'

// 定义接口约束对象类型
interface MyAddressData{
    id: number,
    address: string,
    distance: string
}
interface MyProductsData{
    id: string,
    title: string,
    price: number,
    length: number
}
export default defineComponent({
  name: 'App',
  setup () {
    // 发送请求
    // const { loading, data, errorMsg } = useRequest<MyAddressData>('/data/address.json') // 对象数据
    const { loading, data, errorMsg } = useRequest<MyProductsData>('/data/products.json') // 数组数据
    // 监视
    watch(data, () => {
      if (data.value) {
        console.log(data.value.length)
      }
    })
    return {
      loading, data, errorMsg
    }
  }
})
</script>
```

### toRefs
1. 把一个响应式对象转换成普通对象，该普通对象的每个 `property` 都是一个 `ref`
2. 应用: 当从合成函数返回响应式对象时，`toRefs` 非常有用，这样消费组件就可以在不丢失响应式的情况下对返回的对象进行分解使用
3. 问题: `reactive` 对象取出的所有属性值都是非响应式的
4. 解决: 利用 `toRefs` 可以将一个响应式 `reactive` 对象的所有原始属性转换为响应式的 ref 属性
```vue
<template>
  <h2>toRefs</h2>
  <h3>foo: {{foo}}</h3>
  <h3>bar: {{bar}}</h3>
  <h3>foo2: {{foo2}}</h3>
  <h3>bar2: {{bar2}}</h3>


</template>

<script lang="ts">
import { reactive, toRefs } from 'vue'
/*
toRefs:
  将响应式对象中所有属性包装为ref对象, 并返回包含这些ref对象的普通对象
  应用: 当从合成函数返回响应式对象时，toRefs 非常有用，
        这样消费组件就可以在不丢失响应式的情况下对返回的对象进行分解使用
*/
export default {

  setup () {

    const state = reactive({
      foo: 'a',
      bar: 'b',
    })

    const stateAsRefs = toRefs(state)

    setTimeout(() => {
      state.foo += '++'
      state.bar += '++'
    }, 2000);

    const {foo2, bar2} = useReatureX()

    return {
      // ...state,
      ...stateAsRefs,
      foo2, 
      bar2
    }
  },
}

function useReatureX() {
  const state = reactive({
    foo2: 'a',
    bar2: 'b',
  })

  setTimeout(() => {
    state.foo2 += '++'
    state.bar2 += '++'
  }, 2000);

  return toRefs(state)
}

</script>
```


### ref获取元素

1. 利用`ref`函数获取组件中的标签元素
2. 功能需求: 让输入框自动获取焦点
```vue
<template>
  <h2>ref另一个作用：获取页面中的元素</h2>
  <input type="text">---
  <input type="text" ref="inputRef">
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
/* 
ref获取元素: 利用ref函数获取组件中的标签元素
功能需求: 让输入框自动获取焦点
*/
export default {
  setup() {
    const inputRef = ref<HTMLElement|null>(null)

    onMounted(() => {
      inputRef.value && inputRef.value.focus()
    })

    return {
      inputRef
    }
  },
}
</script>
```

##  Composition API(其它部分)
### shallowReactive 与 shallowRef
1. `shallowReactive` : 只处理了对象内最外层属性的响应式(也就是浅响应式)
2. `shallowRef`: 只处理了`value`的响应式, 不进行对象的`reactive`处理
3. 什么时候用浅响应式呢?
	1. 一般情况下使用`ref`和`reactive`即可
	2. 如果有一个对象数据, 结构比较深, 但变化时只是外层属性变化 ===> `shallowReactive`
	3. 如果有一个对象数据, 后面会产生新的对象来替换 ===> `shallowRef`
	```html
	<template>
  <h2>App</h2>

  <h3>m1: {{m1}}</h3>
  <h3>m2: {{m2}}</h3>
  <h3>m3: {{m3}}</h3>
  <h3>m4: {{m4}}</h3>

  <button @click="update">更新</button>
	</template>

	<script lang="ts">
	import { reactive, ref, shallowReactive, shallowRef } from 'vue'

	export default {

		setup () {
			// reactive 深度劫持（深监视）-----深度响应式
			const m1 = reactive({a: 1, b: {c: 2}})
			// shallowReactive 浅劫持（浅监视）-----浅响应式
			const m2 = shallowReactive({a: 1, b: {c: 2}})
			// ref 深度劫持（深监视）-----深度响应式（做了 reactive 处理）
			const m3 = ref({a: 1, b: {c: 2}})
			// shallowRef 浅劫持（浅监视）-----浅响应式
			const m4 = shallowRef({a: 1, b: {c: 2}})

			const update = () => {
				// m1.b.c += 1
				// m2.b.c += 1

				// m3.value.a += 1
				m4.value.a += 1
			}

			return {
				m1,
				m2,
				m3,
				m4,
				update,
			}
		}
	}
	</script>
  ```
### readonly 与 shallowReadonly
1. readonly:
	1. 深度只读数据
	2. 获取一个对象 (响应式或纯对象) 或 `ref` 并返回原始代理的只读代理。
	3. 只读代理是深层的：访问的任何嵌套 `property` 也是只读的。
2. shallowReadonly
	1. 浅只读数据
	2. 创建一个代理，使其自身的 `property` 为只读，但不执行嵌套对象的深度只读转换
	3. 应用场景:
		在某些特定情况下, 我们可能不希望对数据进行更新的操作, 那就可以包装生成一个只读代理对象来读取数据, 而不能修改或删除
```vue
<template>
  <h2>readonly 和 shallowReadonly</h2>
  <h3>{{state}}</h3>
  <button @click="update">更新</button>
</template>

<script lang="ts">
import { reactive, readonly, shallowReadonly } from 'vue'

export default {

  setup () {

    const state = reactive({
      a: 1,
      b: {
        c: 2
      }
    })
		// 只读属性 ------深度只读
    // const rState1 = readonly(state)
		// shallowReadonly 只读的-----浅只读
		// 浅只读 深度可写
    const rState2 = shallowReadonly(state)

    const update = () => {
      // rState1.a++ // error
      // rState1.b.c++ // error

      // rState2.a++ // error
      rState2.b.c++
    }
    
    return {
      state,
      update
    }
  }
}
</script>
```

### toRaw 与 markRaw
1. toRaw
	1. 返回由 `reactive` 或 `readonly` 方法转换成响应式代理的普通对象。
	2. 这是一个还原方法，可用于临时读取，访问不会被代理/跟踪，写入时也不会触发界面更新。
2. markRaw
	1. 标记一个对象，使其永远不会转换为代理。返回对象本身
	2. 应用场景:
		1. 有些值不应被设置为响应式的，例如复杂的第三方类实例或 `Vue` 组件对象。
		2. 当渲染具有不可变数据源的大列表时，跳过代理转换可以提高性能。
```vue
<template>
	<h2>toRaw 与 markRaw</h2>
  <h2>{{state}}</h2>
  <button @click="testToRaw">测试toRaw</button>
  <button @click="testMarkRaw">测试markRaw</button>
</template>

<script lang="ts">
/* 
toRaw: 得到reactive代理对象的目标数据对象
*/
import {
  markRaw,
  reactive, toRaw,
} from 'vue'
export default {
  setup () {
    const state = reactive<any>({
      name: 'tom',
      age: 25,
    })

    const testToRaw = () => {
      const user = toRaw(state)
      user.age++  // 界面不会更新

    }

    const testMarkRaw = () => {
      const likes = ['a', 'b']
      // state.likes = likes
      state.likes = markRaw(likes) // likes数组就不再是响应式的了
      setTimeout(() => {
        state.likes[0] += '--'
      }, 1000)
    }

    return {
      state,
      testToRaw,
      testMarkRaw,
    }
  }
}
</script>
```

### toRef
1. 为源响应式对象上的某个属性创建一个 `ref` 对象, 二者内部操作的是同一个数据值, 更新时二者是同步的
2. 区别`ref`: 拷贝了一份新的数据值单独操作, 更新时相互不影响
3. 应用: 当要将 某个`prop` 的 `ref` 传递给复合函数时，`toRef` 很有用

```html
<template>
  <h2>toRef 的使用及特点</h2>
  <p>{{state}}</p>
  <p>{{foo}}</p>
  <p>{{foo2}}</p>

  <button @click="update">更新</button>

  <Child :foo="foo"/>
</template>

<script lang="ts">

import {
  reactive,
  toRef,
  ref,
} from 'vue'
import Child from './Child.vue'

export default {

  setup () {

    const state = reactive({
      foo: 1,
      bar: 2
    })
		// 把 响应式数据 state 对象中的某个属性 age 变成 ref 对象
    const foo = toRef(state, 'foo')
		// 把响应式对象中的某个属性 money 用 ref 包装，变成一个 ref
    const foo2 = ref(state.foo)

    const update = () => {
      state.foo++
      // foo.value++
      // foo2.value++  // foo和state中的数据不会更新
    }

    return {
      state,
      foo,
      foo2,
      update,
    }
  },

  components: {
    Child
  }
}
</script>
```
```html
<template>
  <h2>Child</h2>
  <h3>{{foo}}</h3>
  <h3>{{length}}</h3>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, toRef } from 'vue'

const component = defineComponent({
  props: {
    foo: {
      type: Number,
      require: true
    }
  },

  setup (props, context) {
    const length = useFeatureX(toRef(props, 'foo'))

    return {
      length
    }
  }
})

function useFeatureX(foo: Ref) {
  const lenth = computed(() => foo.value.length)

  return lenth
}

export default component
</script>
```

### customRef
1. 创建一个自定义的 `ref`，并对其依赖项跟踪和更新触发进行显式控制
2. `customRef`两个参数分别是用于追踪的`track`和用于触发响应的`trigger`，并返回一个带有`get`和`set`属性的对象
3. 需求: 使用 `customRef` 实现 `debounce` 的示例
```html
<template>
  <h2>customRef 使用</h2>
  <input v-model="keyword" placeholder="搜索关键字"/>
  <p>{{keyword}}</p>
</template>

<script lang="ts">
/*
customRef:
  创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制

需求: 
  使用 customRef 实现 debounce 的示例
*/

import {
  ref,
  customRef
} from 'vue'

export default {

  setup () {
    const keyword = useDebouncedRef('', 500)
    console.log(keyword)
    return {
      keyword
    }
  },
}

/* 
实现函数防抖的自定义ref
*/
// value 将来传入的数据类型不确定 用泛型
// delay 防抖的间隔时间 默认200ms
function useDebouncedRef<T>(value: T, delay = 200) {
  let timeout: number
  return customRef((track, trigger) => {
    return {
      get() {
        // 告诉Vue追踪数据
        track()
        return value
      },
      set(newValue: T) {
				// 清理定时器
        clearTimeout(timeout)
				// 开启定时器
        timeout = setTimeout(() => {
          value = newValue
          // 告诉Vue去触发界面更新
          trigger()
        }, delay)
      }
    }
  })
}
</script>
```

### provide 与 inject
1. `provide`和`inject`提供依赖注入，功能类似 2.x 的`provide/inject`
2. 实现跨层级组件(祖孙)间通信
```vue
<template>
  <h1>父组件</h1>
  <p>当前颜色: {{color}}</p>
  <button @click="color='red'">红</button>
  <button @click="color='yellow'">黄</button>
  <button @click="color='blue'">蓝</button>
  
  <hr>
  <Son />
</template>

<script lang="ts">
import { provide, ref } from 'vue'

import Son from './Son.vue'
export default {
  name: 'ProvideInject',
  components: {
    Son
  },
  setup() {
    
    const color = ref('red')
		// 提供数据
    provide('color', color)

    return {
      color
    }
  }
}
</script>
```
```vue
<template>
  <div>
    <h2>子组件</h2>
    <hr>
    <GrandSon />
  </div>
</template>

<script lang="ts">
import GrandSon from './GrandSon.vue'
export default {
  components: {
    GrandSon
  },
}
</script>
```
```vue
<template>
  <h3 :style="{color}">孙子组件: {{color}}</h3>
  
</template>

<script lang="ts">
import { inject } from 'vue'
export default {
  setup() {
		// 注入数据
    const color = inject('color')

    return {
      color
    }
  }
}
</script>
```

### 响应式数据的判断
1. `isRef`: 检查一个值是否为一个 `ref` 对象
2. `isReactive`: 检查一个对象是否是由 `reactive` 创建的响应式代理
3. `isReadonly`: 检查一个对象是否是由 `readonly` 创建的只读代理
4. `isProxy`: 检查一个对象是否是由 `reactive` 或者 `readonly` 方法创建的代理

## 手写组合 API
### shallowReactive 与 reactive
```js
// shallowReactive 与 reactive

// 定义一个 reactiveHandler 处理对象
const reactiveHandler = {
		// 获取属性值
		get(target, prop) {
			if (key==='_is_reactive') return true
			const result = Reflect.get(target, prop)
			console.log('拦截了读取数据', prop, result)
			return result
		},
		// 修改或添加属性
		set(target, prop, value) {
			const result = Reflect.set(target, prop, value)
			console.log('拦截了修改或添加属性', prop, value)
			return result
		},
		// 删除某个属性
		deleteProperty(target, prop) {
			const result = Reflect.deleteProperty(target, prop)
			console.log('拦截了删除属性', prop)
			return result
		}
}
// 定义一个 shallowReactive 函数，传入一个目标对象
function shallowReactive(target) {
	// 判断当前目标对象是不是 object 类型（对象/数组）
	if(target && typeof target === 'object') {
		return new Proxy(target, reactiveHandler)
	}
	// 如果传入的数据类型是基本数据类型，直接返回
	return target
}

// 定义一个 reactive 函数 传入一个目标对象
function reactive (target) {
	// 判断当前目标对象是不是 object 类型（对象/数组）
	if (target && typeof target === 'object') {
		// 对数组或对象中所有数据进行 reactive 的递归处理
		// 先判断当前数据是不是数组
		if(Array.isArray(target)) {
				// 数组的数据遍历
				target.forEach((item, index) => {
						// 递归
						target[index] = reactive(item)
				})
			} else {
				// 再判断当前数据是不是对象
				// 对象数据遍历
				Object.keys(target).forEach(key => {
						// 递归
						target[key] = reactive(target[key])
				})
			}
			return new Proxy(target, reactiveHandler)
		}
		// 如果传入数据是基本数据类型，直接返回
}

const proxyUser1 = shallowReactive({
	name: 'hidari',
	car: {
		color: 'red'
	}
})
// // 拦截了读取数据 car {color: 'red'}
// proxyUser1.car.color = 'black'
// // 拦截了修改或添加属性 name haha
// proxyUser1.name = 'haha'
// // 拦截了删除属性 name
// delete proxyUser1.name
// // 拦截了读取数据 car {color: 'black'}
// delete proxyUser1.car.color

const proxyUser2 = reactive({
	name: 'hidari',
	car: {
		color: 'red'
	}
})

// 拦截了读取数据 car {color: 'red'}
// 拦截了修改或添加属性 color black
proxyUser2.car.color = 'black'
// 拦截了修改或添加属性 name haha
proxyUser2.name = 'haha'
// 拦截了删除属性 name
delete proxyUser2.name
// 拦截了读取数据 car {color: 'black'}
// 拦截了删除属性 color
delete proxyUser2.car.color
```

### shallowReadonly 与 readonly
```js
// 定义一个 readonlyHandler 函数
const readonlyHandler = {
	get(target, prop) {
		if (key==='_is_readonly') return true
		const result = Reflect.get(target, prop)
		console.log('拦截到了读取数据', prop, result)
		return result
	},
	set(target, prop, value) {
		console.warn('只能读取数据，不能修改或添加数据')
		return true
	},
	deleteProperty(target, prop) {
		console.warn('只能读取数据，不能删除数据')
		return true 
	}
}
// 定义一个 shallowReadonly 函数
function shallowReadonly(target) {
	// 判断当前数据是不是对象
	if (target && typeof target === 'object') {
		return new Proxy(target, readonlyHandler)
	}
	return target
}
// 定义一个 readonly 函数
function readonly(target) {
	// 判断当前数据是不是对象
	if (target && typeof target === 'object') {
		// 判断 target 是不是数组
		if(Array.isArray(target)) {
			// 遍历数组
			target.forEach((item, index) => {
					target[index] = readonly(item)
			})
		} else {
			// 判断 target 是不是对象
			// 遍历对象
			Object.keys(target).forEach(key => {
					target[key] = readonly(target[key])
			})
		}
		return new Proxy(target, readonlyHandler)
	}
	// 如果不是对象或数组，直接返回
	return target
}

const proxyUser1 = shallowReadonly({
	name: 'hidari',
	cars: ['benz', 'bmw']
})

// 只能读取数据，不能修改或添加数据
proxyUser1.name = '11'
// 拦截到了读取数据 name hidari
proxyUser1.name
// 拦截到了读取数据
// cars 
//     (2) ['benz', 'bmw']
//     0: "benz"
//     1: "bycicle"
//     length: 2
// 拦截不了深度修改
proxyUser1.cars[1] = 'bycicle'
// 只能读取数据，不能删除数据
delete proxyUser1.name
// 拦截到了读取数据 cars
// 可以深度删除
delete proxyUser1.cars[1]

const proxyUser2 = readonly({
	name: 'hidari',
	cars: ['benz', 'bmw']
})

// 拦截到了读取数据 name hidari
proxyUser2.name
// 拦截到了读取数据 cars Proxy {0: 'benz', 1: 'bmw'}
// 只能读取数据，不能修改或添加数据
proxyUser2.cars[0] = 'bgcicle'
// 只能读取数据，不能修改或添加数据
proxyUser2.name = 'haha'
// 只能读取数据，不能删除数据
delete proxyUser2.name
// 拦截到了读取数据 cars Proxy {0: 'benz', 1: 'bmw'}
// 只能读取数据，不能删除数据
delete proxyUser2.cars[0]
```

### shallowRef 与 ref
```js
// 定义一个 shallowRef 函数
function shallowRef(target) {
	return {
		// 保存 target 数据
		_is_ref: true, // 标识是 ref 对象
		_value: target,
		get value() {
			console.log('劫持到了读取数据')
			return this._value
		},
		set value(val) {
			console.log('劫持到了修改数据, 准备更新界面', val)
		}
	}
}

// 定义一个 ref 函数
function shallowRef(target) {
	target = reactive(target)
	return {
		// 保存 target 数据
		_is_ref: true, // 标识是 ref 对象
		_value: target,
		get value() {
			console.log('劫持到了读取数据')
			return this._value
		},
		set value(val) {
			console.log('劫持到了修改数据, 准备更新界面', val)
		}
	}
}
```

### isRef, isReactive 与 isReadonly
```js
/* 
isRef: 判断是否是 ref 对象
*/
function isRef(obj) {
  return obj && obj._is_ref
}

/* 
isReactive: 判断是否是 reactive 对象
*/
function isReactive(obj) {
  return obj && obj._is_reactive
}

/* 
判断是否是 readonly 对象
*/
function isReadonly(obj) {
  return obj && obj._is_readonly
}

/* 
是否是 reactive 或 readonly 产生的代理对象
*/
function isProxy (obj) {
  return isReactive(obj) || isReadonly(obj)
}


/* 测试判断函数 */
console.log(isReactive(reactive({})))
console.log(isRef(ref({})))
console.log(isReadonly(readonly({})))
console.log(isProxy(reactive({})))
console.log(isProxy(readonly({})))
```