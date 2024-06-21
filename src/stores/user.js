import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/assets/api'
export const useUserStore = defineStore('useUserStore', () => {
  const userInfo = ref({})
  const userUserPreferences = ref({})
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
  const user = computed(() => {
    return {
      ...userInfo.value,
      ...userUserPreferences.value
    }
  })
  return {
    userInfo,
    user,
    getUserInfo
  }
})