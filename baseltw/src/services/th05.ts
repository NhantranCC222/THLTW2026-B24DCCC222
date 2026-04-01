import { request } from 'umi';

// CLUB
export const getClubs = () => request('/api/clubs');

export const addClub = (data: any) =>
  request('/api/clubs', {
    method: 'POST',
    data,
  });

// APPLICATION
export const getApplications = () =>
  request('/api/applications');