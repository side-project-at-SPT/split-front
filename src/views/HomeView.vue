<script setup>
import {
  ref, computed 
} from 'vue'
import TuxImage from '@/assets/images/tux.png'
const pastures = ref([])
// initialize pastures
for (let x = 0; x < 5; x++)
  for (let y = 0; y < 5; y++)
    pastures.value.push({
      x, y, amount: 0, selected: false
    })
const players = [ {
  name: 'Tux', color: '#ae0000', itemStyle: 'tux'
}, {
  name: '阿鵝', color: '#2563eb', itemStyle: 'gunter'
} ]
pastures.value[0].amount = 16
pastures.value[0].owner = players[0]
pastures.value[pastures.value.length - 1].amount = 16
pastures.value[pastures.value.length - 1].owner = players[1]
//
const currentPlayerIndex = ref(0)
const currentPlayer = computed(() => players[currentPlayerIndex.value])
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
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.length
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
    alert('無法移動，換下一位玩家')
    nextPlayer()
  }
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
}
console.log(TuxImage)
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
      <div :style="{ color: pasture.owner?.color }">
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
</style>