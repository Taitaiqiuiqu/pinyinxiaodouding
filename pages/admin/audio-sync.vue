<template>
  <view class="audio-sync-container">
    <view class="header">
      <text class="title">音频同步工具</text>
      <text class="subtitle">将云端音频信息同步到数据库</text>
    </view>

    <view class="section">
      <view class="section-title">操作说明</view>
      <view class="instruction">
        <text>1. 从微信云开发控制台复制音频文件ID列表</text>
        <text>2. 粘贴到下方文本框中（每行一个fileID）</text>
        <text>3. 点击"开始同步"按钮</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">音频文件ID列表</view>
      <textarea
        v-model="audioFileIds"
        class="textarea"
        placeholder="请粘贴音频文件ID，每行一个&#10;例如：&#10;cloud://xxx/audio/age-select/guide_01.mp3&#10;cloud://xxx/audio/common/click.mp3"
        :maxlength="10000"
      />
      <view class="textarea-footer">
        <text class="count">已输入 {{ lineCount }} 个文件ID</text>
        <button class="clear-btn" size="mini" @click="clearInput">清空</button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">同步选项</view>
      <view class="options">
        <label class="option">
          <checkbox :checked="forceUpdate" @change="onForceUpdateChange" />
          <text>强制更新已存在的记录</text>
        </label>
      </view>
    </view>

    <view class="section">
      <view class="section-title">同步状态</view>
      <view class="status">
        <view class="status-item">
          <text class="label">总处理数：</text>
          <text class="value">{{ syncStatus.totalProcessed }}</text>
        </view>
        <view class="status-item">
          <text class="label">成功添加：</text>
          <text class="value success">{{ syncStatus.addedCount }}</text>
        </view>
        <view class="status-item">
          <text class="label">成功更新：</text>
          <text class="value warning">{{ syncStatus.updatedCount }}</text>
        </view>
        <view class="status-item">
          <text class="label">跳过：</text>
          <text class="value info">{{ syncStatus.skippedCount }}</text>
        </view>
      </view>
    </view>

    <view class="section" v-if="syncLog.length > 0">
      <view class="section-title">同步日志</view>
      <scroll-view class="log-container" scroll-y>
        <view v-for="(log, index) in syncLog" :key="index" class="log-item">
          <text class="log-time">{{ log.time }}</text>
          <text :class="['log-message', log.type]">{{ log.message }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="actions">
      <button
        class="sync-btn"
        :disabled="isSyncing || !hasValidInput"
        @click="startSync"
      >
        {{ isSyncing ? '同步中...' : '开始同步' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      audioFileIds: '',
      forceUpdate: false,
      isSyncing: false,
      syncStatus: {
        totalProcessed: 0,
        addedCount: 0,
        updatedCount: 0,
        skippedCount: 0
      },
      syncLog: []
    }
  },

  computed: {
    lineCount() {
      if (!this.audioFileIds.trim()) {
        return 0
      }
      return this.audioFileIds.split('\n').filter(line => line.trim()).length
    },

    hasValidInput() {
      return this.lineCount > 0
    }
  },

  methods: {
    onForceUpdateChange(e) {
      this.forceUpdate = e.detail.value.length > 0
    },

    clearInput() {
      this.audioFileIds = ''
    },

    addLog(message, type = 'info') {
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      
      this.syncLog.unshift({
        time,
        message,
        type
      })

      if (this.syncLog.length > 100) {
        this.syncLog.pop()
      }
    },

    parseAudioFiles() {
      const lines = this.audioFileIds.split('\n').filter(line => line.trim())
      
      return lines.map(line => {
        const fileID = line.trim()
        const parts = fileID.split('/')
        const fileName = parts[parts.length - 1]
        const pathParts = parts.slice(3, -1)
        const audioType = pathParts.length > 0 ? pathParts.join('/') : 'unknown'

        return {
          fileID,
          fileName,
          audioType,
          duration: 0,
          size: 0
        }
      })
    },

    async startSync() {
      if (this.isSyncing) {
        return
      }

      const audioFiles = this.parseAudioFiles()

      if (audioFiles.length === 0) {
        uni.showToast({
          title: '请输入有效的音频文件ID',
          icon: 'none'
        })
        return
      }

      this.isSyncing = true
      this.syncStatus = {
        totalProcessed: 0,
        addedCount: 0,
        updatedCount: 0,
        skippedCount: 0
      }
      this.syncLog = []

      this.addLog(`开始同步 ${audioFiles.length} 个音频文件`, 'info')

      try {
        const result = await uni.cloud.callFunction({
          name: 'syncAudioToDB',
          data: {
            audioFiles,
            forceUpdate: this.forceUpdate
          }
        })

        if (result.result.success) {
          const { totalProcessed, addedCount, updatedCount, skippedCount } = result.result.data
          
          this.syncStatus = {
            totalProcessed,
            addedCount,
            updatedCount,
            skippedCount
          }

          this.addLog(`同步完成！总计: ${totalProcessed}, 新增: ${addedCount}, 更新: ${updatedCount}, 跳过: ${skippedCount}`, 'success')
          
          uni.showToast({
            title: '同步成功',
            icon: 'success'
          })
        } else {
          throw new Error(result.result.message || '同步失败')
        }
      } catch (error) {
        console.error('同步失败:', error)
        this.addLog(`同步失败: ${error.message}`, 'error')
        
        uni.showToast({
          title: '同步失败',
          icon: 'none'
        })
      } finally {
        this.isSyncing = false
      }
    }
  }
}
</script>

<style scoped>
.audio-sync-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.instruction {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.instruction text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.textarea {
  width: 100%;
  height: 400rpx;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 26rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.count {
  font-size: 24rpx;
  color: #999;
}

.clear-btn {
  font-size: 24rpx;
  color: #666;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.option text {
  font-size: 28rpx;
  color: #666;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item .label {
  font-size: 28rpx;
  color: #666;
}

.status-item .value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.status-item .value.success {
  color: #52c41a;
}

.status-item .value.warning {
  color: #faad14;
}

.status-item .value.info {
  color: #1890ff;
}

.log-container {
  height: 300rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 10rpx;
}

.log-item {
  display: flex;
  gap: 10rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}

.log-message {
  font-size: 24rpx;
  color: #666;
  flex: 1;
  word-break: break-all;
}

.log-message.success {
  color: #52c41a;
}

.log-message.error {
  color: #f5222d;
}

.log-message.warning {
  color: #faad14;
}

.actions {
  margin-top: 40rpx;
}

.sync-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
}

.sync-btn[disabled] {
  background: #ccc;
  color: #999;
}
</style>
