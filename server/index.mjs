import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db } from './db.mjs';
import authRoutes from './routes/auth.mjs';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));app.use(morgan('dev'));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});