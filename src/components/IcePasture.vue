<script setup>
// import { computed } from 'vue'
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
})
const emit = defineEmits([ 'handleClick' ])
const handleClick = (pasture) => {
  emit('handleClick', pasture)
}
const pasture = props.pasture
const needPutCharacter = props.needPutCharacter
const currentPlayer = props.currentPlayer
const originPasure = props.originPasure
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
    <!-- <div>{{ pasture.owner?.nickname }}</div> -->
    </div>
    <div
      class="hexagon-bg"
      :class="{ [pasture.owner?.color]: pasture.owner }"
    >
      123
    </div>
  </div>
</template>

<style scoped>
.tux {
  background-image: url('@/assets/images/1.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.gunter {
  background-image: url('@/assets/images/2.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.abc {
  background-image: url('@/assets/images/3.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.sin {
  background-image: url('@/assets/images/4.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
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

.banner {
  position: absolute;
  top: 31px;
  left: -50px;
  width: 100px;
  height: 64px;
}

.banner.blue {
  background: linear-gradient(270deg, rgba(86, 178, 246, 0) 0%, rgba(86, 178, 246, .8) 100%);
}

.banner.red {
  background: linear-gradient(270deg, rgba(231, 80, 39, 0) 0%, rgba(231, 80, 39, .8) 100%);
}

.banner.green {
  background: linear-gradient(270deg, rgba(121, 191, 0, 0) 0%, rgba(121, 191, 0, .8) 100%);
}

.banner.yellow {
  background: linear-gradient(270deg, rgba(255, 146, 0, 0) 0%, rgba(255, 146, 0, .8) 100%);
}
.hexagon {
    position: absolute;
    width: 100px;
    height: calc(100px * 2 / sqrt(3));
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
.hexagon.green {
  background: linear-gradient(180deg, #E4FFB5 0%, #CAF67E 100%);
}
.hexagon.yellow {
  background: linear-gradient(180deg, #FFFAD4 0%, #FFF7AE 100%);
}
.hexagon-bg {
  position: absolute;
  width: 100px;
  height: calc(100px * 2 / sqrt(3));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #27B8E0;
  z-index: -10;
  top: 12px;
}
.hexagon-bg.green {
  background: #A1D548;
}
.hexagon-bg.yellow {
  background: #FFC23B;
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
</style>