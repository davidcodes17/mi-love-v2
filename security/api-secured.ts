import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure the base URL for your API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://144.126.249.18:9999'

// Create a configured axios instance
const apiSecured = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
apiSecured.interceptors.request.use(
  async (config) => {
    // You can add authentication token here
    const token = await AsyncStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiSecured.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export default apiSecured
