<script setup>
import {
  ref, onMounted, toRefs,
  toRaw, watchEffect
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublicStore } from '../stores/public'
import { useUserStore } from '../stores/user'
import GameOverModal from '@/components/GameOverModal.vue'
import api from '@/assets/api'
import GameRuleModal from '../components/GameRuleModal.vue'
import TurnAnimation from '../components/TurnAnimation.vue'
import PlayerAvatar from '../components/PlayerAvatar.vue'
import IcePasture from '../components/IcePasture.vue'
import useGame from '@/composables/useGame'
const {
  gameStatus, pastures, originPasure, targetPasure, currentPlayer, myTurn, finalPlayers, orderedPlayers, needPutCharacter, myCharacter, initGame, showAllowedTarget, hideAllowedTarget
} = useGame()
const publicStore = usePublicStore()
const userStore = useUserStore()
// const { consumer } = toRefs(publicStore)
let consumer = toRaw(publicStore.consumer)
const { initConnection } = publicStore
const { user } = toRefs(userStore)
const { getUserInfo } = userStore
const route = useRoute()
const router = useRouter()
console.log(route.query.roomId)
const gameId = ref(route.query.game_id)
const roomId = route.query.room_id
const initing = ref(false)
// initialize pastures
// for (let x = 0; x < 5; x++)
//   for (let y = 0; y < 5; y++)
//     pastures.value.push({
//       x, y, amount: 0, selected: false
//     })
let gameChannel = null
const getGameStatus = async () => {
  const data = await api.getGameStatus(gameId.value)
  // mock
  // const mockPastures = [
  //   { x: 1, y: 3, stack: { amount: 0 } },
  //   { x: 2, y: 3, stack: { amount: 0 } },
  //   { x: 3, y: 3, stack: { amount: 0 } },
  //   { x: 4, y: 3, stack: { amount: 0 } },
  //   { x: 5, y: 3, stack: { amount: 0 } },
  //   { x: 0, y: 4, stack: { amount: 0 } },
  //   { x: 0, y: 5, stack: { amount: 0 } },
  //   { x: 1, y: 5, stack: { amount: 0 } },
  //   { x: 2, y: 5, stack: { amount: 0 } },
  //   { x: 3, y: 5, stack: { amount: 0 } },
  //   { x: 4, y: 5, stack: { amount: 0 } },
  //   { x: 0, y: 6, stack: { amount: 0 } },
  //   { x: 1, y: 6, stack: { amount: 0 } },
  //   { x: 2, y: 6, stack: { amount: 0 } },
  //   { x: 3, y: 6, stack: { amount: 0 } },
  //   { x: 4, y: 6, stack: { amount: 0 } },
  //   { x: 0, y: 7, stack: { amount: 0 } },
  //   { x: 1, y: 7, stack: { amount: 0 } },
  //   { x: 2, y: 7, stack: { amount: 0 } },
  //   { x: 3, y: 7, stack: { amount: 0 } },
  //   { x: 4, y: 7, stack: { amount: 0 } },
  // ]
  // data.game.game_data.pastures = mockPastures
  gameStatus.value = data.game
  return data
}

