<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [vue3](#vue3)
  - [setup()](#setup)
  - [setup()细节](#setup%E7%BB%86%E8%8A%82)
  - [ref](#ref)
  - [reactive与ref-细节](#reactive%E4%B8%8Eref-%E7%BB%86%E8%8A%82)
  - [reactive](#reactive)
  - [比较 Vue2 和 Vue3 的响应式](#%E6%AF%94%E8%BE%83-vue2-%E5%92%8C-vue3-%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F)
  - [计算属性与监视](#%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E4%B8%8E%E7%9B%91%E8%A7%86)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

## setup()细节
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


## ref
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

## reactive与ref-细节
1. 是`Vue3`的 `composition API`中2个最重要的响应式`API`
2. `ref`用来处理基本类型数据, `reactive`用来处理对象(递归深度响应式)
3. 如果用`ref`对象/数组, 内部会自动将对象/数组转换为`reactive`的代理对象
4. `ref`内部: 通过给`value`属性添加`getter/setter`来实现对数据的劫持
5. `reactive`内部: 通过使用`Proxy`来实现对对象内部所有数据的劫持, 并通过`Reflect`操作对象内部数据
6. `ref`的数据操作: 在js中要`.value`, 在模板中不需要(内部解析模板时会自动添加`.value`)



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

## 比较 Vue2 和 Vue3 的响应式

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


## 计算属性与监视
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