import { getCollection } from 'astro:content';
import s from '../data/settings.json';
export async function GET({ site }: { site: URL }) {
  const u = (p: string) => new URL(p, site).href;
  const produkte = (await getCollection('produkte')).sort((a, b) => a.data.sort - b.data.sort);
  const artikel = await getCollection('ratgeber');
  const body = `# ${s.firma} (${s.marke} / ${s.submarke})

> ${s.firma} in ${s.plz} ${s.ort}, Österreich, sammelt und recycelt Mineralwolle (Glaswolle, Steinwolle, TEL-Wolle / KMF) von Privat- und Gewerbekunden und verkauft Dämmstoffe von Thermowool. Entsorgung für Privatkunden: ${s.preisKg.toFixed(2)} €/kg verwogen inkl. MwSt.; Abholung Richtpreis ${s.preisKm.toFixed(2)} €/km von/nach Stockerau; Mischmaterial +${s.aufschlagMisch} %; Schneidgerät-Miete ${s.mieteSchneidgeraet} €/Tag. Ab 1.1.2027 gilt in Österreich ein Deponieverbot für Mineralwolle.

Kontakt: ${s.telefon} · ${s.email} · ${s.strasse}, ${s.plz} ${s.ort} · Geschäftsführer ${s.geschaeftsfuehrer}
Einzugsgebiet (Abholung nach km): ${s.einzugsgebiet.join(', ')}

## Wichtigste Seiten
- [Mineralwolle entsorgen](${u('/entsorgung/')}): Varianten, Preise, Ablauf, Kostenrechner
- [Recycling & induktive Glasschmelze](${u('/recycling/')})
- [Shop](${u('/shop/')}): Sammelsäcke, Mietgerät, Dämmstoffe
- [Gewerbe](${u('/gewerbe/')})
- [FAQ](${u('/faq/')})
- [Kontakt](${u('/kontakt/')})

## Produkte & Leistungen
${produkte.map((p) => `- [${p.data.title}](${u(`/shop/${p.id}/`)}): ${p.data.kurz}${p.data.preis != null ? ` Preis: ${p.data.preis.toFixed(2)} € ${p.data.preisEinheit ?? ''}.` : ' Preis auf Anfrage.'}`).join('\n')}

## Ratgeber
${artikel.map((a) => `- [${a.data.title}](${u(`/ratgeber/${a.id}/`)}): ${a.data.antwort}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
