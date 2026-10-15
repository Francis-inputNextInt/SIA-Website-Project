/**
 * Chat API service — calls the backend POST /api/chat exclusively.
 *
 * All response-generation logic lives server-side (backend/src/data/responseEngine.js).
 * There is deliberately NO local fallback here: message generation must not be
 * duplicated in the browser. If the server is unreachable the error is surfaced
 * so the UI can show a helpful message.
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const API_BASE = env.VITE_API_BASE_URL || '/api';

export async function sendChatMessage(userMessage) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed with status ${response.status}.`);
  }

  const data = await response.json();

  // Short cosmetic delay so the typing indicator keeps its original feel.
  const delay = Math.floor(Math.random() * 250) + 300;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return data;
}