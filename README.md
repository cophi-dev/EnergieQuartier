# EnergieQuartier

**Intelligente Konzepte für Hamburgs Energiezukunft**

MVP-Web-App zur schnellen Erstellung von Konzeptstudien für dezentrale Energieversorgungslösungen (PV, Wärmepumpe, Batterie, Solarthermie) – für den Vertrieb bei den Hamburger Energiewerken.

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

1. **Landing** → „Neues Projekt starten“ oder **„HEW-Demo laden“**
2. **Wizard** (`/wizard`) → 5 Schritte → **Berechnen**
3. **Dashboard** (`/dashboard`) → Sankey, KPIs, Charts, **PDF-Report**
4. **Meine Projekte** (`/projekte`) → gespeicherte Studien (localStorage)

### HEW-Vorstellungsdemo

- Festes Showcase-Projekt: MFH Elbchaussee (`/dashboard?demo=hew`)
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

| Rolle      | Hex       |
|------------|-----------|
| Primär     | `#0A4D68` |
| Sekundär   | `#088395` |
| Akzent     | `#00FFCA` |
| Hintergrund| `#F5F8FA` |
