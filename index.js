const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  // ✅ Replace these with your actual Stripe Price IDs from dashboard
  const PRICE_IDS = {
    monthly: 'price_1RPZF4COIG8iILAlrhMjoLJp',
    annual: 'price_1RQwhtCOIG8iILAlosgcMJWH'
  };

  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid billing plan selected.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // 🔁 Required for recurring billing
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: 'https://auraai.uk/frontend/welcome.html',
      cancel_url: 'https://auraai.uk/frontend/pricing.html'
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
