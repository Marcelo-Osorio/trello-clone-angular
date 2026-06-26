import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { Card, Label, LabelColor } from '@models/card.model';
import { List } from '@models/list.model';
import { EMPTY_SEARCH_CRITERIA, SearchCriteria } from '@models/search.model';
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
  private readonly isFilteringSubject = new BehaviorSubject<boolean>(false);

  readonly criteria$ = this.criteriaSubject.asObservable();
  readonly filteredVisibleLists$ = this.filteredVisibleListsSubject.asObservable();
  readonly isFiltering$ = this.isFilteringSubject.asObservable();

  constructor() {
    combineLatest([this.visibleListsSubject, this.criteriaSubject]).subscribe(
      ([visibleLists, criteria]) => {
        const isFiltering = this.hasActiveCriteria(criteria);

        this.isFilteringSubject.next(isFiltering);
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

  clearCriteria(): void {
    this.criteriaSubject.next({ ...EMPTY_SEARCH_CRITERIA, labels: [] });
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
