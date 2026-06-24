import { Injectable } from '@angular/core';

import { ArchivedData } from '@models/card.model';
import { Card } from '@models/card.model';
import { List, ListID } from '@models/list.model';

@Injectable({
  providedIn: 'root',
})
export class ArchivedService {
  private getListIdsKey(boardId: number): string {
    return `archived_list_ids_${boardId}`;
  }

  private getListsKey(boardId: number): string {
    return `archived_lists_${boardId}`;
  }

  private getCardsKey(boardId: number): string {
    return `archived_cards_${boardId}`;
  }

  private parseStorageItem<T>(raw: string | null, fallback: T): T {
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private setStorageItem(
    storage: Storage,
    key: string,
    value: unknown,
  ): boolean {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  private cloneList(list: List): List {
    return JSON.parse(JSON.stringify(list)) as List;
  }

  private getArchivedCards(boardId: number): Card[] {
    return this.parseStorageItem<Card[]>(
      sessionStorage.getItem(this.getCardsKey(boardId)),
      [],
    );
  }

  private saveArchivedCards(boardId: number, cards: Card[]): boolean {
    return this.setStorageItem(
      sessionStorage,
      this.getCardsKey(boardId),
      cards,
    );
  }

  getArchivedListIds(boardId: number): ListID[] {
    return this.parseStorageItem<ListID[]>(
      localStorage.getItem(this.getListIdsKey(boardId)),
      [],
    );
  }

  getArchivedLists(boardId: number): List[] {
    return this.parseStorageItem<List[]>(
      sessionStorage.getItem(this.getListsKey(boardId)),
      [],
    );
  }

  isListArchived(boardId: number, listId: number): boolean {
    return this.getArchivedListIds(boardId).some((item) => item.listID === listId);
  }

  getArchived(boardId: number): ArchivedData {
    return {
      lists: this.getArchivedLists(boardId),
      cards: this.getArchivedCards(boardId),
    };
  }

  archiveCard(boardId: number, card: Card): void {
    const cards = this.getArchivedCards(boardId);
    cards.push(card);
    this.saveArchivedCards(boardId, cards);
  }

  archiveList(boardId: number, list: List): boolean {
    if (this.isListArchived(boardId, list.id)) {
      return false;
    }

    const previousIds = this.getArchivedListIds(boardId);
    const previousLists = this.getArchivedLists(boardId);
    const nextIds = [...previousIds, { listID: list.id }];
    const nextLists = [...previousLists, this.cloneList(list)];

    if (!this.setStorageItem(localStorage, this.getListIdsKey(boardId), nextIds)) {
      return false;
    }

    if (!this.setStorageItem(sessionStorage, this.getListsKey(boardId), nextLists)) {
      this.setStorageItem(localStorage, this.getListIdsKey(boardId), previousIds);
      return false;
    }

    return true;
  }

  recoverCard(boardId: number, cardId: number): void {
    const cards = this.getArchivedCards(boardId).filter((card) => card.id !== cardId);
    this.saveArchivedCards(boardId, cards);
  }

  recoverList(boardId: number, listId: number): void {
    const nextIds = this.getArchivedListIds(boardId).filter(
      (item) => item.listID !== listId,
    );
    const nextLists = this.getArchivedLists(boardId).filter(
      (list) => list.id !== listId,
    );

    this.setStorageItem(localStorage, this.getListIdsKey(boardId), nextIds);
    this.setStorageItem(sessionStorage, this.getListsKey(boardId), nextLists);
  }

  cleanStale(boardId: number, serverListIds: number[], serverCardIds: number[]): void {
    const listIdSet = new Set(serverListIds);
    const cardIdSet = new Set(serverCardIds);
    const lists = this.getArchivedLists(boardId).filter((list) => listIdSet.has(list.id));
    const listIds = this.getArchivedListIds(boardId).filter((item) =>
      listIdSet.has(item.listID),
    );
    const cards = this.getArchivedCards(boardId).filter((card) =>
      cardIdSet.has(card.id),
    );

    this.setStorageItem(localStorage, this.getListIdsKey(boardId), listIds);
    this.setStorageItem(sessionStorage, this.getListsKey(boardId), lists);
    this.saveArchivedCards(boardId, cards);
  }
}
