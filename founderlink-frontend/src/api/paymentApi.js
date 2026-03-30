import axios from 'axios';

const paymentApi = axios.create({
  baseURL: 'http://localhost:8089',
});

paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createOrder = (data) => paymentApi.post('/api/payments/create-order', data);
export const verifyPayment = (data) => paymentApi.post('/api/payments/verify', data);
export const acceptPayment = (paymentId) => paymentApi.put(`/api/payments/${paymentId}/accept`);
export const rejectPayment = (paymentId) => paymentApi.put(`/api/payments/${paymentId}/reject`);
export const getPaymentsByInvestor = (investorId) => paymentApi.get(`/api/payments/investor/${investorId}`);
export const getPaymentsByFounder = (founderId) => paymentApi.get(`/api/payments/founder/${founderId}`);
export const getPaymentsByStartup = (startupId) => paymentApi.get(`/api/payments/startup/${startupId}`);
export const getSagaStatus = (paymentId) => paymentApi.get(`/api/payments/${paymentId}/saga`);
