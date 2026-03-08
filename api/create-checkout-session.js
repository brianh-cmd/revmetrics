import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, email, refCode } = req.body;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://revmetrics.vercel.app/?status=success`,
      cancel_url: `https://revmetrics.vercel.app/?status=cancelled`,
    };

    if (refCode) sessionParams.client_reference_id = refCode;

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: err.message });
  }
}
