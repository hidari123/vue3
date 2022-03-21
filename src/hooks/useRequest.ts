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
