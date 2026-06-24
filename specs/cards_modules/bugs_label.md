---

# Refactoring and Bug Fixes: Labels System

## 1. Current Context and Diagnosis

### Recap of the Correct Behavior

* **`LabelsService`**: Exposes all labels from the current board without duplicates.
* **`LabelsModalComponent` (View Mode)**: Loads the labels from the service into the checklist. If a color does not come from the service, it is assigned a default name (`color name`).

### The Detected Problem

Direct mutation operations (`delete`, `toggle`, `rename`) were being performed using the service inside `LabelsModalComponent`. **This is incorrect.** The modal should only be responsible for reading data, managing its own temporary editing state, and emitting the results to the reactive form in `CardModalComponent`.

---

## 2. Workflow in `LabelsModalComponent`

### View Mode

* Reads the information provided by the service and lists it in the checklist.
* Fills in any missing available labels with the default name (`'color name'`).

### Edit Mode

* Accessed by clicking the edit button of the corresponding label in order to rename it or leave it empty, which reassigns the default name.
* Displays **all available colors**: those in the form, those from the service, and those that do not yet belong to any label.
* **Edit Form Behavior**:

  * If you select a different color, the name input automatically changes to show the name of the label associated with that color, preparing it to be edited.
  * **Unsaved changes**: If the user types a new name but changes the color *without pressing save*, the changes are discarded and the previous color restores its original name.
  * **Save**: When the "Save" button is pressed, the modification immediately affects the modal’s *View Mode*.

> UI change in the `LabelsModalComponent` view mode: the checklist should use the components from https://v15.material.angular.dev/components/checkbox/overview since we already have access to Material.

### Connection with `CardModalComponent`

* When labels are checked or unchecked in the checklist, the changes are immediately reflected in `CardModalComponent` through the **reactive form**.
* *Note:* Up to this point, no service modification method has been called.

---

## 3. Synchronization Logic in `BoardPageComponent`

When returning to `@src/app/modules/boards/pages/board` and validating the reactive form, labels are modified through the service. A strict distinction must be made between 3 types of labels:

### Change Classification for the Service

1. **New Labels (They did not exist in the service):**

   * They must be added as new available labels in the service.
   * They must be associated with the current `cardId`.

2. **Modified Existing Labels (Name only):**

   * They are updated in the service with their new name.
   * *Exception:* They are not updated if the user only assigned the label to the card without editing the text.

3. **Labels Removed from the Card:**

   * If a label already belonged to the card but was unchecked, the service must be instructed to remove the `cardId` from that label.
   * If that card was the last one that had the label, **the label must be completely deleted** from the service.

> Therefore, we conclude that our `CardModal` needs to send to `BoardPage` the **new labels**, the **modified existing labels**, and the **labels that were removed from the card**.

> ⚠️ **Important:** All this processing and categorization must be sent and resolved in `BoardPageComponent` **before** executing `updateCard` for the current card.

---

## 4. Cascading Update Other Cards

When an existing label changes its name, it affects all other cards that have that label assigned. To resolve this, the following reactive flow will be implemented:

### Subscription Flow in `ngOnInit`

* `BoardPageComponent` will subscribe to a new observable from the labels service in `ngOnInit`.

### Transmission Mechanism

1. After processing the reactive form, each renamed label is sent to a method in `LabelsService`.
2. This method checks which IDs of other cards use that label by using the `labelCards$` stream.
3. The service broadcasts the modified label together with the list of affected card IDs through the observable.
4. The subscriber in `BoardPageComponent` receives this event and executes `updateCard` for each of those cards with the label’s new name.

### Closing Rules

* **Avoid loops**: Do not update the source card again, the one that triggered the reactive form, since its information has already been saved.
* **Cache cleanup**: After completing the updates, invalidate the board cache using:

```typescript
this.boardsCacheService.removeBoardDetail(this.board!.id);
```

#### NOTE

You must adapt the label service methods, such as `toggleLabel`, `rename`, `remove`, among others, only if necessary to follow these rules.

---
