import { Injectable } from '@angular/core';
import { Board } from '@models/board.model';

const STORAGE_KEY = 'recently_opened_boards';
const MAX_RECENT = 3;

export interface RecentBoardEntry {
  id: number;
  title: string;
  backgroundColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecentBoardsService {
  pushBoard(board: Board): void {
    const stack = this.getStack();
    const existingIndex = stack.findIndex(entry => entry.id === board.id);
    if (existingIndex !== -1) {
      stack.splice(existingIndex, 1);
    }
    stack.unshift({
      id: board.id,
      title: board.title,
      backgroundColor: board.backgroundColor,
    });
    while (stack.length > MAX_RECENT) {
      stack.pop();
    }
    this.saveStack(stack);
  }

  getStack(): RecentBoardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  removeBoard(boardId: number): void {
    const stack = this.getStack().filter(entry => entry.id !== boardId);
    this.saveStack(stack);
  }

  private saveStack(stack: RecentBoardEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  }
}