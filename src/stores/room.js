import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/assets/api'
export const useRoomStore = defineStore('useRoomStore', () => {
  const rooms = ref([])
  const joinedRoomId = ref('')
  const roomInfo = computed(() => {
    return rooms.value.find((room) => room.id === joinedRoomId.value) || {}
  })
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
  // const getRoomInfo = (roomId) => {
  //   return api.getRoomInfo(roomId).then((res) => {
  //     roomInfo.value = res.room
  //   })
  // }
  const updateRoomPlayers = (roomData) => {
    const room = rooms.value.find((room) => room.id === roomData.id)
    if (room) {
      room.players = roomData.players
    }
  }
  const updateRoomData = (roomData) => {
    const room = rooms.value.find((room) => room.id === roomData.id)
    if (room) {
      room.status = roomData.status
      if (roomData.gameStartInSeconds){
        room.gameStartInSeconds = roomData.gameStartInSeconds
      }
      if (roomData.players){
        room.players = roomData.players
      }
    }
  }
  const joinRoom = (room) => {
    joinedRoomId.value = room.id
    // return api.joinRoom(roomInfo.value.id)
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
    joinedRoomId.value = ''
  }
  const addAiPlayer = () => {
    api.addAiPlayer(roomInfo.value.id)
    return undefined
  }
  return {
    rooms,
    roomInfo,
    joinedRoomId,
    getRooms,
    // getRoomInfo,
    updateRoomData,
    joinRoom,
    updateRoomPlayers,
    leaveRoom,
    closeRoom,
    createRoom,
    clearRoomInfo,
    addAiPlayer
  }
})