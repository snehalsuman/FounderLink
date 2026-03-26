import api from './axiosConfig';

export const getNotifications = (userId) => api.get(`/notifications/${userId}`);
export const getUnreadNotifications = (userId) => api.get(`/notifications/${userId}/unread`);
export const markAsRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);
