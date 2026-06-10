import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Card, CardDescription, Label, LabelColor } from '@models/card.model';

const FIXED_COLORS: LabelColor[] = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];

@Injectable({ providedIn: 'root' })
export class LabelsService {
  private labels$ = new BehaviorSubject<Label[]>([]);
  private labelCards$ = new BehaviorSubject<Record<string, number[]>>({});
  private currentBoardId: number | null = null;

  initFromBoard(boardId: number, cards: Card[]): void {
    this.currentBoardId = boardId;

    const labelsMap = new Map<LabelColor, Label>();
    const labelCards: Record<string, number[]> = {};

    for (const card of cards) {
      const desc = this.parseCardDescription(card.description);
      if (!desc.labels || desc.labels.length === 0) continue;

      for (const label of desc.labels) {
        if (!this.isFixedColor(label.color)) continue;

        // Store label (first occurrence wins for name)
        if (!labelsMap.has(label.color)) {
          labelsMap.set(label.color, { labelName: label.labelName || '', color: label.color });
        }

        // Track card IDs per color
        if (!labelCards[label.color]) {
          labelCards[label.color] = [];
        }
        if (!labelCards[label.color].includes(card.id)) {
          labelCards[label.color].push(card.id);
        }
      }

      // Early stop: all 6 colors found
      if (labelsMap.size === FIXED_COLORS.length) break;
    }

    const labels = Array.from(labelsMap.values());

    // Only persist named labels to board storage
    const namedLabels = labels.filter(l => l.labelName !== '');
    this.saveToSession(`labels_${boardId}`, namedLabels);
    this.saveToSession(`label_cards_${boardId}`, labelCards);

    this.labels$.next(labels);
    this.labelCards$.next(labelCards);
  }

  getLabels$(): Observable<Label[]> {
    return this.labels$.asObservable();
  }

  getLabelCards$(): Observable<Record<string, number[]>> {
    return this.labelCards$.asObservable();
  }

  toggleLabel(boardId: number, color: LabelColor, cardId: number): Label {
    const labelCards = { ...this.labelCards$.value };
    const labels = [...this.labels$.value];

    const cardIds = labelCards[color] ? [...labelCards[color]] : [];
    const existingIndex = cardIds.indexOf(cardId);

    if (existingIndex !== -1) {
      // Deselect: remove cardId
      cardIds.splice(existingIndex, 1);
    } else {
      // Select: add cardId
      cardIds.push(cardId);
    }

    labelCards[color] = cardIds;

    // Find or create label
    let label = labels.find(l => l.color === color);
    if (!label) {
      label = { labelName: this.getAutoName(color), color };
      labels.push(label);
    } else if (!label.labelName) {
      // Auto-assign name if empty
      label = { ...label, labelName: this.getAutoName(color) };
      const idx = labels.findIndex(l => l.color === color);
      labels[idx] = label;
    }

    this.labelCards$.next(labelCards);
    this.labels$.next(labels);

    // Persist label_cards
    this.saveToSession(`label_cards_${boardId}`, labelCards);

    // Persist only named labels to board storage
    const namedLabels = labels.filter(l => l.labelName !== '');
    this.saveToSession(`labels_${boardId}`, namedLabels);

    return label;
  }

  renameLabel(boardId: number, color: LabelColor, newName: string): void {
    const labels = [...this.labels$.value];
    const idx = labels.findIndex(l => l.color === color);
    if (idx === -1) return;

    labels[idx] = { ...labels[idx], labelName: newName };
    this.labels$.next(labels);

    // Persist named labels to board storage
    const namedLabels = labels.filter(l => l.labelName !== '');
    this.saveToSession(`labels_${boardId}`, namedLabels);
  }

  removeLabelFromCard(boardId: number, color: LabelColor, cardId: number): void {
    const labelCards = { ...this.labelCards$.value };
    const cardIds = labelCards[color] ? [...labelCards[color]] : [];
    const idx = cardIds.indexOf(cardId);

    if (idx === -1) return;

    cardIds.splice(idx, 1);

    if (cardIds.length === 0) {
      // Last card removed — delete label from board storage entirely
      delete labelCards[color];

      const labels = this.labels$.value.filter(l => l.color !== color);
      this.labels$.next(labels);

      // Persist updated labels (named only)
      const namedLabels = labels.filter(l => l.labelName !== '');
      this.saveToSession(`labels_${boardId}`, namedLabels);
    } else {
      labelCards[color] = cardIds;
    }

    this.labelCards$.next(labelCards);
    this.saveToSession(`label_cards_${boardId}`, labelCards);
  }

  getAutoName(color: LabelColor): string {
    return color;
  }

  destroy(): void {
    this.labels$.next([]);
    this.labelCards$.next({});
    this.currentBoardId = null;
  }

  private parseCardDescription(raw: string | undefined): CardDescription {
    if (!raw) {
      return { textField: '', checklist: [], labels: [], dueDate: '' };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { textField: '', checklist: [], labels: [], dueDate: '' };
    }
  }

  private isFixedColor(color: string): boolean {
    return (FIXED_COLORS as string[]).includes(color);
  }

  private saveToSession(key: string, value: unknown): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}
