import { Injectable } from '@angular/core';

import { Card, CardDescription, Label } from '@models/card.model';
import { parseDescription } from '@utils/parse-description';

export type FilterType = 'term' | 'label' | 'member' | 'dueDate';

export interface ActiveFilter {
  type: FilterType;
  value: any;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private activeFilter: ActiveFilter | null = null;

  setFilter(type: FilterType, value: any): void {
    this.activeFilter = { type, value };
  }

  clearFilter(): void {
    this.activeFilter = null;
  }

  getActiveFilter(): ActiveFilter | null {
    return this.activeFilter;
  }

  filterCards(cards: Card[]): Card[] {
    if (!this.activeFilter) {
      return cards;
    }

    const { type, value } = this.activeFilter;

    switch (type) {
      case 'term':
        return this.filterByTerm(cards, value as string);
      case 'label':
        return this.filterByLabel(cards, value as Label);
      case 'member':
        return this.filterByMember(cards, value as string);
      case 'dueDate':
        return this.filterByDueDate(cards, value as string);
      default:
        return cards;
    }
  }

  getAllDueDates(cards: Card[]): string[] {
    const dateSet = new Set<string>();
    for (const card of cards) {
      const desc = parseDescription(card.description);
      for (const date of desc.dueDates) {
        dateSet.add(date);
      }
    }
    return Array.from(dateSet).sort();
  }

  private filterByTerm(cards: Card[], term: string): Card[] {
    const lower = term.toLowerCase();
    return cards.filter((card) => {
      if (card.title.toLowerCase().includes(lower)) {
        return true;
      }
      const desc = parseDescription(card.description);
      if (desc.textField.toLowerCase().includes(lower)) {
        return true;
      }
      // Search in checklist items
      for (const group of desc.checklist) {
        for (const item of group.items) {
          if (item.item.toLowerCase().includes(lower)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  private filterByLabel(cards: Card[], label: Label): Card[] {
    return cards.filter((card) => {
      const desc = parseDescription(card.description);
      return desc.labels.some((l) => {
        if (label.color && l.color === label.color) return true;
        if (label.labelName && l.labelName.toLowerCase() === label.labelName.toLowerCase()) return true;
        return false;
      });
    });
  }

  private filterByMember(cards: Card[], memberName: string): Card[] {
    const lower = memberName.toLowerCase();
    return cards.filter((card) => {
      const desc = parseDescription(card.description);
      return desc.textField.toLowerCase().includes(`@${lower}`);
    });
  }

  private filterByDueDate(cards: Card[], date: string): Card[] {
    return cards.filter((card) => {
      const desc = parseDescription(card.description);
      return desc.dueDates.includes(date);
    });
  }
}
