import type { Card } from './card.model';
import type { List } from './list.model';
import type { User } from './user.model';

export type BoardBackgroundColor = 'sky' | 'green' | 'violet' | 'yellow';

export interface CreateBoardDto {
  title: string;
  backgroundColor: BoardBackgroundColor;
}

export interface UpdateBoardDto {
  title?: string;
  backgroundColor?: BoardBackgroundColor;
}

export interface Board {
  id: number;
  title: string;
  backgroundColor: BoardBackgroundColor;
  creationAt: string;
  updatedAt: string;
  members: User[];

  lists?: List[];
  cards?: Card[];
}
