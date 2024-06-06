<script setup lang="ts">
import VideoPlayer from './components/VideoPlayer.vue'
</script>

<template>
  <VideoPlayer
    poster="https://lms-v3-staging.s3.amazonaws.com/default/lms-default-content-thumbnail.jpg"
    src="https://lms-v3.s3.amazonaws.com/unit-videos/d7143e2f-3bc9-410f-b1b1-89889be2ec75"
    :start-time="20"
  />
</template>

<style scoped></style>
