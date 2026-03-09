export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { make, model, year } = req.body;
  const apiKey = process.env.MARKETCHECK_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'MarketCheck API key not configured' });
  if (!make || !model) return res.status(400).json({ error: 'make and model are required' });

  try {
    // Search active listings — Chicago lat/lng for broad national coverage within 100mi radius
    const params = new URLSearchParams({
      api_key: apiKey,
      make: make.trim(),
      model: model.trim(),
      ...(year ? { year_min: parseInt(year) - 1, year_max: parseInt(year) + 1 } : {}),
      latitude: '41.8781',
      longitude: '-87.6298',
      radius: 100,
      rows: 20,
      start: 0,
      fields: 'price,miles,year,make,model,trim',
    });

    const url = `https://mc-api.marketcheck.com/v2/search/car/active?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('MarketCheck error:', data);
      return res.status(502).json({ error: 'MarketCheck API error', detail: data });
    }

    const listings = data.listings || [];

    if (listings.length === 0) {
      return res.status(200).json({ found: false, count: 0 });
    }

    // Filter out $0 or missing prices
    const prices = listings
      .map(l => l.price)
      .filter(p => p && p > 500);

    if (prices.length === 0) {
      return res.status(200).json({ found: false, count: 0 });
    }

    prices.sort((a, b) => a - b);
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const low = prices[0];
    const high = prices[prices.length - 1];
    const median = prices[Math.floor(prices.length / 2)];

    // Determine platform routing
    const yearNum = parseInt(year) || 2000;
    let platform = 'none';
    const collectibleMakes = ['porsche','ferrari','lamborghini','alfa romeo','lancia',
      'maserati','bmw','mercedes','jaguar','triumph','norton','vincent','ducati'];
    const enthusiastMakes = ['honda','toyota','mazda','nissan','subaru','mitsubishi',
      'ford','chevrolet','dodge','volkswagen','audi'];
    const makeLower = make.toLowerCase();

    if (yearNum < 2000 || collectibleMakes.some(m => makeLower.includes(m))) {
      platform = 'bat';
    } else if (yearNum >= 2000 && enthusiastMakes.some(m => makeLower.includes(m))) {
      platform = 'carsandbids';
    }

    const batQuery = `${make}+${model}`.toLowerCase().replace(/\s+/g, '+');
    const cabQuery = `${make} ${model}`.toLowerCase().replace(/\s+/g, '-');

    return res.status(200).json({
      found: true,
      count: prices.length,
      avg,
      low,
      high,
      median,
      platform,
      batUrl: `https://bringatrailer.com/search/?s=${batQuery}#listing-results`,
      cabUrl: `https://carsandbids.com/search#q=${encodeURIComponent(make + ' ' + model)}`,
    });

  } catch (err) {
    console.error('market-price handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
