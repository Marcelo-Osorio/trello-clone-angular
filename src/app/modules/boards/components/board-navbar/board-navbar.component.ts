import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  faHome,
  faUserPlus,
  faArchive,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';

import { Board } from '@models/board.model';

@Component({
  selector: 'app-board-navbar',
  templateUrl: './board-navbar.component.html',
  styleUrls: ['./board-navbar.component.scss'],
})
export class BoardNavbarComponent {
  @Input() board!: Board;
  @Output() boardNameChange = new EventEmitter<string>();
  @Output() searchToggle = new EventEmitter<void>();
  @Output() archived = new EventEmitter<void>();

  faHome = faHome;
  faUserPlus = faUserPlus;
  faArchive = faArchive;
  faMagnifyingGlass = faMagnifyingGlass;

  isEditing = false;
  editName = '';
  searchOpen = false;

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
    // Invite dialog handled by parent via dialog
  }

  onArchived(): void {
    this.archived.emit();
  }

  onSearchToggle(): void {
    this.searchOpen = !this.searchOpen;
    this.searchToggle.emit();
  }
}
