import express from 'express';
import { getCurrentPhase, updateCurrentPhase, restartToPhase0  } from '../dao.mjs';

const router = express.Router();

// Helper function to get phase name
function getPhaseeName(phase) {
  const phases = {
    0: 'SETUP',
    1: 'PROPOSAL',
    2: 'VOTING',
    3: 'SUMMARY'
  };
  return phases[phase] || 'UNKNOWN';
}

// GET /api/phase/current - Get current system phase
router.get('/current', async (req, res) => {
  try {
    const phase = await getCurrentPhase();
    res.json({ 
      current_phase: phase,
      phase_name: getPhaseeName(phase)
    });
  } catch (err) {
    console.error('Error fetching current phase:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// POST /api/phase/transition - Move to next phase
router.post('/transition', async (req, res) => {
  const { phase } = req.body;

  // Validation
  if (phase === undefined) {
    return res.status(400).json({ message: 'Phase number is required' });
  }

  if (isNaN(phase) || phase < 0 || phase > 3) {
    return res.status(400).json({ message: 'Phase must be between 0 and 3' });
  }

  try {
    const currentPhase = await getCurrentPhase();

    const newPhase = await updateCurrentPhase(phase);
    res.json({ 
      message: `Successfully moved to phase ${phase}`,
      previous_phase: currentPhase,
      current_phase: newPhase,
      phase_name: getPhaseeName(newPhase)
    });
  } catch (err) {
    console.error('Error transitioning phase:', err.message);
    
    if (err.message.includes('Phase must be')) {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// POST /api/phase/restart - Restart system to Phase 0
router.post('/restart', async (req, res) => {
  try {
    const result = await restartToPhase0();
    res.json({ 
      message: result.message,
      current_phase: result.phase,
      phase_name: 'SETUP',
      cleared: {
        proposals: 'All proposals deleted',
        votes: 'All votes deleted'
      }
    });
  } catch (err) {
    console.error('Error restarting system:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;