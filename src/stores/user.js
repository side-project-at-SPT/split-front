import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/assets/api'
export const useUserStore = defineStore('useUserStore', () => {
  const users = ref([])
  const userInfo = ref({})
  const userUserPreferences = ref({})
  const getUsers = () => {
    return api.getUsers().then(res => {
      users.value = res.users
    })
  }
  const getUserInfo = () => {
    return api.getUserInfo().then(res => {
      getUserPreferences()
      userInfo.value = res
    })
  }
  const getUserPreferences = async () => {
    return api.getUserPreferences().then(res => {
      userUserPreferences.value = res
    })
  }
  const setNickname = async (nickname) => {
    const params = {
      nickname
    }
    return api.setUserPreferences(params).then(res => {
      if (res.status === 304) return
      userUserPreferences.value.nickname = res.nickname
      return 
    })
  }
  const user = computed(() => {
    return {
      ...userInfo.value,
      ...userUserPreferences.value
    }
  })
  const onlineUsers = computed(() => { 
    return users.value.filter(user => user.is_online)
  })
  return {
    userInfo,
    user,
    onlineUsers,
    getUsers,
    getUserInfo,
    setNickname
  }
})