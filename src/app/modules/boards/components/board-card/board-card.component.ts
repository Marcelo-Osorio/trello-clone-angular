import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Board } from '@models/board.model';
import { BOARD_COLOR_MAP } from '@boards/utils/board-colors';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-board-card',
  template: `
    <a
      [routerLink]="['/app/boards', board.id]"
      class="block relative rounded-lg overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      [ngClass]="colorClass"
    >
      <div class="px-4 py-3 h-24 flex flex-col justify-between">
        <span
          class="text-white font-semibold text-sm leading-tight line-clamp-2"
          [innerHTML]="highlightedTitle"
        ></span>
        <span class="text-white/70 text-xs">
          {{ board.updatedAt | date:'shortDate' }}
        </span>
      </div>
      <button
        *ngIf="showUpdateIcon"
        (click)="onUpdateClick($event)"
        class="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:opacity-100"
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
  @Input() searchTerm = '';
  @Output() boardUpdate = new EventEmitter<Board>();

  faPencil = faPencil;

  constructor(private sanitizer: DomSanitizer) {}

  get colorClass(): string {
    return BOARD_COLOR_MAP[this.board.backgroundColor] || 'bg-gray-700';
  }

  get highlightedTitle(): SafeHtml {
    if (!this.searchTerm) {
      return this.sanitizer.bypassSecurityTrustHtml(this.board.title);
    }
    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
    const highlighted = this.board.title.replace(
      regex,
      '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>'
    );
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  onUpdateClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.boardUpdate.emit(this.board);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}