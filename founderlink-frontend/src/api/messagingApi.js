import api from './axiosConfig';

export const sendMessage = (data) => api.post('/messages', data);
export const getConversationMessages = (conversationId) => api.get(`/messages/conversation/${conversationId}`);
export const getMyConversations = () => api.get('/messages/conversations');
export const startConversation = (otherUserId) => api.post(`/messages/conversations?otherUserId=${otherUserId}`);
