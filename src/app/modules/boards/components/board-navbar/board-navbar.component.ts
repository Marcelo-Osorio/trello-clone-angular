import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import {
  faHome,
  faUserPlus,
  faArchive,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';

import { Board } from '@models/board.model';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';

@Component({
  selector: 'app-board-navbar',
  templateUrl: './board-navbar.component.html',
  styleUrls: ['./board-navbar.component.scss'],
})
export class BoardNavbarComponent {
  @Input() board!: Board;
  @Input() searchPanelOpen = false;
  @Input() hasActiveSearch = false;
  @Output() boardNameChange = new EventEmitter<string>();
  @Output() searchToggle = new EventEmitter<void>();
  @Output() archived = new EventEmitter<void>();

  faHome = faHome;
  faUserPlus = faUserPlus;
  faArchive = faArchive;
  faMagnifyingGlass = faMagnifyingGlass;

  isEditing = false;
  editName = '';

  constructor(private dialog: Dialog) {}

  startEditing(): void {
    this.isEditing = true;
    this.editName = this.board.title;
  }

  saveEdit(): void {
    const trimmed = this.editName.trim();
    if (trimmed && trimmed !== this.board.title) {
      this.boardNameChange.emit(trimmed);
    }
    this.isEditing = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  onInvite(): void {
    this.dialog.open<void>(InviteDialogComponent, {
      data: { boardId: this.board.id },
    });
  }

  onArchived(): void {
    this.archived.emit();
  }

  onSearchToggle(): void {
    this.searchToggle.emit();
  }
}
