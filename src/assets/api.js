import axios from 'axios'
import { ref } from 'vue'
const errorMessage = ref({})
const token = ref(localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQsImV4cCI6MTcxODc2OTMyNH0.4foZU9X0ztp4m8UVeXXUSi4h0_RrFH1l8oRVFV_EF6k')
const axiosInstance = axios.create({
  baseURL: 'https://spt-games-split.zeabur.app/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.value
  },
})
axiosInstance.interceptors.response.use(response => {
  return response
}, error => {
  errorMessage.value = error.response.data
  if (error.response.status === 401) {
    localStorage.removeItem('token')
    token.value = ''
  }
  return Promise.reject(error)
})
const api = {
  errorMessage,
  login: async (name, password) => {
    try {
      const response = await axiosInstance.post('/api/v1/users', {
        name: name,
        password: password
      })
      token.value = response.data.token
      localStorage.setItem('token', response.data.token)
      axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.token
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  getUsers: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users')
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  getUserInfo: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/me')
      return response.data
    }
    catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        token.value = ''
      }
      throw error.response.data
    }
  },
  getUserPreferences: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/preferences')
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  setUserPreferences: async (preferences) => {
    try {
      const response = await axiosInstance.patch('/api/v1/preferences', preferences)
      return response.data
    }
    catch (error) {
      if (error.response.status === 304) {
        return { status: 304 }
      }
      throw error.response.data
    }
  },
  getRooms: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/rooms')
      return response.data
    }
    catch (error) {
      return error.response.data
    }
  },
  getRoomInfo: async (id) => {
    try {
      const response = await axiosInstance.get('/api/v1/rooms/' + id)
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  createRoom: async (name) => {
    try {
      const response = await axiosInstance.post('/api/v1/rooms', {
        name
      })
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  joinRoom: async (id) => {
    try {
      const response = await axiosInstance.put('/api/v1/rooms/' + id)
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  leaveRoom: async (id) => {
    try {
      const response = await axiosInstance.delete('/api/v1/rooms/' + id)
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  closeRoom: async (id) => {
    try {
      const response = await axiosInstance.post('/api/v1/rooms/' + id + '/close')
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  startGame: async (id) => {
    try {
      const response = await axiosInstance.post('/api/v1/rooms/' + id + '/game')
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  },
  getGameStatus: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/games/${ id }`)
      return response.data
    }
    catch (error) {
      throw error.response.data
    }
  }
}
export default api