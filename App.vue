<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initCloud } from './src/services/cloud'

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发环境
  initCloud().then(() => {
    console.log('Cloud initialized successfully')
  }).catch(err => {
    console.error('Cloud initialization failed:', err)
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
	/*每个页面公共css */
</style>
