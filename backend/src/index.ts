import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: true, // Dynamically allows request origin while keeping credentials support
    credentials: true,
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mini ERP + CRM API Server Running', timestamp: new Date() });
});

// Centralized Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP Backend Server active on http://localhost:${PORT}`);
});

export default app;

