<script setup>
import {
  ref, computed, onMounted, toRefs,
  toRaw, watchEffect
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublicStore } from '../stores/public'
import { useUserStore } from '../stores/user'
import GameOverModal from '@/components/GameOverModal.vue'
import api from '@/assets/api'
import GameRuleModal from '../components/GameRuleModal.vue'
import TurnAnimation from '../components/TurnAnimation.vue'
const directions = [
  {
    x: 0, y: -1 
  },
  {
    x: 1, y: -1 
  },
  {
    x: 1, y: 0 
  },
  {
    x: 0, y: 1 
  },
  {
    x: -1, y: 1 
  },
  {
    x: -1, y: 0 
  },
]
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
// const pastures = ref([])
const defaultPlayers = ref([ {
  name: 'Tux', color: '#ae0000', character: 'tux', isEnd: false, id: 1, nickname: 'Tux'
}, {
  name: '阿鵝', color: '#2563eb', character: 'gunter', isEnd: false, id: 2, nickname: '阿鵝'
}, {
  name: 'abc', color: '#d321a9', character: 'abc', isEnd: false, id: 3, nickname: 'abc'
}, {
  name: 'sin', color: '#d38021', character: 'sin', isEnd: false, id: 4, nickname: 'sin'
} ])
const players = computed(() => gameStatus.value?.game_config?.players || defaultPlayers.value)
const gameStatus = ref(null)
const allowTargetPastures = ref([])
const pastures = computed(() => {
  if (!gameStatus.value) return []
  const pastures = gameStatus.value.game_data.pastures.map(pasture => {
    const isAllowTarget = allowTargetPastures.value.find(p => p.x === pasture.x && p.y === pasture.y) ? true : false
    let amount = pasture.stack.amount
    let owner = players.value.find(player => player.color === pasture.stack.color)
    if (originPasure.value && originPasure.value.x === pasture.x && originPasure.value.y === pasture.y){
      amount = originPasure.value.amount
      owner = originPasure.value.owner
    }
    if (targetPasure.value && targetPasure.value.x === pasture.x && targetPasure.value.y === pasture.y) {
      amount = targetPasure.value.amount
      owner = targetPasure.value.owner
    }
    return {
      ...pasture,
      x: pasture.x, y: pasture.y, amount, selected: false, isAllowTarget, isBlocked: pasture.is_blocked, isEdge: false,
      owner
    }
  })
  
  const pastures2 = pastures.map(pasture => ({
    ...pasture,
    // isEdge: checkIsEdgeByMap({ pastures, x: pasture.x, y: pasture.y })
    isEdge: edgePastures.value.find(p => p.x === pasture.x && p.y === pasture.y) ? true : false
  }))
  // checkAllIsEdge()
  return pastures2
})
const edgePastures = ref([])
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
const needPutCharacter = computed(() => {
  return pastures.value.filter(pasture => pasture.owner).length < players.value.length
})

