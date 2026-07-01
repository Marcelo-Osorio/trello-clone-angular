import { Label, LabelColor } from './card.model';

export interface SearchCriteria {
  text: string;
  labels: Label[];
}

export type ActiveFilterChipType = 'search' | 'label';

export interface ActiveFilterChip {
  id: string;
  type: ActiveFilterChipType;
  text: string;
  color?: LabelColor;
}

export const EMPTY_SEARCH_CRITERIA: SearchCriteria = {
  text: '',
  labels: [],
};
