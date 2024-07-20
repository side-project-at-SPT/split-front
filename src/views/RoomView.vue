<script setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import api from '@/assets/api'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePublicStore } from '../stores/public'
import { useRoomStore } from '../stores/room'
import Tux from '@/assets/images/tux.png'
import Gunter from '@/assets/images/gunter.png'
import Sin from '@/assets/images/sin.png'
import Abc from '@/assets/images/abc.png'
import ChangeNicknameModal from '@/components/ChangeNicknameModal.vue'
const penguins = [ Tux, Gunter, Sin, Abc ]
const roles = [ 'tux', 'gunter', 'sin', 'abc' ]
const publicStore = usePublicStore()
const userStore = useUserStore()
const roomStore = useRoomStore()
const router = useRouter()
const { consumer, gaasToken } = toRefs(publicStore)
const { initConnection } = publicStore
const { user } = toRefs(userStore)
const { getUserInfo } = userStore
const { roomInfo } = toRefs(roomStore)
const {
  getRooms, updateRoomPlayers, clearRoomInfo, joinRoom, updateRoomData, closeRoom
} = roomStore
const { params, query } = useRoute()
let { roomId } = params
roomId = Number(roomId)
const { token: queryGaasToken } = query
if (queryGaasToken){
  gaasToken.value = queryGaasToken
}
const trueToken = ref(localStorage.getItem('token'))
const handleChangeRole = (index) => {
  roomChannel.send({ action: 'set_character', character: roles[index] }) 
}
const roomMe = computed(() => {
  return roomInfo.value.players?.find((player) => player.id === user.value.id) || {}
})

const showChangeNicknameModal = ref(false)
const handleReady = async () => {
  console.log('ready')
  roomChannel.send({ action: 'ready' }) 
}
const handleCancelReady = async () => {
  console.log('cancel ready')
  roomChannel.send({ action: 'cancel_ready' }) 
}
const isGaasRoom = computed(() => {
  return !!gaasToken.value
})
const handleLeaveRoom = async () => {
  consumer.value.subscriptions.remove(roomChannel)
  clearRoomInfo()
  if (isGaasRoom.value){
    // Gaas room離開時要做什麼事？？？
  }
  else {
    router.push('/')
  }
}
const handleCloseRoom = async () => {
  closeRoom().catch((error) => {
    showErrorMessage(error.error)
  })
  // if (isGaasRoom.value){
  //   api.closeGaasGame(roomId, trueToken.value)
  // }
  // else {
  router.push('/')
  // }
}
let roomChannel = null
onMounted(async () => {
  console.log('roomId', roomId)
  console.log('gaasToken: ', gaasToken.value)
  if (gaasToken.value) {
    api.setToken(gaasToken.value)
    const res = await api.getTokenFromGaas()
    console.log('res getTokenFromGaas', res)
    trueToken.value = res.token
  }
  if (!consumer.value){
    initConnection(trueToken.value)
    getUserInfo()
    getRooms()
  }
  joinRoom({ id: roomId })
  roomChannel = consumer.value.subscriptions.create({ channel: 'RoomChannel', room_id: roomId }, {
    connected () {
      console.log('connected room channel', roomId)
      // 隨機選一個角色
      const randomIndex = Math.floor(Math.random() * roles.length)
      handleChangeRole(randomIndex)
      getRooms()
    },
    disconnected () {
      console.log('disconnected room channel', roomId)
    },
    received (data) {
      if (data.event === 'room_updated') {
        const roomData = {
          id: roomId,
          // gameStartInSeconds: data.seconds,
          status: data.status,
          players: data.players
        }
        updateRoomData(roomData)
      }
      else if (data.event === 'game_start_in_seconds') {
        const roomData = {
          id: roomId,
          gameStartInSeconds: data.seconds,
          status: 'starting'
        }
        updateRoomData(roomData)
      }
      else if (data.event === 'starting_game_is_cancelled'){
        const roomData = {
          id: roomId,
          gameStartInSeconds: 5,
          status: 'waiting'
        }
        updateRoomData(roomData)
      }
      else if (data.event === 'ready' || data.event === 'cancel_ready') {
        roomInfo.value.players.forEach((player) => {
          if (player.id === data.player.id
          ) {
            player.is_ready = data.player.is_ready
          }
        })
      }
      else if (data.event === 'set_character'){
        const roomData = {
          id: roomId,
          players: data.players
        }
        updateRoomPlayers(roomData)
      }
      else if (data.event === 'game_started') {
        const gameId = data.game_id
        router.push(`/game/?game_id=${ gameId }&room_id=${ roomId }`)
      }
      // else if (data.event === 'join_room') {
      //   const roomData = {
      //     id: roomId,
      //     players: [ ...roomInfo.value.players, data.player ]
      //   }
      //   updateRoomPlayers(roomData)
      // }
      console.log(data, 'data room channel', roomId)
    }
  })
})
</script>

<template>
  <div
    class="flex justify-center"
  >
    <ChangeNicknameModal v-model="showChangeNicknameModal" />
    <div class="flex flex-col gap-2 justify-center items-center hexagon-ice w-[360px] h-[360px]">
      <div class="p-4 text-2xl">
        {{ roomInfo.name }}
        <div
          v-if="roomInfo.status === 'starting'"
          class="text-red"
        >
          {{ roomInfo.gameStartInSeconds }}秒後即將開始
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 items-center justify-center">
        <div
          v-for="(player, index) in roomInfo.players"
          :key="player.id"
          class="text-sm flex items-center justify-center gap-1"
        >
          <div
            v-if="player.is_ready"
            class="text-red"
          >
            <img
              src="/src/assets/vue.svg"
              class="w-6 h-6 object-contain"
            >
          </div>
          <div
            v-if="roles.indexOf(player.character) != -1"
            class="h-8 w-8"
          >
            <img
              :src="penguins[roles.indexOf(player.character)]"
              class="w-full h-full object-contain"
            >
          </div>
          <div
            v-else
            class="h-8 w-8"
          >
            <img
              :src="penguins[index % 4]"
              class="w-full h-full object-contain"
            >
          </div>
          <div>{{ player.nickname }}</div>
        </div>
      </div>
      <div>
        <div>選擇角色</div>
        <div class="flex">
          <div
            v-for="index in 4"
            :key="index"
            class="h-8 w-8"
            @click="handleChangeRole(index - 1)"
          >
            <img
              :src="penguins[index - 1]"
              class="w-6 h-6 object-contain"
            >
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center gap-1">
        <div
          v-if="!roomMe.is_ready"
          class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="handleReady"
        >
          準備
        </div>
        <div
          v-else
          class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="handleCancelReady"
        >
          取消準備
        </div>
        <div
          class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="handleLeaveRoom"
        >
          離開
        </div>
        <div
          class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="showChangeNicknameModal = true"
        >
          修改暱稱
        </div>
        <div
          class="hexagon-ice w-[75px] h-[75px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="handleCloseRoom"
        >
          關閉
        </div>
        <!-- 
            <div
              class="hexagon-ice w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="handleBackRooms"
            >
              返回
            </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
  .hexagon-ice {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
  }

  .new-room {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background-image: linear-gradient(to bottom right, #cae5ff, #87b0ca);
  }

  .hexagon-div {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
</style>