import { onMounted, onUnmounted, ref } from 'vue'
export default function useMousePosition () {
  const x = ref(-1)
  const y = ref(-1)
  // 页面加载完毕后再点击
  const clickHandler = (event:MouseEvent) => {
    x.value = event.pageX
    y.value = event.pageY
    console.log(event)
  }
  // 页面加载完毕后的生命周期
  onMounted(() => {
    window.addEventListener('click', clickHandler)
  })
  // 页面卸载前的生命周期
  onUnmounted(() => {
    window.removeEventListener('click', clickHandler)
  })
  return { x, y }
}
