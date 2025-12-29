<script>
	import { initCloud } from './src/services/cloud'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 初始化云开发环境
			initCloud().then(() => {
				console.log('Cloud initialized successfully')
			}).catch(err => {
				console.error('Cloud initialization failed:', err)
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
