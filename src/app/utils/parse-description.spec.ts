import { parseDescription } from './parse-description';

describe('parseDescription', () => {
  it('should return empty description for undefined', () => {
    const result = parseDescription(undefined);
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDate: '' });
  });

  it('should return empty description for null', () => {
    const result = parseDescription(null);
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDate: '' });
  });

  it('should return empty description for empty string', () => {
    const result = parseDescription('');
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDate: '' });
  });

  it('should parse valid JSON description', () => {
    const json = JSON.stringify({
      textField: 'Hello',
      checklist: [{ groupName: 'g1', items: [{ item: 'task', checked: false }] }],
      labels: [{ color: 'green', labelName: 'Bug' }],
      dueDate: '2026-06-01',
    });
    const result = parseDescription(json);
    expect(result.textField).toBe('Hello');
    expect(result.checklist.length).toBe(1);
    expect(result.labels.length).toBe(1);
    expect(result.dueDate).toBe('2026-06-01');
  });

  it('should fallback to plain text for invalid JSON', () => {
    const result = parseDescription('just plain text');
    expect(result.textField).toBe('just plain text');
    expect(result.checklist).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.dueDate).toEqual('');
  });

  it('should handle JSON with missing fields gracefully', () => {
    const json = JSON.stringify({ textField: 'partial' });
    const result = parseDescription(json);
    expect(result.textField).toBe('partial');
    expect(result.checklist).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.dueDate).toEqual('');
  });

  // --- New tests for dueDate migration (Task 1.7) ---

  it('should parse dueDate as a single string', () => {
    const json = JSON.stringify({
      textField: '',
      checklist: [],
      labels: [],
      dueDate: '2026-07-15',
    });
    const result = parseDescription(json);
    expect(result.dueDate).toBe('2026-07-15');
  });

  it('should fallback to dueDates[0] when dueDate is missing but dueDates array exists (backward compat)', () => {
    const json = JSON.stringify({
      textField: '',
      checklist: [],
      labels: [],
      dueDates: ['2026-08-01', '2026-09-01'],
    });
    const result = parseDescription(json);
    expect(result.dueDate).toBe('2026-08-01');
  });

  it('should prefer dueDate over dueDates when both are present (new format wins)', () => {
    const json = JSON.stringify({
      textField: '',
      checklist: [],
      labels: [],
      dueDate: '2026-10-01',
      dueDates: ['2026-08-01'],
    });
    const result = parseDescription(json);
    expect(result.dueDate).toBe('2026-10-01');
  });

  it('should default dueDate to empty string when neither dueDate nor dueDates are present', () => {
    const json = JSON.stringify({
      textField: 'no dates here',
      checklist: [],
      labels: [],
    });
    const result = parseDescription(json);
    expect(result.dueDate).toBe('');
  });
});
