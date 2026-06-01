import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faClose, faArchive, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { ArchivedService } from '@services/archived.service';
import { Card } from '@models/card.model';
import { List } from '@models/list.model';

interface ArchivedModalData {
  boardId: number;
  lists: List[];
}

@Component({
  selector: 'app-archived-modal',
  templateUrl: './archived-modal.component.html',
  styleUrls: ['./archived-modal.component.scss'],
})
export class ArchivedModalComponent {
  @Output() recovered = new EventEmitter<void>();

  faClose = faClose;
  faArchive = faArchive;
  faRotateLeft = faRotateLeft;

  archivedLists: List[] = [];
  archivedCards: Card[] = [];
  lists: List[] = [];
  selectedListId = 0;
  boardId: number;

  constructor(
    private dialogRef: DialogRef<void>,
    private archivedService: ArchivedService,
    @Inject(DIALOG_DATA) data: ArchivedModalData,
  ) {
    this.boardId = data.boardId;
    this.lists = data.lists;
    this.loadArchived();
  }

  private loadArchived(): void {
    const data = this.archivedService.getArchived(this.boardId);
    this.archivedLists = data.lists;
    this.archivedCards = data.cards;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onRecoverList(listId: number): void {
    this.archivedService.recoverList(this.boardId, listId);
    this.archivedLists = this.archivedLists.filter((l) => l.id !== listId);
    this.recovered.emit();
  }

  onRecoverCard(cardId: number): void {
    if (!this.selectedListId) {
      return;
    }
    this.archivedService.recoverCard(this.boardId, cardId);
    this.archivedCards = this.archivedCards.filter((c) => c.id !== cardId);
    this.recovered.emit();
  }
}
