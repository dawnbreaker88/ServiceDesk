import { apiRequest } from './client';

export const getGuides = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/guides${query ? `?${query}` : ''}`);
};
export const getGuideById = (id) => apiRequest(`/guides/${id}`);
export const getCategories = () => apiRequest('/categories');
