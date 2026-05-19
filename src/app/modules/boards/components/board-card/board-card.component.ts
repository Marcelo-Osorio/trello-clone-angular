import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Board, BoardBackgroundColor } from '@models/board.model';
import { BOARD_COLOR_MAP } from '@boards/utils/board-colors';
import { faPencil } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-board-card',
  template: `
    <a
      [routerLink]="['/app/boards', board.id]"
      class="block relative rounded-lg overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      [ngClass]="colorClass"
    >
      <div class="px-4 py-3 h-24 flex flex-col justify-between">
        <span class="text-white font-semibold text-sm leading-tight line-clamp-2">
          {{ board.title }}
        </span>
        <span class="text-white/70 text-xs">
          {{ board.updatedAt | date:'shortDate' }}
        </span>
      </div>
      <button
        *ngIf="showUpdateIcon"
        (click)="onUpdateClick($event)"
        class="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        [attr.aria-label]="'Update ' + board.title"
        type="button"
      >
        <fa-icon [icon]="faPencil" class="text-xs"></fa-icon>
      </button>
    </a>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BoardCardComponent {
  @Input() board!: Board;
  @Input() showUpdateIcon = true;
  @Output() boardUpdate = new EventEmitter<Board>();

  faPencil = faPencil;

  get colorClass(): string {
    return BOARD_COLOR_MAP[this.board.backgroundColor] || 'bg-gray-700';
  }

  onUpdateClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.boardUpdate.emit(this.board);
  }
}