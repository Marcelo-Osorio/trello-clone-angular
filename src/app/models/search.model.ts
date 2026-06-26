import { Label } from './card.model';

export interface SearchCriteria {
  text: string;
  labels: Label[];
}

export const EMPTY_SEARCH_CRITERIA: SearchCriteria = {
  text: '',
  labels: [],
};
