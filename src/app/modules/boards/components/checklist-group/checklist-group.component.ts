import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  faTrash,
  faPlus,
  faCheckSquare,
  faSquare,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import { ChecklistGroup, ChecklistItem } from '@models/card.model';

@Component({
  selector: 'app-checklist-group',
  templateUrl: './checklist-group.component.html',
  styleUrls: ['./checklist-group.component.scss'],
})
export class ChecklistGroupComponent {
  @Input() group!: ChecklistGroup;
  @Output() groupChange = new EventEmitter<ChecklistGroup>();
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
  titleDraft = '';
  addingItem = false;
  newItemText = '';
  editingItemIndex: number | null = null;
  itemDraft = '';

  get totalItems(): number {
    return this.group.items.length;
  }

  get checkedItems(): number {
    return this.group.items.filter((i) => i.checked).length;
  }

  get progressPercent(): number {
    if (this.totalItems === 0) return 0;
    return Math.round((this.checkedItems / this.totalItems) * 100);
  }

  get visibleItems(): ChecklistItem[] {
    if (this.hideChecked) {
      return this.group.items.filter((i) => !i.checked);
    }
    return this.group.items;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  toggleHideChecked(): void {
    this.hideChecked = !this.hideChecked;
  }

  startEditTitle(): void {
    this.editingTitle = true;
    this.titleDraft = this.group.groupName;
  }

  saveTitle(): void {
    const trimmed = this.titleDraft.trim();
    if (trimmed && trimmed !== this.group.groupName) {
      this.group = { ...this.group, groupName: trimmed };
      this.emitChange();
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
    const items = [...this.group.items];
    items[index] = { ...items[index], checked: !items[index].checked };
    this.group = { ...this.group, items };
    this.emitChange();
  }

  startEditItem(index: number): void {
    this.editingItemIndex = index;
    this.itemDraft = this.group.items[index].item;
  }

  saveItem(): void {
    if (this.editingItemIndex === null) return;
    const trimmed = this.itemDraft.trim();
    if (trimmed) {
      const items = [...this.group.items];
      items[this.editingItemIndex] = { ...items[this.editingItemIndex], item: trimmed };
      this.group = { ...this.group, items };
      this.emitChange();
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
    const newItem: ChecklistItem = { item: trimmed, checked: false };
    this.group = { ...this.group, items: [...this.group.items, newItem] };
    this.emitChange();
    this.newItemText = '';
    this.addingItem = false;
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

  private emitChange(): void {
    this.groupChange.emit(this.group);
  }
}
