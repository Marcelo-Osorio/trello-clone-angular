import type { User } from './user.model';

export interface CardBoardRef {
  id: number;
  title: string;
  backgroundColor: 'sky' | 'green' | 'violet' | 'yellow';
  creationAt: string;
  updatedAt: string;
}

export interface CardListRef {
  id: number;
  title: string;
  position: number;
  creationAt: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  position: number;
  creationAt: string;
  updatedAt: string;

  members?: User[];
  board?: CardBoardRef;
  list?: CardListRef;
}

export interface CreateCardDto {
  title: string;
  listId: number;
  boardId: number;
  position: number;
  description?: string;
}

export interface UpdateCardDto {
  title: string;
  description?: string;
  position: number;
  listId: number;
  boardId: number;
}
