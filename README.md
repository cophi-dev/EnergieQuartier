# EnergieQuartier

**Konzeptstudien für dezentrale Energie**

Web-App zur schnellen Erstellung von Konzeptstudien für dezentrale Energieversorgung (PV, Wärmepumpe, Batterie, Solarthermie) – mit Sankey, KPIs und PDF-Export.

## Tech Stack

- Next.js 15 (App Router + TypeScript)
- Tailwind CSS + shadcn/ui
- Recharts · React Hook Form + Zod · Framer Motion · jsPDF
- Zustand + localStorage (Projekte)

## Entwicklung

```bash
npm install
npm run dev
```

Öffnen: [http://localhost:3000](http://localhost:3000)

### Demo-Flow

1. **Landing** → „Neues Projekt starten“ oder **„Demo Projekt laden“**
2. **Wizard** (`/wizard`) → 5 Schritte → **Berechnen**
3. **Dashboard** (`/dashboard`) → Sankey, KPIs, Charts, **PDF-Report**
4. **Meine Projekte** (`/projekte`) → gespeicherte Studien (localStorage)

### Beispielprojekt

- Festes Demo-Objekt: MFH Hammerbrook (`/dashboard?demo=showcase`)
- KPIs in Hero-Mockup und Dashboard-Banner stammen aus derselben Berechnung

### Speicherpilot

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SPEICHERPILOT_URL=https://ihre-app-url.de
```

### Tests

```bash
npm test
```

## Struktur

```
app/
├── page.tsx              Landing Page
├── wizard/               5-Schritte-Konfigurator
├── dashboard/            Simulation & Report
├── projekte/             Gespeicherte Projekte
├── components/           Layout, Landing, Wizard, Dashboard
├── lib/                  Konstanten, Berechnungen
└── types/                TypeScript-Modelle

components/ui/            shadcn/ui Komponenten
lib/store.ts              Zustand-Store (localStorage)
```

## Markenfarben

| Rolle       | Hex       |
|-------------|-----------|
| Primär      | `#0F172A` |
| Akzent Cyan | `#06B6D4` |
| Akzent Grün | `#22C55E` |
| Hintergrund | `#F8FAFC` |
