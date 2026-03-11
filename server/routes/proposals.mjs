import express from 'express';
import {
  getAllProposals, getProposalById, createProposal, updateProposal
  
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

// POST /api/proposals - Create new proposal
router.post('/', async (req, res) => {
  const { userId, description, cost } = req.body;

  // Validation
  if (!userId || !description || !cost) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(cost) || cost <= 0) {
    return res.status(400).json({ message: 'Cost must be a positive number' });
  }

  try {
    const proposal = await createProposal(userId, description, cost);
    res.status(201).json({ 
      message: 'Proposal created successfully', 
      proposal 
    });
  } catch (err) {
    console.error('Error creating proposal:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/proposals/:id - Update proposal
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, cost } = req.body;

  // Validation
  if (!description || !cost) {
    return res.status(400).json({ message: 'Description and cost are required' });
  }

  if (isNaN(cost) || cost <= 0) {
    return res.status(400).json({ message: 'Cost must be a positive number' });
  }

  try {
    // Check if proposal exists
    const proposal = await getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Update proposal
    const updatedProposal = await updateProposal(id, description, cost);
    res.json({ 
      message: 'Proposal updated successfully', 
      proposal: updatedProposal 
    });
  } catch (err) {
    console.error('Error updating proposal:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
