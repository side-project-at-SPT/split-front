<script setup>
import { defineProps, computed } from 'vue'
const props = defineProps({
  character: {
    type: String,
    default: 'tux'
  },
  color: {
    type: String,
    default: 'red'
  },
  name: {
    type: String,
    default: 'Player'
  }
})
const gradientFrom = computed(() => {
  switch (props.color) {
  case 'red':
    return '#FCC0B4'
  case 'blue':
    return '#B3D9FF'
  case 'green':
    return '#CAF67E'
  case 'yellow':
    return '#FFF7AE'
  default:
    return '#FCC0B4'
  }
})
const gradientEnd = computed(() => {
  switch (props.color) {
  case 'red':
    return '#E75027'
  case 'blue':
    return '#2B9CEF'
  case 'green':
    return '#79BF00'
  case 'yellow':
    return '#FF9200'
  default:
    return '#E75027'
  }
})
</script>

<template>
  <div class="avatar justify-center flex">
    <svg
      width="120"
      height="120"
      viewBox="-5 -5 116 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="avatar"
        d="M106.4 55.4546C106.4 97.1416 95.0411 106 53.4 106C11.759 106 0.400024 94.6285 0.400024 52.9416C0.400024 11.2546 11.759 0 53.4 0C95.0411 0 106.4 13.7676 106.4 55.4546Z"
        :fill="`url(#gradient-${props.color})`"
      ></path>
      <defs>
        <linearGradient
          :id="`gradient-${props.color}`"
          x1="53.4"
          y1="0"
          x2="53.4"
          y2="106"
          gradientUnits="userSpaceOnUse"
        >
          <stop :stop-color="gradientFrom"></stop>
          <stop
            offset="1"
            :stop-color="gradientEnd"
          ></stop>
        </linearGradient>
      </defs>
    </svg>
    <div
      class="name flex justify-center items-center"
      :class="props.color"
    >
      {{ props.name }}
    </div>
    <div
      :class="props.character"
      class="h-[106px] w-[106px] absolute"
    ></div>
  </div>
</template>

<style scoped>
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

.sin {
  background-image: url('@/assets/images/sin.png');
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
</style>