onMounted(() => {
  // const users = ref(Number(route.query.users || 2))
  if (!consumer){
    const token = localStorage.getItem('token')
    initConnection(token)
    consumer = toRaw(publicStore.consumer)
    getUserInfo()
  }
  gameChannel = consumer.subscriptions.create({ channel: 'GameChannel', game_id: gameId.value }, {
    connected () {
      console.log('connected game channel', gameId.value)
    },
    disconnected () {
      console.log('disconnected game channel', gameId.value)
    },
    received (data) {
      if (data.event === 'player_joined_game') {
        // players.value = data.player_state
        console.log(data, 'game player_joined_game', pastures.value.length)
        // pastures.value.length 用這個判斷有優化空間
        if (!initing.value){
          initing.value = true
          // const pastureAmount = players.value.length * 16
          // initPastures(pastureAmount)
          // console.log(players.value, 'players')
          getGameStatus().then(() => {
            initGame()
            // gameStatus.value = 
            // gameStatus.value.game_data.pastures.forEach(pasture => {
            //   addPasture({ x: pasture.x, y: pasture.y })
            //   checkAllIsEdge()
            // })
            // // 放置初始位置
            // for (let i = 0; i < players.value.length; i++){
            //   let pasture = getAEdgePasture()
            //   while (pasture.owner){
            //     pasture = getAEdgePasture()
            //   }
            //   pasture.amount = 16
            //   pasture.owner = players.value[i]
            // }
          }).catch(error => {
            if (error.error == 'Failed to authenticate'){
              alert('請重新登入')
              router.push('/')
            }
          })
        }
      }
      else if (data.event === 'game_over'){
        gameOver.value = true
      }
      else if (data.event === 'stack_placed' || data.event === 'stack_splitted') {
        gameStatus.value.game_data = data.game_data
        originPasure.value = null
        targetPasure.value = null
      }
      else if (data.type === 'move_sheep') {
        if (data.actionPlayer === user.value.id) return
        moveItem({
          from: data.from, to: data.to, character: data.character
        })
        if (data.direction === 'go'){
          originPasure.value.amount--
          targetPasure.value.amount++
        }
        else if (data.direction === 'back'){
          originPasure.value.amount++
          targetPasure.value.amount--
        }
      }
      else if (data.type === 'set_origin_pasure') {
        if (data.actionPlayer === user.value.id) return
        originPasure.value = data.pasture
        originPasure.value.selected = true
        // showAllowedTarget()
      }
      else if (data.type === 'set_target_pasure') {
        if (data.actionPlayer === user.value.id) return
        targetPasure.value = data.pasture
        targetPasure.value.selected = true
      }
      else if (data.type === 'cancel_action') {
        if (data.actionPlayer === user.value.id) return
        targetPasure.value = null
        originPasure.value = null
      } 
      console.log(data, 'data game channel', gameId.value)
    }
  })
  getGameStatus().catch(error => {
    if (error.error == 'Failed to authenticate'){
      alert('請重新登入')
      router.push('/')
    }
  })
})

watchEffect(() => {
  if (myTurn.value){
    showTurnAnimation.value = true
  }
})

