import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faClose, faArchive, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { ArchivedService } from '@services/archived.service';
import { List } from '@models/list.model';

interface ArchivedModalData {
  boardId: number;
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
  boardId: number;

  constructor(
    private dialogRef: DialogRef<void>,
    private archivedService: ArchivedService,
    @Inject(DIALOG_DATA) data: ArchivedModalData,
  ) {
    this.boardId = data.boardId;
    this.loadArchived();
  }

  private loadArchived(): void {
    this.archivedLists = this.archivedService.getArchivedLists(this.boardId);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onRecoverList(listId: number): void {
    this.archivedService.recoverList(this.boardId, listId);
    this.archivedLists = this.archivedLists.filter((l) => l.id !== listId);
    this.recovered.emit();
  }
}
