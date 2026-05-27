import { TestBed } from '@angular/core/testing';
import { ArchivedService } from './archived.service';
import { Card } from '@models/card.model';
import { List } from '@models/list.model';

describe('ArchivedService', () => {
  let service: ArchivedService;
  const boardId = 1;
  const storageKey = `archived_${boardId}`;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivedService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getArchived', () => {
    it('should return empty structure when no data exists', () => {
      const result = service.getArchived(boardId);
      expect(result.lists.length).toBe(0);
      expect(result.cards.length).toBe(0);
    });

    it('should return parsed data from localStorage', () => {
      const data = {
        lists: [{ id: 10, title: 'Done', position: 0, creationAt: '', updatedAt: '' }],
        cards: [{ id: 20, title: 'Card 1', position: 0, creationAt: '', updatedAt: '' }],
      };
      localStorage.setItem(storageKey, JSON.stringify(data));

      const result = service.getArchived(boardId);
      expect(result.lists.length).toBe(1);
      expect(result.cards.length).toBe(1);
      expect(result.lists[0].id).toBe(10);
      expect(result.cards[0].id).toBe(20);
    });
  });

  describe('archiveCard', () => {
    it('should append a card to archived cards', () => {
      const card: Card = { id: 5, title: 'Old Card', position: 0, creationAt: '', updatedAt: '' };
      service.archiveCard(boardId, card);

      const result = service.getArchived(boardId);
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].id).toBe(5);
      expect(result.lists.length).toBe(0);
    });

    it('should append multiple cards', () => {
      service.archiveCard(boardId, { id: 1, title: 'A', position: 0, creationAt: '', updatedAt: '' });
      service.archiveCard(boardId, { id: 2, title: 'B', position: 0, creationAt: '', updatedAt: '' });

      const result = service.getArchived(boardId);
      expect(result.cards.length).toBe(2);
    });
  });

  describe('archiveList', () => {
    it('should append a list and its cards', () => {
      const list: List = { id: 10, title: 'Old List', position: 0, creationAt: '', updatedAt: '' };
      const cards: Card[] = [
        { id: 20, title: 'Card A', position: 0, creationAt: '', updatedAt: '' },
      ];

      service.archiveList(boardId, list, cards);

      const result = service.getArchived(boardId);
      expect(result.lists.length).toBe(1);
      expect(result.lists[0].id).toBe(10);
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].id).toBe(20);
    });
  });

  describe('recoverCard', () => {
    it('should remove a card from archived cards', () => {
      service.archiveCard(boardId, { id: 1, title: 'A', position: 0, creationAt: '', updatedAt: '' });
      service.archiveCard(boardId, { id: 2, title: 'B', position: 0, creationAt: '', updatedAt: '' });

      service.recoverCard(boardId, 1);

      const result = service.getArchived(boardId);
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].id).toBe(2);
    });

    it('should do nothing if card not found', () => {
      service.archiveCard(boardId, { id: 1, title: 'A', position: 0, creationAt: '', updatedAt: '' });

      service.recoverCard(boardId, 99);

      const result = service.getArchived(boardId);
      expect(result.cards.length).toBe(1);
    });
  });

  describe('recoverList', () => {
    it('should remove a list and its cards', () => {
      service.archiveList(boardId, { id: 10, title: 'List', position: 0, creationAt: '', updatedAt: '' }, [
        { id: 20, title: 'Card', position: 0, creationAt: '', updatedAt: '' },
      ]);

      service.recoverList(boardId, 10);

      const result = service.getArchived(boardId);
      expect(result.lists.length).toBe(0);
      expect(result.cards.length).toBe(0);
    });
  });

  describe('cleanStale', () => {
    it('should remove archived items not present on server', () => {
      service.archiveList(boardId, { id: 10, title: 'Stale List', position: 0, creationAt: '', updatedAt: '' }, []);
      service.archiveCard(boardId, { id: 20, title: 'Stale Card', position: 0, creationAt: '', updatedAt: '' });
      service.archiveCard(boardId, { id: 21, title: 'Valid Card', position: 0, creationAt: '', updatedAt: '' });

      service.cleanStale(boardId, [], [21]);

      const result = service.getArchived(boardId);
      expect(result.lists.length).toBe(0);
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].id).toBe(21);
    });
  });
});
