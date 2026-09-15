import { getMockResponse } from '../data/mockResponses.js';

/**
 * Service to handle chat message processing.
 * Currently uses the frontend mock response system with simulated typing delay.
 * In future phases, this can be swapped with OpenAI API backend calls.
 */
export async function sendChatMessage(userMessage) {
  // Simulate network/AI generation delay (600ms - 850ms)
  const delay = Math.floor(Math.random() * 250) + 600;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = getMockResponse(userMessage);
      resolve({
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: response.content,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, delay);
  });
}

