import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: err.message });
  }

  console.log('Webhook event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    const referralCode = session.client_reference_id;

    // Retrieve full session with line items expanded
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });

    const priceId = fullSession.line_items?.data?.[0]?.price?.id;
    console.log('priceId:', priceId);
    console.log('ANNUAL price:', process.env.REACT_APP_STRIPE_ANNUAL);
    const plan = priceId === process.env.REACT_APP_STRIPE_ANNUAL ? 'annual' : 'monthly';
    console.log('Plan:', plan, 'Email:', email);

    try {
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            plan,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription
          })
        }
      );
      const updateData = await updateRes.json();
      console.log('Supabase update result:', JSON.stringify(updateData));

      if (referralCode) {
        await fetch(
          `${supabaseUrl}/rest/v1/profiles?referral_code=eq.${referralCode}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ referral_credits: 1 })
          }
        );
      }

      console.log(`✅ Plan updated to ${plan} for ${email}`);
    } catch (err) {
      console.error('Supabase update error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }
  }

  res.status(200).json({ received: true });
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
