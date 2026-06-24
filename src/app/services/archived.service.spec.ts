import { TestBed } from '@angular/core/testing';

import { Card } from '@models/card.model';
import { List, ListID } from '@models/list.model';

import { ArchivedService } from './archived.service';

describe('ArchivedService', () => {
  let service: ArchivedService;
  const boardId = 1;
  const listIdsKey = `archived_list_ids_${boardId}`;
  const listsKey = `archived_lists_${boardId}`;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivedService);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  function createList(cards: Card[] = []): List {
    return {
      id: 10,
      title: 'Archived List',
      position: 0,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
      cards,
    };
  }

  function createCard(id: number, title: string): Card {
    return {
      id,
      title,
      position: 0,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty archived list ids and lists when storage is empty', () => {
    expect(service.getArchivedListIds(boardId)).toEqual([]);
    expect(service.getArchivedLists(boardId)).toEqual([]);
    expect(service.getArchived(boardId)).toEqual({ lists: [], cards: [] });
  });

  it('should archive a list in localStorage ids and sessionStorage payload', () => {
    const list = createList([createCard(20, 'Card A')]);

    const result = service.archiveList(boardId, list);

    const storedIds = JSON.parse(localStorage.getItem(listIdsKey) || '[]') as ListID[];
    const storedLists = JSON.parse(sessionStorage.getItem(listsKey) || '[]') as List[];

    expect(result).toBeTrue();
    expect(storedIds).toEqual([{ listID: 10 }]);
    expect(storedLists.length).toBe(1);
    expect(storedLists[0].cards?.length).toBe(1);
    expect(storedLists[0].cards?.[0].title).toBe('Card A');
  });

  it('should not archive the same list twice', () => {
    const list = createList([createCard(20, 'Card A')]);

    expect(service.archiveList(boardId, list)).toBeTrue();
    expect(service.archiveList(boardId, list)).toBeFalse();
    expect(service.getArchivedListIds(boardId)).toEqual([{ listID: 10 }]);
    expect(service.getArchivedLists(boardId).length).toBe(1);
  });

  it('should rollback the localStorage id when saving the list payload fails', () => {
    const list = createList([createCard(20, 'Card A')]);
    const originalSetItem = Storage.prototype.setItem;

    spyOn(Storage.prototype, 'setItem').and.callFake(function (
      this: Storage,
      key: string,
      value: string,
    ): void {
      if (key === listsKey) {
        throw new Error('quota');
      }

      originalSetItem.call(this, key, value);
    });

    const result = service.archiveList(boardId, list);

    expect(result).toBeFalse();
    expect(service.getArchivedListIds(boardId)).toEqual([]);
    expect(service.getArchivedLists(boardId)).toEqual([]);
  });

  it('should recover a list from ids and stored payloads', () => {
    const list = createList([createCard(20, 'Card A')]);
    service.archiveList(boardId, list);

    service.recoverList(boardId, list.id);

    expect(service.getArchivedListIds(boardId)).toEqual([]);
    expect(service.getArchivedLists(boardId)).toEqual([]);
  });

  it('should clean stale archived lists using server list ids', () => {
    service.archiveList(boardId, createList());
    service.archiveList(boardId, {
      id: 11,
      title: 'Valid List',
      position: 1,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
      cards: [],
    });

    service.cleanStale(boardId, [11], []);

    expect(service.getArchivedListIds(boardId)).toEqual([{ listID: 11 }]);
    expect(service.getArchivedLists(boardId).map((list) => list.id)).toEqual([11]);
  });

  it('should keep archived card compatibility for existing callers', () => {
    service.archiveCard(boardId, createCard(30, 'Card Only'));

    expect(service.getArchived(boardId).cards.map((card) => card.id)).toEqual([30]);

    service.recoverCard(boardId, 30);

    expect(service.getArchived(boardId).cards).toEqual([]);
  });
});
