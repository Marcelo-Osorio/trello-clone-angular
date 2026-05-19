import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faSearch, faClock, faPen } from '@fortawesome/free-solid-svg-icons';
import { faTrello as faTrelloBrand } from '@fortawesome/free-brands-svg-icons';

import { Board, BoardBackgroundColor, CreateBoardDto, UpdateBoardDto } from '@models/board.model';
import { BoardsService } from '@services/boards.service';
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
  boards: Board[] = [];
  recentBoards: Board[] = [];
  allBoards: Board[] = [];
  filteredBoards: Board[] = [];
  searchTerm = '';
  loading = true;

  faTrello = faTrelloBrand;
  faPlus = faPlus;
  faSearch = faSearch;
  faClock = faClock;
  faPen = faPen;

  private destroy$ = new Subject<void>();

  constructor(
    private boardsService: BoardsService,
    private router: Router,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoards(): void {
    this.loading = true;
    this.boardsService.getMeBoards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boards) => {
          this.boards = boards.sort((a, b) => b.id - a.id);
          this.recentBoards = this.boards.slice(0, 4);
          this.allBoards = [...this.boards];
          this.filteredBoards = [...this.allBoards];
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

  highlightTitle(title: string): string {
    if (!this.searchTerm) return title;
    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
    return title.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>');
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
            this.boards = [newBoard, ...this.boards].sort((a, b) => b.id - a.id);
            this.recentBoards = this.boards.slice(0, 4);
            this.allBoards = [...this.boards];
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
            const index = this.boards.findIndex(b => b.id === updatedBoard.id);
            if (index !== -1) {
              this.boards[index] = updatedBoard;
              this.recentBoards = this.boards.slice(0, 4);
              this.allBoards = [...this.boards];
              this.filteredBoards = this.searchTerm
                ? this.allBoards.filter(b => b.title.toLowerCase().includes(this.searchTerm))
                : [...this.allBoards];
            }
          });
      }
    });
  }

  navigateToBoard(boardId: number): void {
    this.router.navigate(['/app/boards', boardId]);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
