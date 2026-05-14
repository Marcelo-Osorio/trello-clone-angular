import type { Card } from './card.model';

export interface ListBoardRef {
  id: number;
  title: string;
  backgroundColor: 'sky' | 'green' | 'violet' | 'yellow';
  creationAt: string;
  updatedAt: string;
}

export interface List {
  id: number;
  title: string;
  position: number;
  creationAt: string;
  updatedAt: string;

  board?: ListBoardRef;
  cards?: Card[];
}

export interface CreateListDto {
  title: string;
  boardId: number;
  position: number;
}
