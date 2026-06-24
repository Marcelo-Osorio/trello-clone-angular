# refactor: implement reactive forms for the card modal

## Context

The main refactor will be applied to:

`@src/app/modules/boards/components/card-modal`

Specifically, the card modal inputs must now behave as part of a reactive form.

The reactive form structure must be created in:

`@src/app/modules/boards/pages/board`

Currently, when the card modal is opened and a card is edited, changes are persisted through the `persistCard` method. This approach is inefficient because it saves data during editing instead of tracking and validating the card state through a single form.

The new behavior must track all card data through the reactive form, validate changes continuously, and only persist updates when the modal is closed successfully.

If the user attempts to close the modal while the form is invalid, closing must be prevented and a confirmation pop-up must be displayed.

The pop-up should show a message similar to:

> This card does not meet the required validation rules. What would you like to do?

The available actions must be:

- Continue editing
- Close and discard changes

If the form is valid, the modal should close normally and the complete form data must be sent to `updateCard` from:

`@src/app/modules/boards/pages/board`

---

## Objectives

Create one reusable reactive form structure for each card.

The form must follow this structure:

```ts
form {
  cardTitle: string; // required, min: 1, max: 25

  textDescription: string; // optional, max: 200

  labels: [
    {
      labelName: string; // required if label exists, min: 2, max: 50
      color: string; // required if label exists, min: 2, max: 20
    }
  ];

  checklist: [
    {
      groupName: string; // required if checklist group exists, min: 2, max: 20
      items: [
        {
          item: string; // required if item exists, min: 2, max: 70
          checked: boolean; // default: false
        }
      ];
    }
  ];

  dueDate: string; // optional, only one date, must be greater than now()
}
````

A custom validator must be created in `@utils` to verify that `dueDate` is greater than the current date.

---

## Reactive form integration

Every input inside:

`@src/app/modules/boards/components/card-modal`

must receive and use the complete reactive form provided from:

`@src/app/modules/boards/pages/board`

The purpose is to validate each input from the parent form and keep the card state synchronized.

---

## Card title

The `cardTitle` field represents the card title.

The card title is first created from:

`@src/app/modules/boards/pages/board`

through the `onAddCard` method.

This value must be bound to the `cardTitle` form control.

The card title can also be edited from:

`@src/app/modules/boards/components/card-modal`

Therefore, the title input inside the modal must also be bound to the same `cardTitle` form control.

---

## Text description

The `textDescription` field must be managed inside:

`@src/app/modules/boards/components/card-modal`

It must be bound to the current card description field.

---

# Labels

## Requirements

When a board is loaded, it already includes all lists and cards, including the labels assigned to each card.

A labels service must be created to collect all labels found across the board.

The service must:

* Read all labels from the loaded board cards.
* Remove duplicated labels.
* Store the available labels in `sessionStorage`.
* Only store labels whose colors exist in `FIXED_COLORS`, located in:

`@src/app/modules/boards/components/labels-modal`

If a label color is not part of `FIXED_COLORS`, it must be ignored.

If all colors from `FIXED_COLORS` have already been found, the search can stop.

---

## Loading available labels

Once the board labels are collected, the same labels service must be used by:

`@src/app/modules/boards/components/labels-modal/labels-modal.component.ts`

to display the available labels.

The current label representation must be improved.

The labels modal should display a checkbox-style button area with:

* Label name
* Label color
* Edit icon

If a label has no name, only the color should be shown.

The label name must appear above the color bar.

When the user selects a label that has only a color and no name, it must be added with this default structure:

```ts
{
  labelName: color,
  color: color
}
```

---

## Label edit mode

The edit button must switch the labels modal into edit mode.

This should be handled inside the same component:

`@src/app/modules/boards/components/labels-modal`

The component should have two states:

* Normal label selection mode
* Label edit mode

In edit mode, show:

* An input with the placeholder: `Enter label name`
* A color selector below the input
* A Back button
* A Save button

The color selector must only show unused colors.

To determine unused colors, compare the full list of `FIXED_COLORS` against the labels already stored in the labels service.

However, when editing an existing label, its current color must still be displayed and selectable, even if it is already being used.

If the label already has a name, the input must be prefilled with the current name.

When saving, the label must be stored in the labels service and then shown again in the normal selection state as an available label.

If an existing label is edited, it must overwrite the previous value in the labels service.

Do not create a separate “create label” feature. The system must only work with the labels and colors that currently exist.

Labels selected only by color, using the default name equal to the color, must not be persisted as custom labels in the labels service.

Only labels with a custom name should be saved in the labels service.

---

## Selecting labels

Every time a label is selected in:

`@src/app/modules/boards/components/labels-modal`

it must be added to the reactive form.

Before sending the selected labels back to:

`@src/app/modules/boards/components/card-modal`

the form validations must be checked.

If the validations allow it, the selected labels must also be displayed in the card modal.

---

## Loading labels already assigned to a card

If a card already has labels, the labels modal must show:

* Labels already assigned to the card
* Labels with custom names
* Labels that only have a color
* Labels available from other cards

Labels already assigned to the current card must appear as selected, using a check indicator.

When a user deselects a label:

* Remove it from the reactive form.
* Remove it from the current card selection.
* Update the labels service if necessary.

The labels modal must also include a Close button in case the user does not want to continue editing labels.

---

## Updating labels across other cards

If a label created or used by another card is edited, the change must also affect every card that uses that label.

This must be handled after closing:

`@src/app/modules/boards/components/card-modal`

and returning to:

`@src/app/modules/boards/pages/board`

The flow must be:

1. The label is edited inside `labels-modal`.
2. The modified label is emitted to `card-modal`.
3. `card-modal` stores the information temporarily.
4. When `card-modal` closes, the modified labels are sent back to `board`.
5. `board` validates the reactive form again.
6. `board` updates the current card using `updateCard`.
7. `board` updates the other affected cards.

---

## Label service session storage

The labels service must maintain a `sessionStorage` structure containing all usable label colors.

Example:

```ts
{
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500'
}
```

For each color, the service must also store an array of card IDs that currently use that label.

This `sessionStorage` data must be initialized when:

`@src/app/modules/boards/pages/board`

loads the board for the first time.

It must also be updated when a new or edited card modifies its labels.

---

## Cascade label updates

Once the board page knows which labels were edited, it must send those modified labels to the labels service.

The labels service must expose an observable that notifies which cards must be updated and which label must be applied.

The board page must subscribe to this observable and update the affected cards by ID.

The current card that was just updated must be excluded from this cascade update.

Only the description section of the affected cards must be updated.

When the current card is updated, the board page must also update the labels service `sessionStorage` with the latest label data for the entire board.

---

## Deselecting labels

When a label is deselected from a card, the labels service must update both tracking structures.

### 1. Card ID tracking

If a label is removed from a card, the current card ID must be removed from the list of card IDs associated with that label color.

### 2. Board label tracking

If the removed label was the last instance of that label across the entire board, it must also be removed from the general labels storage.

This can be detected using the card ID tracking structure.

---

# Checklist

The checklist feature is managed inside:

`@src/app/modules/boards/components/card-modal`

When creating a checklist title, bind that value to:

```ts
checklist[index].groupName
```

Each checklist group has this structure:

```ts
{
  groupName: string;
  items: [
    {
      item: string;
      checked: boolean;
    }
  ];
}
```

Checklist groups are rendered through:

`@src/app/modules/boards/components/checklist-group`

The `checklist-group` component must receive the corresponding form group or form controls.

It must validate:

* `groupName`
* `items[].item`
* `items[].checked`

Changes must still be reflected in:

`@src/app/modules/boards/components/card-modal`

through the existing outputs.

The form must track the checklist state, while the UI continues to update normally through component communication.

---

# Due date

The due date behavior must be refactored.

Currently, `openDueDateModal` in:

`@src/app/modules/boards/components/card-modal`

assumes that multiple due dates can exist because it uses an array.

This must be changed.

Only one due date is allowed.

The modal:

`@src/app/modules/boards/components/due-date-modal`

must use Angular Material Datepicker instead of Tailwind-based custom UI.

Use Angular Material v15 Datepicker from:

`https://v15.material.angular.dev/`

The datepicker must be connected to the reactive form field:

```ts
dueDate
```

The form must validate that the selected date is greater than the current date.

Create this validation as a custom validator inside `@utils`.

Only dates are required.

Do not include hours or minutes.

The required display format is:

```txt
dd/mm/yyyy
```

---

# Board cache

The service:

`@src/app/services/boards-cache.service.ts`

currently caches a board, including lists and cards.

Every time any board data is updated from:

`@src/app/modules/boards/pages/board`

the cache for that board must be cleared.

This ensures that the next reload fetches the latest board data.

---

# Deprecation of `persistCard`

The method:

```ts
persistCard
```

inside:

`@src/app/modules/boards/components/card-modal`

must be deprecated.

Before closing the modal, validation must be performed using the reactive form.

After the modal closes, the form must be validated again in:

`@src/app/modules/boards/pages/board`

before calling `updateCard`.

---

# Validation messages

Every form validation error must be shown clearly in the UI.

For each invalid field:

* Highlight the invalid input.
* Display a red error message below the input.
* The error message must explain where the validation failed.

Examples:

```txt
The card title is required.
The card title must not exceed 25 characters.
The label name must be at least 2 characters long.
The checklist item must not exceed 70 characters.
The due date must be greater than today.
```

```
```
