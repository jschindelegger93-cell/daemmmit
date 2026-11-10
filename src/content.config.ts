import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = {
  seoTitle: z.string().max(70).nullish(),
  seoDescription: z.string().max(170).nullish(),
  noindex: z.boolean().nullish(),
};

const produkte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produkte' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      typ: z.enum(['produkt', 'service']).default('produkt'),
      kategorie: z.enum(['entsorgung', 'hochbau', 'technik']),
      marke: z.string().nullish(),
      kurz: z.string(),
      bild: image().nullish(),
      anwendung: z.array(z.string()).nullish(),
      vorteile: z.array(z.string()).nullish(),
      daten: z.array(z.object({ label: z.string(), wert: z.string() })).nullish(),
      varianten: z.array(z.object({ name: z.string(), info: z.string().nullish() })).nullish(),
      einheit: z.string().default('Stück'),
      preis: z.number().nullish(),
      preisEinheit: z.string().nullish(),
      preisHinweis: z.string().nullish(),
      status: z.string().nullish(),
      top: z.boolean().nullish(),
      sort: z.number().default(100),
      quelle: z.string().nullish(),
      ...seo,
    }),
});

const ratgeber = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ratgeber' }),
  schema: z.object({
    title: z.string(),
    kurz: z.string(),
    antwort: z.string(),
    kategorie: z.string(),
    datum: z.coerce.date(),
    aktualisiert: z.coerce.date().nullish(),
    lesezeit: z.number().default(4),
    quellen: z.array(z.object({ titel: z.string(), url: z.string() })).nullish(),
    faq: z.array(z.object({ frage: z.string(), antwort: z.string() })).nullish(),
    ...seo,
  }),
});

export const collections = { produkte, ratgeber };
