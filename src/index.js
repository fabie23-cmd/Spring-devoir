import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import customersRouter from './routes/customers.js';
import measurementsRouter from './routes/measurements.js';
import garmentsRouter from './routes/garments.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 9090; // Updated port to 9090

// Middleware
app.use(cors());
app.use(express.json());

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Routes
app.use('/clients', customersRouter); // Updated route prefix
app.use('/api/measurements', measurementsRouter);
app.use('/api/garments', garmentsRouter);
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});