import { Injectable } from '@angular/core';
import { Board } from '@models/board.model';

const DETAIL_BOARDS_KEY = 'detail_boards';
const ME_BOARDS_KEY = 'me_boards';

@Injectable({
  providedIn: 'root',
})
export class BoardsCacheService {
  getBoardById(id: number): Board | null {
    const map = this.getDetailMap();
    return map[id] ?? null;
  }

  setBoardById(board: Board): void {
    const map = this.getDetailMap();
    map[board.id] = board;
    this.saveDetailMap(map);
  }

  getMeBoards(): Board[] | null {
    const raw = sessionStorage.getItem(ME_BOARDS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Board[];
    } catch {
      return null;
    }
  }

  setMeBoards(boards: Board[]): void {
    sessionStorage.setItem(ME_BOARDS_KEY, JSON.stringify(boards));
  }

  removeBoardDetail(id: number): void {
    const map = this.getDetailMap();
    delete map[id];
    this.saveDetailMap(map);
  }

  clearMeBoards(): void {
    sessionStorage.removeItem(ME_BOARDS_KEY);
  }

  clearAll(): void {
    sessionStorage.removeItem(DETAIL_BOARDS_KEY);
    sessionStorage.removeItem(ME_BOARDS_KEY);
  }

  private getDetailMap(): Record<number, Board> {
    const raw = sessionStorage.getItem(DETAIL_BOARDS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<number, Board>;
    } catch {
      return {};
    }
  }

  private saveDetailMap(map: Record<number, Board>): void {
    sessionStorage.setItem(DETAIL_BOARDS_KEY, JSON.stringify(map));
  }
}