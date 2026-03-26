import api from './axiosConfig';

export const getMyProfile = (userId) => api.get(`/users/${userId}`);
export const updateProfile = (userId, data) => api.put(`/users/${userId}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);
export const searchUsersBySkill = (skill) => api.get(`/users/search?skill=${encodeURIComponent(skill)}`);
export const getCoFounderIds = () => api.get('/auth/users/by-role?role=ROLE_COFOUNDER');
export const getUsersByRole = (role) => api.get(`/auth/users/by-role?role=${role}`);
export const getAuthUserById = (id) => api.get(`/auth/users/${id}`);
export const getProfilesBatch = (userIds, skill) => {
  const params = new URLSearchParams({ userIds: userIds.join(',') });
  if (skill) params.append('skill', skill);
  return api.get(`/users/profiles/batch?${params}`);
};
