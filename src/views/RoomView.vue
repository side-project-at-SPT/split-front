<script setup>
import {
  computed, onMounted, ref, toRefs, toRaw 
} from 'vue'
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
import RoomButton from '@/components/RoomButton.vue'
const penguins = [ Tux, Gunter, Sin, Abc ]
const roles = [ 'tux', 'gunter', 'abc', 'sin' ]
const publicStore = usePublicStore()
const userStore = useUserStore()
const roomStore = useRoomStore()
const router = useRouter()
const { gaasToken } = toRefs(publicStore)
let consumer = toRaw(publicStore.consumer)
const { initConnection } = publicStore
const { user } = toRefs(userStore)
const { getUserInfo } = userStore
const { roomInfo } = toRefs(roomStore)
const {
  getRooms, updateRoomPlayers, clearRoomInfo, joinRoom, updateRoomData, closeRoom, addAiPlayer
} = roomStore
const { params, query } = useRoute()
let { roomId } = params
roomId = Number(roomId)
const { token: queryGaasToken } = query
if (queryGaasToken){
  gaasToken.value = queryGaasToken
  localStorage.setItem('token', queryGaasToken)
}
const trueToken = ref(localStorage.getItem('token'))
const handleChangeRole = (index) => {
  roomChannel.send({ action: 'set_character', character: roles[index] }) 
}
const roomMe = computed(() => {
  return roomInfo.value.players?.find((player) => player.id === user.value.id) || {}
})

const showChangeNicknameModal = ref(false)
const aiPlayerJoined = ref(false)
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
  // roomChannel.send({ action: 'leave_room' })
  // roomChannel.unsubscribe()
  if (consumer){
    consumer.subscriptions.remove(roomChannel)
    console.log(consumer, 'consumer')
  }
  clearRoomInfo()
  if (isGaasRoom.value){
    // Gaas room離開時要做什麼事？？？
  }
  else {
    router.push('/')
  }
}
const handleCloseRoom = async () => {
  closeRoom().catch(() => {
    // showErrorMessage(error.error)
  })
  router.push('/')
}
const handleAddAiPlayer = async () => {
  await addAiPlayer()
  aiPlayerJoined.value = true
  console.log('add ai player success')
}
let roomChannel = null
// let publicStoreRoomChannel = null
// let consumer = null
onMounted(async () => {
  console.log('roomId', roomId)
  console.log('gaasToken: ', gaasToken.value)
  if (!gaasToken.value && sessionStorage.getItem('gaasToken')){
    gaasToken.value = sessionStorage.getItem('gaasToken')
  }
  if (gaasToken.value) {
    api.setToken(gaasToken.value)
    trueToken.value = gaasToken.value
  }
  if (!consumer){
    console.log('no consumer')
    initConnection(trueToken.value)
    consumer = toRaw(publicStore.consumer)
    getUserInfo()
    getRooms()
    initRoomChannel()
  }
  else {
    console.log('has consumer')
    initRoomChannel()
  }
  joinRoom({ id: roomId })
})
const initRoomChannel = () => {
  // 檢查是否已經訂閱過該房間
  if (consumer.subscriptions.findAll(`{"channel":"RoomChannel","room_id":${ roomId }}`).length > 0){
    roomChannel = consumer.subscriptions.findAll(`{"channel":"RoomChannel","room_id":${ roomId }}`)[0]
    roomChannel.send({ action: 'cancel_ready' }) 
    return
  }
  roomChannel = consumer.subscriptions.create({ channel: 'RoomChannel', room_id: roomId }, {
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
      else if (data.event === 'room_closed') {
        handleLeaveRoom()
      }
      console.log(data, 'data room channel', roomId)
    }
  })
}
const buttonConfig = computed(() => [
  {
    text: !roomMe.value.is_ready ? '準備' : '取消準備',
    onClick: !roomMe.value.is_ready ? handleReady : handleCancelReady,
  },
  {
    text: '離開房間',
    isShow: !gaasToken.value,
    onClick: handleLeaveRoom
  },
  {
    text: '修改暱稱',
    onClick: () => {showChangeNicknameModal.value = true}
  },
  {
    text: '關閉房間',
    onClick: handleCloseRoom
  }
])

</script>

<template>
  <div
    class="flex justify-center"
  >
    <ChangeNicknameModal v-model="showChangeNicknameModal" />
    <div class="flex flex-col gap-2 justify-center items-center hexagon-ice w-[480px] h-[480px]">
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
            <div
              :class="player.character"
              class="h-8 w-8"
            ></div>
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
        <div class="text-sm flex items-center justify-center gap-1">
          <div
            v-if="!aiPlayerJoined"
            class="cursor-pointer px-5 py-3"
            @click="handleAddAiPlayer"
          >
            加入 AI
          </div>
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
            <div
              :class="roles[index - 1]"
              class="h-8 w-8"
            ></div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center gap-1">
        <RoomButton
          v-for="{ text,isShow,onClick } in buttonConfig"
          :key="text"
          :text="text"
          :is-show="isShow"
          @on-click="onClick"
        />
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

.tux {
  background-image: url('@/assets/images/papua.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.gunter {
  background-image: url('@/assets/images/eudyptula.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.abc {
  background-image: url('@/assets/images/aptenodytes.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.sin {
  background-image: url('@/assets/images/eudyptes.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
</style>