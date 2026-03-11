import express from 'express';
import { castVote, updateVote, deleteVote, getScoredProposals  } from '../dao.mjs';

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

// PUT /api/votes - Update vote
router.put('/', async (req, res) => {
  const { userId, proposalId, score } = req.body;

  // Validation
  if (!userId || !proposalId || score === undefined) {
    return res.status(400).json({ message: 'userId, proposalId, and score are required' });
  }

  if (isNaN(score) || score < 0 || score > 3) {
    return res.status(400).json({ message: 'Score must be between 0 and 3' });
  }

  try {
    const result = await updateVote(userId, proposalId, score);
    res.json(result);
  } catch (err) {
    console.error('Vote update error:', err.message);
    
    if (err.message.includes('No user with id')) {
      return res.status(404).json({ message: err.message });
    }
    
    if (err.message.includes('No vote found')) {
      return res.status(404).json({ message: err.message });
    }
    
    // Return the actual error for debugging
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// DELETE /api/votes - Delete vote
router.delete('/', async (req, res) => {
  const { userId, proposalId } = req.body;

  // Validation
  if (!userId || !proposalId) {
    return res.status(400).json({ message: 'userId and proposalId are required' });
  }

  try {
    const result = await deleteVote(userId, proposalId);
    res.json(result);
  } catch (err) {
    console.error('Vote delete error:', err.message);
    
    if (err.message.includes('No user with id')) {
      return res.status(404).json({ message: err.message });
    }
    
    if (err.message.includes('No vote found')) {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/votes/user/:userId - Get proposals user has voted on
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const proposals = await getScoredProposals(userId);
    
    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: 'No voted proposals found' });
    }

    res.json(proposals);
  } catch (err) {
    console.error('Error fetching voted proposals:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;