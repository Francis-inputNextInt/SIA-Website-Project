/**
 * POST /api/chat
 * Receives a user message and returns an AI assistant response.
 */
import { Router } from 'express';
import { getMockResponse } from '../data/responseEngine.js';

const router = Router();

router.post('/chat', (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const result = getMockResponse(message);

  if (!result) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  res.json({
    id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    role: 'assistant',
    content: result.content,
    category: result.category,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
});

export default router;