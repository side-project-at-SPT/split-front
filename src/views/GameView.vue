<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.query.roomId)
const pastures = ref([])
// initialize pastures
// for (let x = 0; x < 5; x++)
//   for (let y = 0; y < 5; y++)
//     pastures.value.push({
//       x, y, amount: 0, selected: false
//     })
onMounted(() => {
  const users = ref(Number(route.query.users || 2))
  console.log(users.value)
  const pastureAmount = users.value * 16
  initPastures(pastureAmount)
  for (let i = 0; i < users.value; i++){
    let pasture = getAEdgePasture()
    while (pasture.owner){
      pasture = getAEdgePasture()
    }
    pasture.amount = 16
    pasture.owner = players.value[i]
  }
})
const initPastures = (pastureAmount) => {
  for (let i = 0; i < pastureAmount; i++) {
    if (pastures.value.length === 0){
      addPasture({ x: 0, y: 0, isEdge: true })
      continue
    }
    setEdgePasture()
    checkAllIsEdge()
  }
  const topX = Math.min(...pastures.value.map(pasture => pasture.x))
  const topY = Math.min(...pastures.value.map(pasture => pasture.y))
  console.log(topX, topY)
  pastures.value.forEach(pasture => {
    pasture.x -= topX
    pasture.y -= topY
  })
}
const setEdgePasture = () => {
  const edgePasture = getAEdgePasture()
  if (!edgePasture){
    console.log(pastures.value)
    return
  }
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
  const randomIndex = Math.floor(Math.random() * directions.length)
  for (let i = 0; i < directions.length; i++){
    const x = edgePasture.x + directions[(randomIndex + i) % directions.length].x
    const y = edgePasture.y + directions[(randomIndex + i) % directions.length].y
    if (!pastures.value.find(pasture => pasture.x === x && pasture.y === y)){
      addPasture({ x, y })
      break
    }
  }
}
const checkAllIsEdge = () => {
  const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
  edgePastures.forEach(pasture => {
    pasture.isEdge = checkIsEdge({ x: pasture.x, y: pasture.y })
  })
}
const addPasture = ({ x, y }) => {
  const isEdge = checkIsEdge({ x, y })
  pastures.value.push({
    x, y, amount: 0, selected: false, isAllowTarget: false, isBlocked: false, isEdge
  })
}
const checkIsEdge = ({ x, y }) => {
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
    const target = pastures.value.find(pasture => pasture.x === x + directions[i].x && pasture.y === y + directions[i].y)
    if (!target) return true
  }
  return false
}
const getAEdgePasture = () => {
  const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
  const randomIndex = Math.floor(Math.random() * edgePastures.length)
  return edgePastures[randomIndex]
}
const players = ref([ {
  name: 'Tux', color: '#ae0000', itemStyle: 'tux', isEnd: false
}, {
  name: '阿鵝', color: '#2563eb', itemStyle: 'gunter', isEnd: false
}, {
  name: 'abc', color: '#d321a9', itemStyle: 'abc', isEnd: false
}, {
  name: 'sin', color: '#d38021', itemStyle: 'sin', isEnd: false
} ])

// pastures.value[0].amount = 16
// pastures.value[0].owner = players.value[0]
// pastures.value[20].amount = 16
// pastures.value[20].owner = players.value[2]
// pastures.value[4].amount = 16
// pastures.value[4].owner = players.value[3]
// pastures.value[pastures.value.length - 1].amount = 16
// pastures.value[pastures.value.length - 1].owner = players.value[1]
//
const currentPlayerIndex = ref(0)
const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
const originPasure = ref(null)
const targetPasure = ref(null)
let originAmount = 0
let targetAmount = 0
const handleClick = (pasture) => {
  if (!originPasure.value) {
    if (pasture.owner?.name !== currentPlayer.value.name) return
    if (pasture.amount < 2) return
    originPasure.value = pasture
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
    targetPasure.value = pasture
    targetAmount = pasture.amount
    pasture.selected = !pasture.selected
    targetPasure.value.owner = originPasure.value.owner
    // 取消顯示合法目的地
    hideAllowedTarget()
    return
  }
  // 如果有選擇來源的牧場，且來源牧場有羊，則移動羊到目標牧場
  if (targetPasure.value === pasture) {
    if (originPasure.value && originPasure.value.amount > 1) {
      // targetPasure.value.amount++
      originPasure.value.amount--
      moveItem({
        from: originPasure.value, to: targetPasure.value, itemStyle: originPasure.value.owner.itemStyle
      })
    }
    return
  }
  if (originPasure.value === pasture) {
    if (targetPasure.value && targetPasure.value.amount > 1) {
      // originPasure.value.amount++
      targetPasure.value.amount--
      moveItem({
        from: targetPasure.value, to: originPasure.value, itemStyle: originPasure.value.owner.itemStyle
      })
    }
  }
}
const moveItem = ({
  from, to, itemStyle
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
  newDiv.className = itemStyle
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
      tempTarget.isAllowTarget = true
      tempTarget = null
    }
  })
}
const hideAllowedTarget = () => {
  pastures.value.forEach(pasture => pasture.isAllowTarget = false)
}
const handleConfirm = () => {
  originPasure.value.selected = false
  targetPasure.value.selected = false
  originPasure.value = null
  targetPasure.value = null
  originAmount = 0
  targetAmount = 0
  // 切換玩家
  nextPlayer()
}
const nextPlayer = () => {
  if (players.value.every(player => player.isEnd)) {
    alert('遊戲結束')
    return
  }
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
  // 判斷還可不可以移動
  const ownerPastures = pastures.value.filter(pasture => pasture.owner?.name === currentPlayer.value.name)
  ownerPastures.forEach(pasture => {
    if (pasture.isBlocked) return
    if (pasture.amount < 2) pasture.isBlocked = true
    // 查看是否有可以移動的牧場
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
    let isAlive = false
    directions.forEach(direction => {
      let directionAddX = direction.x
      let directionAddY = direction.y
      while (true) {
        if (isAlive) return
        const target = pastures.value.find(p => p.x === pasture.x + directionAddX && p.y === pasture.y + directionAddY)
        if (!target || target.amount > 0) {
          break
        }
        if (target.amount === 0) {
          isAlive = true
          break
        }
        directionAddX += direction.x
        directionAddY += direction.y
      }
    })
    if (!isAlive) pasture.isBlocked = true
  })
  if (ownerPastures.every(pasture => pasture.isBlocked)) {
    currentPlayer.value.isEnd = true
    nextPlayer()
  }
}
const finalPlayers = computed(() => players.value.map(player => {
  return {
    name: player.name,
    score: pastures.value.filter(pasture => pasture.owner?.name === player.name).length
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
        {{ currentPlayer.name }}
        <div
          :class="currentPlayer.itemStyle"
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
      <div
        v-if="pasture.owner"
        :style="{ color: pasture.owner?.color }"
      >
        {{ pasture.amount }}
      </div>
      <div
        v-if="pasture.amount"
        :class="pasture.owner?.itemStyle"
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