import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Card, CardDescription, Label, LabelColor } from '@models/card.model';

const FIXED_COLORS: LabelColor[] = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];

export interface LabelRenameEvent {
  color: LabelColor;
  labelName: string;
  sourceCardId: number;
  affectedCardIds: number[];
}

@Injectable({ providedIn: 'root' })
export class LabelsService {
  private labels$ = new BehaviorSubject<Label[]>([]);
  private labelCards$ = new BehaviorSubject<Record<string, number[]>>({});
  private renamedLabels$ = new Subject<LabelRenameEvent>();
  private currentBoardId: number | null = null;

  initFromBoard(boardId: number, cards: Card[]): void {
    this.currentBoardId = boardId;

    const labelsMap = new Map<LabelColor, Label>();
    const labelCards: Record<string, number[]> = {};

    for (const card of cards) {
      const desc = this.parseCardDescription(card.description);
      if (!desc.labels || desc.labels.length === 0) {
        continue;
      }

      for (const label of desc.labels) {
        if (!this.isFixedColor(label.color)) {
          continue;
        }

        if (!labelsMap.has(label.color)) {
          labelsMap.set(label.color, {
            labelName: this.normalizeLabelName(label.color, label.labelName),
            color: label.color,
          });
        }

        if (!labelCards[label.color]) {
          labelCards[label.color] = [];
        }

        if (!labelCards[label.color].includes(card.id)) {
          labelCards[label.color].push(card.id);
        }
      }

      if (labelsMap.size === FIXED_COLORS.length) {
        break;
      }
    }

    const labels = Array.from(labelsMap.values());

    this.labels$.next(labels);
    this.labelCards$.next(labelCards);
    this.persistState(boardId);
  }

  getLabels$(): Observable<Label[]> {
    return this.labels$.asObservable();
  }

  getLabelCards$(): Observable<Record<string, number[]>> {
    return this.labelCards$.asObservable();
  }

  getRenamedLabels$(): Observable<LabelRenameEvent> {
    return this.renamedLabels$.asObservable();
  }

  getLabelsSnapshot(): Label[] {
    return this.labels$.value.map((label) => ({ ...label }));
  }

  hasLabel(color: LabelColor): boolean {
    return this.labels$.value.some((label) => label.color === color);
  }

  addLabelToCard(
    boardId: number,
    color: LabelColor,
    labelName: string,
    cardId: number,
  ): void {
    const labels = [...this.labels$.value];
    const labelCards = { ...this.labelCards$.value };
    const normalizedName = this.normalizeLabelName(color, labelName);
    const labelIndex = labels.findIndex((label) => label.color === color);

    if (labelIndex === -1) {
      labels.push({ color, labelName: normalizedName });
    } else {
      labels[labelIndex] = {
        ...labels[labelIndex],
        labelName: labels[labelIndex].labelName || normalizedName,
      };
    }

    const cardIds = labelCards[color] ? [...labelCards[color]] : [];
    if (!cardIds.includes(cardId)) {
      cardIds.push(cardId);
    }
    labelCards[color] = cardIds;

    this.labels$.next(labels);
    this.labelCards$.next(labelCards);
    this.persistState(boardId);
  }

  renameLabel(
    boardId: number,
    color: LabelColor,
    newName: string,
    sourceCardId: number,
  ): void {
    const labels = [...this.labels$.value];
    const idx = labels.findIndex((label) => label.color === color);
    if (idx === -1) {
      return;
    }

    const normalizedName = this.normalizeLabelName(color, newName);
    if (labels[idx].labelName === normalizedName) {
      return;
    }

    labels[idx] = { ...labels[idx], labelName: normalizedName };
    this.labels$.next(labels);
    this.persistState(boardId);

    const affectedCardIds = [...(this.labelCards$.value[color] || [])];
    this.renamedLabels$.next({
      color,
      labelName: normalizedName,
      sourceCardId,
      affectedCardIds,
    });
  }

  removeLabelFromCard(boardId: number, color: LabelColor, cardId: number): void {
    const labelCards = { ...this.labelCards$.value };
    const cardIds = labelCards[color] ? [...labelCards[color]] : [];
    const idx = cardIds.indexOf(cardId);

    if (idx === -1) {
      return;
    }

    cardIds.splice(idx, 1);

    if (cardIds.length === 0) {
      delete labelCards[color];
      this.labels$.next(this.labels$.value.filter((label) => label.color !== color));
    } else {
      labelCards[color] = cardIds;
    }

    this.labelCards$.next(labelCards);
    this.persistState(boardId);
  }

  getAutoName(color: LabelColor): string {
    return color;
  }

  destroy(): void {
    this.labels$.next([]);
    this.labelCards$.next({});
    this.currentBoardId = null;
  }

  private normalizeLabelName(color: LabelColor, labelName?: string): string {
    return labelName?.trim() || this.getAutoName(color);
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

  private isFixedColor(color: string): color is LabelColor {
    return (FIXED_COLORS as string[]).includes(color);
  }

  private persistState(boardId: number): void {
    this.saveToSession(`labels_${boardId}`, this.labels$.value);
    this.saveToSession(`label_cards_${boardId}`, this.labelCards$.value);
  }

  private saveToSession(key: string, value: unknown): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}
