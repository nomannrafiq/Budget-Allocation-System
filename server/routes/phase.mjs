import express from 'express';
import { getCurrentPhase } from '../dao.mjs';

const router = express.Router();

// GET /api/phase/current - Get current system phase
router.get('/current', async (req, res) => {
  try {
    const phase = await getCurrentPhase();
    res.json({ 
      current_phase: phase,
      phase_name: getPhaseName(phase)
    });
  } catch (err) {
    console.error('Error fetching current phase:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Helper function to get phase name
function getPhaseName(phase) {
  const phases = {
    0: 'SETUP',
    1: 'PROPOSAL',
    2: 'VOTING',
    3: 'SUMMARY'
  };
  return phases[phase] || 'UNKNOWN';
}

export default router;