// TEMPORARY diagnostic probe #2 (Nov 17, 2026) — parallel-fetch test. Remove after use.
const URLS = [
  ['gn-ap', 'https://news.google.com/rss/search?q=site%3Aapnews.com&hl=en-US&gl=US&ceid=US%3Aen'],
  ['gn-cnn', 'https://news.google.com/rss/search?q=site%3Acnn.com&hl=en-US&gl=US&ceid=US%3Aen'],
  ['gn-fox', 'https://news.google.com/rss/search?q=site%3Afoxnews.com&hl=en-US&gl=US&ceid=US%3Aen'],
  ['gn-bbc', 'https://news.google.com/rss/search?q=site%3Abbc.com&hl=en-US&gl=US&ceid=US%3Aen'],
  ['gn-npr', 'https://news.google.com/rss/search?q=site%3Anpr.org&hl=en-US&gl=US&ceid=US%3Aen'],
  ['gn-nyt', 'https://news.google.com/rss/search?q=site%3Anytimes.com&hl=en-US&gl=US&ceid=US%3Aen'],
  ['zh', 'https://feeds.feedburner.com/zerohedge/feed'],
  ['dw', 'https://www.dailywire.com/feeds/rss.xml'],
  ['tg', 'https://t.me/s/rnintel'],
  ['espn', 'https://www.espn.com/espn/rss/news'],
  ['hill', 'https://thehill.com/feed/'],
  ['npr-direct', 'https://feeds.npr.org/1001/rss.xml'],
];
async function one([label, url]) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const headers = url.includes('t.me')
      ? { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewSurgeWire/1.0', Accept: 'text/html' }
      : { 'User-Agent': 'NewSurgeWire/1.0 (+https://newsurge.tv)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' };
    const r = await fetch(url, { signal: ctrl.signal, headers });
    if (!r.ok) return { label, status: r.status, items: 0 };
    const body = await r.text();
    return { label, status: r.status, bytes: body.length, items: (body.match(/<item>/g) || []).length, tg: body.includes('tgme_widget_message_text') };
  } catch (e) {
    return { label, error: String((e && e.message) || e), cause: String((e && e.cause && (e.cause.code || e.cause.message)) || '') };
  } finally {
    clearTimeout(to);
  }
}
export default async function handler(req, res) {
  // replicate buildWire: repeat the set 3x and fire ALL in parallel at once (~36 fetches)
  const jobs = [];
  for (let k = 0; k < 3; k++) for (const u of URLS) jobs.push(one(u));
  const out = await Promise.all(jobs);
  const ok = out.filter((o) => o.items > 0 || o.tg).length;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ at: new Date().toISOString(), parallel: jobs.length, withItems: ok, out });
}
