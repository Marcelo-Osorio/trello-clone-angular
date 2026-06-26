# Tasks: Refactor System of Search & Filter

## Completion Status

- [x] TASK-001: Implement MatSidenav layout for Search Panel
- [x] TASK-002: Develop SearchService core filtering logic
- [x] TASK-003: Build Search Panel inputs and label selector
- [x] TASK-004: Implement active filter chips in Search Panel
- [x] TASK-005: Integrate filtering results into Board rendering

## TASK-001: Implement MatSidenav layout for Search Panel

Files:

* BoardNavbarComponent
* BoardComponent
* SearchPanelComponent

Implementation:

* Add an event emitter in `BoardNavbarComponent` to dispatch a click event when the search icon is pressed.
* Wrap the main content of `BoardComponent` in an Angular Material `MatSidenavContainer`.
* Embed `SearchPanelComponent` inside a `MatSidenav` within `BoardComponent`.
* Configure the `MatSidenav` to open from the right, set position to `over`, apply a slow push animation, and ensure it closes automatically upon a backdrop click.
* Bind the navbar's emit event to open the sidenav in `BoardComponent`.

Done when:

* Clicking the search icon in the navbar opens the side panel from the right.
* Clicking outside the panel successfully closes it.

---

## TASK-002: Develop SearchService core filtering logic

Files:

* SearchService
* search.models (or equivalent models file)

Implementation:

* Define interfaces for the search criteria (e.g., text string, array of selected label IDs).
* Add an `isFiltering` boolean state that turns true when criteria are actively sent.
* Create a method to receive and store text and label criteria from `SearchPanelComponent`.
* Implement a filtering function using native higher-order array methods (`filter`, `some`, `includes`).
* The logic must exclude archived lists entirely.
* Apply cumulative filtering: filter cards by checking if the search text matches the card title, description, or checklist items, **AND** check if the card contains at least one of the selected labels.
* The function should return only lists that contain at least one matched card, and strictly only the matched cards inside those lists.

Done when:

* The service effectively stores search states.
* The filtering algorithm successfully processes raw lists and accurately returns filtered arrays using native JS/TS array functions based on the cumulative rules.

---

## TASK-003: Build Search Panel inputs and label selector

Files:

* SearchPanelComponent
* LabelsService

Implementation:

* Add a text input field for the text-based search. Trigger the search using an Enter keypress or a debounce delay after typing.
* Inject `LabelsService` to fetch all available board labels.
* Create a selection row in the UI displaying the fetched labels, showing the label's color and name.
* Bind the text input and label selector to send their active values to the `SearchService`.

Done when:

* The text input successfully captures data without spamming the service (via debounce or enter).
* All labels are visually rendered in a selectable row.
* Selecting labels or typing text successfully passes the criteria to `SearchService`.

---

## TASK-004: Implement active filter chips in Search Panel

Files:

* SearchPanelComponent

Implementation:

* Read the currently active search criteria (from local state or `SearchService`) to dynamically render Angular Material chips.
* Format label chips as `[label | label-name]`.
* Format search chips as `[search | search content]`.
* Implement text truncation logic for the text search chip: if the search text exceeds a certain length, append `...` to the end.
* Add an "x" (remove) button to each chip.
* Create a function so that clicking the "x" removes the filter from the UI and updates the `SearchService` to clear that specific criteria.

Done when:

* Active filters are clearly visible as formatted chips.
* Long text searches are properly truncated with three dots.
* Users can remove individual filters by clicking the chip's "x" button, which successfully updates the active search state.

---

## TASK-005: Integrate filtering results into Board rendering

Files:

* BoardComponent

Implementation:

* Ensure `BoardComponent` consistently sends the latest visible (non-archived) lists to `SearchService` for processing.
* Query the filtered data output from `SearchService`.
* Update the template rendering logic so that if `isFiltering` is true, the board renders the processed lists instead of the raw board lists.
* Verify that lists without any matching cards are completely hidden from the board during an active search.

Done when:

* The board dynamically updates its UI based on the active search filters.
* Only cards matching both text and label criteria are displayed.
* Empty lists (lists with zero matches) are completely hidden from the board view during an active search.
