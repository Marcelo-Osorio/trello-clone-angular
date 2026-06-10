import { TestBed } from '@angular/core/testing';
import { LabelsService } from './labels.service';
import { Card, Label, LabelColor, CardDescription } from '@models/card.model';

describe('LabelsService', () => {
  let service: LabelsService;
  let sessionStorageSpy: jasmine.SpyObj<Storage>;

  const FIXED_COLORS: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  };

  /** Helper to build CardDescription JSON with the current model shape */
  function makeDesc(overrides: Partial<CardDescription> = {}): string {
    const desc: CardDescription = {
      textField: '',
      checklist: [],
      labels: [],
      dueDate: '',
      ...overrides,
    };
    return JSON.stringify(desc);
  }

  beforeEach(() => {
    // Mock sessionStorage
    const store: Record<string, string> = {};
    sessionStorageSpy = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem', 'clear']);
    sessionStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    sessionStorageSpy.setItem.and.callFake((key: string, value: string) => { store[key] = value; });
    sessionStorageSpy.removeItem.and.callFake((key: string) => { delete store[key]; });
    sessionStorageSpy.clear.and.callFake(() => { for (const k of Object.keys(store)) delete store[k]; });

    spyOnProperty(window, 'sessionStorage', 'get').and.returnValue(sessionStorageSpy as any);

    TestBed.configureTestingModule({
      providers: [LabelsService],
    });
    service = TestBed.inject(LabelsService);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('initFromBoard', () => {
    it('should scan cards and store labels with FIXED_COLORS only', () => {
      const boardId = 1;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [
            { labelName: 'Bug', color: 'green' as LabelColor },
            { labelName: '', color: 'yellow' as LabelColor },
          ],
        }), position: 0, creationAt: '', updatedAt: '' },
        { id: 2, title: 'Card 2', description: makeDesc({
          labels: [
            { labelName: 'Pink Label', color: 'pink' as any },
          ],
        }), position: 1, creationAt: '', updatedAt: '' },
      ];

      service.initFromBoard(boardId, cards);

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      // Only green and yellow — 'pink' is not in FIXED_COLORS
      expect(labels.length).toBe(2);
      expect(labels.some((l: Label) => l.color === 'green')).toBeTrue();
      expect(labels.some((l: Label) => l.color === 'yellow')).toBeTrue();
      expect(labels.some((l: Label) => (l as any).color === 'pink')).toBeFalse();

      // Verify sessionStorage was written
      expect(sessionStorageSpy.setItem).toHaveBeenCalledWith(
        `labels_${boardId}`,
        jasmine.any(String)
      );
    });

    it('should stop scanning when all 6 colors are found', () => {
      const boardId = 2;
      const allColors: Label[] = Object.keys(FIXED_COLORS).map((c: string) => ({
        labelName: c,
        color: c as LabelColor,
      }));

      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({ labels: allColors }), position: 0, creationAt: '', updatedAt: '' },
      ];

      service.initFromBoard(boardId, cards);

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      expect(labels.length).toBe(6);
    });

    it('should discard labels whose color is NOT in FIXED_COLORS', () => {
      const boardId = 3;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [
            { labelName: 'Magenta', color: 'magenta' as any },
            { labelName: 'Cyan', color: 'cyan' as any },
          ],
        }), position: 0, creationAt: '', updatedAt: '' },
      ];

      service.initFromBoard(boardId, cards);

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      expect(labels.length).toBe(0);
    });

    it('should store label_cards in sessionStorage', () => {
      const boardId = 4;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'red' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
        { id: 2, title: 'Card 2', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'red' as LabelColor }],
        }), position: 1, creationAt: '', updatedAt: '' },
      ];

      service.initFromBoard(boardId, cards);

      expect(sessionStorageSpy.setItem).toHaveBeenCalledWith(
        `label_cards_${boardId}`,
        jasmine.any(String)
      );

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(labelCards['red']).toEqual([1, 2]);
    });
  });

  describe('toggleLabel', () => {
    it('should add cardId to label and return label with autoName if no name', () => {
      const boardId = 10;
      const cards: Card[] = [
        { id: 5, title: 'Card 5', description: makeDesc(), position: 0, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      const result = service.toggleLabel(boardId, 'blue' as LabelColor, 5);

      // 'blue' has no name → autoName should return 'blue'
      expect(result.labelName).toBe('blue');
      expect(result.color).toBe('blue');

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(labelCards['blue']).toContain(5);
    });

    it('should remove cardId from label if already present (deselect)', () => {
      const boardId = 11;
      const cards: Card[] = [
        { id: 5, title: 'Card 5', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'green' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      // Toggle to deselect
      service.toggleLabel(boardId, 'green' as LabelColor, 5);

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(labelCards['green']).not.toContain(5);
    });
  });

  describe('removeLabelFromCard', () => {
    it('should remove cardId from label map and remove label from board if last card', () => {
      const boardId = 20;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [{ labelName: 'Urgent', color: 'orange' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      // Card 1 is the only card with orange label
      service.removeLabelFromCard(boardId, 'orange' as LabelColor, 1);

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      expect(labels.some((l: Label) => l.color === 'orange')).toBeFalse();

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(labelCards['orange']).toBeUndefined();
    });

    it('should remove cardId from label but keep label if other cards still use it', () => {
      const boardId = 21;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'green' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
        { id: 2, title: 'Card 2', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'green' as LabelColor }],
        }), position: 1, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      // Remove card 1, but card 2 still has green
      service.removeLabelFromCard(boardId, 'green' as LabelColor, 1);

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      expect(labels.some((l: Label) => l.color === 'green')).toBeTrue();

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(labelCards['green']).not.toContain(1);
      expect(labelCards['green']).toContain(2);
    });
  });

  describe('renameLabel', () => {
    it('should update label name in sessionStorage and emit via BehaviorSubject', () => {
      const boardId = 30;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [{ labelName: 'green', color: 'green' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      service.renameLabel(boardId, 'green' as LabelColor, 'Bug');

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      const greenLabel = labels.find((l: Label) => l.color === 'green');
      expect(greenLabel!.labelName).toBe('Bug');

      // Verify sessionStorage was updated
      expect(sessionStorageSpy.setItem).toHaveBeenCalledWith(
        `labels_${boardId}`,
        jasmine.any(String)
      );
    });
  });

  describe('getAutoName', () => {
    it('should return the color string as name', () => {
      expect(service.getAutoName('green' as LabelColor)).toBe('green');
      expect(service.getAutoName('yellow' as LabelColor)).toBe('yellow');
      expect(service.getAutoName('red' as LabelColor)).toBe('red');
      expect(service.getAutoName('blue' as LabelColor)).toBe('blue');
      expect(service.getAutoName('orange' as LabelColor)).toBe('orange');
      expect(service.getAutoName('purple' as LabelColor)).toBe('purple');
    });
  });

  describe('destroy', () => {
    it('should clear BehaviorSubjects', () => {
      const boardId = 40;
      const cards: Card[] = [
        { id: 1, title: 'Card 1', description: makeDesc({
          labels: [{ labelName: 'Bug', color: 'red' as LabelColor }],
        }), position: 0, creationAt: '', updatedAt: '' },
      ];
      service.initFromBoard(boardId, cards);

      service.destroy();

      let labels: Label[] = [];
      service.getLabels$().subscribe((l: Label[]) => labels = l);
      expect(labels.length).toBe(0);

      let labelCards: Record<string, number[]> = {};
      service.getLabelCards$().subscribe((lc: Record<string, number[]>) => labelCards = lc);
      expect(Object.keys(labelCards).length).toBe(0);
    });
  });
});