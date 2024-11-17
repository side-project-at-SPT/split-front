<script setup>
import { computed } from 'vue'
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
  },
  active: {
    type: Boolean,
    default: false
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
  <div
    v-if="props.active"
    class="avatar justify-center flex"
  >
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
      :class="props.character"
      class="h-[106px] w-[106px] absolute"
    ></div>
    <div
      class="name flex justify-center items-center"
      :class="props.color"
    >
      {{ props.name }}
    </div>
    <div
      class="banner"
      :class="props.color"
    >
    </div>
    <!-- <div class="test-clip">
    </div> -->
  </div>
  <div
    v-else
    class="avatar justify-center flex"
  >
    <svg>
      <defs>
        <clipPath id="avatarClip">
          <path
            d="M82.4 42.8989C82.4 75.1473 73.6129 82 41.4 82C9.18712 82 0.400024 73.2032 0.400024 40.9548C0.400024 8.70636 9.18712 0 41.4 0C73.6129 0 82.4 10.6504 82.4 42.8989Z"
            fill="white"
          ></path>
        </clipPath>
      </defs>
    </svg>
    <div
      :class="props.character"
      class="h-[102px] w-[102px] test-clip  absolute top-5"
    ></div>
    <div
      class="name flex justify-center items-center"
      :class="props.color"
    >
      {{ props.name }}
    </div>
  </div>
</template>

<style scoped>
.tux,
.papua {
  background-image: url('@/assets/images/1.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.gunter,
.eudyptula {
  background-image: url('@/assets/images/2.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.abc,
.aptenodytes {
  background-image: url('@/assets/images/3.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.sin,
.eudyptes {
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