import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db } from './db.mjs';


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});