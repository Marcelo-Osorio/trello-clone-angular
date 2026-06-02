import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { Card, CardDescription } from '@models/card.model';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    title: 'Test Card',
    description: '',
    position: 0,
    creationAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

function cardWithDesc(desc: Partial<CardDescription>, overrides: Partial<Card> = {}): Card {
  return makeCard({
    description: JSON.stringify({
      textField: '',
      checklist: [],
      labels: [],
      dueDates: [],
      ...desc,
    }),
    ...overrides,
  });
}

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getActiveFilter', () => {
    it('should return null when no filter is set', () => {
      expect(service.getActiveFilter()).toBeNull();
    });

    it('should return the active filter after setFilter', () => {
      service.setFilter('term', 'hello');
      const filter = service.getActiveFilter();
      expect(filter).toEqual({ type: 'term', value: 'hello' });
    });
  });

  describe('clearFilter', () => {
    it('should clear the active filter', () => {
      service.setFilter('term', 'hello');
      service.clearFilter();
      expect(service.getActiveFilter()).toBeNull();
    });
  });

  describe('filterCards — term', () => {
    it('should return all cards when no filter is active', () => {
      const cards = [makeCard({ id: 1 }), makeCard({ id: 2 })];
      expect(service.filterCards(cards)).toEqual(cards);
    });

    it('should match cards by title', () => {
      service.setFilter('term', 'angular');
      const cards = [
        makeCard({ id: 1, title: 'Learn Angular' }),
        makeCard({ id: 2, title: 'Learn React' }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should match cards by description textField', () => {
      service.setFilter('term', 'important');
      const cards = [
        cardWithDesc({ textField: 'This is important' }, { id: 1 }),
        cardWithDesc({ textField: 'Not relevant' }, { id: 2 }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should match cards by checklist item text', () => {
      service.setFilter('term', 'deploy');
      const cards = [
        cardWithDesc({
          checklist: [{ groupName: 'Tasks', items: [{ item: 'Deploy to prod', checked: false }] }],
        }, { id: 1 }),
        makeCard({ id: 2, title: 'No checklist' }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should be case-insensitive', () => {
      service.setFilter('term', 'ANGULAR');
      const cards = [makeCard({ id: 1, title: 'Learn angular' })];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
    });
  });

  describe('filterCards — label', () => {
    it('should match cards by label color', () => {
      service.setFilter('label', { color: 'green', labelName: '' });
      const cards = [
        cardWithDesc({ labels: [{ color: 'green', labelName: 'Bug' }] }, { id: 1 }),
        cardWithDesc({ labels: [{ color: 'red', labelName: 'Urgent' }] }, { id: 2 }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should match cards by label name', () => {
      service.setFilter('label', { color: '', labelName: 'Bug' });
      const cards = [
        cardWithDesc({ labels: [{ color: 'green', labelName: 'Bug' }] }, { id: 1 }),
        cardWithDesc({ labels: [{ color: 'red', labelName: 'Feature' }] }, { id: 2 }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('filterCards — member', () => {
    it('should match cards by @mention in textField', () => {
      service.setFilter('member', 'John');
      const cards = [
        cardWithDesc({ textField: 'Assigned to @John for review' }, { id: 1 }),
        cardWithDesc({ textField: 'No mention here' }, { id: 2 }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('filterCards — dueDate', () => {
    it('should match cards by exact due date', () => {
      service.setFilter('dueDate', '2026-06-15');
      const cards = [
        cardWithDesc({ dueDates: ['2026-06-15'] }, { id: 1 }),
        cardWithDesc({ dueDates: ['2026-07-01'] }, { id: 2 }),
        makeCard({ id: 3 }),
      ];
      const result = service.filterCards(cards);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('non-incremental filter', () => {
    it('should deactivate previous filter when new one is set', () => {
      service.setFilter('term', 'hello');
      service.setFilter('label', { color: 'green', labelName: '' });
      const filter = service.getActiveFilter();
      expect(filter!.type).toBe('label');
    });

    it('should restore all cards after clearing filter', () => {
      const cards = [makeCard({ id: 1 }), makeCard({ id: 2 })];
      service.setFilter('term', 'nonexistent');
      expect(service.filterCards(cards).length).toBe(0);
      service.clearFilter();
      expect(service.filterCards(cards).length).toBe(2);
    });
  });

  describe('getAllDueDates', () => {
    it('should return all unique due dates sorted', () => {
      const cards = [
        cardWithDesc({ dueDates: ['2026-06-15', '2026-07-01'] }),
        cardWithDesc({ dueDates: ['2026-06-15', '2026-08-01'] }),
        makeCard(), // no description
      ];
      const dates = service.getAllDueDates(cards);
      expect(dates).toEqual(['2026-06-15', '2026-07-01', '2026-08-01']);
    });

    it('should return empty array when no cards have due dates', () => {
      const cards = [makeCard(), makeCard()];
      const dates = service.getAllDueDates(cards);
      expect(dates).toEqual([]);
    });
  });
});