const myCharacter = computed(() => {
  const me = players.value.find(player => player.id === user.value.id)
  if (!me) return 'tux'
  return me.character
})
const initGame = () => {
  console.log('init game')
  // 找外圍第一格
  let i = 0
  while (edgePastures.value.length === 0){
    for (let j = 0; j <= i; j++){
      const x = i - j
      const y = j
      const edgePasture = pastures.value.find(pasture => pasture.x === x && pasture.y === y)
      if (edgePasture){
        edgePastures.value.push({ x, y })
        break
      }
    }
    i++
  }
  // 順時針找出所有外圍牧場

  const firstPoint = edgePastures.value[0]
  let cPoint = {
    x: firstPoint.x,
    y: firstPoint.y,
  }
  let directionIndex = 0
  let count = 0 // 保護
  while (!(cPoint.x == firstPoint.x && cPoint.y == firstPoint.y && directionIndex == 0 && edgePastures.value.length !== 1) && count < 100){
    const testPoint = {
      x: cPoint.x + directions[directionIndex].x,
      y: cPoint.y + directions[directionIndex].y
    }
    const pasture = pastures.value.find(pasture => pasture.x === testPoint.x && pasture.y === testPoint.y)
    if (pasture){
      edgePastures.value.push(testPoint)
      cPoint = testPoint
      directionIndex = (directionIndex + 5) % 6
    }
    else {
      directionIndex = (directionIndex + 1) % 6
    }
    count++
  }
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
  getGameStatus()
})
const currentPlayer = computed(() => players.value[gameStatus.value?.game_data?.current_player_index || 0])
const myTurn = computed(() => {
  return currentPlayer.value.id === user.value.id
})
watchEffect(() => {
  if (myTurn.value){
    showTurnAnimation.value = true
  }
})
const orderedPlayers = computed(() => {
  const playersOrder = []
  for (let i = 0; i < players.value.length; i++){
    playersOrder.push(players.value[((gameStatus.value?.game_data?.current_player_index || 0) + i) % players.value.length])
  }
  return playersOrder
})
const originPasure = ref(null)
const targetPasure = ref(null)
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
  newDiv.style.left = `calc(${ from.x * 105 }px + ${ from.y * 105 }px * sin(30deg) + 25px)`
  newDiv.style.top = `calc(${ from.y * 105 }px * cos(30deg) + 45px)`
  newDiv.style.position = 'absolute'
  newDiv.style.width = '50px'
  newDiv.style.height = '50px'
  newDiv.style.pointerEvents = 'none'
  // newDiv.style.backgroundColor = color
  newDiv.style.transition = 'left 0.5s, top 0.5s'
  newDiv.className = character
  document.querySelector('.pasture-table').appendChild(newDiv)
  setTimeout(() => {
    newDiv.style.left = `calc(${ to.x * 105 }px + ${ to.y * 105 }px * sin(30deg) + 25px)`
    newDiv.style.top = `calc(${ to.y * 105 }px *  cos(30deg) + 45px)`
  }, 10)
  setTimeout(() => {
    newDiv.remove()
    to.amount++
  }, 500)
}
const showAllowedTarget = () => {
  directions.forEach(direction => {
    let tempTarget
    let directionAddX = direction.x
    let directionAddY = direction.y
    while (true) {
      const target = pastures.value.find(pasture => pasture.x === originPasure.value.x + directionAddX && pasture.y === originPasure.value.y + directionAddY)
      if (!target || target.amount > 0) {
        break
      }
      tempTarget = target
      directionAddX += direction.x
      directionAddY += direction.y
    }
    if (tempTarget) {
      allowTargetPastures.value.push({ x: tempTarget.x, y: tempTarget.y })
      // tempTarget.isAllowTarget = true
      tempTarget = null
    }
  })
}
const hideAllowedTarget = () => {
  allowTargetPastures.value = []
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

const finalPlayers = computed(() => players.value.map(player => {
  return {
    name: player.nickname,
    score: pastures.value.filter(pasture => pasture.owner?.id === player.id).length,
    largestPasture: getLargestPasture(player)
  }
}).sort((a, b) => b.score - a.score))
const getLargestPasture = (player) => {
  // 找出此玩家所有牧場
  const playerPastures = pastures.value.filter(pasture => pasture.owner?.id === player.id)
  // 找出最大牧場
  let largestPasture = 0
  let parts = []
  for (let i = 0 ; i < playerPastures.length; i++){
    // 空的直接加入
    if (parts.length === 0){
      parts.push([ playerPastures[i] ])
      continue
    }
    // 檢查目前牧場是否有與parts中的牧場相鄰
    let nearPart = []
    for (let j = 0; j < parts.length; j++){
      const part = parts[j]
      for (let k = 0; k < part.length; k++){
        const partPasture = part[k]
        for (let l = 0; l < directions.length; l++){
          const direction = directions[l]
          if (partPasture.x + direction.x === playerPastures[i].x && partPasture.y + direction.y === playerPastures[i].y){
            // part.push(playerPastures[i])
            nearPart.push(j)
            // isAdd = true
            break
          }
        }
        if (nearPart.includes(j)) break
        // if(isAdd) break
      }
      // if(isAdd) break
    }
    // 如果有相鄰的part，則合併
    if (nearPart.length > 0){
      let newPart = [ playerPastures[i] ]
      nearPart.forEach(partIndex => {
        newPart = [ ...newPart, ...parts[partIndex] ]
        // parts[partIndex].forEach(partPasture => {
        //   newPart.push(partPasture)
        // })
      })
      // 刪除舊的part
      let newParts = []
      parts.forEach((part, index) => {
        if (!nearPart.includes(index)) newParts.push(part)
      })
      // parts = parts.filter((part, index) => !nearPart.includes(index))
      newParts.push(newPart)
      // parts.push(newPart)
      parts = newParts
    }
    else {
      parts.push([ playerPastures[i] ])
    }
  }
  // 找出最大的part
  parts.forEach(part => {
    // console.log(part, 'part', player.nickname)
    if (part.length > largestPasture) largestPasture = part.length
  })
  return largestPasture
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
  <div class="flex items-center flex-col fixed mt-5 ml-5 gap-3">
    <div class="bg-white p-3 text-blue-500 ">
      當前回合
    </div>
    <div
      v-for="player in orderedPlayers"
      :key="player.id"
      class="h-20 w-20 flex flex-col items-center relative"
    >
      <div
        :class="player.character"
        class="h-12 w-12"
      ></div>
      <div
        class="absolute bottom-0 w-full text-center rounded-lg"
        :style="{ background: player.color }"
      >
        {{ player.nickname }}
      </div>
    </div>
  </div>
  <div class="flex items-center ml-[200px]">
    <span
      class="bg-blue-400 p-2 m-5 cursor-pointer"
      @click="handleConfirm"
    >
      確定移動
    </span>
    <span
      class="bg-blue-400 p-2 m-5 cursor-pointer"
      @click="handleCancel"
    >
      取消選取
    </span>
    <span
      class="bg-blue-400 p-2 m-5 cursor-pointer"
      @click="showRule = true"
    >
      遊戲規則
    </span>
    <div>
      <div
        v-for="player in finalPlayers"
        :key="player.name"
        class="flex items-center justify-center gap-2"
      >
        <div>{{ player.name }}:</div>
        <div>{{ player.score }}分</div>
        <div>最大區塊{{ player.largestPasture }}</div>
      </div>
    </div>
  </div>
  <div
    v-if="myTurn"
    class="ml-[300px]"
  >
    <div v-if="needPutCharacter">
      選擇一個初始位置(綠色底色)
    </div>
    <div v-else>
      輪到你了，請移動
    </div>
  </div>
  <div class="text-white relative mt-10 pasture-table">
    <div
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
    >
      <!-- <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div> -->
      <!-- <div>
        ({{ pasture.x }},{{ pasture.y }}),{{ pasture.isEdge }}
      </div> -->
      <div
        v-if="pasture.owner"
      >
        {{ pasture.amount }}
      </div>
      <div
        v-if="pasture.amount"
        :class="[pasture.owner?.character , { 'zoom-in-out': pasture.owner?.id === currentPlayer.id && !originPasure && !pasture.is_blocked }]"
        class="h-12 w-12"
      ></div>
    </div>
  </div>
</template>

<style>
  .hexagon {
    position: absolute;
    width: 100px;
    height: calc(100px * 2 / sqrt(3));
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }

  .ice {
    background-image: linear-gradient(to bottom right, #b3d9ff, #218ed3);
  }

  .tux {
    background-image: url('@/assets/images/tux.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .gunter {
    background-image: url('@/assets/images/gunter.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .abc {
    background-image: url('@/assets/images/abc.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
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

  .sin {
    background-image: url('@/assets/images/sin.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .bg-from-owner {
    background-image: linear-gradient(to bottom right, #b3d9ff, var(--player-coler));
  }

  .hexagon-div {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
</style>