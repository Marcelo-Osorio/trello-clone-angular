import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subscription } from 'rxjs';

import { BoardsService } from '@services/boards.service';
import { ArchivedService } from '@services/archived.service';
import { Board } from '@models/board.model';
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
