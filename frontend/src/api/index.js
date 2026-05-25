import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'

const api = axios.create({ baseURL: BASE, timeout: 15000 })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('dc_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dc_token')
      localStorage.removeItem('dc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  signup: d => api.post('/auth/signup', d),
  login:  d => api.post('/auth/login', d),
  me:     ()  => api.get('/auth/me'),
}

export const postsAPI = {
  feed:        (p=1,n=15)  => api.get(`/posts/feed?page=${p}&per_page=${n}`),
  create:      d           => api.post('/posts/', d),
  remove:      id          => api.delete(`/posts/${id}`),
  like:        id          => api.post(`/posts/${id}/like`),
  comments:    id          => api.get(`/posts/${id}/comments`),
  addComment:  (id,d)      => api.post(`/posts/${id}/comments`, d),
  search:      q           => api.get(`/posts/search/posts?q=${encodeURIComponent(q)}`),
}

export const usersAPI = {
  profile:          id  => api.get(`/users/${id}`),
  posts:            id  => api.get(`/users/${id}/posts`),
  update:           d   => api.patch('/users/me/profile', d),
  search:           q   => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  notifications:    ()  => api.get('/users/notifications'),
  markRead:         ()  => api.post('/users/notifications/read'),
}
