import { parseDescription } from './parse-description';

describe('parseDescription', () => {
  it('should return empty description for undefined', () => {
    const result = parseDescription(undefined);
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDates: [] });
  });

  it('should return empty description for null', () => {
    const result = parseDescription(null);
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDates: [] });
  });

  it('should return empty description for empty string', () => {
    const result = parseDescription('');
    expect(result).toEqual({ textField: '', checklist: [], labels: [], dueDates: [] });
  });

  it('should parse valid JSON description', () => {
    const json = JSON.stringify({
      textField: 'Hello',
      checklist: [{ groupName: 'g1', items: [{ item: 'task', checked: false }] }],
      labels: [{ color: 'green', labelName: 'Bug' }],
      dueDates: ['2026-06-01'],
    });
    const result = parseDescription(json);
    expect(result.textField).toBe('Hello');
    expect(result.checklist.length).toBe(1);
    expect(result.labels.length).toBe(1);
    expect(result.dueDates.length).toBe(1);
  });

  it('should fallback to plain text for invalid JSON', () => {
    const result = parseDescription('just plain text');
    expect(result.textField).toBe('just plain text');
    expect(result.checklist).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.dueDates).toEqual([]);
  });

  it('should handle JSON with missing fields gracefully', () => {
    const json = JSON.stringify({ textField: 'partial' });
    const result = parseDescription(json);
    expect(result.textField).toBe('partial');
    expect(result.checklist).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.dueDates).toEqual([]);
  });
});
