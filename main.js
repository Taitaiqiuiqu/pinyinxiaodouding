import App from './App'
import FloatingBall from './src/components/FloatingBall/FloatingBall.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
Vue.component('FloatingBall', FloatingBall)
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.component('FloatingBall', FloatingBall)
  return {
    app
  }
}
// #endif