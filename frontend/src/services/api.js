import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Workouts
export const workoutAPI = {
  getAll:        ()     => api.get('/workouts'),
  add:           (d)    => api.post('/workouts', d),
  update:        (id,d) => api.put(`/workouts/${id}`, d),
  remove:        (id)   => api.delete(`/workouts/${id}`),
  weeklyStats:   ()     => api.get('/workouts/stats/weekly'),
  monthlyStats:  ()     => api.get('/workouts/stats/monthly'),
};

// Steps
export const stepsAPI = {
  getAll:  ()    => api.get('/steps'),
  add:     (d)   => api.post('/steps', d),
  remove:  (id)  => api.delete(`/steps/${id}`),
  weekly:  ()    => api.get('/steps/weekly'),
};

// Weight
export const weightAPI = {
  getAll:  ()     => api.get('/weight'),
  add:     (d)    => api.post('/weight', d),
  update:  (id,d) => api.put(`/weight/${id}`, d),
  remove:  (id)   => api.delete(`/weight/${id}`),
};

// Goals
export const goalsAPI = {
  getAll:    ()     => api.get('/goals'),
  add:       (d)    => api.post('/goals', d),
  update:    (id,d) => api.put(`/goals/${id}`, d),
  remove:    (id)   => api.delete(`/goals/${id}`),
  completed: ()     => api.get('/goals/completed'),
};

// Social
export const socialAPI = {
  getFriends:         ()     => api.get('/social/friends'),
  getPending:         ()     => api.get('/social/friends/pending'),
  sendRequest:        (d)    => api.post('/social/friends', d),
  respondRequest:     (id,d) => api.put(`/social/friends/${id}/respond`, d),
  removeFriend:       (id)   => api.delete(`/social/friends/${id}`),
  searchUsers:        (q)    => api.get(`/social/users/search?q=${encodeURIComponent(q)}`),
  getAchievements:    ()     => api.get('/social/achievements'),
};

// Leaderboard
export const leaderboardAPI = {
  get:      (sort='steps', period='week') => api.get(`/leaderboard?sort=${sort}&period=${period}`),
  combined: (sort='steps', period='week') => api.get(`/leaderboard/combined?sort=${sort}&period=${period}`),
};

// Uploads
export const uploadAPI = {
  profilePic:     (form) => api.post('/uploads/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  progressPhoto:  (form) => api.post('/uploads/progress', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPhotos:      ()     => api.get('/uploads/progress'),
  deletePhoto:    (id)   => api.delete(`/uploads/progress/${id}`),
};

// Notifications
export const notifAPI = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllRead: ()   => api.put('/notifications/read-all'),
};

export default api;
