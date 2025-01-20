import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../index.js';

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('customer_id').notEmpty().isUUID(),
  body('garment_id').notEmpty().isUUID(),
  body('status').isIn(['pending', 'in_progress', 'ready', 'delivered', 'cancelled']),
  body('price').isFloat({ min: 0 }),
  body('notes').optional().trim(),
  body('due_date').optional().isISO8601().toDate(),
];

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (id, prenom, nom),
        garments (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        garments (id, name)
      `)
      .eq('customer_id', req.params.customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', validateOrder, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'in_progress', 'ready', 'delivered', 'cancelled']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;