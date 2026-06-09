import { CardDescription } from '@models/card.model';

const EMPTY_DESCRIPTION: CardDescription = {
  textField: '',
  checklist: [],
  labels: [],
  dueDate: '',
};

export function parseDescription(raw: string | undefined | null): CardDescription {
  if (!raw) {
    return { ...EMPTY_DESCRIPTION };
  }
  try {
    const parsed = JSON.parse(raw);

    // Resolve dueDate: prefer new format (string), fallback to old format (dueDates[0])
    let dueDate = '';
    if (typeof parsed.dueDate === 'string') {
      dueDate = parsed.dueDate;
    } else if (Array.isArray(parsed.dueDates) && parsed.dueDates.length > 0) {
      dueDate = parsed.dueDates[0];
    }

    return {
      textField: typeof parsed.textField === 'string' ? parsed.textField : '',
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      labels: Array.isArray(parsed.labels) ? parsed.labels : [],
      dueDate,
    };
  } catch {
    return { ...EMPTY_DESCRIPTION, textField: raw };
  }
}
