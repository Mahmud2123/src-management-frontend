import apiClient from './client2';

export async function postChat(message: string, conversationId?: string) {
  // apiClient already has base '/api' in browser; use path relative to that to avoid double /api
  return apiClient.post('/ai/chat', { message, conversationId }, { timeout: 60000 }).then((r) => r.data);
}

export async function getHistory() {
  return apiClient.get('/ai/history').then((r) => r.data);
}

export async function getConversation(id: string) {
  return apiClient.get(`/ai/history/${id}`).then((r) => r.data);
}
