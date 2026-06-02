import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';

import { Card } from '@models/card.model';
import { List } from '@models/list.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  @Input() list!: List;
  @Input() listIndex!: number;
  @Input() connectedDropListIds: string[] = [];

  @Output() cardDropped = new EventEmitter<CdkDragDrop<Card[]>>();
  @Output() addCard = new EventEmitter<{ listId: number; title: string }>();
  @Output() archiveList = new EventEmitter<number>();
  @Output() archiveAllCards = new EventEmitter<number>();
  @Output() cardClick = new EventEmitter<number>();

  faEllipsis = faEllipsis;
  faPlus = faPlus;

  showAddForm = false;
  newCardTitle = '';
  menuOpen = false;

  get cards(): Card[] {
    return this.list.cards || [];
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.newCardTitle = '';
    }
  }

  submitCard(): void {
    const title = this.newCardTitle.trim();
    if (!title) {
      return;
    }
    this.addCard.emit({ listId: this.list.id, title });
    this.newCardTitle = '';
    this.showAddForm = false;
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newCardTitle = '';
  }

  onAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submitCard();
    } else if (event.key === 'Escape') {
      this.cancelAdd();
    }
  }

  onCardDrop(event: CdkDragDrop<Card[]>): void {
    this.cardDropped.emit(event);
  }

  onCardClick(cardId: number): void {
    this.cardClick.emit(cardId);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onArchiveList(): void {
    this.archiveList.emit(this.list.id);
    this.menuOpen = false;
  }

  onArchiveAllCards(): void {
    this.archiveAllCards.emit(this.list.id);
    this.menuOpen = false;
  }
}
