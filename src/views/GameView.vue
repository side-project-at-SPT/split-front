<script setup>
import {
  ref, computed, onMounted, toRefs, 
} from 'vue'
import { useRoute } from 'vue-router'
import { usePublicStore } from '../stores/public'
import { useUserStore } from '../stores/user'
import api from '@/assets/api'
const publicStore = usePublicStore()
const userStore = useUserStore()
const { consumer } = toRefs(publicStore)
const { user } = toRefs(userStore)
const route = useRoute()
console.log(route.query.roomId)
const gameId = ref(route.query.game_id)
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
    isEdge: checkIsEdgeByMap({ pastures, x: pasture.x, y: pasture.y })
  }))
  // checkAllIsEdge()
  return pastures2
})
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
  gameStatus.value = data.game
  return data
}
const needPutCharacter = computed(() => {
  return pastures.value.filter(pasture => pasture.owner).length < players.value.length
})
const myTurn = computed(() => {
  return currentPlayer.value.id === user.value.id
})
onMounted(() => {
  const users = ref(Number(route.query.users || 2))
  
  console.log(users.value, gameId.value)
  gameChannel = consumer.value.subscriptions.create({ channel: 'GameChannel', game_id: gameId.value }, {
    connected () {
      console.log('connected game channel', gameId.value)
    },
    disconnected () {
      console.log('disconnected game channel', gameId.value)
    },
    received (data) {
      if (data.event === 'player_joined_game') {
        players.value = data.player_state
        console.log(data, 'game player_joined_game')
        if (pastures.value.length === 0 && !initing.value){
          initing.value = true
          // const pastureAmount = players.value.length * 16
          // initPastures(pastureAmount)
          // console.log(players.value, 'players')
          getGameStatus().then(() => {
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
      else if (data.event === 'stack_placed' || data.event === 'stack_splitted') {
        gameStatus.value.game_data = data.game_data
      }
      else if (data.type === 'move_sheep') {
        // const originPasture = pastures.value.find(pasture => pasture.x === data.origin_x && pasture.y === data.origin_y)
        // const targetPasture = pastures.value.find(pasture => pasture.x === data.target_x && pasture.y === data.target_y)
        // originPasture.amount--
        // targetPasture.amount++
        moveItem({
          from: data.from, to: data.to, character: data.character
        })
      }
      // if (data.event === 'game updated') {
      //   getgameInfo(gameId)
      // }
      // else if (data.event === 'game_start_in_seconds') {
      //   const gameData = {
      //     id: gameId,
      //     gameStartInSeconds: data.seconds,
      //     status: 'starting'
      //   }
      //   updategameData(gameData)
      // }
      // else if (data.event === 'game_started') {
      //   const gameId = data.game_id
      //   router.push(`/game/?game_id=${ gameId }`)
      // }
      console.log(data, 'data game channel', gameId.value)
    }
  })
  // console.log(users.value)
  // const pastureAmount = users.value * 16
  // initPastures(pastureAmount)
  // for (let i = 0; i < users.value; i++){
  //   let pasture = getAEdgePasture()
  //   while (pasture.owner){
  //     pasture = getAEdgePasture()
  //   }
  //   pasture.amount = 16
  //   pasture.owner = players.value[i]
  // }
  getGameStatus()
})
// const initPastures = (pastureAmount) => {
//   for (let i = 0; i < pastureAmount; i++) {
//     if (pastures.value.length === 0){
//       addPasture({ x: 0, y: 0, isEdge: true })
//       continue
//     }
//     setEdgePasture()
//     checkAllIsEdge()
//   }
//   const topX = Math.min(...pastures.value.map(pasture => pasture.x))
//   const topY = Math.min(...pastures.value.map(pasture => pasture.y))
//   console.log(topX, topY)
//   pastures.value.forEach(pasture => {
//     pasture.x -= topX
//     pasture.y -= topY
//   })
// }
// const setEdgePasture = () => {
//   const edgePasture = getAEdgePasture()
//   if (!edgePasture){
//     console.log(pastures.value)
//     return
//   }
//   const directions = [
//     {
//       x: 1, y: 0 
//     },
//     {
//       x: 1, y: -1 
//     },
//     {
//       x: 0, y: -1 
//     },
//     {
//       x: -1, y: 0 
//     },
//     {
//       x: -1, y: 1 
//     },
//     {
//       x: 0, y: 1 
//     } ]
//   const randomIndex = Math.floor(Math.random() * directions.length)
//   for (let i = 0; i < directions.length; i++){
//     const x = edgePasture.x + directions[(randomIndex + i) % directions.length].x
//     const y = edgePasture.y + directions[(randomIndex + i) % directions.length].y
//     if (!pastures.value.find(pasture => pasture.x === x && pasture.y === y)){
//       addPasture({ x, y })
//       break
//     }
//   }
// }
// const checkAllIsEdge = () => {
//   const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
//   edgePastures.forEach(pasture => {
//     pasture.isEdge = checkIsEdge({ x: pasture.x, y: pasture.y })
//   })
// }
// const addPasture = ({ x, y }) => {
//   const isEdge = checkIsEdge({ x, y })
//   pastures.value.push({
//     x, y, amount: 0, selected: false, isAllowTarget: false, isBlocked: false, isEdge
//   })
// }
// const checkIsEdge = ({ x, y }) => {
//   const directions = [
//     {
//       x: 1, y: 0 
//     },
//     {
//       x: 1, y: -1 
//     },
//     {
//       x: 0, y: -1 
//     },
//     {
//       x: -1, y: 0 
//     },
//     {
//       x: -1, y: 1 
//     },
//     {
//       x: 0, y: 1 
//     } ]
//   for (let i = 0; i < directions.length; i++){
//     const target = pastures.value.find(pasture => pasture.x === x + directions[i].x && pasture.y === y + directions[i].y)
//     if (!target) return true
//   }
//   return false
// }
const checkIsEdgeByMap = ({ pastures, x, y }) => {
  const directions = [
    {
      x: 1, y: 0 
    },
    {
      x: 1, y: -1 
    },
    {
      x: 0, y: -1 
    },
    {
      x: -1, y: 0 
    },
    {
      x: -1, y: 1 
    },
    {
      x: 0, y: 1 
    } ]
  for (let i = 0; i < directions.length; i++){
    const target = pastures.find(pasture => pasture.x === x + directions[i].x && pasture.y === y + directions[i].y)
    if (!target) return true
  }
  return false
}
// const getAEdgePasture = () => {
//   const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
//   const randomIndex = Math.floor(Math.random() * edgePastures.length)
//   return edgePastures[randomIndex]
// }

// pastures.value[0].amount = 16
// pastures.value[0].owner = players.value[0]
// pastures.value[20].amount = 16
// pastures.value[20].owner = players.value[2]
// pastures.value[4].amount = 16
// pastures.value[4].owner = players.value[3]
// pastures.value[pastures.value.length - 1].amount = 16
// pastures.value[pastures.value.length - 1].owner = players.value[1]
//
// const currentPlayerIndex = ref(0)
// const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
const currentPlayer = computed(() => players.value[gameStatus.value?.game_data?.current_player_index || 0])
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
  console.log(needPutCharacter.value, myTurn.value)
  console.log(pasture)
  if (needPutCharacter.value && myTurn.value){
    if (pasture.owner || !pasture.isEdge) return
    setFirstPasture(pasture)
    return
  }
  if (!originPasure.value) {
    console.log(pasture, currentPlayer.value)
    if (pasture.owner?.id !== currentPlayer.value.id) return
    if (pasture.amount < 2) return
    originPasure.value = { ...pasture }
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
    targetAmount = pasture.amount
    pasture.selected = !pasture.selected
    targetPasure.value.owner = originPasure.value.owner
    // 取消顯示合法目的地
    hideAllowedTarget()
    return
  }
  // 如果有選擇來源的牧場，且來源牧場有羊，則移動羊到目標牧場
  if (targetPasure.value.x === pasture.x && targetPasure.value.y === pasture.y) {
    if (originPasure.value && originPasure.value.amount > 1) {
      // targetPasure.value.amount++
      originPasure.value.amount--
      console.log('move', originPasure.value, targetPasure.value)
      moveItem({
        from: originPasure.value, to: targetPasure.value, character: originPasure.value.owner.character
      })
      gameChannel.send({
        type: 'move_sheep', from: { x: originPasure.value.x, y: originPasure.value.y }, to: { x: targetPasure.value.x, y: targetPasure.value.y }, character: originPasure.value.owner.character
      })
    }
    return
  }
  if (originPasure.value === pasture) {
    if (targetPasure.value && targetPasure.value.amount > 1) {
      // originPasure.value.amount++
      targetPasure.value.amount--
      moveItem({
        from: targetPasure.value, to: originPasure.value, character: originPasure.value.owner.character
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
  newDiv.style.top = `calc(${ from.y * 105 / 2 }px * sqrt(3) * cos(30deg) + 25px)`
  newDiv.style.position = 'absolute'
  newDiv.style.width = '50px'
  newDiv.style.height = '50px'
  // newDiv.style.backgroundColor = color
  newDiv.style.transition = 'left 0.5s, top 0.5s'
  newDiv.className = character
  document.querySelector('.pasture-table').appendChild(newDiv)
  setTimeout(() => {
    newDiv.style.left = `calc(${ to.x * 105 }px + ${ to.y * 105 }px * sin(30deg) + 25px)`
    newDiv.style.top = `calc(${ to.y * 105 / 2 }px * sqrt(3) * cos(30deg) + 25px)`
  }, 10)
  setTimeout(() => {
    newDiv.remove()
    to.amount++
  }, 500)
}
const showAllowedTarget = () => {
  // 六個方向
  const directions = [
    {
      x: 1, y: 0 
    },
    {
      x: 1, y: -1 
    },
    {
      x: 0, y: -1 
    },
    {
      x: -1, y: 0 
    },
    {
      x: -1, y: 1 
    },
    {
      x: 0, y: 1 
    }
  ]
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
// const nextPlayer = () => {
//   if (players.value.every(player => player.isEnd)) {
//     alert('遊戲結束')
//     return
//   }
//   currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
//   // 判斷還可不可以移動
//   const ownerPastures = pastures.value.filter(pasture => pasture.owner?.id === currentPlayer.value.id)
//   ownerPastures.forEach(pasture => {
//     if (pasture.isBlocked) return
//     if (pasture.amount < 2) pasture.isBlocked = true
//     // 查看是否有可以移動的牧場
//     const directions = [
//       {
//         x: 1, y: 0 
//       },
//       {
//         x: 1, y: -1 
//       },
//       {
//         x: 0, y: -1 
//       },
//       {
//         x: -1, y: 0 
//       },
//       {
//         x: -1, y: 1 
//       },
//       {
//         x: 0, y: 1 
//       }
//     ]
//     let isAlive = false
//     directions.forEach(direction => {
//       let directionAddX = direction.x
//       let directionAddY = direction.y
//       while (true) {
//         if (isAlive) return
//         const target = pastures.value.find(p => p.x === pasture.x + directionAddX && p.y === pasture.y + directionAddY)
//         if (!target || target.amount > 0) {
//           break
//         }
//         if (target.amount === 0) {
//           isAlive = true
//           break
//         }
//         directionAddX += direction.x
//         directionAddY += direction.y
//       }
//     })
//     if (!isAlive) pasture.isBlocked = true
//   })
//   if (ownerPastures.every(pasture => pasture.isBlocked)) {
//     currentPlayer.value.isEnd = true
//     nextPlayer()
//   }
// }
const finalPlayers = computed(() => players.value.map(player => {
  return {
    name: player.nickname,
    score: pastures.value.filter(pasture => pasture.owner?.id === player.id).length
  }
}).sort((a, b) => b.score - a.score))
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
}
const gameOver = computed(() => players.value.every(player => player.isEnd))
</script>

<template>
  <div class="flex items-center ">
    <div class="flex items-center ">
      <div class="bg-white p-3">
        當前回合
      </div>
      <div
        class="p-3 flex items-center"
        :style="{ background: currentPlayer.color }"
      >
        {{ currentPlayer.nickname }}
        <div
          :class="currentPlayer.character"
          class="h-6 w-6"
        ></div>
      </div>
    </div>
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
  </div>
  <div
    v-if="gameOver"
    class="w-[500px] flex flex-col items-center"
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
  </div>
  <div v-if="needPutCharacter && myTurn">
    請選擇一個初始位置
  </div>
  <div class="text-white relative mt-10 pasture-table">
    <div
      v-for="pasture in pastures"
      :key="`${pasture.x}-${pasture.y}`"
      class="hexagon flex flex-col justify-center items-center text-black cursor-pointer"
      :class="{ 'bg-green-500': pasture.selected,
                'bg-green-400': pasture.isAllowTarget,
                'ice': !pasture.selected && !pasture.isAllowTarget }"
      :style="{ left: `calc(${pasture.x * 105}px + ${pasture.y * 105}px * sin(30deg))`,
                top: `calc(${pasture.y * 105 / 2}px * sqrt(3) * cos(30deg))` }"
      @click="()=>handleClick(pasture)"
    >
      <!-- <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div> -->
      <div>
        ({{ pasture.x }},{{ pasture.y }}),{{ pasture.isEdge }}
      </div>
      <div
        v-if="pasture.owner"
        :style="{ color: pasture.owner?.color }"
      >
        {{ pasture.amount }}
      </div>
      <div
        v-if="pasture.amount"
        :class="pasture.owner?.character"
        class="h-12 w-12"
      ></div>
    </div>
  </div>
</template>

<style>
  .hexagon {
    position: absolute;
    width: 100px;
    height: 100px;
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
    background-size: contain;
  }

  .sin {
    background-image: url('@/assets/images/sin.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
</style>