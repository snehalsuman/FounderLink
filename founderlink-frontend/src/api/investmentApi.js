import api from './axiosConfig';

export const createInvestment = (data) => api.post('/investments', data);
export const getInvestmentsByStartup = (startupId) => api.get(`/investments/startup/${startupId}`);
export const getMyInvestments = (investorId) => api.get(`/investments/investor/${investorId}`);
export const approveInvestment = (id) => api.put(`/investments/${id}/approve`);
export const rejectInvestment = (id) => api.put(`/investments/${id}/reject`);
