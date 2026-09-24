import { apiRequest } from './client';

export const getMyAssets = () => apiRequest('/assets/my-assets');
export const getAssets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/assets${query ? `?${query}` : ''}`);
};
export const getAssetById = (id) => apiRequest(`/assets/${id}`);
