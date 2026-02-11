# Criterion

Criterion è un’app desktop Electron per l’editing critico dei testi. Usa un’architettura multi‑processo (main/preload/renderer) con editor basato su TipTap e gestione stato tramite Redux.

Copyright © 2025 FinconsGroup

## Tecnologie principali

- Electron 38 – framework desktop
- React 19 – UI renderer
- TypeScript 5.8 – tipizzazione
- Vite 6 / electron-vite – build e dev server
- Redux Toolkit + Redux Saga – state management
- TipTap v2.11 – editor di testo ricco
- Tailwind CSS 3.3 + shadcn/ui + Radix UI – UI
- i18next – localizzazione
- Lucide React – icone
- electron-builder – packaging e distribuzione
- electron-store – storage persistente

## Script principali

- dev / dev:staging / dev:prod – avvio in sviluppo
- build / build:dev / build:staging – build
- dist-mac – packaging macOS (.pkg)
- dist-win – packaging Windows (.exe)
- dist-linux – packaging Linux (.deb)
- typecheck – typecheck completo
- lint – linting

Per dettagli sugli script di build, vedi [scripts_usage.md](scripts_usage.md).
