# AGENTS.md

## Project Overview

Angular 15 SPA (NgModule-based, not standalone). Project name: `trello-auth`. Auth-focused Trello clone.

## Developer Commands

- `npm start` — dev server at `http://localhost:4200/`
- `npm test` — Karma + Jasmine unit tests (auto-watch, Chrome browser)
- `npm run lint` — Angular ESLint (`@angular-eslint`)
- `npm run build` — production build to `dist/trello-auth/`

## API documentation
If you need more information of apis make a request mcp postman in my workspace and in collection Fake Trello API 

## Key Conventions

- **Component selector prefix**: `app` (elements use `kebab-case`, attributes use `camelCase`)
- **Component default style**: SCSS (set in `angular.json` schematics)
- **All new components** must use SCSS style via `ng generate component ... --style=scss` or the schematic default
- **HTML templates** are inline in `.ts` files by default (not separate `.html` files)
- **Tailwind CSS** is configured with `@tailwindcss/forms` plugin — use utility classes in component SCSS

## Architecture

- `src/app/modules/` — feature modules (auth, boards, users, profile, layout, shared)
- `src/app/services/` — auth, token, boards, users services
- `src/app/interceptors/token.interceptor.ts` — attaches JWT to HTTP requests
- `src/app/guards/` — `auth.guard.ts` (requires auth), `redirect.guard.ts` (redirects logged-in users)
- `src/app/models/` — TypeScript interfaces

## Environment / API

- Dev: `src/environments/environment.ts` — `API_URL: 'https://fake-trello-api.herokuapp.com'`
- Prod: `src/environments/environment.prod.ts` — same API URL (production replacement in `angular.json`)
- Both environments point to the same fake API (no separate prod API)

## Important Quirks

- Production build uses `fileReplacements` to swap `environment.ts` → `environment.prod.ts` (defined in `angular.json` build config)
- Karma runs in Chrome browser — requires Chrome installed or headless mode configured
- `ng lint` uses `@angular-eslint/schematics` collection (configured in angular.json CLI)
- ESLint `parserOptions.project` is set to `tsconfig.json` — lint will fail without running `ng build` first to generate the program
- No CI/CD workflows found in `.github/workflows/`

## Tooling Versions ( pinned in package.json )

- Angular: `~15.2.0`
- TypeScript: `~4.9.5`
- Tailwind CSS: `~3.1.6`
- ESLint: `^8.33.0` with `@angular-eslint` v15.2.1
- Karma / Jasmine for testing
