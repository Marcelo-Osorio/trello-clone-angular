import { Injectable } from '@angular/core';

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

  private saveArchivedLists(boardId: number, lists: List[]): boolean {
    return this.setStorageItem(
      sessionStorage,
      this.getListsKey(boardId),
      lists,
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

    if (!this.saveArchivedLists(boardId, nextLists)) {
      this.setStorageItem(localStorage, this.getListIdsKey(boardId), previousIds);
      return false;
    }

    return true;
  }

  recoverList(boardId: number, listId: number): void {
    const nextIds = this.getArchivedListIds(boardId).filter(
      (item) => item.listID !== listId,
    );
    const nextLists = this.getArchivedLists(boardId).filter(
      (list) => list.id !== listId,
    );

    this.setStorageItem(localStorage, this.getListIdsKey(boardId), nextIds);
    this.saveArchivedLists(boardId, nextLists);
  }

  syncArchivedLists(boardId: number, lists: List[]): void {
    const archivedIds = new Set(
      this.getArchivedListIds(boardId).map((item) => item.listID),
    );
    const nextLists = lists
      .filter((list) => archivedIds.has(list.id))
      .map((list) => this.cloneList(list));

    this.saveArchivedLists(boardId, nextLists);
  }

  updateArchivedList(boardId: number, list: List): void {
    if (!this.isListArchived(boardId, list.id)) {
      return;
    }

    const archivedLists = this.getArchivedLists(boardId);
    const nextLists = archivedLists.map((archivedList) =>
      archivedList.id === list.id ? this.cloneList(list) : archivedList,
    );

    this.saveArchivedLists(boardId, nextLists);
  }

  cleanStale(boardId: number, serverListIds: number[]): void {
    const listIdSet = new Set(serverListIds);
    const lists = this.getArchivedLists(boardId).filter((list) => listIdSet.has(list.id));
    const listIds = this.getArchivedListIds(boardId).filter((item) =>
      listIdSet.has(item.listID),
    );

    this.setStorageItem(localStorage, this.getListIdsKey(boardId), listIds);
    this.saveArchivedLists(boardId, lists);
  }
}
