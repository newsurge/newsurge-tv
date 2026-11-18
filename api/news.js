// NewSurge.tv — THE GOOD NEWS WIRE
// Serverless aggregator: pulls positive-news RSS feeds, filters, returns JSON.
// FEEDS are filled from verified research (Oct 2026). Categories mirror the wire columns.
// OUTLET CHANNELS (Sergio's call, Oct 5 2026): the wire is now a channel lineup.
// Subject channels parked in api/_parked_subject_feeds.js. Positivity + denylist filters still apply.
// OUTLET CHANNELS (Sergio's call, Oct 5 2026): the wire is now a channel lineup.
// Each channel = one outlet's positive stories, grouped CENTER / RIGHT / LEFT (center first, his call).
// Alex Jones: slot reserved in CENTER — his direct feeds are all down as of Oct 5 2026 (infowars.com bot-walled + "Off Air", banned.video rebuilding, GCN RSS 522, Google News only stale/legal coverage). Wire it when reachable.
// Subject channels parked in api/_parked_subject_feeds.js. Positivity + denylist filters still apply.
const FEEDS = {
  // ---- CENTER ----
  goodnews: [
    { name: 'Good News Network', site: 'https://www.goodnewsnetwork.org', url: 'https://www.goodnewsnetwork.org/feed/' },
    { name: 'Positive News', site: 'https://www.positive.news', url: 'https://www.positive.news/feed/' },
    // section feed (Nov 14 2026): outlet-curated positive section — runs ungated
    // like GNN/Positive News above, still passes DENY/DENY_RE/AI/clickbait.
    { name: 'Reasons to be Cheerful', site: 'https://reasonstobecheerful.world', url: 'https://reasonstobecheerful.world/feed/', section: true },
    { name: 'Optimist Daily', site: 'https://www.optimistdaily.com', url: 'https://www.optimistdaily.com/feed/', section: true },
    { name: 'DailyGood', site: 'https://www.dailygood.org', url: 'https://feeds.feedburner.com/dailygood', section: true },
    // section feed (Nov 15 2026): feel-good aggregator, every item carries a photo.
    { name: 'InspireMore', site: 'https://www.inspiremore.com', url: 'https://www.inspiremore.com/feed/', section: true },
  ],
  ap: [
    { name: 'AP', site: 'https://apnews.com', url: 'https://news.google.com/rss/search?q=site:apnews.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'AP: Heroes', site: 'https://apnews.com', url: 'https://news.google.com/rss/search?q=site:apnews.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  reuters: [
    { name: 'Reuters', site: 'https://www.reuters.com', url: 'https://news.google.com/rss/search?q=site:reuters.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Reuters: Heroes', site: 'https://www.reuters.com', url: 'https://news.google.com/rss/search?q=site:reuters.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  usatoday: [
    { name: 'USA Today', site: 'https://www.usatoday.com', url: 'https://news.google.com/rss/search?q=site:usatoday.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'USA Today: Heroes', site: 'https://www.usatoday.com', url: 'https://news.google.com/rss/search?q=site:usatoday.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  axios: [
    { name: 'Axios', site: 'https://www.axios.com', url: 'https://news.google.com/rss/search?q=site:axios.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Axios: Heroes', site: 'https://www.axios.com', url: 'https://news.google.com/rss/search?q=site:axios.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  thehill: [
    // direct feed (Nov 15 2026): WordPress firehose, gated like every direct feed; items carry photos.
    { name: 'The Hill', site: 'https://thehill.com', url: 'https://thehill.com/feed/', direct: true },
    { name: 'The Hill', site: 'https://thehill.com', url: 'https://news.google.com/rss/search?q=site:thehill.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'The Hill: Heroes', site: 'https://thehill.com', url: 'https://news.google.com/rss/search?q=site:thehill.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  bloomberg: [
    { name: 'Bloomberg', site: 'https://www.bloomberg.com', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Bloomberg: Heroes', site: 'https://www.bloomberg.com', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  pbs: [
    { name: 'PBS News', site: 'https://www.pbs.org', url: 'https://news.google.com/rss/search?q=site:pbs.org+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'PBS News: Heroes', site: 'https://www.pbs.org', url: 'https://news.google.com/rss/search?q=site:pbs.org+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  alexjones: [
    { name: 'Alex Jones Live', site: 'https://www.alexjoneslive.com', url: 'https://www.alexjoneslive.com/feed/' },
  ],
  // ---- FAITH (Sergio's call, Nov 12 2026: EWTN is a news source) ----
  // Dedicated Catholic/Christian channel: DENY-filtered but NOT positivity-gated
  // (section trust level — his DENY list already strips politics/culture-war terms).
  // ewtn.com/rss 404s; EWTN's news arm publishes at ewtnnews.com (CNA rides the same platform).
  ewtn: [
    { name: 'EWTN News', site: 'https://www.ewtnnews.com', url: 'https://www.ewtnnews.com/rss', section: true },
    { name: 'Catholic News Agency', site: 'https://www.catholicnewsagency.com', url: 'https://www.catholicnewsagency.com/rss', section: true },
    { name: 'National Catholic Register', site: 'https://www.ncregister.com', url: 'https://www.ncregister.com/rss.xml', section: true },
    { name: 'Christian Post', site: 'https://www.christianpost.com', url: 'https://www.christianpost.com/rss', section: true },
    // section feeds (Nov 15 2026): more Catholic wires with per-item photos.
    { name: 'Crux', site: 'https://cruxnow.com', url: 'https://cruxnow.com/feed/', section: true },
    { name: 'OSV News', site: 'https://www.osvnews.com', url: 'https://www.osvnews.com/feed/', section: true },
    { name: 'Aleteia', site: 'https://aleteia.org', url: 'https://aleteia.org/feed/', section: true },
  ],
  // ---- RIGHT ----
  foxnews: [
    { name: 'Fox News', site: 'https://www.foxnews.com', url: 'https://feeds.foxnews.com/foxnews/latest', direct: true },
    // section feed (Nov 14 2026): Fox's own Good News vertical — ungated, DENY-filtered, all items carry photos.
    { name: 'Fox News: Good News', site: 'https://www.foxnews.com', url: 'https://moxie.foxnews.com/google-publisher/good-news.xml', section: true },
    // direct feed (Nov 15 2026): Fox's US desk via the same moxie pipe — gated, photo-carrying.
    { name: 'Fox News', site: 'https://www.foxnews.com', url: 'https://moxie.foxnews.com/google-publisher/us.xml', direct: true },
    { name: 'Fox News', site: 'https://www.foxnews.com', url: 'https://news.google.com/rss/search?q=site:foxnews.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Fox News: Heroes', site: 'https://www.foxnews.com', url: 'https://news.google.com/rss/search?q=site:foxnews.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  newsmax: [
    { name: 'Newsmax', site: 'https://www.newsmax.com', url: 'https://news.google.com/rss/search?q=site:newsmax.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Newsmax: Heroes', site: 'https://www.newsmax.com', url: 'https://news.google.com/rss/search?q=site:newsmax.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  nypost: [
    { name: 'NY Post', site: 'https://nypost.com', url: 'https://nypost.com/feed/', direct: true },
    { name: 'NY Post', site: 'https://nypost.com', url: 'https://news.google.com/rss/search?q=site:nypost.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'NY Post: Heroes', site: 'https://nypost.com', url: 'https://news.google.com/rss/search?q=site:nypost.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  washexaminer: [
    { name: 'Wash Examiner', site: 'https://www.washingtonexaminer.com', url: 'https://news.google.com/rss/search?q=site:washingtonexaminer.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Wash Examiner: Heroes', site: 'https://www.washingtonexaminer.com', url: 'https://news.google.com/rss/search?q=site:washingtonexaminer.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  washtimes: [
    { name: 'Wash Times', site: 'https://www.washingtontimes.com', url: 'https://news.google.com/rss/search?q=site:washingtontimes.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Wash Times: Heroes', site: 'https://www.washingtontimes.com', url: 'https://news.google.com/rss/search?q=site:washingtontimes.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  dailywire: [
    // direct feed (Nov 15 2026): the outlet's own RSS — gated, most items carry photos.
    { name: 'Daily Wire', site: 'https://www.dailywire.com', url: 'https://www.dailywire.com/feeds/rss.xml', direct: true },
    { name: 'Daily Wire', site: 'https://www.dailywire.com', url: 'https://news.google.com/rss/search?q=site:dailywire.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Daily Wire: Heroes', site: 'https://www.dailywire.com', url: 'https://news.google.com/rss/search?q=site:dailywire.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  zerohedge: [
    // direct feed (Nov 17 2026 — Sergio's call: "ZeroHedge News needs to be on
    // the site"). Runs RAW like alexjones (see RAW_CATS below): it is a
    // markets/geopolitics firehose and passes the positivity gate ~0% of the
    // time, so gating it would mean a permanently empty channel. Balance cap
    // in MAX_OVERRIDE keeps it from flooding the newest-first wire.
    { name: 'ZeroHedge', site: 'https://www.zerohedge.com', url: 'https://feeds.feedburner.com/zerohedge/feed' },
  ],
  rerumnovarum: [
    // Telegram channel mirror (Nov 17 2026 — Sergio's call: Rerum Novarum is
    // his favorite news source and "needs to be featured"). He posts mostly on
    // Telegram (@rnintel); the channel's public preview page is parsed into
    // wire items by parseTelegram below. Runs RAW like alexjones/zerohedge:
    // breaking-war alerts would never pass the positivity gate.
    { name: 'Rerum Novarum', site: 'https://t.me/rnintel', url: 'https://t.me/s/rnintel', telegram: true },
  ],
  // ---- LEFT ----
  msnbc: [
    { name: 'MSNBC', site: 'https://www.msnbc.com', url: 'https://news.google.com/rss/search?q=site:msnbc.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'MSNBC: Heroes', site: 'https://www.msnbc.com', url: 'https://news.google.com/rss/search?q=site:msnbc.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'NBC News', site: 'https://www.nbcnews.com', url: 'https://feeds.nbcnews.com/feeds/topstories', direct: true },
    { name: 'NBC News', site: 'https://www.nbcnews.com', url: 'https://news.google.com/rss/search?q=site:nbcnews.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22acts+of+kindness%22+OR+inspiring+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  cnn: [
    { name: 'CNN', site: 'https://www.cnn.com', url: 'https://news.google.com/rss/search?q=site:cnn.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'CNN: Heroes', site: 'https://www.cnn.com', url: 'https://news.google.com/rss/search?q=site:cnn.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  nyt: [
    { name: 'NY Times', site: 'https://www.nytimes.com', url: 'https://news.google.com/rss/search?q=site:nytimes.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'NY Times: Heroes', site: 'https://www.nytimes.com', url: 'https://news.google.com/rss/search?q=site:nytimes.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  wapo: [
    { name: 'Wash Post', site: 'https://www.washingtonpost.com', url: 'https://news.google.com/rss/search?q=site:washingtonpost.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Wash Post: Heroes', site: 'https://www.washingtonpost.com', url: 'https://news.google.com/rss/search?q=site:washingtonpost.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  abcnews: [
    // direct feed (Nov 15 2026): ABC's top-stories RSS — gated; every item carries a photo.
    // (This channel measured EMPTY on Google News alone in the Nov 15 baseline run.)
    { name: 'ABC News', site: 'https://abcnews.go.com', url: 'https://feeds.abcnews.com/abcnews/topstories', direct: true },
    { name: 'ABC News', site: 'https://abcnews.go.com', url: 'https://news.google.com/rss/search?q=site:abcnews.go.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'ABC News: Heroes', site: 'https://abcnews.go.com', url: 'https://news.google.com/rss/search?q=site:abcnews.go.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  cbsnews: [
    { name: 'CBS News', site: 'https://www.cbsnews.com', url: 'https://www.cbsnews.com/latest/rss/main', direct: true },
    // section feed (Nov 14 2026): CBS's The Uplift — ungated, DENY-filtered; photos come via the <image> element / og:image pass.
    { name: 'CBS: The Uplift', site: 'https://www.cbsnews.com', url: 'https://www.cbsnews.com/latest/rss/uplift', section: true },
    { name: 'CBS News', site: 'https://www.cbsnews.com', url: 'https://news.google.com/rss/search?q=site:cbsnews.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'CBS News: Heroes', site: 'https://www.cbsnews.com', url: 'https://news.google.com/rss/search?q=site:cbsnews.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  politico: [
    { name: 'Politico', site: 'https://www.politico.com', url: 'https://news.google.com/rss/search?q=site:politico.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Politico: Heroes', site: 'https://www.politico.com', url: 'https://news.google.com/rss/search?q=site:politico.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  npr: [
    { name: 'NPR', site: 'https://www.npr.org', url: 'https://feeds.npr.org/1001/rss.xml', direct: true },
    { name: 'NPR', site: 'https://www.npr.org', url: 'https://news.google.com/rss/search?q=site:npr.org+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'NPR: Heroes', site: 'https://www.npr.org', url: 'https://news.google.com/rss/search?q=site:npr.org+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  theguardian: [
    { name: 'The Guardian', site: 'https://www.theguardian.com', url: 'https://www.theguardian.com/us-news/rss', direct: true },
    // section feed (Nov 14 2026): The Upside series — ungated, DENY-filtered, items carry photos.
    { name: 'The Guardian: The Upside', site: 'https://www.theguardian.com', url: 'https://www.theguardian.com/world/series/the-upside/rss', section: true },
    // direct feed (Nov 15 2026): the Guardian's world desk — gated, photo-carrying.
    { name: 'The Guardian', site: 'https://www.theguardian.com', url: 'https://www.theguardian.com/world/rss', direct: true },
    { name: 'The Guardian', site: 'https://www.theguardian.com', url: 'https://news.google.com/rss/search?q=site:theguardian.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'The Guardian: Heroes', site: 'https://www.theguardian.com', url: 'https://news.google.com/rss/search?q=site:theguardian.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  // BBC (Nov 14 2026): general-news firehose, so it runs GATED like the other
  // direct feeds — positivity vocabulary + DENY decide what crosses into the wire.
  bbc: [
    { name: 'BBC News', site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/rss.xml', direct: true },
    // direct feed (Nov 15 2026): the BBC's US & Canada desk — gated, photo-carrying.
    { name: 'BBC News', site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', direct: true },
  ],
  huffpost: [
    { name: 'HuffPost', site: 'https://www.huffpost.com', url: 'https://news.google.com/rss/search?q=site:huffpost.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'HuffPost: Heroes', site: 'https://www.huffpost.com', url: 'https://news.google.com/rss/search?q=site:huffpost.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  vox: [
    { name: 'Vox', site: 'https://www.vox.com', url: 'https://news.google.com/rss/search?q=site:vox.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+%22feel-good%22+OR+%22acts+of+kindness%22+OR+%22faith+in+humanity%22+OR+inspiring+OR+miracle+OR+reunited)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Vox: Heroes', site: 'https://www.vox.com', url: 'https://news.google.com/rss/search?q=site:vox.com+(%22saved+his+life%22+OR+%22saved+her+life%22+OR+%22saved+their+lives%22+OR+rescue+OR+hero+OR+%22beating+cancer%22+OR+%22cancer-free%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  // ---- SPORTS ----
  espn: [
    { name: 'ESPN', site: 'https://www.espn.com', url: 'https://news.google.com/rss/search?q=site:espn.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+inspiring+OR+%22feel-good%22+OR+triumph+OR+comeback)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'ESPN: Heroes', site: 'https://www.espn.com', url: 'https://news.google.com/rss/search?q=site:espn.com+(hero+OR+inspiration+OR+%22beating+cancer%22+OR+tribute)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  foxsports: [
    { name: 'Fox Sports', site: 'https://www.foxsports.com', url: 'https://news.google.com/rss/search?q=site:foxsports.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+inspiring+OR+%22feel-good%22+OR+triumph+OR+comeback)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Fox Sports: Heroes', site: 'https://www.foxsports.com', url: 'https://news.google.com/rss/search?q=site:foxsports.com+(hero+OR+inspiration+OR+%22beating+cancer%22+OR+tribute)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
  // ---- GAMING ----
  gamespot: [
    { name: 'GameSpot', site: 'https://www.gamespot.com', url: 'https://news.google.com/rss/search?q=site:gamespot.com+(%22good+news%22+OR+uplifting+OR+heartwarming+OR+inspiring+OR+celebration+OR+milestone)+when:7d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'GameSpot: Heroes', site: 'https://www.gamespot.com', url: 'https://news.google.com/rss/search?q=site:gamespot.com+(hero+OR+inspiration+OR+charity+OR+%22giving+back%22)+when:7d&hl=en-US&gl=US&ceid=US:en' },
  ],
};

// Titles containing any of these get dropped (keep the wire all-positive).
const DENY = [
  'murder', 'killed', 'killing', 'shooter', 'shooting', 'stabbed', 'dismember',
  'terror', 'war ', 'war,', 'war:', 'wars', 'invasion', 'airstrike',
  // war top-up (Oct 5 2026): "Russian aerial strikes snarl traffic on 3 Kyiv bridges" slipped into Heroes via "rescue"
  'russia', 'russian', 'ukraine', 'kyiv', 'kiev', 'putin', 'zelensky',
  'missile', 'drone strike', 'air strike', 'aerial strike', 'strike', 'warfare', 'troops',
  // war/sports/politics top-up 2 (Oct 5 2026): "Ukrainian" dodged "ukraine"; NFL gossip, injury reports and Prime Day deals slipped into Uplifting
  'ukrain', 'gamble', 'trade deadline', 'injury update', 'injury report', 'dodgers', 'prime day', 'book review',
  // top-up 3 (Oct 5 2026): obituary, plane stabbing/hijacking in Heroes; "mystery books" listicles
  'obituary', 'stabbing', 'hijack', 'mystery books', 'snf', 'batter',
  // top-up 4 (Oct 5 2026): streaming listicles ("Five Action Movies to Stream Now") in Heroes
  'to stream',
  // top-up 5 (Oct 5 2026): "Fire & Rescue Service" accident reports and spacecraft stories riding the word "rescue" into Animals
  'fire & rescue', 'fire and rescue', 'spacecraft',
  'dies', 'died', 'dead ', 'death ', 'fatal', 'crash', 'scandal',
  'arrest', 'lawsuit', 'fraud', 'indicted', 'attack', 'bomb',
  'threat ', 'crisis', 'crises', 'layoff', 'outbreak', 'epidemic', 'pandemic', 'sacrific', 'pollut',
  // editorial: no politics, no culture-war topics (Sergio's call, Oct 2026)
  'trump', 'biden', 'harris', 'obama', 'clinton', 'pelosi', 'schumer', 'mcconnell',
  'vance', 'walz', 'desantis', 'newsom', 'maga', 'gop', 'democrat', 'republican',
  'congress', 'senate', 'white house', 'election', 'midterm', 'ballot', 'impeachment',
  'tariff', 'supreme court', 'governor', 'lgbt', 'transgender', 'abortion',
  'pro-life', 'pro-choice', 'dei ', 'woke',
  // science the Church would object to
  'embryonic', 'human clon',
  // nothing with dark layers — no triggers (Sergio's rule, Oct 2026)
  'jane doe', 'john doe', 'unidentified', 'missing', 'kidnap', 'abduct',
  'cold case', 'suspect', 'charged with', 'sentenced', 'victim',
  'abuse', 'assault', 'suicide', 'overdose', 'tragedy', 'tragic',
  'devastat', 'mourn', 'funeral',
  // no sports at all, period (Sergio's call, Oct 5 2026 — was pro-only before)
  'fantasy', 'sportsbook', 'betting', 'parlay', 'moneyline', 'wager',
  'nba', 'mlb', 'nhl', 'super bowl', 'world series', 'premier league',
  'champions league', 'march madness', 'touchdown', 'home run', 'grand slam',
  'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf',
  'olympic', 'athlete', 'championship', 'playoff', 'coach', 'quarterback',
  'striker', 'world cup', 'grand prix', 'formula 1', 'title fight',
  'knockout', 'cricket', 'rugby', 'wrestling',
  // election-news top-up (Oct 5 2026): Brazilian presidential-vote stories slipped into Animals/Heroes
  'bolsonaro', 'lula', 'maduro', 'milei', 'presidential', ' vote', ' voter',
  ' voting', 'referendum', 'coup', 'regime',
  // doom-framing top-up (Oct 5 2026): "worry for farmers after worst harvest" slipped into Animals
  'worry', 'worries', 'worst', 'fear ', 'fears', 'feared', 'dread', 'bleak', 'gloom',
  // sad-animal-framing top-up (Oct 5 2026): his call — happy cat news, not sad cat news
  'neglect', 'abandoned', 'stolen', 'heartbreaking', 'heartbreak', 'mistreat', 'starv',
  // immigration/protest top-up (Oct 5 2026): a migrant-protest story slipped into Dogs via "rescue"
  'migrant', 'asylum', 'deport', 'protest', 'riot', 'toilet',
  // geopolitics top-up (Oct 5 2026): "US-India trade deal not imminent" slipped into Earth
  'trade deal', 'trade war',
  // sports-journalism jargon top-up (Oct 5 2026)
  'instant analysis', 'postgame', 'box score', 'game recap',
  // outlet-channel top-up (Oct 5 2026): WWE, walk-offs and Chiefs slipped through on loose positivity matches
  'wwe', 'wrestlemania', 'walk-off', 'walk off', 'chiefs',
  // sports top-up (Oct 10 2026): Guardian rugby 'hat-trick' story in good-news query
  'hat-trick', 'hat trick',
  // shopping-deal top-up (Oct 5 2026): "Walmart Deal Days" listicles in NY Post / USA Today
  'deal days', 'slashing prices', 'deals event', "what i'd buy", 'deals are live', 'deal is live',
  // opinion + TV-show top-up (Oct 5 2026)
  'opinion |', 'opinion:',
  // good-news-feed top-up (Oct 10 2026): horoscope listicles riding the GNN feed
  'horoscope',
  // dark/geopolitics top-up (Oct 5 2026): hostages, Iran, nazi references, "slaves" abuse story
  'hostage', 'iran', 'heil', 'hitler', 'nazi', 'slaves',
  // policy-fight top-up (Oct 5 2026): AG/poll-monitors, Medicare drug-pricing
  'medicare', 'attorney general', 'poll monitor',
  // stale listicle top-up (Oct 5 2026): AP "2017 Breakthrough Entertainers"
  'breakthrough entertainer',
  // outlet-channel round 2 (Oct 5 2026): tag/archive junk pages, wire subdomains, politics, doom
  'article archives', 'tag:', 'blue wave', 'video statement', 'diaz-canel',
  'fallout after', 'debunked', 'vanished', 'suspends search', 'urgent warning',
  'heatwave', 'deadly', 'record electric rate', 'execution', 'unconscious',
  'heroes, zeros', 'hail mary',
  // US pro-team nicknames (zero-sports rule is absolute; slight overblock beats a leak)
  'yankees', 'red sox', 'patriots', 'cowboys', 'eagles', 'packers', 'jets', 'niners',
  'broncos', 'raiders', 'chargers', 'steelers', 'ravens', 'bengals', 'browns',
  'texans', 'colts', 'titans', 'jaguars', 'dolphins', 'lakers', 'celtics', 'bulls',
  'knicks', 'warriors', 'mavericks', 'nuggets', 'bucks', 'heat', 'hornets', 'pistons',
  'pacers', 'raptors', 'wizards', 'grizzlies', 'pelicans', 'clippers', 'blazers',
  'jazz', 'timberwolves', 'thunder', 'rockets', 'spurs', 'cubs', 'mets', 'phillies',
  'braves', 'marlins', 'nationals', 'pirates', 'reds', 'brewers', 'padres', 'rockies',
  'diamondbacks', 'rangers', 'astros', 'athletics', 'mariners', 'tigers', 'twins',
  'guardians', 'orioles', 'rays', 'blue jays', 'white sox', 'cardinals', 'giants', 'bears', 'bills', 'suns', 'kings', 'nets', 'magic',
  // round 3 (Oct 5 2026): more NFL/NHL/soccer/college names that leaked via outlet queries
  'seahawks', 'falcons', 'saints', 'buccaneers', 'lions', 'vikings', 'commanders',
  'bruins', 'devils', 'penguins', 'capitals', 'flyers', 'hurricanes', 'lightning',
  'maple leafs', 'senators', 'canadiens', 'sabres', 'red wings', 'blackhawks',
  'blues', 'avalanche', 'predators', 'golden knights', 'kraken', 'oilers', 'flames', 'canucks', 'ducks',
  'arsenal', 'chelsea', 'liverpool', 'manchester united', 'manchester city', 'tottenham',
  'barcelona', 'real madrid', 'bayern', 'psg', 'juventus', 'inter milan', 'ac milan', 'dortmund', 'ajax',
  'nebraska', 'rutgers', 'hoosiers', 'nittany lions', 'northwestern', 'huskers', 'buckeyes',
  'wolverines', 'crimson tide', 'bulldogs', 'gators', 'seminoles', 'tar heels', 'blue devils',
  'boilermakers', 'hawkeyes', 'badgers', 'sooners', 'longhorns', 'aggies', 'wildcats',
  // round 3: dark/violent/politics/doom/shopping/junk-page leaks
  'shootout', '9/11', '9-11', 'netanyahu', 'fire rescue', 'collapse', 'venezuela', 'quake',
  'cocaine', 'seize', 'tumor', 'debt anxiety', 'selling off', 'signs you', 'incendiary',
  'doubles down', 'on sale', 'breaking news and latest headlines', "here's the latest",
  'prime minister', 'enes kanter', 'quietly damaging', 'diaz', 'd\u00edaz-canel',
  // round 4 (Oct 5 2026): sports columns, gossip, geopolitics, junk homepages
  'ohio state', 'upset scare', 'division series', 'no-hit', 'wake-up call', 'antonio conte',
  'mamdani', 'myanmar', 'repatriation', 'suspends', 'affair', 'controversial',
  'water cannon', 'dinner hero', 'discounts', 'tipping point', 'here\u2019s the latest',
  'bick brooks', 'policy - washington examiner',
  // round 5 (Oct 5 2026): death/flood/wildfire framing
  'how to die', 'dying', 'flood', 'wildfire',
  // round 6 (Oct 6 2026): doom framing that reads clean but isn't hope — violence,
  // political combat, geopolitical threats, disasters (hope-only restoration)
  'violent', 'violently', 'shoved', 'shoving', 'brutal', 'brutally',
  'beaten up', 'beat up', 'clash', 'clashes', 'clashed', 'standoff',
  'crackdown', 'purge', 'threatens', 'threatening', 'warns of', 'warns that',
  'slams', 'slammed', 'blasts', 'blasted', 'feud', 'feuding',
  'mudslinging', 'torn over', 'crusade against',
  'hurricane', 'typhoon', 'earthquake', 'tornado', 'tsunami',
  'violence', 'next target',
];

// pattern-based blocks (Oct 5 2026): scores and league scheduling dodge keyword lists
// (team nicknames like Colts/Commanders/Devils collide with animal names, so match the patterns instead)
const DENY_RE = [
  /\b\d{1,3}\s*-\s*\d{1,3}\b/, // final scores: 3-2, 24-17
  /\bweek \d{1,2}\b/,          // Week 4, week 12 (league scheduling)
  /\b\d{2}ers\b/,              // 49ers, 76ers (team nicknames)
  /\bseason \d{1,2}\b/,        // Season 15 (TV-show news)
  /(?!\bdaily wire\b)\b[a-z]+ wire\b/i,  // Rams Wire, Nittany Lions Wire (team-wire subdomains) — not the Daily Wire outlet
  /\bnfl\b/i, // NFL as a standalone word — substring 'nfl' false-positives on "inflight"
];

// clickbait filter (Oct 6 2026 — Sergio's call: no clickbait on the wire)
// drops ALL-CAPS screamers, !!! / ??? headlines, and classic bait phrases.
// RAW channels are exempt (Alex Jones runs unfiltered by his decision).
const CLICKBAIT_PHRASES = [
  "you won't believe", 'you wont believe', 'will shock you',
  'jaw-dropping', 'jaw dropping', 'mind-blowing', 'mind blowing',
  'what happens next', 'what happened next', 'number 7 will',
  'gone wrong', 'epic fail', 'unbelievable',
];
function isClickbait(title) {
  if (/[!?]{2,}/.test(title)) return true;
  const low = title.toLowerCase();
  if (CLICKBAIT_PHRASES.some((p) => low.includes(p))) return true;
  const letters = title.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 25) {
    const upper = letters.replace(/[^A-Z]/g, '').length;
    if (upper / letters.length > 0.7) return true; // ALL-CAPS screamer
  }
  return false;
}

// AI news only when it heals or helps the planet (Sergio's rule, Oct 2026)
// Scans title AND description — AI stories were slipping through on descriptions alone.
const AI_OK = ['cure', 'curing', 'heal', 'cancer', 'disease', 'alzheimer', 'parkinson', 'drug discover', 'diagnos', 'climate', 'environment', 'clean energy', 'fusion', 'prosthet', 'blind', 'deaf'];
function isBannedAI(textLow) {
  const hasAI = /\bai\b/.test(textLow) || /\bllm\b/.test(textLow)
    || textLow.includes('artificial intelligence') || textLow.includes('ai-powered')
    || textLow.includes('generative ai') || textLow.includes('chatgpt')
    || textLow.includes('openai') || textLow.includes('machine learning')
    || textLow.includes('anthropic') || textLow.includes('gemini') || textLow.includes('copilot');
  if (!hasAI) return false;
  return !AI_OK.some((w) => textLow.includes(w));
}

// positivity gate (Nov 14 2026 — the SURGE-DIRECT-FEEDS-PLAN hybrid, Sergio's
// "fix the wire" go): Google News feeds carry their hope filter inside the
// search query itself, but a general direct feed is a firehose. Items from a
// feed marked `direct: true` may enter ONLY if title/description matches the
// same hope vocabulary the Google queries use — then they still pass DENY,
// DENY_RE, the AI rule and the clickbait filter like everything else.
const POSITIVITY = [
  'good news', 'uplifting', 'heartwarming', 'feel-good', 'feel good',
  'acts of kindness', 'act of kindness', 'faith in humanity',
  'inspiring', 'inspired', 'inspiration', 'inspirational',
  'miracle', 'miraculous', 'reunited', 'reunite', 'reunion',
  'hero', 'heroes', 'heroic', 'rescue', 'rescued', 'rescues',
  'saved his life', 'saved her life', 'saved their lives', 'saves lives', 'saved the life',
  'beating cancer', 'cancer-free', 'cancer free', 'beats cancer', 'beat cancer',
  'kindness', 'good samaritan', 'pay it forward', 'paying it forward',
  'comes together', 'came together', 'come together', 'rally around', 'rallies around',
  'second chance', 'new lease on life', 'against all odds', 'against the odds',
  'overcame', 'overcomes', 'triumph', 'dream come true', 'wish come true',
  'grants wish', 'granted wish', 'make-a-wish', 'homecoming',
  'lost dog', 'lost cat', 'lost pet', 'found dog', 'found cat',
  'adopts', 'adopted', 'adoption',
  'donates', 'donated', 'donation', 'raises money', 'raised money', 'fundraiser',
  'volunteer', 'volunteers', 'volunteering',
  'reunites', 'reuniting', 'long-lost', 'long lost',
  'recovered', 'recovery', 'survivor', 'survived', 'survives',
  'breakthrough', 'first steps', 'walks again', 'walking again',
  'good deed', 'helping hand', 'lend a hand', 'neighbors help', 'neighbours help',
  'community rallies', 'outpouring', 'acts of courage', 'act of courage',
  // gate vocabulary round 2 (Nov 15 2026 — Sergio: "the wire has no live
  // images"): the Nov 14 gate starved the photo-carrying direct feeds (Fox 0/4,
  // NBC 0/15, BBC 0/15, NY Post 0/7 passed) because plain good-news English —
  // "saved", "celebrates", "wins an award" — wasn't in the vocabulary. These
  // are the same hope register, and every item still passes DENY / DENY_RE /
  // AI / clickbait afterwards, so sports and doom stay blocked by those lists.
  'saved', 'saves', 'saving', 'life-saving', 'lifesaving',
  'celebrat', 'award', 'honor', 'honored', 'honour', 'champion',
  'wins', 'winning', 'winner', 'won the', 'won a', 'win the', 'win a',
  'graduat', 'wedding', 'newborn', 'remission', 'in remission',
  'smiles', 'smiling', 'joyful', 'hopeful', 'new hope', 'gives hope',
  'adorable', 'touching', 'surprise', 'milestone', 'scholarship', 'achievement',
  'gives back', 'giving back', 'gave back',
  'welcome home', 'welcomed home', 'returns home', 'returned home', 'came home', 'coming home',
  'thriving', 'flourishing', 'puppy', 'kitten', 'service dog', 'therapy dog',
  'homeless', 'veteran',
  // round 2b (same day, from hand-checking the rejected firehose items):
  // charity galas, "lucky after cancer treatment", hall-of-fame honors,
  // legacy stories, and seasonal Christmas wonder — all hope register.
  'gala', 'lucky', 'christmas', 'hall of fame', 'legacy',
];
function passesPositivity(textLow) {
  return POSITIVITY.some((w) => textLow.includes(w));
}

// category must-contain guard (Oct 5 2026): Google News matching is loose, so
// Cats/Dogs stories must actually mention the animal (a pigeon rescue and a
// toilet-access story both slipped into Dogs on the word "rescue" alone).
// sports outlets never belong on the wire, no matter what the headline says (Oct 5 2026)
// RAW channels (Sergio's call, Oct 5 2026): latest as the outlet publishes it, no positivity/politics filter.
// Alex Jones: "latest stories and news from the Alex Jones show" in the center ("he's a patriot",
// reliability critiques dismissed). Filters would nuke the whole feed, so this channel runs raw.
const RAW_CATS = new Set(['alexjones', 'zerohedge', 'rerumnovarum']);
// sports channels (Sergio's call, Oct 6 2026): their own outlet's stories are welcome
// in the sports channels, still blocked from leaking into the news channels
const SPORTS_CATS = new Set(['espn', 'foxsports']);
const SOURCE_DENY = [
  'espn', 'the athletic', 'bleacher', 'yardbarker', 'sbnation', 'deadspin',
  'cbssports', 'foxsports', 'nbcsports', 'sportingnews',
  // every USA Today sports-team vertical lives here: lakerswire, seahawkswire, ninerswire, ...
  'wire.usatoday.com',
];

const MAX_PER_CAT = 10;
// balance caps (Oct 10 2026 — Sergio's call: the wire must feel balanced).
// Raw high-volume channels get a smaller slice so no single voice floods
// the newest-first wire. The channel itself is untouched — still raw, still his.
const MAX_OVERRIDE = { alexjones: 4, zerohedge: 4, rerumnovarum: 4 };
const FETCH_TIMEOUT = 8000;

function clean(s) {
  if (!s) return '';
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLink(itemXml) {
  // RSS: <link>url</link> — Atom: <link href="url" .../>
  let m = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i);
  if (m) return m[1].trim();
  // CDATA-wrapped link (Christian Post, Nov 14 2026): <link><![CDATA[url]]></link>
  m = itemXml.match(/<link[^>]*>\s*<!\[CDATA\[([^\]]+)\]\]>\s*<\/link>/i);
  if (m) return m[1].trim();
  m = itemXml.match(/<link[^>]*>([^<]+)<\/link>/i);
  return m ? m[1].trim() : '';
}

function extractImg(block, rawHtml) {
  // media:content (Nov 15 2026): feeds often list several renditions of the
  // same photo — score them and keep the one closest to a 700px display width
  // instead of the first in-range tag, so cards get a crisp mid-size image
  // rather than a thumbnail or a 4000px original.
  const mcs = block.match(/<media:content[^>]*>/gi) || [];
  let best = '', bestScore = -1;
  for (const tag of mcs) {
    const u = tag.match(/url=["']([^"']+)["']/i);
    if (!u) continue;
    const url = u[1].replace(/&amp;/g, '&');
    if (!/image|\.(jpe?g|png|webp)/i.test(tag + ' ' + url)) continue;
    const w = tag.match(/width=["'](\d+)["']/i);
    const width = w ? +w[1] : 0;
    let score = 10; // no width declared: usable, but a sized sibling wins
    if (width) score = 1000 - Math.min(1000, Math.abs(width - 700));
    if (width && width < 120) score = -1; // tracking-pixel sized, never a photo
    if (score > bestScore) { bestScore = score; best = url; }
  }
  if (best) return best;
  const th = block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
  if (th) return th[1].replace(/&amp;/g, '&');
  const enc = block.match(/<enclosure[^>]*>/i);
  if (enc && /image/i.test(enc[0])) {
    const u = enc[0].match(/url=["']([^"']+)["']/i);
    if (u) return u[1].replace(/&amp;/g, '&');
  }
  // Atom enclosures ride on <link rel="enclosure" type="image/..." href="..."/>
  const ae = block.match(/<link[^>]*rel=["']enclosure["'][^>]*>/i);
  if (ae && /image/i.test(ae[0])) {
    const u = ae[0].match(/href=["']([^"']+)["']/i);
    if (u) return u[1].replace(/&amp;/g, '&');
  }
  // plain <image>URL</image> element (CBS feeds, Nov 14 2026). Skip the tiny
  // 60x60 thumbnails — leaving img empty lets attachImages upgrade the item
  // with the article page's full-size og:image instead.
  const pl = block.match(/<image[^>]*>([\s\S]*?)<\/image>/i);
  if (pl) {
    const u = clean(pl[1]);
    if (/^https?:\/\//i.test(u) && !u.includes('/thumbnail/60x60/')) return u;
  }
  // <img> inside description / content:encoded (NPR style): skip tracking
  // pixels and spacer gifs, and prefer a rendition that declares a real
  // width over a bare first match (Nov 15 2026).
  const imgTags = (rawHtml || '').match(/<img[^>]*>/gi) || [];
  let imgBest = '', imgBestScore = -1;
  for (const tag of imgTags) {
    const u = tag.match(/src=["']([^"']+)["']/i) || tag.match(/data-src=["']([^"']+)["']/i);
    if (!u) continue;
    const url = u[1].replace(/&amp;/g, '&');
    if (!/^https?:\/\//i.test(url)) continue;
    if (/\.gif(\?|$)/i.test(url) || /1x1|pixel|spacer|tracker|feedburner/i.test(url)) continue;
    const w = tag.match(/width=["'](\d+)["']/i);
    const width = w ? +w[1] : 0;
    if (width && width <= 2) continue;
    const score = width ? 1000 - Math.min(1000, Math.abs(width - 700)) : 10;
    if (score > imgBestScore) { imgBestScore = score; imgBest = url; }
  }
  return imgBest;
}

function parseFeed(xml, raw, gated) {
  const items = [];
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  for (const b of blocks) {
    const t = b.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = clean(t && t[1]);
    if (!title) continue;
    const low = title.toLowerCase();
    const de = b.match(/<(description|summary)[^>]*>([\s\S]*?)<\/\1>/i);
    const rawDesc = (de && de[2]) || '';
    // NPR-style feeds carry the story photo as an <img> inside content:encoded,
    // not in the description — scan both for the image pass (Nov 14 2026).
    const ce = b.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
    const rawHtml = rawDesc + (ce ? '\n' + ce[1] : '');
    let desc = clean(rawDesc);
    const textLow = low + ' ' + desc.toLowerCase();
    if (!raw) {
      if (DENY.some((d) => textLow.includes(d))) continue;
      if (DENY_RE.some((re) => re.test(textLow))) continue;
      if (isBannedAI(textLow)) continue;
      if (isClickbait(title)) continue;
      if (gated && !passesPositivity(textLow)) continue;
    }
    const link = extractLink(b);
    if (!link || !/^https?:\/\//i.test(link)) continue;
    const d = b.match(/<(pubDate|published|updated)[^>]*>([\s\S]*?)<\/\1>/i);
    const ts = d ? Date.parse(clean(d[2])) : NaN;
    if (desc.length > 180) {
      desc = desc.slice(0, 180);
      const sp = desc.lastIndexOf(' ');
      desc = (sp > 100 ? desc.slice(0, sp) : desc) + '…';
    }
    desc = tidyDesc(desc, title);
    items.push({ title, link, ts: isNaN(ts) ? 0 : ts, desc, img: extractImg(b, rawHtml) });
  }
  return items;
}

// ---- Telegram channel mirrors (Nov 17 2026) ----
// A public Telegram channel's preview page (t.me/s/<name>) is server-rendered
// HTML, not RSS: each post block carries data-post="<name>/<id>", the text in
// .tgme_widget_message_text, an ISO datetime, and often a photo. Parsed into
// the same item shape parseFeed returns. Wired only for RAW channels Sergio
// follows directly (Rerum Novarum).
function parseTelegram(html) {
  const items = [];
  const blocks = String(html || '').split('data-post="').slice(1);
  for (const b of blocks) {
    const idm = b.match(/^([\w/]+)"/);
    if (!idm) continue;
    const link = 'https://t.me/' + idm[1];
    const tm = b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
    if (!tm) continue;
    let title = clean(tm[1].replace(/<br\s*\/?>/gi, ' '));
    if (!title) continue;
    if (title.length > 200) {
      title = title.slice(0, 200);
      const sp = title.lastIndexOf(' ');
      title = (sp > 100 ? title.slice(0, sp) : title) + '…';
    }
    const dm = b.match(/datetime="([^"]+)"/);
    const ts = dm ? Date.parse(dm[1]) : NaN;
    const pm = b.match(/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/);
    items.push({ title, link, ts: isNaN(ts) ? 0 : ts, desc: '', img: pm ? pm[1] : '' });
  }
  return items;
}

async function fetchTelegram(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewSurgeWire/1.0', Accept: 'text/html' },
    });
    if (!r.ok) return [];
    return parseTelegram(await r.text());
  } catch {
    return [];
  } finally {
    clearTimeout(to);
  }
}

// ---- story thumbnails (Oct 12 2026 — Sergio: every article gets a small
// thumbnail from its source). Feeds carry no images at all (verified), so for
// items with a real publisher URL we read the article's og:image. Google News
// links refuse server-side fetches (HTTP 400), so those items ship without
// img and the client renders a source-mark tile instead. Results are cached
// in-memory per warm instance so repeat loads stay fast.
const OG_CACHE = new Map();
const OG_TTL = 30 * 60 * 1000;
function tidyDesc(desc, title) {
  if (!desc) return '';
  let d = String(desc).trim();
  d = d.replace(/\s*The post .*? appeared first on .*$/s, '').trim();
  const tp = d.indexOf(' The post ');
  if (tp > 30) d = d.slice(0, tp).trim();
  if (title) {
    const core = title.replace(/\s+[-–|]\s+[^-–|]{2,45}$/, '');
    if (d.toLowerCase().startsWith(core.toLowerCase())) {
      const rest = d.slice(core.length).replace(/^[\s\-–—:|·]+/, '').trim();
      d = rest.length >= 50 ? rest : '';
    }
  }
  return d;
}
function metaContent(buf, names) {
  for (const n of names) {
    const m = buf.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + n + '["\'][^>]+content=["\']([^"\']+)["\']', 'i'))
      || buf.match(new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' + n + '["\']', 'i'));
    if (m) return m[1].trim();
  }
  return '';
}
function imgOk(u, w) {
  if (!u || !/^https?:\/\//i.test(u)) return false;
  const path = String(u).split(/[?#]/)[0].toLowerCase();
  if (/(logo|favicon|site-?icon|placeholder|share[-_]?image|og[-_]?default|masthead|avatar|sprite|blank|fallback|1x1|default[-_.])/.test(path)) return false;
  if (w && w < 400) return false;
  return true;
}
async function fetchOgMeta(url) {
  const hit = OG_CACHE.get(url);
  if (hit && Date.now() - hit.at < OG_TTL) return hit.meta;
  let meta = { img: '', desc: '' };
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewSurgeWire/1.0; +https://newsurge.tv)', Accept: 'text/html' },
    });
    if (r.ok && r.body) {
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (buf.length < 110000) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        if (!meta.og) meta.og = metaContent(buf, ['og:image:secure_url', 'og:image']);
        if (!meta.tw) meta.tw = metaContent(buf, ['twitter:image']);
        if (!meta.desc) meta.desc = metaContent(buf, ['og:description', 'twitter:description', 'description']);
        if (((meta.og || meta.tw) && meta.desc) || buf.includes('</head>')) break;
      }
      try { reader.cancel(); } catch {}
      var ogw = parseInt(metaContent(buf, ['og:image:width']) || '0', 10) || 0;
      meta.img = imgOk(meta.og, ogw) ? meta.og : (imgOk(meta.tw, 0) ? meta.tw : '');
      delete meta.og; delete meta.tw;
      meta.desc = clean(meta.desc);
      if (meta.desc.length > 220) meta.desc = meta.desc.slice(0, 220);
    }
  } catch { meta = { img: '', desc: '' }; } finally { clearTimeout(to); }
  if (OG_CACHE.size > 800) OG_CACHE.delete(OG_CACHE.keys().next().value);
  OG_CACHE.set(url, { meta, at: Date.now() });
  return meta;
}
async function attachImages(out) {
  const byLink = new Map();
  for (const cat of Object.keys(out)) {
    for (const it of out[cat]) {
      if (!it.link || it.img || it.link.includes('news.google.com')) continue;
      if (!byLink.has(it.link)) byLink.set(it.link, []);
      byLink.get(it.link).push(it);
    }
  }
  const links = [...byLink.keys()];
  const metas = await Promise.all(links.map((l) => fetchOgMeta(l)));
  links.forEach((l, i) => {
    const m = metas[i];
    if (!m) return;
    byLink.get(l).forEach((it) => {
      if (m.img) it.img = m.img;
      if (m.desc) {
        const td = tidyDesc(m.desc, it.title);
        if (td && td.length > (it.desc || '').length) it.desc = td;
      }
    });
  });
}

async function fetchFeed(url, raw, gated) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'NewSurgeWire/1.0 (+https://newsurge.tv)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    });
    if (!r.ok) return [];
    const xml = await r.text();
    return parseFeed(xml, raw, gated);
  } catch {
    return [];
  } finally {
    clearTimeout(to);
  }
}

function normTitle(t) {
  let s = String(t || '').toLowerCase();
  s = s.replace(/\s+[-–—|]\s+[^-–—|]{2,45}$/, ''); // trailing " - Outlet" suffix (Google News style)
  return s.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function buildWire() {
  try {
    const cats = Object.keys(FEEDS);
    const out = {};
    await Promise.all(
      cats.map(async (cat) => {
        const feeds = FEEDS[cat] || [];
        const results = await Promise.all(feeds.map((f) => f.telegram ? fetchTelegram(f.url) : fetchFeed(f.url, RAW_CATS.has(cat), !!f.direct && !f.section)));
        const seen = new Set();
        const merged = [];
        for (const list of results) {
          for (const it of list) {
            if (seen.has(it.link)) continue;
            seen.add(it.link);
            merged.push({ ...it, source: '' });
          }
        }
        // tag each item with its feed's source name + site
        // title dedupe (Nov 14 2026): the same story now arrives twice — once
        // via Google News (no photo, ever) and once via the outlet's direct
        // feed (with photo). Merge on normalized title; the photo-carrying
        // version wins.
        const named = [];
        const seenLink = new Set();
        const byTitle = new Map();
        for (let i = 0; i < feeds.length; i++) {
          for (const it of results[i]) {
            if (seenLink.has(it.link)) continue;
            seenLink.add(it.link);
            const item = { title: it.title, link: it.link, ts: it.ts, desc: it.desc, img: it.img || '', source: feeds[i].name, site: feeds[i].site, via: (feeds[i].direct || feeds[i].section) ? 1 : 0 };
            const key = normTitle(it.title);
            if (key && byTitle.has(key)) {
              const prev = byTitle.get(key);
              if (!prev.img && item.img) {
                named[named.indexOf(prev)] = item;
                byTitle.set(key, item);
              }
              continue;
            }
            if (key) byTitle.set(key, item);
            named.push(item);
          }
        }
        named.sort((a, b) => b.ts - a.ts);
        // source guard: sports outlets never belong on the wire
        // freshness guard: nothing older than 7 days (ts=0 = unknown date, kept)
        const FRESH_MS = 7*24*3600*1000;
        const nowMs = Date.now();
        const eligible = named.filter((it) => {
          if (it.ts && nowMs - it.ts > FRESH_MS) return false;
          // sports-outlet bylines often hide in the headline ("... - The Athletic - nytimes.com")
          const srcLow = ((it.source || '') + ' ' + (it.site || '') + ' ' + (it.title || '')).toLowerCase();
          if (!SPORTS_CATS.has(cat) && SOURCE_DENY.some((s) => srcLow.includes(s))) return false;
          return true;
        });
        // slot reservation (Nov 14 2026; strengthened Nov 15 2026): Google
        // News items are always newer, so photo-carrying direct/section items
        // lost the top-10 race and the wire stayed at ~5-10% photos. Reserve
        // up to 4 slots per full-size category for direct/section items —
        // photo-carrying ones first; a via item without a feed photo still
        // earns its slot because attachImages (below) fills most of them
        // from the article's og:image.
        const cap = MAX_OVERRIDE[cat] || MAX_PER_CAT;
        let picked = eligible.slice(0, cap);
        if (cap >= 6) {
          const viaPool = eligible.filter((it) => it.via && !picked.includes(it));
          const reserved = [
            ...viaPool.filter((it) => it.img),
            ...viaPool.filter((it) => !it.img),
          ].slice(0, 4);
          if (reserved.length) {
            picked = [...picked.slice(0, cap - reserved.length), ...reserved].sort((a, b) => b.ts - a.ts);
          }
        }
        out[cat] = picked.map(({ title, link, source, site, ts, desc, img }) => ({ title, link, source, site, ts, desc, img: img || '' }));
      })
    );
    await attachImages(out);
    return { updated: new Date().toISOString(), categories: out };
  } catch (e) {
    throw e;
  }
}

// Warm-instance response cache, stale-while-revalidate (Oct 13 2026): a cold
// build takes ~10s (60 feeds + the og:image pass), which left phones staring
// at TUNING THE WIRE with an empty wire and no thumbnails. Cached responses
// return instantly and a background refresh keeps the wire current — rule
// edits land within one cycle (~90s).
let WIRE_CACHE = null;
let WIRE_REFRESHING = false;
const WIRE_TTL_MS = 90 * 1000;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const nowMs = Date.now();
  if (WIRE_CACHE && nowMs - WIRE_CACHE.at < WIRE_TTL_MS) {
    return res.status(200).json(WIRE_CACHE.payload);
  }
  if (WIRE_CACHE) {
    if (!WIRE_REFRESHING) {
      WIRE_REFRESHING = true;
      buildWire()
        .then((p) => { WIRE_CACHE = { at: Date.now(), payload: p }; })
        .catch(() => {})
        .finally(() => { WIRE_REFRESHING = false; });
    }
    return res.status(200).json(WIRE_CACHE.payload);
  }
  try {
    const payload = await buildWire();
    WIRE_CACHE = { at: Date.now(), payload };
    return res.status(200).json(payload);
  } catch (e) {
    return res.status(502).json({ error: 'wire unavailable' });
  }
}
