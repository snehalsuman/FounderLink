import api from './axiosConfig';

export const createStartup = (data) => api.post('/startups', data);
export const getAllStartups = (page = 0, size = 10) => api.get(`/startups?page=${page}&size=${size}`);
export const getStartupById = (id) => api.get(`/startups/${id}`);
export const updateStartup = (id, data) => api.put(`/startups/${id}`, data);
export const deleteStartup = (id) => api.delete(`/startups/${id}`);
export const approveStartup = (id) => api.put(`/startups/${id}/approve`);
export const rejectStartup  = (id) => api.put(`/startups/${id}/reject`);
export const followStartup = (id) => api.post(`/startups/${id}/follow`);
export const getStartupsByFounder = (founderId) => api.get(`/startups/founder/${founderId}`);
export const getAllStartupsAdmin = () => api.get('/startups/admin/all?page=0&size=100');
