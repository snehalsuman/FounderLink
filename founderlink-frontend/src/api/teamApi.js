import api from './axiosConfig';

export const inviteCoFounder = (data) => api.post('/teams/invite', data);
export const acceptInvitation = (invitationId) => api.post(`/teams/join/${invitationId}`);
export const rejectInvitation = (invitationId) => api.put(`/teams/reject/${invitationId}`);
export const getTeamByStartup = (startupId) => api.get(`/teams/startup/${startupId}`);
export const getMyInvitations = () => api.get('/teams/invitations/my');
export const updateMemberRole = (memberId, data) => api.put(`/teams/${memberId}/role`, data);
