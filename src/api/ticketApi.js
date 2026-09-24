import { apiRequest } from './client';

export const getTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/tickets${query ? `?${query}` : ''}`);
};

export const getTicketById = (id) => apiRequest(`/tickets/${id}`);

export const createTicket = (data) =>
  apiRequest('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const addComment = (ticketId, data) =>
  apiRequest(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resolveTicket = (ticketId, resolutionSummary) =>
  apiRequest(`/tickets/${ticketId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolutionSummary }),
  });

export const reopenTicket = (ticketId, rejectionReason) =>
  apiRequest(`/tickets/${ticketId}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ rejectionReason }),
  });

export const closeTicket = (ticketId) =>
  apiRequest(`/tickets/${ticketId}/close`, {
    method: 'POST',
  });
