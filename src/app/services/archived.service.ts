import { Injectable } from '@angular/core';

import { ArchivedData } from '@models/card.model';
import { Card } from '@models/card.model';
import { List } from '@models/list.model';

@Injectable({
  providedIn: 'root',
})
export class ArchivedService {
  private getKey(boardId: number): string {
    return `archived_${boardId}`;
  }

  private getData(boardId: number): ArchivedData {
    const key = this.getKey(boardId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { lists: [], cards: [] };
    }
    try {
      return JSON.parse(raw) as ArchivedData;
    } catch {
      return { lists: [], cards: [] };
    }
  }

  private saveData(boardId: number, data: ArchivedData): void {
    const key = this.getKey(boardId);
    localStorage.setItem(key, JSON.stringify(data));
  }

  getArchived(boardId: number): ArchivedData {
    return this.getData(boardId);
  }

  archiveCard(boardId: number, card: Card): void {
    const data = this.getData(boardId);
    data.cards.push(card);
    this.saveData(boardId, data);
  }

  archiveList(boardId: number, list: List, cards: Card[]): void {
    const data = this.getData(boardId);
    data.lists.push(list);
    cards.forEach((card) => {
      if (!card.list) {
        card.list = {
          id: list.id,
          title: list.title,
          position: list.position,
          creationAt: list.creationAt,
          updatedAt: list.updatedAt,
        };
      }
      data.cards.push(card);
    });
    this.saveData(boardId, data);
  }

  recoverCard(boardId: number, cardId: number): void {
    const data = this.getData(boardId);
    data.cards = data.cards.filter((card) => card.id !== cardId);
    this.saveData(boardId, data);
  }

  recoverList(boardId: number, listId: number): void {
    const data = this.getData(boardId);
    data.lists = data.lists.filter((list) => list.id !== listId);
    data.cards = data.cards.filter((card) => card.list?.id !== listId);
    this.saveData(boardId, data);
  }

  cleanStale(boardId: number, serverListIds: number[], serverCardIds: number[]): void {
    const data = this.getData(boardId);
    const listIdSet = new Set(serverListIds);
    const cardIdSet = new Set(serverCardIds);

    data.lists = data.lists.filter((list) => listIdSet.has(list.id));
    data.cards = data.cards.filter((card) => cardIdSet.has(card.id));

    this.saveData(boardId, data);
  }
}
