/**
 * Chat API service — calls the backend POST /api/chat exclusively.
 * Sends user message, conversation history, and bearer token if authenticated.
 */
import { supabase } from './supabase.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const API_BASE = env.VITE_API_BASE_URL || '/api';

async function getAccessToken() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (err) {
    return null;
  }
}

export async function sendChatMessage(userMessage, history = []) {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ message: userMessage, history })
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

