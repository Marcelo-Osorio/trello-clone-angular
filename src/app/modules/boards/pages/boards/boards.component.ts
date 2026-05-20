import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faSearch, faClock, faPen, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faTrello as faTrelloBrand } from '@fortawesome/free-brands-svg-icons';

import { Board, CreateBoardDto, UpdateBoardDto } from '@models/board.model';
import { BoardsService } from '@services/boards.service';
import { RecentBoardsService, RecentBoardEntry } from '@services/recent-boards.service';
import { CreateBoardDialogComponent } from '@boards/components/create-board-dialog/create-board-dialog.component';
import { UpdateBoardDialogComponent } from '@boards/components/update-board-dialog/update-board-dialog.component';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BoardsComponent implements OnInit, OnDestroy {
  allBoards: Board[] = [];
  filteredBoards: Board[] = [];
  recentStackEntries: RecentBoardEntry[] = [];
  recentBoards: Board[] = [];
  searchTerm = '';
  loading = true;
  recentlyViewedExpanded = true;

  faTrello = faTrelloBrand;
  faPlus = faPlus;
  faSearch = faSearch;
  faClock = faClock;
  faPen = faPen;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  private destroy$ = new Subject<void>();

  constructor(
    private boardsService: BoardsService,
    private recentBoardsService: RecentBoardsService,
    private router: Router,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadBoards();
    this.recentBoardsService.stackChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stack => {
        this.recentStackEntries = stack;
        this.syncRecentBoards();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasRecentBoards(): boolean {
    return this.recentBoards.length > 0;
  }

  get hasAllBoards(): boolean {
    return this.allBoards.length > 0;
  }

  private syncRecentBoards(): void {
    if (this.allBoards.length === 0) {
      this.recentBoards = [];
      return;
    }
    this.recentBoards = this.recentStackEntries
      .map(entry => this.allBoards.find(b => b.id === entry.id))
      .filter((b): b is Board => !!b)
      .slice(0, 4);
  }

  loadBoards(): void {
    this.loading = true;
    this.boardsService.getMeBoards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boards) => {
          this.allBoards = boards.sort((a, b) => b.id - a.id);
          this.filteredBoards = [...this.allBoards];
          this.syncRecentBoards();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    if (!this.searchTerm) {
      this.filteredBoards = [...this.allBoards];
    } else {
      this.filteredBoards = this.allBoards.filter(board =>
        board.title.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(CreateBoardDialogComponent, {
      width: '400px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.boardsService.createBoard(result as CreateBoardDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe((newBoard) => {
            this.allBoards = [newBoard, ...this.allBoards].sort((a, b) => b.id - a.id);
            this.filteredBoards = this.searchTerm
              ? this.allBoards.filter(b => b.title.toLowerCase().includes(this.searchTerm))
              : [...this.allBoards];
          });
      }
    });
  }

  openUpdateBoardDialog(board: Board): void {
    const dialogRef = this.dialog.open(UpdateBoardDialogComponent, {
      width: '400px',
      data: { board },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.boardsService.updateBoard(board.id, result as UpdateBoardDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe((updatedBoard) => {
            const index = this.allBoards.findIndex(b => b.id === updatedBoard.id);
            if (index !== -1) {
              this.allBoards[index] = updatedBoard;
              this.filteredBoards = this.searchTerm
                ? this.allBoards.filter(b => b.title.toLowerCase().includes(this.searchTerm))
                : [...this.allBoards];
              this.syncRecentBoards();
            }
          });
      }
    });
  }

  toggleRecentlyViewed(): void {
    this.recentlyViewedExpanded = !this.recentlyViewedExpanded;
  }
}
