export default async function handler(req, res) {
  try {
    const [au, ag, pt] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU').then((r) => r.json()),
      fetch('https://api.gold-api.com/price/XAG').then((r) => r.json()),
      fetch('https://api.gold-api.com/price/XPT').then((r) => r.json()),
    ]);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json({ gold: au.price, silver: ag.price, platinum: pt.price });
  } catch (e) {
    res.status(502).json({ error: 'upstream unavailable' });
  }
}
