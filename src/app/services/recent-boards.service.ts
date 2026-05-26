import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board } from '@models/board.model';

const STORAGE_KEY = 'recently_opened_boards';
const MAX_RECENT = 4;

export interface RecentBoardEntry {
  id: number;
  title: string;
  backgroundColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecentBoardsService {
  private stack$ = new BehaviorSubject<RecentBoardEntry[]>(this.loadStack());

  get stackChanges$() {
    return this.stack$.asObservable();
  }

  pushBoard(board: Board): void {
    const stack = this.stack$.getValue();
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
    this.stack$.next([...stack]);
  }

  getStack(): RecentBoardEntry[] {
    return this.stack$.getValue();
  }

  removeBoard(boardId: number): void {
    const stack = this.stack$.getValue().filter(entry => entry.id !== boardId);
    this.saveStack(stack);
    this.stack$.next([...stack]);
  }

  clearStack(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.stack$.next([]);
  }

  private loadStack(): RecentBoardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveStack(stack: RecentBoardEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  }
}