import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../index.js';

const router = express.Router();

// Validation middleware
const validateGarment = [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('base_price').isFloat({ min: 0 }),
  body('estimated_hours').optional().isInt({ min: 0 }),
];

// Get all garments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('garments')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create garment
router.post('/', validateGarment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('garments')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update garment
router.put('/:id', validateGarment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('garments')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Garment not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;