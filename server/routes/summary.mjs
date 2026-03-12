import express from 'express';
import { getAcceptedProposals, getCurrentBudget } from '../dao.mjs';

const router = express.Router();

// GET /api/summary - Get summary with budget and accepted proposals
router.get('/', async (req, res) => {
  try {
    const budget = await getCurrentBudget();
    const proposals = await getAcceptedProposals();

    if (!budget) {
      return res.status(404).json({ message: 'No budget defined' });
    }

    // Calculate spent and remaining
    const spent = proposals.reduce((sum, p) => sum + p.cost, 0);
    const remaining = budget.amount - spent;

    res.json({
      budget: {
        total: budget.amount,
        spent: spent,
        remaining: remaining,
        phase: budget.phase
      },
      proposals: proposals,
      summary: {
        total_proposals: proposals.length,
        accepted: proposals.filter(p => p.avg_score >= 2).length,
        rejected: proposals.filter(p => p.avg_score < 2).length
      }
    });
  } catch (err) {
    console.error('Error fetching summary:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;