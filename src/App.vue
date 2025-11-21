<script setup>
import GameAudio from './components/GameAudio.vue'
</script>

<template>
  <div>
    <GameAudio />
    <router-view />
  </div>
</template>

<style>
:root {
  --red-400: #e75027;
  --yellow-400: #ff9200;
  --green-400: #79bf00;
  --blue-400: #2b9cef;
  --red-300: #fb8464;
  --yellow-300: #ffc23b;
  --green-300: #a1d548;
  --blue-300: #56b2f6;
}

body {
  background-image: url('@/assets/images/bg.webp');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: 100% 100%;
}
</style>