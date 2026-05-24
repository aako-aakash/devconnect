import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dc_token')
      localStorage.removeItem('dc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  me:     ()     => api.get('/auth/me'),
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export const postsAPI = {
  getFeed:      (page = 1, perPage = 20) => api.get(`/posts/feed?page=${page}&per_page=${perPage}`),
  create:       (data)    => api.post('/posts/', data),
  delete:       (id)      => api.delete(`/posts/${id}`),
  toggleLike:   (id)      => api.post(`/posts/${id}/like`),
  getComments:  (id)      => api.get(`/posts/${id}/comments`),
  addComment:   (id, data) => api.post(`/posts/${id}/comments`, data),
  searchPosts:  (q)       => api.get(`/posts/search/posts?q=${encodeURIComponent(q)}`),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:           (id)   => api.get(`/users/${id}`),
  getUserPosts:         (id)   => api.get(`/users/${id}/posts`),
  updateProfile:        (data) => api.patch('/users/me/profile', data),
  searchUsers:          (q)    => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  getNotifications:     ()     => api.get('/users/notifications'),
  markNotificationsRead: ()    => api.post('/users/notifications/read'),
}

export default api
