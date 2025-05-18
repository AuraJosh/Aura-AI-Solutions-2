const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: { name: 'Essential Plan' },
          unit_amount: 2500, // £25 in pence
        },
        quantity: 1,
      },
    ],
    success_url: 'https://auraai.uk',
    cancel_url: 'https://auraai.uk/frontend/pricing.html',
  });

  res.json({ id: session.id });
});

app.listen(process.env.PORT || 4242, () =>
  console.log('Server running on port 4242')
);
