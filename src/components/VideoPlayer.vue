<script setup lang="ts">
import 'video.js/dist/video-js.css'
import 'videojs-youtube'
import videojs from 'video.js'
import { defineProps, ref, withDefaults, onMounted, computed, onUnmounted, defineEmits } from 'vue'
import Player from 'video.js/dist/types/player'
import VimeoPlayer from '@vimeo/player'
import type { TimeUpdateEvent } from '@vimeo/player'

const props = withDefaults(
  defineProps<{
    options?: any
    playbackRates?: number[]
    autoplay?: boolean
    controls?: boolean
    preload?: 'auto' | 'metadata' | 'none'
    responsive?: boolean
    fluid?: boolean
    displayNegative?: boolean
    forward?: number
    backward?: number
    nativeControlsForTouch?: boolean
    poster?: string
    src: string
    startTime?: number
    width?: number
    loop?: boolean
  }>(),
  {
    playbackRates: () => [0.5, 1, 1.5, 2],
    controls: true,
    preload: 'auto',
    responsive: true,
    fluid: true,
    forward: 5,
    backward: 10,
    nativeControlsForTouch: true,
    startTime: 0
  }
)

const emit = defineEmits<{
  (e: 'onEnded', value?: number): void
  (e: 'onPaused', value?: number): void
  (e: 'onPlay', value?: number): void
  (e: 'onMute', value?: boolean): void
}>()

const videoPlayer = ref<HTMLVideoElement | null>(null)
const vimeoPlayer = ref<HTMLDivElement | null>(null)
const vimeoWrapper = ref<HTMLDivElement>()

const player = ref<Player | null>(null)
const isFinishedVideo = ref(false)
const src = computed(() => props.src)
const isYoutube = computed(() => isYouTubeLink(src.value))
const isVimeo = computed(() => src.value.includes('vimeo'))
const width = computed(() => props.width)
const autoplay = computed(() => props.autoplay)
const loop = computed(() => props.loop)
const source = computed(() => {
  if (!src.value && isVimeo.value) {
    return ''
  }
  if (isYoutube.value) {
    return {
      src: src.value,
      type: 'video/youtube'
    }
  }
  return {
    src: src.value,
    type: 'video/mp4'
  }
})
const startTime = computed(() => props.startTime)
const options = computed(() => {
  return {
    autoplay: props.autoplay,
    controls: props.controls,
    nativeControlsForTouch: props.nativeControlsForTouch,
    preload: props.preload,
    responsive: props.responsive,
    enableDocumentPictureInPicture: true,
    enableSmoothSeeking: true,
    playbackRates: props.playbackRates,
    fluid: props.fluid,
    loop: props.loop,
    controlBar: {
      remainingTimeDisplay: {
        displayNegative: props.displayNegative
      },
      skipButtons: {
        forward: props.forward,
        backward: props.backward
      }
    },
    poster: props.poster,
    sources: [source.value],
    techOrder: ['youtube', 'html5'],
    nativeVideoTracks: true,
    preloadTextTracks: true,
    ...props.options
  }
})

const isYouTubeLink = (url: string) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
  return youtubeRegex.test(url)
}

const handleSetTime = () => {
  if (!player.value) {
    return
  }
  player.value.currentTime(startTime.value)
}

const handleGetDuration = (time?: number) => {
  if (!time || time === 0) {
    return
  }
  emit('onPlay', time)
}

const handlePlayerPause = (time?: number) => {
  emit('onPaused', time)
}

const handlePlayerEnded = (time?: number) => {
  emit('onEnded', time)
}

const handlePlayerVolumeChange = () => {
  if (!player.value) {
    return
  }
  emit('onMute', player.value.muted())
}

const destroyPlayer = () => {
  if (player.value) {
    player.value.dispose()
  }
}

// Youtube and MP4 Player
const handleInitializePlayer = () => {
  if (!videoPlayer.value) {
    return
  }
  player.value = videojs(videoPlayer.value, options.value)

  player.value.ready(() => {
    handleSetTime()
  })

  if (isYoutube.value) {
    player.value.on('loadedmetadata', handleSetTime)
  }

  player.value.on('play', () => handleGetDuration(player.value?.currentTime()))
  player.value.on('pause', () => handlePlayerPause(player.value?.currentTime()))
  player.value.on('ended', () => handlePlayerEnded(player.value?.currentTime()))
  player.value.on('volumechange', () => handlePlayerVolumeChange)
}

// Extract ID from vimeo link
const getVideoIdFromUrl = (url: string): string => {
  if (url.includes('video')) {
    const match = url.match(/video\/(\d+)/)
    return match ? match[1] : ''
  }

  const vimeoRegex = /https?:\/\/(?:www\.)?vimeo.com\/(\d+)/

  // Test the URL and extract the video ID if it matches
  const match = url.match(vimeoRegex)
  return match ? match[1] : ''
}

// Vimeo Player
const handleInitializeVimeoPlayer = () => {
  if (!vimeoPlayer.value) {
    return
  }
  const playerVimeo = new VimeoPlayer(vimeoPlayer.value, {
    id: getVideoIdFromUrl(src.value), // Vimeo video ID
    width: width.value ?? vimeoWrapper.value?.clientWidth,
    autoplay: autoplay.value,
    loop: loop.value
  })

  playerVimeo.setCurrentTime(startTime.value)

  playerVimeo.on('play', function (event: TimeUpdateEvent) {
    isFinishedVideo.value = false
    handleGetDuration(event.seconds)
  })

  playerVimeo.on('ended', function (event: TimeUpdateEvent) {
    isFinishedVideo.value = true
    handlePlayerEnded(event.seconds)
    playerVimeo.pause()
  })

  playerVimeo.on('pause', function (event: TimeUpdateEvent) {
    if (isFinishedVideo.value) {
      return
    }
    handlePlayerPause(event.seconds)
  })
}

onMounted(() => {
  if (!isVimeo.value) {
    handleInitializePlayer()
  }
  if (isVimeo.value) {
    handleInitializeVimeoPlayer()
  }
})

onUnmounted(() => {
  destroyPlayer()
})
</script>

<template>
  <div class="rev-video-player">
    <video v-if="!isVimeo" ref="videoPlayer" class="video-js vjs-default-skin"></video>
    <div class="rev-vimeo-video-player" v-if="isVimeo" ref="vimeoWrapper">
      <div ref="vimeoPlayer" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>

<style>
.rev-video-player {
  width: 100%;
  height: 100%;
}

.rev-vimeo-video-player {
  width: 100%;
  height: 100%;
}
</style>
