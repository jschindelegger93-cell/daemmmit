import s from '../data/settings.json';
export function GET({ site }: { site: URL }) {
  // BEI GO-LIVE: in settings.json "klickdummy": false setzen
  const body = s.klickdummy
    ? 'User-agent: *\nDisallow: /\n'
    : ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /warenkorb/', 'Disallow: /danke/', '', ...['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'].flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']), `Sitemap: ${new URL('/sitemap-index.xml', site).href}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
