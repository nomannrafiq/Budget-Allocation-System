import express from 'express';
import {
  getAllProposals, getProposalById 
  
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

// GET /api/proposals/:id - Get proposal by ID 
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await getProposalById(id);
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (err) {
    console.error('Error fetching proposal:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});
export default router;
