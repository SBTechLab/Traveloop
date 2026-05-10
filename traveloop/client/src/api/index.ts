import api from './axios';

// Auth
export const signup = (data: { name: string; email: string; password: string }) => api.post('/auth/signup', data);
export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Trips
export const getTrips = () => api.get('/trips');
export const getTrip = (id: string) => api.get(`/trips/${id}`);
export const createTrip = (data: FormData) => api.post('/trips', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateTrip = (id: string, data: FormData) => api.put(`/trips/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteTrip = (id: string) => api.delete(`/trips/${id}`);

// Stops
export const createStop = (data: object) => api.post('/stops', data);
export const updateStop = (id: string, data: object) => api.put(`/stops/${id}`, data);
export const deleteStop = (id: string) => api.delete(`/stops/${id}`);
export const reorderStops = (tripId: string, orderedIds: string[]) => api.patch('/stops/reorder', { tripId, orderedIds });

// Cities
export const getCities = (params?: { search?: string; region?: string }) => api.get('/cities', { params });
export const getCity = (id: string) => api.get(`/cities/${id}`);

// Activities
export const getCityActivities = (cityId: string, params?: object) => api.get(`/activities/city/${cityId}`, { params });
export const addActivityToStop = (stopId: string, data: object) => api.post(`/activities/stop/${stopId}`, data);
export const removeStopActivity = (id: string) => api.delete(`/activities/stopActivity/${id}`);

// Budget
export const getBudget = (tripId: string) => api.get(`/budget/${tripId}`);
export const updateBudget = (tripId: string, data: object) => api.put(`/budget/${tripId}`, data);

// Packing
export const getPackingItems = (tripId: string) => api.get(`/packing/${tripId}`);
export const addPackingItem = (tripId: string, data: object) => api.post(`/packing/${tripId}`, data);
export const updatePackingItem = (id: string, data: object) => api.patch(`/packing/item/${id}`, data);
export const deletePackingItem = (id: string) => api.delete(`/packing/item/${id}`);
export const resetPackingItems = (tripId: string) => api.post(`/packing/${tripId}/reset`, {});

// Notes
export const getNotes = (tripId: string) => api.get(`/notes/${tripId}`);
export const createNote = (tripId: string, data: object) => api.post(`/notes/${tripId}`, data);
export const updateNote = (id: string, data: object) => api.put(`/notes/note/${id}`, data);
export const deleteNote = (id: string) => api.delete(`/notes/note/${id}`);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data: FormData) => api.put('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data: object) => api.put('/profile/password', data);
export const deleteAccount = () => api.delete('/profile');

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const toggleUserActive = (id: string) => api.patch(`/admin/users/${id}/toggle`, {});

// Share
export const getSharedTrip = (slug: string) => api.get(`/share/${slug}`);
export const copySharedTrip = (slug: string) => api.post(`/share/${slug}/copy`, {});
