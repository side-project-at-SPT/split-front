<script setup>
import { toRefs } from 'vue'
const props = defineProps({
  pasture: {
    type: Object,
    required: true
  },
  needPutCharacter: {
    type: Boolean,
    default: false
  },
  currentPlayer: {
    type: Object,
    required: true
  },
  isOrigin: {
    type: Boolean,
    default: false
  },
  originExist: {
    type: Boolean,
    default: false
  },
  isTarget: {
    type: Boolean,
    default: false
  },
  targetExist: {
    type: Boolean,
    default: false
  },
  myTurn: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits([ 'handleClick' ])
const handleClick = (pasture) => {
  emit('handleClick', pasture)
}

const {
  pasture, needPutCharacter, currentPlayer, isOrigin, isTarget, originExist, targetExist
} = toRefs(props)

// const pasture = props.pasture
// const needPutCharacter = props.needPutCharacter
// const currentPlayer = props.currentPlayer
// const originPasure = props.originPasure
// const gradientFrom = computed(() => {
//   switch (props.color) {
//   case 'red':
//     return '#FCC0B4'
//   case 'blue':
//     return '#B3D9FF'
//   case 'green':
//     return '#CAF67E'
//   case 'yellow':
//     return '#FFF7AE'
//   default:
//     return '#FCC0B4'
//   }
// })
// const gradientEnd = computed(() => {
//   switch (props.color) {
//   case 'red':
//     return '#E75027'
//   case 'blue':
//     return '#2B9CEF'
//   case 'green':
//     return '#79BF00'
//   case 'yellow':
//     return '#FF9200'
//   default:
//     return '#E75027'
//   }
// })
</script>

<template>
  <div class="relative">
    <div
      :key="`${pasture.x}-${pasture.y}`"
      class="hexagon flex flex-col justify-center items-center text-black cursor-pointer"
      :class="{ 
        'bg-active-pasture': pasture.isAllowTarget || (needPutCharacter && pasture.isEdge) ,
        'ice': !pasture.selected && !pasture.isAllowTarget && !(needPutCharacter && pasture.isEdge),
        [pasture.owner?.color]: pasture.owner,
        'is-origin': isOrigin,
        'is-target': isTarget,
      }"
      @click="()=>handleClick(pasture)"
    >
      <!-- <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div> -->
      <!-- <div>
        ({{ pasture.x }},{{ pasture.y }}),{{ pasture.isEdge }}
      </div> -->
      <div class="amount-bg">
      </div>
      <div class="w-[50px] h-[40px] absolute rounded-full top-[65px] land">
      </div>
      <div
        v-if="pasture.amount"
        :class="[pasture.owner?.character , { 'zoom-in-out': pasture.owner?.id === currentPlayer.id && !originExist && !pasture.is_blocked,
                                              'opacity-40': myTurn && pasture.owner?.id !== currentPlayer.id }]"
        class="pasture"
      ></div>
    <!-- <div>{{ pasture.owner?.nickname }}</div> -->
    </div>
    <div
      v-if="pasture.owner"
      class="penguin-amount"
    >
      {{ pasture.amount }}
    </div>
    <div
      class="hexagon-bg"
      :class="{ [pasture.owner?.color]: pasture.owner }"
    >
    </div>
    <div
      v-if="!targetExist && isOrigin"
      class="shine"
    >
    </div>
    <div
      v-if="isOrigin || isTarget"
      class="pin"
    >
    </div>
  </div>
</template>

<style scoped>
.pasture.tux {
  background-image: url('@/assets/images/1p.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.pasture.gunter {
  background-image: url('@/assets/images/2p.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.pasture.abc {
  background-image: url('@/assets/images/3p.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.pasture.sin {
  background-image: url('@/assets/images/4p.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* .bg-active-pasture:hover {
  background-image: url('@/assets/images/3p.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 86px 86px;
} */

.pasture {
  z-index: 10;
  width: 64px;
  height: 64px;
  margin-top: 16px;
}

.penguin-amount {
  position: absolute;
  top: 1.3rem;
  left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
}

.is-origin ~ .penguin-amount,
.is-target ~ .penguin-amount {
  top: -13px;
  left: 17px;
  z-index: 1;
  gap: 10px;
  width: 69px;
  height: 36px;
  padding: 10px;
  background: #0f2a30e5;
  border-radius: 20px;
  opacity: 0px;
  animation: animate-amount 2s linear infinite;
}

#avatar {
  position: relative;
  stroke: #fff;
  /* width: 106px;
  height: 106px; */
  /* border: 5px solid #fff; */
  stroke-width: 5px;
}

.name {
  position: absolute;
  bottom: -12px;
  width: 98px;
  height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  border-radius: 30px;
}

.name.red {
  background: #e75027;
}

.name.blue {
  background: #2b9cef;
}

.name.green {
  background: #79bf00;
}

.name.yellow {
  background: #ff9200;
}

.test-clip {
  position: absolute;
  width: 82px;
  height: 82px;
  clip-path: url('#avatarClip');
  background-color: #fff;
}

.hexagon {
  position: absolute;
  width: 100px;
  height: calc(100px * 2 / sqrt(3));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.hexagon.green {
  background: linear-gradient(180deg, #e4ffb5 0%, #caf67e 100%);

  .amount-bg {
    background: var(--green-400);
  }

  .land {
    background: var(--green-300);
  }
}

.hexagon.yellow {
  background: linear-gradient(180deg, #fffad4 0%, #fff7ae 100%);

  .amount-bg {
    background: var(--yellow-400);
  }

  .land {
    background: var(--yellow-300);
  }
}

.hexagon.red {
  background: linear-gradient(180deg, #ffd5cc 0%, #fcc0b4 100%);

  .amount-bg {
    background: var(--red-400);
  }

  .land {
    background: var(--red-300);
  }
}

.hexagon.blue {
  background: linear-gradient(180deg, #cce6ff 0%, #b3d9ff 100%);

  .amount-bg {
    background: var(--blue-400);
  }

  .land {
    background: var(--blue-300);
  }
}

.amount-bg {
  position: absolute;
  top: -15px;
  left: -36px;
  z-index: -1;
  width: 82px;
  height: 82px;
  border-radius: 50%;
}

.is-origin > .amount-bg,
.is-target > .amount-bg {
  display: none;
}

.hexagon-bg {
  position: absolute;
  top: 12px;
  z-index: -10;
  width: 100px;
  height: calc(100px * 2 / sqrt(3));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #27b8e0;

  &.green {
    background: #a1d548;
  }

  &.yellow {
    background: #ffc23b;
  }

  &.red {
    background: #fb8464;
  }

  &.blue {
    background: #56b2f6;
  }
}

.shine {
  position: absolute;
  top: -83px;
  left: -96px;
  z-index: 11;
  width: 280px;
  height: 280px;
  pointer-events: none;
  background-image: url('@/assets/images/shine.svg');
  transform-origin: 144px 144px;
  animation: animate-shine 2s linear infinite;
}
@keyframes animate-shine {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.pin {
  position: absolute;
  top: -75px;
  left: 30px;
  z-index: 12;
  width: 40px;
  height: 50px;
  pointer-events: none;
  background-image: url('@/assets/images/pin.svg');
  animation: animate-pin 2s linear infinite;
}
@keyframes animate-pin {
  0% {
    transform: translateY(20px);
  }

  50% {
    transform: translateY(30px);
  }

  100% {
    transform: translateY(20px);
  }
}
@keyframes animate-amount {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(10px);
  }

  100% {
    transform: translateY(0px);
  }
}
</style>