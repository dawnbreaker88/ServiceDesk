import { apiRequest } from './client';

export const sendAiChat = (data) =>
  apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const classifyIssue = (text) =>
  apiRequest('/ai/classify', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const escalateToTicket = (data) =>
  apiRequest('/ai/escalate', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getAiSessions = () => apiRequest('/ai/sessions');
