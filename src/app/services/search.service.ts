import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { Card, Label, LabelColor } from '@models/card.model';
import { List } from '@models/list.model';
import {
  ActiveFilterChip,
  EMPTY_SEARCH_CRITERIA,
  SearchCriteria,
} from '@models/search.model';
import { parseDescription } from '@utils/parse-description';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly criteriaSubject = new BehaviorSubject<SearchCriteria>({
    ...EMPTY_SEARCH_CRITERIA,
    labels: [],
  });
  private readonly visibleListsSubject = new BehaviorSubject<List[]>([]);
  private readonly filteredVisibleListsSubject = new BehaviorSubject<List[]>([]);
  private readonly activeChipsSubject = new BehaviorSubject<ActiveFilterChip[]>([]);
  private readonly activeFilterCountSubject = new BehaviorSubject<number>(0);
  private readonly isFilteringSubject = new BehaviorSubject<boolean>(false);

  readonly criteria$ = this.criteriaSubject.asObservable();
  readonly filteredVisibleLists$ = this.filteredVisibleListsSubject.asObservable();
  readonly activeChips$ = this.activeChipsSubject.asObservable();
  readonly activeFilterCount$ = this.activeFilterCountSubject.asObservable();
  readonly isFiltering$ = this.isFilteringSubject.asObservable();

  constructor() {
    combineLatest([this.visibleListsSubject, this.criteriaSubject]).subscribe(
      ([visibleLists, criteria]) => {
        const isFiltering = this.hasActiveCriteria(criteria);
        const activeChips = this.buildActiveChips(criteria);

        this.isFilteringSubject.next(isFiltering);
        this.activeChipsSubject.next(activeChips);
        this.activeFilterCountSubject.next(activeChips.length);
        this.filteredVisibleListsSubject.next(
          isFiltering
            ? this.filterVisibleLists(visibleLists, criteria)
            : visibleLists,
        );
      },
    );
  }

  setVisibleLists(lists: List[]): void {
    this.visibleListsSubject.next(lists);
  }

  updateText(text: string): void {
    this.patchCriteria({ text: text.trim() });
  }

  clearText(): void {
    this.patchCriteria({ text: '' });
  }

  toggleLabel(label: Label): void {
    const labels = this.criteriaSubject.value.labels;
    const nextLabels = this.hasLabel(labels, label.color)
      ? labels.filter((currentLabel) => currentLabel.color !== label.color)
      : [...labels, this.cloneLabel(label)];

    this.patchCriteria({ labels: nextLabels });
  }

  removeLabel(color: LabelColor): void {
    this.patchCriteria({
      labels: this.criteriaSubject.value.labels.filter(
        (label) => label.color !== color,
      ),
    });
  }

  removeChip(chip: ActiveFilterChip): void {
    if (chip.type === 'search') {
      this.clearText();
      return;
    }

    if (chip.color) {
      this.removeLabel(chip.color);
    }
  }

  clearCriteria(): void {
    this.criteriaSubject.next({ ...EMPTY_SEARCH_CRITERIA, labels: [] });
  }

  clearAllFilters(): void {
    this.clearCriteria();
  }

  getCriteriaSnapshot(): SearchCriteria {
    const { text, labels } = this.criteriaSubject.value;

    return {
      text,
      labels: labels.map((label) => this.cloneLabel(label)),
    };
  }

  getIsFilteringSnapshot(): boolean {
    return this.isFilteringSubject.value;
  }

  private patchCriteria(criteriaPatch: Partial<SearchCriteria>): void {
    this.criteriaSubject.next({
      ...this.criteriaSubject.value,
      ...criteriaPatch,
    });
  }

  private hasActiveCriteria(criteria: SearchCriteria): boolean {
    return criteria.text.length > 0 || criteria.labels.length > 0;
  }

  private buildActiveChips(criteria: SearchCriteria): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = [];

    if (criteria.text) {
      chips.push({
        id: 'search-text',
        type: 'search',
        text: criteria.text,
      });
    }

    criteria.labels.forEach((label) => {
      chips.push({
        id: `label-${label.color}`,
        type: 'label',
        text: label.labelName?.trim() || label.color,
        color: label.color,
      });
    });

    return chips;
  }

  private filterVisibleLists(
    visibleLists: List[],
    criteria: SearchCriteria,
  ): List[] {
    return visibleLists
      .map((list) => {
        const matchedCards = (list.cards || []).filter((card) =>
          this.matchesCard(card, criteria),
        );

        return {
          ...list,
          cards: matchedCards,
        };
      })
      .filter((list) => (list.cards || []).length > 0);
  }

  private matchesCard(card: Card, criteria: SearchCriteria): boolean {
    const matchesText =
      !criteria.text || this.matchesTextCriteria(card, criteria.text);
    const matchesLabels =
      criteria.labels.length === 0 ||
      this.matchesLabelCriteria(card, criteria.labels);

    return matchesText && matchesLabels;
  }

  private matchesTextCriteria(card: Card, searchText: string): boolean {
    const lowerSearchText = searchText.toLowerCase();
    const description = parseDescription(card.description);

    return (
      card.title.toLowerCase().includes(lowerSearchText) ||
      description.textField.toLowerCase().includes(lowerSearchText) ||
      description.checklist.some(
        (group) =>
          group.groupName.toLowerCase().includes(lowerSearchText) ||
          group.items.some((item) =>
            item.item.toLowerCase().includes(lowerSearchText),
          ),
      )
    );
  }

  private matchesLabelCriteria(card: Card, selectedLabels: Label[]): boolean {
    const cardLabels = parseDescription(card.description).labels;

    return selectedLabels.some((selectedLabel) =>
      cardLabels.some((cardLabel) => cardLabel.color === selectedLabel.color),
    );
  }

  private hasLabel(labels: Label[], color: LabelColor): boolean {
    return labels.some((label) => label.color === color);
  }

  private cloneLabel(label: Label): Label {
    return {
      color: label.color,
      labelName: label.labelName,
    };
  }
}