const setFirstPasture = (pasture) => {
  console.log(`put character x:${ pasture.x }, y:${ pasture.y } `)
  gameChannel.send({ action: 'place_stack', x: pasture.x, y: pasture.y })
}
let originAmount = 0
let targetAmount = 0
const handleClick = (pasture) => {
  // 是否為選擇起始位置動作
  if (!myTurn.value) return 
  if (needPutCharacter.value){
    if (pasture.owner || !pasture.isEdge) return
    setFirstPasture(pasture)
    return
  }
  if (!originPasure.value) {
    // console.log(pasture, currentPlayer.value)
    if (pasture.owner?.id !== currentPlayer.value.id) return
    if (pasture.amount < 2) return
    originPasure.value = { ...pasture }
    gameChannel.send({ type: 'set_origin_pasure', pasture, actionPlayer: user.value.id })
    originAmount = pasture.amount
    pasture.selected = !pasture.selected
    // 顯示合法目的地
    showAllowedTarget()
    return
  }
  if (originPasure.value === pasture && !targetPasure.value) {
    handleCancel()
    return
  }
  if (!targetPasure.value) {
    if (!pasture.isAllowTarget) return
    targetPasure.value = { ...pasture }
    gameChannel.send({ type: 'set_target_pasure', pasture: { ...pasture, owner: originPasure.value.owner }, actionPlayer: currentPlayer.value.id })
    targetAmount = pasture.amount
    pasture.selected = !pasture.selected
    targetPasure.value.owner = originPasure.value.owner
    // 取消顯示合法目的地
    hideAllowedTarget()
    // 選中先送一隻過去
    originPasure.value.amount--
    moveItem({
      from: originPasure.value, to: targetPasure.value, character: originPasure.value.owner.character
    })
    gameChannel.send({
      type: 'move_sheep', from: { x: originPasure.value.x, y: originPasure.value.y }, to: { x: targetPasure.value.x, y: targetPasure.value.y }, character: originPasure.value.owner.character, actionPlayer: user.value.id, direction: 'go'
    })
    return
  }
  // 如果有選擇來源的牧場，且來源牧場有羊，則移動羊到目標牧場
  if (targetPasure.value.x === pasture.x && targetPasure.value.y === pasture.y) {
    if (originPasure.value && originPasure.value.amount > 1) {
      originPasure.value.amount--
      moveItem({
        from: originPasure.value, to: targetPasure.value, character: originPasure.value.owner.character
      })
      gameChannel.send({
        type: 'move_sheep', from: { x: originPasure.value.x, y: originPasure.value.y }, to: { x: targetPasure.value.x, y: targetPasure.value.y }, character: originPasure.value.owner.character, actionPlayer: user.value.id, direction: 'go'
      })
    }
    return
  }
  if (originPasure.value.x === pasture.x && originPasure.value.y === pasture.y) {
    // 往回走
    if (targetPasure.value && targetPasure.value.amount > 1) {
      targetPasure.value.amount--
      moveItem({
        from: targetPasure.value, to: originPasure.value, character: originPasure.value.owner.character
      })
      gameChannel.send({
        type: 'move_sheep', from: { x: targetPasure.value.x, y: targetPasure.value.y }, to: { x: originPasure.value.x, y: originPasure.value.y }, character: originPasure.value.owner.character, actionPlayer: user.value.id, direction: 'back'
      })
    }
  }
}
const moveItem = ({
  from, to, character
}) => {
  // 在 pasture-table 新增一個羊
  const newDiv = document.createElement('div')
  newDiv.style.left = `calc(${ from.x * 105 }px + ${ from.y * 105 }px * sin(30deg) + 7px)`
  newDiv.style.top = `calc(${ from.y * 105 }px * cos(30deg) + 15px)`
  newDiv.style.position = 'absolute'
  newDiv.style.width = '86px'
  newDiv.style.height = '86px'
  newDiv.style.pointerEvents = 'none'
  // newDiv.style.backgroundColor = color
  newDiv.style.transition = 'left 0.5s, top 0.5s'
  newDiv.className = character
  document.querySelector('.pasture-table').appendChild(newDiv)
  setTimeout(() => {
    newDiv.style.left = `calc(${ to.x * 105 }px + ${ to.y * 105 }px * sin(30deg) + 7px)`
    newDiv.style.top = `calc(${ to.y * 105 }px *  cos(30deg) + 15px)`
  }, 10)
  setTimeout(() => {
    newDiv.remove()
    to.amount++
  }, 500)
}

const handleConfirm = () => {
  const moveAmount = pastures.value.find(pasture => pasture.x === targetPasure.value.x && pasture.y === targetPasure.value.y).amount
  const data = {
    origin_x: originPasure.value.x, // 起點 X 座標
    origin_y: originPasure.value.y, // 起點 Y 座標
    target_x: targetPasure.value.x, // 終點 X 座標
    target_y: targetPasure.value.y, // 終點 Y 座標
    target_amount: moveAmount // 分配到終點的企鵝數量
  }
  gameChannel.send({ action: 'split_stack', ...data })
  originPasure.value.selected = false
  targetPasure.value.selected = false
  originPasure.value = null
  targetPasure.value = null
  originAmount = 0
  targetAmount = 0

  // 切換玩家
  // nextPlayer()
}
const handleCancel = () => {
  // 還原數字
  if (originPasure.value) {
    originPasure.value.selected = false
    originPasure.value.amount = originAmount
    originPasure.value = null
  }
  if (targetPasure.value) {
    targetPasure.value.selected = false
    targetPasure.value.amount = targetAmount
    targetPasure.value.owner = null
    targetPasure.value = null
  }
  hideAllowedTarget()
  gameChannel.send({ type: 'cancel_action' })
}
// const gameOver = computed(() => players.value.every(player => player.isEnd))
const gameOver = ref(false)
const showRule = ref(false)
const handlebackRoom = () => {
  // 斷線
  if (consumer){
    consumer.subscriptions.remove(gameChannel)
  }
  router.push(`/room/${ roomId }`)
}
const showTurnAnimation = ref(false)
</script>

