import { getCollection } from 'astro:content';
import s from '../data/settings.json';
import faq from '../data/faq.json';
export async function GET() {
  const artikel = await getCollection('ratgeber');
  const body = `# ${s.firma} – Kerninhalte

${s.firma}, ${s.strasse}, ${s.plz} ${s.ort}. Telefon ${s.telefon}, E-Mail ${s.email}.

## Preise Entsorgung (Privatkunden)
- Anlieferung Sammelstelle Stockerau: ${s.preisKg.toFixed(2)} €/kg verwogen, inkl. MwSt.
- Abholung in Sammelsäcken: ${s.preisKg.toFixed(2)} €/kg + Abholung (Richtpreis ${s.preisKm.toFixed(2)} €/km von/nach Stockerau), innerhalb einer Woche
- Absaugung vor Ort (in Vorbereitung): ${s.preisKg.toFixed(2)} €/kg + Stundenaufwand + Anfahrt
- Mischmaterial (Glas- und Steinwolle gemischt): +${s.aufschlagMisch} %
- Schneidgerät mit Absaugung: ${s.mieteSchneidgeraet} €/Tag
- Gewerbekunden: Preis nach Tätigkeitsfeld und Menge auf Anfrage

## FAQ
${faq.gruppen.flatMap((g) => g.fragen).filter((f) => !f.antwort.includes('[PLATZHALTER')).map((f) => `### ${f.frage}\n${f.antwort}`).join('\n\n')}

## Ratgeber
${artikel.map((a) => `### ${a.data.title}\n${a.data.antwort}\n\n${a.body ?? ''}`).join('\n\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
