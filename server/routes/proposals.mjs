import express from 'express';
import {
  getAllProposals 
  
} from '../dao.mjs';

const router = express.Router();

// GET /api/proposals - Get all proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await getAllProposals();
    if (proposals.length === 0) {
      return res.status(404).json({ message: 'No proposals found' });
    }
    res.json(proposals);
  } catch (err) {
    console.error('Error fetching proposals:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
