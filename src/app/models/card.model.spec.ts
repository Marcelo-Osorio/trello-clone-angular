import { CardDescription, ChecklistGroup, ChecklistItem, Label, LabelColor } from './card.model';

describe('Card Model Types', () => {
  describe('LabelColor', () => {
    it('should accept valid label colors', () => {
      const colors: LabelColor[] = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];
      expect(colors.length).toBe(6);
    });
  });

  describe('Label', () => {
    it('should create a valid label', () => {
      const label: Label = {
        labelName: 'Bug',
        color: 'red',
      };
      expect(label.labelName).toBe('Bug');
      expect(label.color).toBe('red');
    });
  });

  describe('ChecklistItem', () => {
    it('should create a checklist item', () => {
      const item: ChecklistItem = {
        item: 'Fix navigation',
        checked: false,
      };
      expect(item.item).toBe('Fix navigation');
      expect(item.checked).toBe(false);
    });
  });

  describe('ChecklistGroup', () => {
    it('should create a checklist group with items', () => {
      const group: ChecklistGroup = {
        groupName: 'Sprint Tasks',
        items: [
          { item: 'Task 1', checked: true },
          { item: 'Task 2', checked: false },
        ],
      };
      expect(group.groupName).toBe('Sprint Tasks');
      expect(group.items.length).toBe(2);
      expect(group.items[0].checked).toBe(true);
    });
  });

  describe('CardDescription', () => {
    it('should create a complete card description', () => {
      const desc: CardDescription = {
        textField: 'This is the card description',
        checklist: [
          {
            groupName: 'Tasks',
            items: [{ item: 'Do something', checked: false }],
          },
        ],
        labels: [{ labelName: 'Urgent', color: 'red' }],
        dueDates: ['2026-06-01T00:00:00.000Z'],
      };
      expect(desc.textField).toBe('This is the card description');
      expect(desc.checklist.length).toBe(1);
      expect(desc.labels.length).toBe(1);
      expect(desc.dueDates.length).toBe(1);
    });

    it('should allow empty card description', () => {
      const desc: CardDescription = {
        textField: '',
        checklist: [],
        labels: [],
        dueDates: [],
      };
      expect(desc.textField).toBe('');
      expect(desc.checklist.length).toBe(0);
      expect(desc.labels.length).toBe(0);
      expect(desc.dueDates.length).toBe(0);
    });
  });
});
