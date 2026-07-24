# mentor-matching-frontend

Frontend for the CodeYourFuture mentor matching platform.

Design documentation lives in [docs/design](docs/design):

- [DESIGN.md](docs/design/DESIGN.md) — design system and screen specs
- [HANDOFF.md](docs/design/HANDOFF.md) — Penpot to React/Tailwind handoff guide

# Getting started

## Clone the repository

```bash
git clone <[repo](https://github.com/Zobeir-Rigi/Career-Mentors-Matching)>
cd client
```

## How to install

```bash
npm install
npm run dev
```

## How to build for deployment

```bash
npm run build
```

## Project structure

```text
client/src/
├── pages/           # Route-level screens — one component per route, registered with the router
├── components/      # Shared feature components, composed from the primitives in ui/
│   └── ui/          # Small presentational UI primitives (Button, Card, Badge, Input, …)
├── lib/             # Reusable functions and class utilities — pure TypeScript, no JSX
├── index.css        # The complete theme config
└── main.tsx         # App entry: router setup and theme bootstrapping
```
