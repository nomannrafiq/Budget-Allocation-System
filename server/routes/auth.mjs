import express from 'express';
import { registerUser, getUserByCredentials } from '../dao.mjs';


const router = express.Router();


// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }

  try {
    const result = await registerUser(username, password, role);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'Username already exists. Please choose another one.') {
      res.status(409).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});


// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await getUserByCredentials(username, password);

    if (user) {
      res.status(200).json({ 
        message: `${user.role} login successful`, 
        user 
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout Successful' });
});


export default router;
