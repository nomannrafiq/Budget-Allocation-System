import express from 'express';
import { defineNewBudget, getCurrentBudget } from '../dao.mjs';

const router = express.Router();

// POST /api/budget - Set new budget
router.post('/', async (req, res) => {
  const { amount } = req.body;

  // Validation
  if (!amount) {
    return res.status(400).json({ message: 'Budget amount is required' });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Budget amount must be a positive number' });
  }

  try {
    const budget = await defineNewBudget(amount);
    res.status(201).json({ 
      message: 'Budget set successfully', 
      budget 
    });
  } catch (err) {
    console.error('Error setting budget:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// GET /api/budget - Get current budget
router.get('/', async (req, res) => {
  try {
    const budget = await getCurrentBudget();
    
    if (!budget) {
      return res.status(404).json({ message: 'No budget defined yet' });
    }

    res.json(budget);
  } catch (err) {
    console.error('Error fetching budget:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;