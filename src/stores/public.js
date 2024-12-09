import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createConsumer } from '@rails/actioncable'
export const usePublicStore = defineStore('usePublicStore', () => {
  const gaasToken = ref(null)
  const consumer = ref(null)
  const audioPlayer = ref(null)
  const musicPlaying = ref(false)
  const reloadAudio = () => {
    audioPlayer.value.load()
    if (musicPlaying.value)
      audioPlayer.value.play()
    else
      audioPlayer.value.pause()
  }
  const toggleAudio = () => {
    if (audioPlayer.value.paused) {
      audioPlayer.value.load()
      audioPlayer.value.play()
      musicPlaying.value = true
    }
    else {
      audioPlayer.value.pause()
      musicPlaying.value = false
    }
  }
  const initConnection = (token) => {
    const socketUrl = `wss://spt-games-split.zeabur.app/cable?token=${ token }`
    consumer.value = createConsumer(socketUrl)
    return consumer.value
  }
  return {
    consumer,
    gaasToken,
    audioPlayer,
    musicPlaying,
    initConnection,
    toggleAudio,
    reloadAudio
  }
})