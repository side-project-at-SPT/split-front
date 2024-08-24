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
  originPasure: {
    type: Object,
    default: null
  },
  targetPasure: {
    type: Object,
    default: null
  }
})
const emit = defineEmits([ 'handleClick' ])
const handleClick = (pasture) => {
  emit('handleClick', pasture)
}

const {
  pasture, needPutCharacter, currentPlayer, originPasure, targetPasure 
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
      :class="{ 'bg-green-500': pasture.selected || (needPutCharacter && pasture.isEdge),
                'bg-green-400': pasture.isAllowTarget,
                'ice': !pasture.selected && !pasture.isAllowTarget && !(needPutCharacter && pasture.isEdge),
                [pasture.owner?.color]: pasture.owner,
      }"
      @click="()=>handleClick(pasture)"
    >
      <!-- <div>
        {{ `${pasture.x},${pasture.y}` }}
      </div> -->
      <!-- <div>
        ({{ pasture.x }},{{ pasture.y }}),{{ pasture.isEdge }}
      </div> -->
      <div class="w-[75px] h-[75px] absolute rounded-full -top-[20px] -left-[40px] amount-bg">
      </div>
      <div class="w-[50px] h-[40px] absolute rounded-full top-[65px] land">
      </div>
      <div
        v-if="pasture.owner"
        class="absolute top-[1.3rem] left-2 text-white"
      >
        {{ pasture.amount }}
      </div>
      <div
        v-if="pasture.amount"
        :class="[pasture.owner?.character , { 'zoom-in-out': pasture.owner?.id === currentPlayer.id && !originPasure && !pasture.is_blocked }]"
        class="pasture"
      ></div>
    <!-- <div>{{ pasture.owner?.nickname }}</div> -->
    </div>
    <div
      class="hexagon-bg"
      :class="{ [pasture.owner?.color]: pasture.owner }"
    >
    </div>
    <div
      v-if="originPasure && !targetPasure && pasture.x === originPasure.x && pasture.y === originPasure.y"
      class="shine"
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

.pasture {
  z-index: 10;
  width: 86px;
  height: 86px;
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

.hexagon-bg {
  position: absolute;
  top: 12px;
  z-index: -10;
  width: 100px;
  height: calc(100px * 2 / sqrt(3));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #27b8e0;
}

.hexagon-bg.green {
  background: #a1d548;
}

.hexagon-bg.yellow {
  background: #ffc23b;
}
/* .test-clip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 5px solid #fff;
  clip-path: inherit;
} */
.shine {
  position: absolute;
  height: 280px;
  width: 280px;
  background-image: url('@/assets/images/shine.svg');
  animation: animate-shine 2s linear infinite;
  transform-origin: 144px 144px;
  pointer-events: none;
  top: -83px;
  left: -96px;
  z-index: 11;
  }
  @keyframes animate-shine {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>