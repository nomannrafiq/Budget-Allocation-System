import express from 'express';
import { castVote } from '../dao.mjs';

const router = express.Router();

// POST /api/votes - Cast or update vote
router.post('/', async (req, res) => {
  const { userId, proposalId, score } = req.body;

  // Validation
  if (!userId || !proposalId || score === undefined) {
    return res.status(400).json({ message: 'userId, proposalId, and score are required' });
  }

  if (isNaN(score) || score < 0 || score > 3) {
    return res.status(400).json({ message: 'Score must be between 0 and 3' });
  }

  try {
    const result = await castVote(userId, proposalId, score);
    res.status(201).json(result);
  } catch (err) {
    console.error('Vote error:', err.message);
    
    // Check error type
    if (err.message.includes('No user with id')) {
      return res.status(404).json({ message: err.message });
    }
    
    if (err.message.includes('No proposal with id')) {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;