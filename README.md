# Dämm-Mit EA GmbH – Website & Shop

Astro (statisch) + Sveltia CMS + Netlify Forms. Aufbau nach dem MASTER WEB PROMPT (Variante A+B).

## Einrichtung in 5 Schritten
1. Netlify → **Add new project → Import from Git** → Repo `jschindelegger93-cell/daemmmit` wählen. Build-Einstellungen kommen aus `netlify.toml` (`npm run build`, `dist`).
2. Netlify → Forms: E-Mail-Benachrichtigung für `beratung`, `bestellung`, `kontakt` aktivieren.
3. Inhalte bearbeiten unter `/admin` (Anmeldung mit GitHub-Konto bzw. Token).
4. Platzhalter füllen: im Projekt nach `[PLATZHALTER` suchen.
5. **Go-live:** in `src/data/settings.json` (oder im CMS) `klickdummy` und `trackingPanel` auf `false` setzen, Domain verbinden, Sitemap `/sitemap-index.xml` in der Google Search Console einreichen.

## Lokal
```
npm install
npm run dev
```

## Struktur
- `src/data/settings.json` – Firmendaten, Preise, Announcement, Navigation
- `src/data/home.json`, `src/data/faq.json` – Startseite, FAQ
- `src/content/produkte/` – Produkte & Leistungen (Shop)
- `src/content/ratgeber/` – Ratgeber-Artikel
- `src/scripts/main.js` – Modal, Warenkorb, Rechner, Filter, Tracking (dataLayer)
- `public/admin/` – Sveltia CMS
