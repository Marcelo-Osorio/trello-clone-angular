import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import {
  faHome,
  faUserPlus,
  faArchive,
  faLayerGroup,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { Board } from '@models/board.model';
import { ActiveFilterChip } from '@models/search.model';
import { SearchService } from '@services/search.service';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';

@Component({
  selector: 'app-board-navbar',
  templateUrl: './board-navbar.component.html',
  styleUrls: ['./board-navbar.component.scss'],
})
export class BoardNavbarComponent implements OnDestroy {
  @Input() board!: Board;
  @Input() searchPanelOpen = false;
  @Output() boardNameChange = new EventEmitter<string>();
  @Output() searchToggle = new EventEmitter<void>();
  @Output() archived = new EventEmitter<void>();

  faHome = faHome;
  faUserPlus = faUserPlus;
  faArchive = faArchive;
  faLayerGroup = faLayerGroup;
  faMagnifyingGlass = faMagnifyingGlass;

  isEditing = false;
  editName = '';
  filtersOverlayOpen = false;
  activeChips: ActiveFilterChip[] = [];
  activeFilterCount = 0;

  private readonly subscription = new Subscription();

  constructor(
    private dialog: Dialog,
    private searchService: SearchService,
  ) {
    this.subscription.add(
      this.searchService.activeChips$.subscribe((chips) => {
        this.activeChips = chips.map((chip) => ({ ...chip }));
        if (chips.length === 0) {
          this.filtersOverlayOpen = false;
        }
      }),
    );

    this.subscription.add(
      this.searchService.activeFilterCount$.subscribe((count) => {
        this.activeFilterCount = count;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get hasActiveFilters(): boolean {
    return this.activeFilterCount > 0;
  }

  startEditing(): void {
    this.isEditing = true;
    this.editName = this.board.title;
  }

  saveEdit(): void {
    const trimmed = this.editName.trim();
    if (trimmed && trimmed !== this.board.title) {
      this.boardNameChange.emit(trimmed);
    }
    this.isEditing = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  onInvite(): void {
    this.dialog.open<void>(InviteDialogComponent, {
      data: { boardId: this.board.id },
    });
  }

  onArchived(): void {
    this.archived.emit();
  }

  onSearchToggle(): void {
    this.searchToggle.emit();
  }

  toggleFiltersOverlay(): void {
    if (!this.hasActiveFilters) {
      return;
    }

    this.filtersOverlayOpen = !this.filtersOverlayOpen;
  }

  closeFiltersOverlay(): void {
    this.filtersOverlayOpen = false;
  }

  removeChip(chip: ActiveFilterChip): void {
    this.searchService.removeChip(chip);
  }

  clearAllFilters(): void {
    this.searchService.clearAllFilters();
  }
}
