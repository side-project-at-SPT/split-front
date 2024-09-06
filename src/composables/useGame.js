import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
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
export default function useGame () {
  const userStore = useUserStore()
  const defaultPlayers = ref([ {
    name: 'Tux', color: '#ae0000', character: 'tux', isEnd: false, id: 1, nickname: 'Tux'
  }, {
    name: '阿鵝', color: '#2563eb', character: 'gunter', isEnd: false, id: 2, nickname: '阿鵝'
  }, {
    name: 'abc', color: '#d321a9', character: 'abc', isEnd: false, id: 3, nickname: 'abc'
  }, {
    name: 'sin', color: '#d38021', character: 'sin', isEnd: false, id: 4, nickname: 'sin'
  } ])
  const gameStatus = ref(null)
  const allowTargetPastures = ref([])
  const players = computed(() => gameStatus.value?.game_config?.players.map((player) => ({
    ...player,
    character: player.character === 'none' ? 'tux' : player.character
  })) || defaultPlayers.value)
  const originPasure = ref(null)
  const targetPasure = ref(null)
  const edgePastures = ref([])
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
  const currentPlayer = computed(() => players.value[gameStatus.value?.game_data?.current_player_index || 0])
  const myTurn = computed(() => {
    return currentPlayer.value.id === userStore.user.id
  })
  const finalPlayersWithoutRank = computed(() => players.value.map(player => {
    return {
      name: player.nickname,
      score: pastures.value.filter(pasture => pasture.owner?.id === player.id).length,
      largestPasture: getLargestPasture(player),
      color: player.color,
      character: player.character
    }
  }).sort((a, b) => {
    // 先比較分數
    if (b.score !== a.score) {
      return b.score - a.score 
    }
    else {
      // 如果分數相同，再比較 largestPasture
      if (b.largestPasture !== a.largestPasture){
        return b.largestPasture - a.largestPasture 
      }
      return a.name === userStore.user.nickname ? -1 : b.name === userStore.user.nickname ? 1 : 0
    }
  }))
  
  const finalPlayers = computed(() => {
    let prePlayer = null
    return finalPlayersWithoutRank.value
      .map((player, index) => {
        let rank = index + 1
        if (index !== 0) {
          if (player.score === prePlayer.score && player.largestPasture === prePlayer.largestPasture){
            rank = prePlayer.rank
          }
        }
        prePlayer = {
          ...player,
          rank
        }
        return prePlayer
      })
  })
  const orderedPlayers = computed(() => {
    const playersOrder = []
    for (let i = 0; i < players.value.length; i++){
      playersOrder.push(players.value[((gameStatus.value?.game_data?.current_player_index || 0) + i) % players.value.length])
    }
    return playersOrder
  })
  const needPutCharacter = computed(() => {
    return pastures.value.filter(pasture => pasture.owner).length < players.value.length
  })
  
  const myCharacter = computed(() => {
    const me = players.value.find(player => player.id === userStore.user.id)
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
    while (!(cPoint.x == firstPoint.x && cPoint.y == firstPoint.y && directionIndex == 0 && edgePastures.value.length !== 1) && count < 200){
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
  const isObserver = computed(() => {
    return !players.value.find(player => player.id === userStore.user.id)
  })
  return {
    gameStatus,
    originPasure,
    targetPasure,
    pastures,
    currentPlayer,
    myTurn,
    finalPlayers,
    orderedPlayers,
    needPutCharacter,
    myCharacter,
    isObserver,
    initGame,
    showAllowedTarget,
    hideAllowedTarget
  }
}