import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  faTrash,
  faPlus,
  faCheckSquare,
  faSquare,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-checklist-group',
  templateUrl: './checklist-group.component.html',
  styleUrls: ['./checklist-group.component.scss'],
})
export class ChecklistGroupComponent {
  @Input() groupForm!: FormGroup;
  @Output() groupDelete = new EventEmitter<void>();

  faTrash = faTrash;
  faPlus = faPlus;
  faCheckSquare = faCheckSquare;
  faSquare = faSquare;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  expanded = true;
  hideChecked = false;
  editingTitle = false;
  addingItem = false;
  newItemText = '';
  editingItemIndex: number | null = null;

  get groupNameControl(): FormControl {
    return this.groupForm.get('groupName') as FormControl;
  }

  get groupName(): string {
    return this.groupNameControl.value || '';
  }

  get items(): FormArray {
    return this.groupForm.get('items') as FormArray;
  }

  get itemGroups(): FormGroup[] {
    return this.items.controls as FormGroup[];
  }

  get visibleItemGroups(): { control: FormGroup; index: number }[] {
    return this.itemGroups
      .map((control, index) => ({ control, index }))
      .filter(({ control }) => !this.hideChecked || !this.isItemChecked(control));
  }

  get totalItems(): number {
    return this.items.length;
  }

  get checkedItems(): number {
    return this.itemGroups.filter((item) => this.isItemChecked(item)).length;
  }

  get progressPercent(): number {
    if (this.totalItems === 0) return 0;
    return Math.round((this.checkedItems / this.totalItems) * 100);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  toggleHideChecked(): void {
    this.hideChecked = !this.hideChecked;
  }

  startEditTitle(): void {
    this.editingTitle = true;
  }

  saveTitle(): void {
    const trimmed = this.groupName.trim();
    if (trimmed) {
      this.groupNameControl.setValue(trimmed);
    }
    this.editingTitle = false;
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelEditTitle();
    }
  }

  toggleItem(index: number): void {
    const checkedControl = this.itemGroups[index].get('checked');
    checkedControl?.setValue(!checkedControl.value);
  }

  startEditItem(index: number): void {
    this.editingItemIndex = index;
  }

  saveItem(): void {
    if (this.editingItemIndex === null) return;
    const itemControl = this.itemGroups[this.editingItemIndex].get('item') as FormControl;
    const trimmed = (itemControl.value || '').trim();
    if (trimmed) {
      itemControl.setValue(trimmed);
    }
    this.editingItemIndex = null;
  }

  cancelEditItem(): void {
    this.editingItemIndex = null;
  }

  onItemKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveItem();
    } else if (event.key === 'Escape') {
      this.cancelEditItem();
    }
  }

  startAddItem(): void {
    this.addingItem = true;
    this.newItemText = '';
  }

  submitNewItem(): void {
    const trimmed = this.newItemText.trim();
    if (!trimmed) return;
    this.items.push(
      new FormGroup({
        item: new FormControl(trimmed),
        checked: new FormControl(false),
      }),
    );
    this.newItemText = '';
    this.addingItem = false;
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    if (this.editingItemIndex === index) {
      this.editingItemIndex = null;
    }
  }

  cancelAddItem(): void {
    this.addingItem = false;
    this.newItemText = '';
  }

  onNewItemKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submitNewItem();
    } else if (event.key === 'Escape') {
      this.cancelAddItem();
    }
  }

  deleteGroup(): void {
    this.groupDelete.emit();
  }

  itemTextControl(itemForm: FormGroup): FormControl {
    return itemForm.get('item') as FormControl;
  }

  itemCheckedControl(itemForm: FormGroup): FormControl {
    return itemForm.get('checked') as FormControl;
  }

  itemText(itemForm: FormGroup): string {
    return this.itemTextControl(itemForm).value || '';
  }

  isItemChecked(itemForm: FormGroup): boolean {
    return Boolean(this.itemCheckedControl(itemForm).value);
  }
}
