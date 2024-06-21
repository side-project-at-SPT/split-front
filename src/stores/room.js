import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/assets/api'
export const useRoomStore = defineStore('useRoomStore', () => {
  const rooms = ref([])
  const roomInfo = ref({})
  const getRooms = () => {
    return api.getRooms().then((res) => {
      rooms.value = res.rooms
    })
  }
  const createRoom = async (roomName) => {
    const data = await api.createRoom(roomName)
    getRooms()
    return data
  }
  const getRoomInfo = (roomId) => {
    return api.getRoomInfo(roomId).then((res) => {
      roomInfo.value = res.room
    })
  }
  const joinRoom = () => {
    return api.joinRoom(roomInfo.value.id)
  }
  const leaveRoom = () => {
    return api.leaveRoom(roomInfo.value.id)
  }
  const closeRoom = () => {
    return api.closeRoom(roomInfo.value.id).then(() => {
      clearRoomInfo()
    })
  }
  const clearRoomInfo = () => {
    getRooms()
    roomInfo.value = {}
  }
  return {
    rooms,
    roomInfo,
    getRooms,
    getRoomInfo,
    joinRoom,
    leaveRoom,
    closeRoom,
    createRoom,
    clearRoomInfo,
  }
})