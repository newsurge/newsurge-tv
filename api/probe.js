// TEMPORARY diagnostic probe (Nov 17, 2026) — remove after use.
export default async function handler(req, res) {
  const H = { 'User-Agent': 'NewSurgeWire/1.0 (+https://newsurge.tv)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' };
  async function t(label, url, headers) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);
    try {
      const r = await fetch(url, { signal: ctrl.signal, headers });
      const body = await r.text();
      return { label, status: r.status, ok: r.ok, bytes: body.length, items: (body.match(/<item>/g) || []).length, tg: body.includes('tgme_widget_message_text'), head: body.slice(0, 90) };
    } catch (e) {
      return { label, error: String((e && e.message) || e), cause: String((e && e.cause && (e.cause.code || e.cause.message)) || '') };
    } finally {
      clearTimeout(to);
    }
  }
  const out = [];
  out.push(await t('gn-ap-wire-headers', 'https://news.google.com/rss/search?q=site%3Aapnews.com&hl=en-US&gl=US&ceid=US%3Aen', H));
  out.push(await t('gn-ap-plain', 'https://news.google.com/rss/search?q=site%3Aapnews.com&hl=en-US&gl=US&ceid=US%3Aen', undefined));
  out.push(await t('zh-feedburner-wire-headers', 'https://feeds.feedburner.com/zerohedge/feed', H));
  out.push(await t('dw-direct-wire-headers', 'https://www.dailywire.com/feeds/rss.xml', H));
  out.push(await t('telegram-browser-ua', 'https://t.me/s/rnintel', { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewSurgeWire/1.0', Accept: 'text/html' }));
  out.push(await t('goldapi-control', 'https://api.gold-api.com/price/XAU', undefined));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ at: new Date().toISOString(), out });
}
