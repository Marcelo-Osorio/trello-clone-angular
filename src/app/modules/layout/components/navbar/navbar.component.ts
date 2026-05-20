import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import {
  faBell,
  faInfoCircle,
  faClose,
  faAngleDown,
  faUser,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { faTrello as faTrelloBrand } from '@fortawesome/free-brands-svg-icons';

import { AuthService } from '@services/auth.service';
import { TokenService } from '@services/token.service';
import { BoardsService } from '@services/boards.service';
import { RecentBoardsService, RecentBoardEntry } from '@services/recent-boards.service';
import { CreateBoardDialogComponent } from '@boards/components/create-board-dialog/create-board-dialog.component';
import { CreateBoardDto } from '@models/board.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  faBell = faBell;
  faInfoCircle = faInfoCircle;
  faClose = faClose;
  faAngleDown = faAngleDown;
  faUser = faUser;
  faPlus = faPlus;
  faTrello = faTrelloBrand;

  isOpenOverlayAvatar = false;
  isOpenOverlayBoards = false;

  user$ = this.authService.user$;
  recentBoards: RecentBoardEntry[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private boardsService: BoardsService,
    private recentBoardsService: RecentBoardsService,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.recentBoardsService.stackChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stack => {
        this.recentBoards = stack.slice(0, 3);
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const match = url.match(/\/app\/boards\/(\d+)/);
      if (match) {
        const boardId = parseInt(match[1], 10);
        this.boardsService.getBoardById(boardId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((board) => {
            this.recentBoardsService.pushBoard(board);
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCreateBoardDialog(): void {
    this.isOpenOverlayBoards = false;
    const dialogRef = this.dialog.open(CreateBoardDialogComponent, {
      width: '400px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.boardsService.createBoard(result as CreateBoardDto).subscribe();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getColorClass(color: string): string {
    const map: Record<string, string> = {
      sky: 'bg-sky-700',
      green: 'bg-green-700',
      violet: 'bg-violet-700',
      yellow: 'bg-amber-600',
    };
    return map[color] || 'bg-gray-700';
  }
}