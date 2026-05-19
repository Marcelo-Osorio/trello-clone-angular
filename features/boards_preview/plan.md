## Implementation Plan: Boards Module Enhancement

---

### Phase 1: Core Infrastructure & Services

**1.1 Extend BoardsService** (`src/app/services/boards.service.ts`)

* Add `getMeBoards()` → `GET /api/v1/me/boards`
* Add `getMeProfile()` → `GET /api/v1/me/profile`
* Update existing methods to use correct endpoints

**1.2 Update AuthService** (`src/app/services/auth.service.ts`)

* Change `getProfile()` endpoint from `/api/v1/auth/profile` to `/api/v1/me/profile`

---

### Phase 2: BoardsComponent (Main Page)

**2.1 New Components to Create:**

| Component | Purpose |
| --- | --- |
| **`create-board-dialog/`** | Modal to create new board with title + color picker |
| **`board-card/`** | Reusable board card with update icon |
| **`skeleton-loader/`** | Loading skeleton for boards grid |
| **`search-boards/`** | Search input with highlight on matches |

**2.2 Update BoardsComponent** (`pages/boards/boards.component.ts`)

* Inject `BoardsService`
* Load boards via `getMeBoards()`
* Implement **Recently Viewed** section: first 4 boards (sorted by ID descending)
* Implement **All Boards** section with infinite scroll (CDK Virtual Scroll or manual pagination)
* Add **View All** link below Recently Viewed to jump to full list
* Remove "My workspace" accordion (unnecessary)
* Add skeleton loading state

**2.3 Update Template** (`pages/boards/boards.component.html`)

* **Sidebar:** Remove accordion, keep navigation links
* **Main area:**
* "Recently viewed" heading with 4 board cards
* "View all boards" link
* Search input for filtering boards
* "All Boards" section with infinite scroll grid



---

### Phase 3: Create Board Dialog

**3.1 `create-board-dialog.component.ts**`

* Form with title input (required) + `backgroundColor` radio buttons
* Colors: `sky`, `green`, `violet`, `yellow` (from `board.model.ts`)
* Submit calls `BoardsService.createBoard()`
* Returns created board to parent on success

**3.2 Modal Styling**

* Use Angular Material or CDK Dialog
* Use Tailwind for styling

---

### Phase 4: Board Card Component

**4.1 `board-card.component.ts**`

* **Inputs:** `board: Board`, `showUpdateIcon: boolean`
* **Outputs:** `boardUpdated`, `boardClicked`
* Displays board title with background color
* Pencil icon (top-right) triggers update event
* Click navigates to board detail

**4.2 `board-card.component.html**`

* Colored background based on `board.backgroundColor`
* Hover effect showing update icon
* Responsive sizing

---

### Phase 5: Search Boards Feature

**5.1 Implementation**

* Filter boards by title match (case-insensitive)
* Highlight matched syllables in title (using `<mark>` or `<span>`)
* Debounce search input (300ms)
* Show "No results" state

---

### Phase 6: Update Board Dialog

**6.1 `update-board-dialog.component.ts**`

* Pre-populate form with current `board.title` and `board.backgroundColor`
* Color options: `sky`, `green`, `violet`, `yellow`
* Submit calls `BoardsService.updateBoard(id, data)`

---

### Phase 7: Navbar Enhancement

**7.1 Add Recent Boards Stack**

* Inject `BoardsService`
* On board open, push board ID to localStorage stack (max 3)
* On navbar init, load stack and fetch board details

**7.2 Update Template** (`navbar.component.html`)

* **Boards dropdown:** Show 3 most recently opened boards from localStorage
* **Create button:** Opens create board modal
* **User avatar section:** If no avatar, show default user icon

---

### Phase 8: Loading States & Skeletons

**8.1 `skeleton-loader.component.ts**`

* Animated pulse effect
* Configurable count (show 4-8 skeleton cards)

---

### File Structure (Final)

```text
src/app/modules/boards/
├── boards.module.ts                       # Add new components to declarations
├── boards-routing.module.ts               # No changes
├── components/
│   ├── todo-dialog/                       # Existing
│   ├── create-board-dialog/
│   │   ├── create-board-dialog.component.ts
│   │   └── create-board-dialog.component.html
│   ├── board-card/
│   │   ├── board-card.component.ts
│   │   └── board-card.component.html
│   └── skeleton-loader/
│       ├── skeleton-loader.component.ts
│       └── skeleton-loader.component.html
└── pages/
    ├── board/                             # READ ONLY - don't modify
    │   ├── board.component.ts
    │   └── board.component.html
    └── boards/
        ├── boards.component.ts            # Enhance with API integration
        └── boards.component.html          # Enhance with new UI

```

---

### Key Technical Decisions

**1. API Endpoints Used:**

* `GET /api/v1/me/profile` — Replace auth/profile
* `GET /api/v1/me/boards` — Get user's boards (ordered by id desc)
* `POST /api/v1/boards` — Create board
* `PUT /api/v1/boards/:id` — Update board

**2. Color Mapping:**

| Color Name | Tailwind Class |
| --- | --- |
| `sky` | `bg-sky-700` |
| `green` | `bg-green-700` |
| `violet` | `bg-violet-700` |
| `yellow` | `bg-amber-700` |

**3. Recently Viewed Logic:**

* **Main page:** First 4 from `/api/v1/me/boards` (sorted by id desc)
* **Navbar:** localStorage stack of last 3 opened board IDs

**4. Responsive Breakpoints:**

* **Mobile:** 1 column
* **Tablet:** 2 columns
* **Desktop:** 4 columns

---

### Questions for Clarification

1. **Infinite Scroll:** Should I use Angular CDK Virtual Scrolling or a manual "Load More" button?
2. **Update Board Access:** Should the update icon appear on hover only, or always be visible?
3. **Search Scope:** Should the search filter the already-loaded boards, or make a new API call?
