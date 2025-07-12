// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL, // Lee la URL desde .env
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor opcional para añadir token si usas autenticación
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
