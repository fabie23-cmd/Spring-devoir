import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../index.js';

const router = express.Router();

// Validation middleware
const validateCustomerWithOrders = [
  body('prenom').notEmpty().withMessage('Le prénom est obligatoire').trim(),
  body('nom').notEmpty().withMessage('Le nom est obligatoire').trim(),
  body('telephone').notEmpty().withMessage('Le téléphone est obligatoire')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('telephone', value);
      
      if (error) throw new Error('Erreur de validation du téléphone');
      if (data && data.length > 0) {
        throw new Error('Ce numéro de téléphone existe déjà');
      }
      return true;
    }),
  body('address').notEmpty().withMessage('L\'adresse est obligatoire').trim(),
  body('orders').isArray({ min: 1 }).withMessage('Au moins une commande est requise'),
  body('orders.*.price').isFloat({ min: 0 }).withMessage('Le montant doit être positif'),
  body('orders.*.garment_id').notEmpty().withMessage('L\'article est obligatoire'),
];

// Create customer with orders
router.post('/:id/commandes', validateCustomerWithOrders, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { prenom, nom, telephone, address, orders } = req.body;

  try {
    // Start a Supabase transaction
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        Prenom,  
        nom,        
        telephone,
        address,
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    // Insert orders for the customer
    const ordersToInsert = orders.map(order => ({
      customer_id: customer.id,
      garment_id: order.garment_id,
      price: order.price,
      status: 'pending',
      created_at: new Date().toISOString()
    }));

    const { error: ordersError } = await supabase
      .from('orders')
      .insert(ordersToInsert);

    if (ordersError) throw ordersError;

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer orders with pagination
router.get('/:id/commandes', async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('prenom, nom, telephone')
      .eq('id', id)
      .single();

    if (customerError) throw customerError;

    // Get paginated orders
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select('created_at, price', { count: 'exact' })
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) throw ordersError;

    const response = {
      results: [{
        client: {
          nomComplet: `${customer.prenom} ${customer.nom}`,
          telephone: customer.telephone
        },
        commandes: orders.map(order => ({
          date: order.created_at,
          montant: order.price
        }))
      }],
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;