<template>
  <GameRuleModal v-model="showRule" />
  <GameOverModal v-model="gameOver">
    <div
      class="w-[500px] flex flex-col items-center justify-around"
    >
      <div>遊戲結束</div>
      <div
        v-for="player in finalPlayers"
        :key="player.name"
        class="flex items-center justify-center gap-2"
      >
        <div>{{ player.name }}:</div>
        <div>{{ player.score }}分</div>
      </div>
      <button
        class="hexagon-div flex mt-4 justify-center rounded-md bg-blue-300 h-[100px] w-[100px] items-center text-sm font-semibold  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="handlebackRoom"
      >
        回到房間
      </button>
    </div>
  </GameOverModal>
  <TurnAnimation
    v-model="showTurnAnimation"
    :character="myCharacter"
  />
  <div class="flex items-center flex-col fixed top-10 left-[50px] gap-3 z-10">
    <div class="p-3 text-text">
      當前回合
    </div>
    <div
      v-for="player in orderedPlayers"
      :key="player.id"
      class="h-[106px] w-[106px] flex flex-col items-center relative"
    >
      <PlayerAvatar
        :character="player.character"
        :color="player.color"
        :name="player.nickname"
        :active="player.id === currentPlayer.id"
      />
    </div>
  </div>
  <div class="flex items-center flex-col fixed top-10 right-0 gap-3 z-10">
    <div class=" text-text h-6 w-[126px]">
      最新戰況
    </div>
    <div
      v-for="player in finalPlayers"
      :key="player.id"
      class="w-[166px] h-[69px] flex items-center relative bg-gradient-light border-4 border-white shadow-button rounded-l-3xl py-3 box-border"
    >
      <div
        class="absolute w-8 h-8 -left-5 flex justify-center items-center rounded-full text-white box-content"
        :class="`score-${ player.color }`"
      >
        {{ player.score }}
      </div>
      <div class="ml-8 text-text ">
        <div class="font-medium">
          {{ player.name }}
        </div>
        <div class="text-sm">
          最大區塊 {{ player.largestPasture }}
        </div>
      </div>
    </div>
  </div>
  <div
    class="flex items-center justify-center w-full fixed top-10 pointer-events-none z-10"
  >
    <div class="bg-gradient-light w-[580px] py-5 text-center text-text border-4 border-white rounded-3xl shadow-message text-3xl">
      <div v-if="myTurn && needPutCharacter">
        請選擇一個初始位置(綠色底色)
      </div>
      <div v-else-if="myTurn">
        請移動你的企鵝
      </div>
      <div v-else>
        等待{{ currentPlayer.nickname }}移動
      </div>
    </div>
  </div>
  <div
    v-if="myTurn && targetPasure"
    class="flex items-center justify-center w-full fixed bottom-20 pointer-events-none z-10"
  >
    <div class="flex items-center gap-3">
      <div
        class=" text-[#982000] text-xl rounded-full py-[10px] px-7 cursor-pointer pointer-events-auto bg-gradient-to-b from-[#FFFBD6] to-[#FFBA39] border border-[#FFDE7B] shadow-confirm"
        @click="handleConfirm"
      >
        確定移動
      </div>
      <div
        class="w-[50px] h-[50px] p-2 cursor-pointer pointer-events-auto rounded-full bg-gradient-to-b from-[#AFB7B9] to-[#6B7375] border border-[#DBDFEO] shadow-cancel flex justify-center items-center"
        @click="handleCancel"
      >
        <div class="stroke h-5 w-5"></div>
      </div>
    </div>
  </div>
  <div
    class="flex items-center justify-center fixed bottom-10 right-10 pointer-events-none z-10"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-[50px] h-[50px] p-2 cursor-pointer pointer-events-auto rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#DAFFFF] border border-[#DBDFEO] shadow-button flex justify-center items-center"
        @click="showRule = true"
      >
        <div class="question h-[38px] w-[38px]"></div>
      </div>
    </div>
  </div>
  <div class="text-white relative mt-32 pasture-table">
    <!-- <div
      v-for="pasture in pastures"
      :key="`${pasture.x}-${pasture.y}`"
      class="hexagon flex flex-col justify-center items-center text-black cursor-pointer"
      :class="{ 'bg-green-500': pasture.selected || (needPutCharacter && pasture.isEdge),
                'bg-green-400': pasture.isAllowTarget,
                'ice': !pasture.selected && !pasture.isAllowTarget && !(needPutCharacter && pasture.isEdge),
                'bg-from-owner': pasture.owner,
      }"
      :style="{ left: `calc(${pasture.x * 105}px + ${pasture.y * 105}px * sin(30deg))`,
                top: `calc(${pasture.y * 105}px * cos(30deg))`,
                '--player-coler': pasture.owner?.color }"
      @click="()=>handleClick(pasture)"
    > -->
    <!-- <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div> -->
    <!-- <div>
        ({{ pasture.x }},{{ pasture.y }}),{{ pasture.isEdge }}
      </div> -->
    <!-- <div
      v-if="pasture.owner"
    >
      {{ pasture.amount }}
    </div>
    <div
      v-if="pasture.amount"
      :class="[pasture.owner?.character , { 'zoom-in-out': pasture.owner?.id === currentPlayer.id && !originPasure && !pasture.is_blocked }]"
      class="h-12 w-12"
    ></div> -->
    <!-- </div> -->
    <IcePasture
      v-for="pasture in pastures"
      :key="`${pasture.x}-${pasture.y}`"
      :pasture="pasture"
      :need-put-character="needPutCharacter"
      :current-player="currentPlayer"
      :my-turn="myTurn"
      :is-origin="!!originPasure && pasture.x === originPasure.x && pasture.y === originPasure.y"
      :is-target="!!targetPasure && pasture.x === targetPasure.x && pasture.y === targetPasure.y"
      :origin-exist="!!originPasure"
      :target-exist="!!targetPasure"
      :style="{ left: `calc(${pasture.x * 105}px + ${pasture.y * 105}px * sin(30deg))`,
                top: `calc(${pasture.y * 105}px * cos(30deg))` }"
      @handle-click="handleClick"
    />
  </div>
