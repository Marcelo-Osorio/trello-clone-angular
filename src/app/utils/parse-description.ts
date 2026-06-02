import { CardDescription } from '@models/card.model';

const EMPTY_DESCRIPTION: CardDescription = {
  textField: '',
  checklist: [],
  labels: [],
  dueDates: [],
};

export function parseDescription(raw: string | undefined | null): CardDescription {
  if (!raw) {
    return { ...EMPTY_DESCRIPTION };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      textField: typeof parsed.textField === 'string' ? parsed.textField : '',
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      labels: Array.isArray(parsed.labels) ? parsed.labels : [],
      dueDates: Array.isArray(parsed.dueDates) ? parsed.dueDates : [],
    };
  } catch {
    return { ...EMPTY_DESCRIPTION, textField: raw };
  }
}
