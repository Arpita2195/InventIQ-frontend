import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosInstance'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('inventiq_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setInitializing(false)
  }, [])

  useEffect(() => {
    if (user?.token) api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`
    else delete api.defaults.headers.common['Authorization']
  }, [user])

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data)
      localStorage.setItem('inventiq_user', JSON.stringify(data))
      return data
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }

  const register = async (form) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/register', form)
      setUser(data)
      localStorage.setItem('inventiq_user', JSON.stringify(data))
      return data
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('inventiq_user')
    delete api.defaults.headers.common['Authorization']
  }

  const updateUser = (data) => {
    setUser(data)
    localStorage.setItem('inventiq_user', JSON.stringify(data))
  }

  return (
    <AuthContext.Provider value={{ user, loading, initializing, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
