import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  faClose,
  faMagnifyingGlass,
  faCalendarDay,
  faTag,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import { Board } from '@models/board.model';
import { Label } from '@models/card.model';
import { SearchService } from '@services/search.service';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
})
export class SearchPanelComponent {
  @Input() board!: Board;
  @Output() close = new EventEmitter<void>();

  faClose = faClose;
  faMagnifyingGlass = faMagnifyingGlass;
  faCalendarDay = faCalendarDay;
  faTag = faTag;
  faUser = faUser;

  searchTerm = '';
  memberSearchTerm = '';
  showMemberPopup = false;
  showAllDatesPopup = false;
  expandedDueDates = false;

  labelColors: { color: string; bgClass: string }[] = [
    { color: 'green', bgClass: 'bg-green-500' },
    { color: 'yellow', bgClass: 'bg-yellow-400' },
    { color: 'orange', bgClass: 'bg-orange-500' },
    { color: 'red', bgClass: 'bg-red-500' },
    { color: 'purple', bgClass: 'bg-purple-500' },
    { color: 'blue', bgClass: 'bg-blue-500' },
  ];

  private MAX_VISIBLE_DATES = 5;

  constructor(private searchService: SearchService) {}

  get activeFilter() {
    return this.searchService.getActiveFilter();
  }

  get allDueDates(): string[] {
    const cards = this.board?.cards || [];
    return this.searchService.getAllDueDates(cards);
  }

  get visibleDueDates(): string[] {
    if (this.expandedDueDates) {
      return this.allDueDates;
    }
    return this.allDueDates.slice(0, this.MAX_VISIBLE_DATES);
  }

  get hasMoreDueDates(): boolean {
    return this.allDueDates.length > this.MAX_VISIBLE_DATES && !this.expandedDueDates;
  }

  get resultCount(): number {
    if (!this.activeFilter) return -1;
    const cards = this.board?.cards || [];
    return this.searchService.filterCards(cards).length;
  }

  onClose(): void {
    this.close.emit();
  }

  onSearchSubmit(): void {
    const trimmed = this.searchTerm.trim();
    if (trimmed) {
      this.searchService.setFilter('term', trimmed);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchSubmit();
    }
  }

  onLabelClick(label: Label): void {
    this.searchService.setFilter('label', label);
  }

  onDueDateClick(date: string): void {
    this.searchService.setFilter('dueDate', date);
  }

  onClearFilter(): void {
    this.searchService.clearFilter();
    this.searchTerm = '';
    this.memberSearchTerm = '';
  }

  toggleMemberPopup(): void {
    this.showMemberPopup = !this.showMemberPopup;
  }

  onMemberSelect(memberName: string): void {
    this.searchService.setFilter('member', memberName);
    this.memberSearchTerm = '';
    this.showMemberPopup = false;
  }

  onMemberKeydown(event: KeyboardEvent): void {
    if (event.key === '@') {
      this.showMemberPopup = true;
    }
  }

  showAllDueDates(): void {
    this.expandedDueDates = true;
  }

  get activeFilterLabel(): string {
    if (!this.activeFilter) return '';
    switch (this.activeFilter.type) {
      case 'term':
        return `Search: "${this.activeFilter.value}"`;
      case 'label':
        return `Label: ${this.activeFilter.value.labelName || this.activeFilter.value.color}`;
      case 'member':
        return `Member: @${this.activeFilter.value}`;
      case 'dueDate':
        return `Due: ${this.activeFilter.value}`;
      default:
        return '';
    }
  }
}
