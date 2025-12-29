<template>
  <view style="display:none"></view>
</template>

<script>
export default {
  name: 'AudioPlayer',
  data() {
    return {
      ctx: null,
      currentTrack: null,
      queue: [],
      isInitialized: false
    }
  },
  mounted() {
    if (typeof uni !== 'undefined' && uni.createInnerAudioContext) {
      this.ctx = uni.createInnerAudioContext()
      this.ctx.onEnded(() => this._onEnded())
      this.ctx.onError((e) => this._onError(e))
      this.ctx.onCanplay(() => this._onCanplay())
      this.ctx.onPlay(() => this._onPlay())
      this.ctx.onWaiting(() => this._onWaiting())
      this.ctx.onStop(() => this._onStop())
      this.isInitialized = true
      console.log('AudioPlayer: context created')
      
      this.$nextTick(() => {
        this._processQueue()
      })
    } else {
      console.error('AudioPlayer: uni.createInnerAudioContext not available')
    }
  },
  watch: {
    isInitialized(newVal) {
      if (newVal) {
        this._processQueue()
      }
    }
  },
  methods: {
    // map logical audio types to numeric priorities (higher = more important)
    _priorityOf(type) {
      const map = {
        guide: 3,
        phonics: 3,
        word: 3,
        feedback: 2,
        bgm: 1,
        music: 1
      }
      return map[type] ?? 2
    },

    // internal: process queue and start next track if any
    _processQueue() {
      if (this.currentTrack) return
      const next = this.queue.shift()
      if (!next) return
      this._startTrack(next)
    },

    // internal: start playing a track object
    _startTrack(track) {
      console.log('AudioPlayer _startTrack called with track:', track)
      if (!this.ctx) {
        console.error('AudioPlayer: audio context unavailable')
        track.reject && track.reject(new Error('audio context unavailable'))
        this.currentTrack = null
        this._processQueue()
        return
      }
      this.currentTrack = track
      this.ctx.stop()
      let audioPath = track.file
      if (audioPath.startsWith('/')) {
        audioPath = audioPath.slice(1)
      }
      if (!audioPath.startsWith('static/')) {
        audioPath = `static/audio/${audioPath}`
      }
      console.log('AudioPlayer: setting src to', audioPath)
      this.ctx.src = audioPath
      this.ctx.loop = !!track.loop
      
      console.log('AudioPlayer: src set, full path:', this.ctx.src)
      
      // play, resolve/reject handled on events
      try {
        console.log('AudioPlayer: attempting to play audio...')
        this.ctx.play()
        console.log('AudioPlayer: play() called successfully')
      } catch (err) {
        console.error('AudioPlayer: play() failed with error:', err)
        track.reject && track.reject(err)
        this.currentTrack = null
        this._processQueue()
      }
    },

    // called when current ctx ends naturally
    _onEnded() {
      const track = this.currentTrack
      if (track) {
        track.resolve && track.resolve({ finished: true })
        track.onComplete && track.onComplete()
      }
      this.currentTrack = null
      // process next in queue
      this._processQueue()
      this.$emit('ended')
    },

    _onError(e) {
      console.error('AudioPlayer error:', e)
      console.error('AudioPlayer error details:', JSON.stringify(e))
      console.error('Current audio src:', this.ctx ? this.ctx.src : 'N/A')
      const track = this.currentTrack
      if (track) {
        track.reject && track.reject(e)
      }
      this.currentTrack = null
      this._processQueue()
      this.$emit('error', e)
    },

    _onCanplay() {
      console.log('AudioPlayer can play:', this.ctx.src)
    },

    _onPlay() {
      console.log('AudioPlayer playing:', this.ctx.src)
      console.log('AudioPlayer duration:', this.ctx.duration)
      console.log('AudioPlayer currentTime:', this.ctx.currentTime)
    },

    _onWaiting() {
      console.log('AudioPlayer waiting:', this.ctx.src)
    },

    _onStop() {
      console.log('AudioPlayer stopped:', this.ctx.src)
    },

    // public API: play with priority handling
    play({ type = 'phonics', file, loop = false, onComplete = null } = {}) {
      if (!file) return Promise.reject(new Error('file is required'))
      const priority = this._priorityOf(type)
      return new Promise((resolve, reject) => {
        const track = { type, file, loop, priority, resolve, reject, onComplete }
        
        if (!this.isInitialized || !this.ctx) {
          console.warn('AudioPlayer: audio context not yet initialized, queuing track')
          this.queue.push(track)
          return
        }
        
        if (!this.currentTrack) {
          this._startTrack(track)
          return
        }
        if (priority > (this.currentTrack.priority || 0)) {
          try {
            this.currentTrack.reject && this.currentTrack.reject({ interrupted: true, by: type })
          } catch (e) {}
          this.currentTrack = null
          this._startTrack(track)
          return
        }
        this.queue.push(track)
      })
    },

    // stop current playback and clear queue
    stop(clearQueue = false) {
      if (this.ctx) {
        try { this.ctx.stop() } catch (e) {}
      }
      if (this.currentTrack) {
        try { this.currentTrack.reject && this.currentTrack.reject({ stopped: true }) } catch {}
        this.currentTrack = null
      }
      if (clearQueue) {
        // reject queued promises
        while (this.queue.length) {
          const t = this.queue.shift()
          try { t.reject && t.reject({ stopped: true }) } catch {}
        }
      }
    },

    pause() {
      if (this.ctx) {
        try { this.ctx.pause() } catch (e) {}
      }
    },

    resume() {
      if (this.ctx) {
        try { this.ctx.play() } catch (e) {}
      }
    },

    clearQueue() {
      while (this.queue.length) {
        const t = this.queue.shift()
        try { t.reject && t.reject({ cleared: true }) } catch {}
      }
    }
  },

  beforeUnmount() {
    if (this.ctx) {
      try { this.ctx.destroy() } catch {}
      this.ctx = null
    }
  }
}
</script>

<style scoped>
/* invisible component — methods exposed via ref */
</style>


