import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { Subscription } from 'rxjs';

import { BoardsService } from '@services/boards.service';
import { CardsService } from '@services/cards.service';
import { ArchivedService } from '@services/archived.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { List } from '@models/list.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  lists: List[] = [];
  loading = true;
  error: string | null = null;

  private paramsSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardsService: BoardsService,
    private cardsService: CardsService,
    private archivedService: ArchivedService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.loadBoard(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  onBoardNameChange(newName: string): void {
    if (!this.board || !newName.trim()) {
      return;
    }
    this.boardsService.updateBoard(this.board.id, { title: newName.trim() }).subscribe({
      next: (updated) => {
        this.board = updated;
      },
    });
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetList: List): void {
    if (event.previousContainer === event.container) {
      // Reorder within same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const movedCard = event.container.data[event.currentIndex];
      if (movedCard && this.board) {
        this.cardsService.updateCard(movedCard.id, {
          title: movedCard.title,
          description: movedCard.description,
          position: event.currentIndex,
          listId: targetList.id,
          boardId: this.board.id,
        }).subscribe();
      }
    } else {
      // Transfer between lists
      const card = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if (card && this.board) {
        this.cardsService.updateCard(card.id, {
          title: card.title,
          description: card.description,
          position: event.currentIndex,
          listId: targetList.id,
          boardId: this.board.id,
        }).subscribe();
      }
    }
  }

  onListDrop(event: CdkDragDrop<List[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.lists, event.previousIndex, event.currentIndex);
    }
  }

  onAddCard(event: { listId: number; title: string }): void {
    if (!this.board) {
      return;
    }
    const targetList = this.lists.find((l) => l.id === event.listId);
    if (!targetList) {
      return;
    }
    const nextPosition = (targetList.cards || []).length;
    this.cardsService.createCard({
      title: event.title,
      listId: event.listId,
      boardId: this.board.id,
      position: nextPosition,
      description: '',
    }).subscribe({
      next: (newCard) => {
        if (!targetList.cards) {
          targetList.cards = [];
        }
        targetList.cards.push(newCard);
      },
    });
  }

  onArchiveList(listId: number): void {
    if (!this.board) {
      return;
    }
    const list = this.lists.find((l) => l.id === listId);
    if (!list) {
      return;
    }
    this.archivedService.archiveList(this.board.id, list, list.cards || []);
    this.lists = this.lists.filter((l) => l.id !== listId);
  }

  onArchiveAllCards(listId: number): void {
    if (!this.board) {
      return;
    }
    const list = this.lists.find((l) => l.id === listId);
    if (!list || !list.cards) {
      return;
    }
    list.cards.forEach((card) => {
      this.archivedService.archiveCard(this.board!.id, card);
    });
    list.cards = [];
  }

  onCardClick(cardId: number): void {
    // Card modal will be implemented in PR-4
    console.log('Card clicked:', cardId);
  }

  private loadBoard(id: number): void {
    this.loading = true;
    this.error = null;

    this.boardsService.getBoardById(id).subscribe({
      next: (board) => {
        this.board = board;
        this.lists = this.filterArchived(board);
        this.loading = false;

        // Clean stale archived entries
        const serverListIds = (board.lists || []).map((l) => l.id);
        const serverCardIds = (board.cards || []).map((c) => c.id);
        this.archivedService.cleanStale(id, serverListIds, serverCardIds);
      },
      error: () => {
        this.error = 'Failed to load board. Please try again.';
        this.loading = false;
      },
    });
  }

  private filterArchived(board: Board): List[] {
    const archived = this.archivedService.getArchived(board.id);
    const archivedListIds = new Set(archived.lists.map((l) => l.id));
    const archivedCardIds = new Set(archived.cards.map((c) => c.id));

    const lists = board.lists || [];
    return lists
      .filter((list) => !archivedListIds.has(list.id))
      .map((list) => ({
        ...list,
        cards: (list.cards || []).filter((card) => !archivedCardIds.has(card.id)),
      }));
  }
}
