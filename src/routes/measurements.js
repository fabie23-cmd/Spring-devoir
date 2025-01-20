import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../index.js';

const router = express.Router();

// Validation middleware
const validateMeasurement = [
  body('customer_id').notEmpty().isUUID(),
  body('bust').optional().isFloat(),
  body('waist').optional().isFloat(),
  body('hips').optional().isFloat(),
  body('shoulder_width').optional().isFloat(),
  body('arm_length').optional().isFloat(),
  body('inseam').optional().isFloat(),
  body('notes').optional().trim(),
];

// Get measurements by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('customer_id', req.params.customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create measurement
router.post('/', validateMeasurement, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('measurements')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update measurement
router.put('/:id', validateMeasurement, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('measurements')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Measurement not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;