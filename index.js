const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_your_secret_key'); // Replace with your real secret key

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON body

app.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  const PRICE_IDS = {
    monthly: 'prod_SKDg3M1fARmgaJ', // e.g., Essential Monthly
    annual: 'prod_SLdzQAUlhAHgyV'    // e.g., Essential Annual
  };

  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
