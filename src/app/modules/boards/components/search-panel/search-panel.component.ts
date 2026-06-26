import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { faClose, faMagnifyingGlass, faTag } from '@fortawesome/free-solid-svg-icons';

import { Label, LabelColor } from '@models/card.model';
import { EMPTY_SEARCH_CRITERIA, SearchCriteria } from '@models/search.model';
import { LabelsService } from '@services/labels.service';
import { SearchService } from '@services/search.service';

const LABEL_ORDER: LabelColor[] = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];

const LABEL_BG_MAP: Record<LabelColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
};

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
})
export class SearchPanelComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  faClose = faClose;
  faMagnifyingGlass = faMagnifyingGlass;
  faTag = faTag;

  searchDraft = '';
  labels: Label[] = [];
  criteria: SearchCriteria = { ...EMPTY_SEARCH_CRITERIA, labels: [] };
  readonly labelBgMap = LABEL_BG_MAP;
  readonly maxSearchChipLength = 28;

  private readonly searchTermChanges = new Subject<string>();
  private readonly subscription = new Subscription();

  constructor(
    private searchService: SearchService,
    private labelsService: LabelsService,
  ) {
    this.subscription.add(
      this.labelsService.getLabels$().subscribe((labels) => {
        this.labels = [...labels].sort(
          (left, right) =>
            LABEL_ORDER.indexOf(left.color) - LABEL_ORDER.indexOf(right.color),
        );
      }),
    );

    this.subscription.add(
      this.searchService.criteria$.subscribe((criteria) => {
        this.criteria = {
          text: criteria.text,
          labels: criteria.labels.map((label) => ({ ...label })),
        };
        this.searchDraft = criteria.text;
      }),
    );

    this.subscription.add(
      this.searchTermChanges
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((searchTerm) => {
          this.searchService.updateText(searchTerm);
        }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      this.focusSearchInput();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get hasFilters(): boolean {
    return this.criteria.text.length > 0 || this.criteria.labels.length > 0;
  }

  get truncatedSearchChip(): string {
    if (this.criteria.text.length <= this.maxSearchChipLength) {
      return this.criteria.text;
    }

    return `${this.criteria.text.slice(0, this.maxSearchChipLength - 3).trimEnd()}...`;
  }

  onClose(): void {
    this.close.emit();
  }

  onSearchDraftChange(searchTerm: string): void {
    this.searchDraft = searchTerm;
    this.searchTermChanges.next(searchTerm);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    this.searchService.updateText(this.searchDraft);
  }

  onLabelToggle(label: Label): void {
    this.searchService.toggleLabel(label);
  }

  removeTextFilter(): void {
    this.searchService.clearText();
  }

  removeLabelFilter(color: LabelColor): void {
    this.searchService.removeLabel(color);
  }

  isLabelSelected(label: Label): boolean {
    return this.criteria.labels.some(
      (selectedLabel) => selectedLabel.color === label.color,
    );
  }

  getLabelName(label: Label): string {
    return label.labelName?.trim() || label.color;
  }

  trackByLabel(_: number, label: Label): LabelColor {
    return label.color;
  }

  private focusSearchInput(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
      this.searchInput?.nativeElement.select();
    }, 0);
  }
}
