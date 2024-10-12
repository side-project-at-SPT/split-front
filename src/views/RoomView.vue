<script setup>
import {
  computed, onMounted, ref, toRefs, toRaw 
} from 'vue'
import api from '@/assets/api'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePublicStore } from '../stores/public'
import { useRoomStore } from '../stores/room'
import Aptenodytes from '@/assets/images/3.png'
import Eudyptes from '@/assets/images/4.png'
import Eudyptula from '@/assets/images/2.png'
import Papua from '@/assets/images/1.png'
import ChangeNicknameModal from '@/components/ChangeNicknameModal.vue'
import RoomPlayerSlide from '../components/RoomPlayerSlide.vue'

const penguins = [ Aptenodytes, Papua, Eudyptula, Eudyptes ]
const roles = [ 'Aptenodytes', 'Eudyptes', 'Eudyptula', 'Papua' ]
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
  getRooms, updateRoomPlayers, clearRoomInfo, joinRoom, updateRoomData, closeRoom,
} = roomStore
// const {
//   getRooms, updateRoomPlayers, clearRoomInfo, joinRoom, updateRoomData, closeRoom, addAiPlayer
// } = roomStore
const { params, query } = useRoute()
let { roomId } = params
roomId = Number(roomId)
const { token: queryGaasToken } = query
const defaultChoseAvatar = ref()
if (queryGaasToken){
  gaasToken.value = queryGaasToken
  localStorage.setItem('token', queryGaasToken)
}
const trueToken = ref(localStorage.getItem('token'))
const handleChangeRole = (index) => {
  roomChannel.send({ action: 'set_character', character: roles[index] }) 
}
const roomMe = computed(() => roomInfo.value.players?.find((player) => player.id === user.value.id) || {})
const playerNum = computed(() => roomInfo.value.players?.length || 1)
const showChangeNicknameModal = ref(false)
// const aiPlayerJoined = ref(false)
const handleReadyChange = computed(() => { 
  if (roomMe.value.is_ready) {
    return function (){ return roomChannel.send({ action: 'cancel_ready' })}
  }
  return function (){ return roomChannel.send({ action: 'ready' })}
})
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
  
  if (isGaasRoom.value){
    // Gaas room離開時要做什麼事？？？
  }
  else if (roomInfo.value?.players && roomInfo.value?.players.length <= 1) {
    closeRoom().catch(() => {
      // showErrorMessage(error.error)
    })
    console.log(roomInfo.value)
    router.push('/')
  }
  clearRoomInfo()
}

// const handleAddAiPlayer = async () => {
//   await addAiPlayer()
//   aiPlayerJoined.value = true
// }
let roomChannel = null

onMounted(async () => {
  if (!gaasToken.value && sessionStorage.getItem('gaasToken')){
    gaasToken.value = sessionStorage.getItem('gaasToken')
  }
  if (gaasToken.value) {
    api.setToken(gaasToken.value)
    trueToken.value = gaasToken.value
  }
  if (!consumer){
    initConnection(trueToken.value)
    consumer = toRaw(publicStore.consumer)
    getUserInfo()
    getRooms()
    initRoomChannel()
  }
  else {
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
      // 隨機選一個角色
      const randomIndex = Math.floor(Math.random() * roles.length)
      defaultChoseAvatar.value = randomIndex
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
    }
  })
}

</script>

