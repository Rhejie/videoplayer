import { VideoPlayer } from './component'
import type { App } from 'vue'

export default {
  install: (app: App) => {
    app.component('VideoPlayer', VideoPlayer)
  }
}

export { VideoPlayer }