</template>

<style>
  .ice {
    background: linear-gradient(0deg, #b2efff -.01%, #def6ff 100.01%);

    /* background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3); */
  }

  .tux {
    background-image: url('@/assets/images/1p.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .gunter {
    background-image: url('@/assets/images/2p.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .abc {
    background-image: url('@/assets/images/3p.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
  }

  .sin {
    background-image: url('@/assets/images/4p.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .stroke {
    background-image: url('@/assets/images/stroke.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .zoom-in-out {
    animation: animate-zoom-in-out 1.5s infinite;
  }
  @keyframes animate-zoom-in-out {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.3);
    }

    100% {
      transform: scale(1);
    }
  }

  .bg-from-owner {
    background-image: linear-gradient(to bottom right, #b3d9ff, var(--player-coler));
  }

  .hexagon-div {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }

  .question {
    background-image: url('@/assets/images/icon-question.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .score-yellow {
    background: #ffc23b;
    border: 3px solid #fff7ae;
    box-shadow: 1px 1px 0px 0px #ffc23b;
  }

  .score-blue {
    background: #56b2f6;
    border: 3px solid #b3d9ff;
    box-shadow: 1px 1px 0px 0px #2b9cef;
  }

  .score-red {
    background: #fb8464;
    border: 3px solid #fcc0b4;
    box-shadow: 1px 1px 0px 0px #fb8464;
  }

  .score-green {
    background: #a1d548;
    border: 3px solid #caf67e;
    box-shadow: 1px 1px 0px 0px #79bf00;
  }

</style>