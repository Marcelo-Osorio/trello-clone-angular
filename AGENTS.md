# AGENTS.md

## Project Overview

Angular 15 SPA (NgModule-based, not standalone). Project name: `trello-auth`. Auth-focused Trello clone.

## Developer Commands

- `npm start` — dev server at `http://localhost:4200/`
- `npm test` — Karma + Jasmine unit tests (auto-watch, Chrome browser)
- `npm run lint` — Angular ESLint (`@angular-eslint`)
- `npm run build` — production build to `dist/trello-auth/`

## API documentation
API documentation is available in two ways:
- **Postman MCP**: Query the `Fake Trello API` collection in your Postman workspace, my_workspace/Fake Trello API (recommended)
- **Local file**: (If you can't log in mcp postman) `postman.json` in the project root contains the complete collection (sync with Postman workspace)

To refresh the local file, run `postman_getCollection` via MCP and write the result to `postman.json`. 

## Key Conventions

- **Component selector prefix**: `app` (elements use `kebab-case`, attributes use `camelCase`)
- **Component default style**: SCSS (set in `angular.json` schematics)
- **All new components** must use SCSS style via `ng generate component ... --style=scss` or the schematic default
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

## Developer Rules

> When UI elements (inputs, modals, dropdowns) are rendered dynamically via conditional templates (`*ngIf`, `ng-template`):

1. **Avoid Native Autofocus:** HTML `autofocus` only works on initial page load. It will fail on dynamically injected elements, breaking keyboard navigation and blur events.
2. **Use Template References:** Always mark the target element with a template reference variable (e.g., `#targetElement`) and query it via `@ViewChild` or `@ViewChildren`.
3. **Execute Focus on Next Tick:** Wrap the `.focus()` logic inside a `setTimeout(() => { ... }, 0)` right after modifying the visibility state. This forces Angular to finish rendering the DOM before attempting to focus the element.
4. **Proposal a message commit:** : After builded a feature, bug or refactor, proposal a commit message under this rule <{action}(what it affects 'only one word -> board-cards') : message resume> where action could be refactor, bugs or feature

> Process of install external resources :
1. **Installations new tools or libraries:** Always ask first before to install external library or tool and explain why you need it.

## Advices

- If there's a modify that require the change doom and styles, be willing to use angular material and cdk components `https://v15.material.angular.dev/`.
- If there's a modify that require the change doom and styles, read the skills of tailwind.
- If there's a urge to see external documentation use context7 MCP.
- If it may find a component that is repeating its calling across at least two components or modules, put it in our shared module `@src\app\modules\shared/`
