import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createConsumer } from '@rails/actioncable'
export const usePublicStore = defineStore('usePublicStore', () => {
  const gaasToken = ref(null)
  const consumer = ref(null)
  const initConnection = (token) => {
    const socketUrl = `wss://spt-games-split.zeabur.app/cable?token=${ token }`
    consumer.value = createConsumer(socketUrl)
    return consumer.value
  }
  return {
    consumer,
    gaasToken,
    initConnection
  }
})