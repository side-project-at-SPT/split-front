<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { usePublicStore } from '../stores/public'
import { useRoute } from 'vue-router'
const audioPlayer = ref(null)
const publicStore = usePublicStore()
const route = useRoute()
const audioPath = computed(() => {
  if (route.path.includes('/game')) {
    return '/game.mp3'
  }
  return '/room.mp3'
})
onMounted(() => {
  publicStore.audioPlayer = audioPlayer.value
})
watch(() => audioPath.value, () => {
  publicStore.reloadAudio()
})
</script>

<template>
  <audio
    ref="audioPlayer"
    autoplay
    loop
    volume="0.1"
  >
    <source
      :src="audioPath"
      type="audio/mpeg"
    >
    你的瀏覽器不支援 audio 元素。
  </audio>
</template>