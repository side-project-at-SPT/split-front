import axios from 'axios'
import { ref } from 'vue'
const token = ref(localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQsImV4cCI6MTcxODc2OTMyNH0.4foZU9X0ztp4m8UVeXXUSi4h0_RrFH1l8oRVFV_EF6k')
const axiosInstance = axios.create({
  baseURL: 'https://spt-games-split.zeabur.app/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.value
  },
})
const api = {
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
    } catch (error) {
      return error
    }
  },
  getRooms: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/rooms')
      return response.data
    } catch (error) {
      return error.response.data
    }
  },
}
export default api