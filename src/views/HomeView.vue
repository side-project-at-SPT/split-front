<script setup>
import api from '@/assets/api'
import { RouterLink } from 'vue-router'
const getRooms = async () => {
  return api.getRooms()
}
const login = async () => {
  return api.login('account', 'password')
}
</script>

<template>
  <div>
    <RouterLink to="/game">
      Game
    </RouterLink>
  </div>
  <div>
    <div @click="getRooms">
      取得房間列表
    </div>
    <div @click="login">
      登入
    </div>
  </div>
</template>