<template>
  <div class="roomBackground w-screen h-screen relative pt-10">
    <ChangeNicknameModal v-model="showChangeNicknameModal" />
    <div class="relative">
      <button
        class="w-[62px] h-[62px] absolute  left-10 rounded-[50%] bg-[url(@/assets/roomPLayers/goBackButton.jpg)]"
        @click="handleLeaveRoom"
      ></button>
      <div
        class="title"
      >
        請選擇你的企鵝
      </div>
    </div>
    <div class="flex justify-center mt-[50px]">
      <RoomPlayerSlide
        :name="user.nickname"
        :image-key="defaultChoseAvatar"
        :chose-lock="roomMe.is_ready"
        @chose-player="(value)=>handleChangeRole(value)"
        @change-name="()=> showChangeNicknameModal = true "
      />
    </div>

    <div class="h-1/4 w-full bg-[#0F2A30E5] absolute bottom-0 flex items-center justify-evenly">
      <div class="flex items-center">
        <div class="text-white font-normal mr-10">
          <p class="text-base mb-3">
            玩家數量
          </p>
          <p
            class="font-medium text-xl "
            style="text-align: justify;
  text-align-last: justify;
  text-justify: distribute-all-lines;"
          >
            共{{ playerNum }}名
          </p>
        </div>
        <div class="flex w-[504px] h-full">
          <div
            v-for="(player) in roomInfo.players"
            :key="player.id"
            class="w-32 h-32 flex flex-col justify-center items-center"
          >
            {{ penguins.find((item)=> String(item) === player.character) }}
            <div
              :class="`avatarBackground ${player.is_ready? 'bg-white':'notReadyBackground'}`"
            >
              <img
                class="avatarImage"
                :src="penguins[roles.indexOf(player.character)]"
                alt=""
              >
            </div>
          
            <div class="mt-2 w-full flex items-center justify-center">
              <img
                v-if="player.is_ready"
                src="@/assets/roomPLayers/ready.svg"
                alt="ready"
                class="max-w-5 max-h-5 mr-2"
              >
              <p class="text-white">
                {{ player.nickname }}
              </p>
            </div>
          </div>
        </div>
        <!-- <div class="text-sm flex items-center justify-center gap-1">
            <div
              v-if="!aiPlayerJoined"
              class="cursor-pointer px-5 py-3"
              @click="handleAddAiPlayer"
            >
              加入 AI
            </div>
          </div> -->
      </div>  
      <div
        v-if="roomInfo.status === 'starting'"
        class="text-[#83FFDC] flex items-center justify-between w-[500px]"
      >
        <div class="mr-24">
          <p>全員就緒</p>
          <p class="text-xl mt-5 font-medium">
            {{ roomInfo.name }}
          </p>
        </div>
        <p>
          <span class="font-medium mr-2">
            {{ roomInfo.gameStartInSeconds }}
          </span>
          秒後開始遊戲 ...
        </p>
      </div>

      <div
        v-else
        class="flex items-center justify-between w-[500px]"
      >
        <div class="text-white">
          <p>等待玩家就緒中</p>
          <div class="flex items-center mt-5">
            <p class="mr-5 text-xl font-medium">
              {{ roomInfo.name }}
            </p>
            <!-- <button
              class="bg-[url(@/assets/roomPlayers/edit.svg)] bg-center bg-cover w-5 h-5"
              @click="() => {showChangeNicknameModal = true}"
            ></button> -->
          </div>
        </div>
        <button
          v-if="roomInfo.status !== 'starting'"
          :class="`${roomMe.is_ready?'cancelReadyButton':'readyButton'} text-xl ml-24 w-[140px] h-[50px] rounded-[30px]`"
          @click="handleReadyChange"
        >
          {{ roomMe.is_ready?'取消準備':'我準備好了' }}
        </button>
      </div>
    </div>
    
    <svg>
      <defs>
        <clipPath id="avatarClip">
          <path
            d="M82.4 42.8989C82.4 75.1473 73.6129 82 41.4 82C9.18712 82 0.400024 73.2032 0.400024 40.9548C0.400024 8.70636 9.18712 0 41.4 0C73.6129 0 82.4 10.6504 82.4 42.8989Z"
            fill="white"
          ></path>
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.roomBackground {
  background: linear-gradient(180deg, #27b8e0 0%, #b2efff 100%);
}

.title {
  position: relative;
  z-index: 1;
  width: 580px;
  height: 84px;
  margin: 0 auto 0 auto;
  font-size: 30px;
  font-weight: 500;
  line-height: 76px;
  color: #006989;
  text-align: center;
  background: linear-gradient(180deg, #ffffffff 0%, #daffffff 100%);
  border: 4px solid #ffffff;
  border-radius: 24px;
  box-shadow: 0px 4px 0px 0px #27b8e0;
}

.title::before {
  content: '';
  position: absolute;
  top: -40px;
  left: 50%;
  z-index: -1;
  width: 312px;
  height: 300px;
  clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
  background: radial-gradient(134.28% 140.37% at 57.69% -38.05%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, .05) 2%, rgba(255, 255, 255, .17) 6%, rgba(255, 255, 255, .36) 12%, rgba(255, 255, 255, .64) 18%, rgba(255, 255, 255, .98) 25%, #ffffff 26%, rgba(255, 255, 255, .76) 41%, rgba(255, 255, 255, .44) 62%, rgba(255, 255, 255, .2) 80%, rgba(255, 255, 255, .06) 93%, rgba(255, 255, 255, 0) 100%);
  transform: translate(-50%, 0%);
}

.avatarBackground {
  position: relative;
  width: 82px;
  height: 82px;
  clip-path: url('#avatarClip');
}

.notReadyBackground::before {
  content: '未準備';
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
  font-size: 20px;
  line-height: 4;
  color: #ffffffc4;
  text-align: center;
  background-color: #778b8f8a;
}

.readyButton {
  width: 140px;
  height: 50px;
  color: #982000;
  text-shadow: 0px 0px 4px 0px #fff7ae;
  background: linear-gradient(180deg, #fffbd6 0%, #ffba39 100%);
  border-radius: 30px;
  box-shadow: 0px 4px 0px 0px #ff9200;
}

.cancelReadyButton {
  color: #ffff;
  background: linear-gradient(180deg, #afb7b9 0%, #6b7375 100%);
  border: 1px solid #dbdfe0;
}
</style>