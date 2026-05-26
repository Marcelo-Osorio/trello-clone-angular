import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

import { Board, CreateBoardDto, UpdateBoardDto } from '@models/board.model';
import { User } from '@models/user.model';
import { checkToken } from '@interceptors/token.interceptor';
import { BoardsCacheService } from '@services/boards-cache.service';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  private apiUrl = environment.API_URL;
  private boardsUrl = `${this.apiUrl}/api/v1/boards`;
  private meUrl = `${this.apiUrl}/api/v1/me`;
  private boardCreationNotify = new BehaviorSubject<Board | null>(null);
  boardCreationNotify$ = this.boardCreationNotify.asObservable();

  constructor(
    private http: HttpClient,
    private cache: BoardsCacheService,
  ) {}

  getBoards() {
    return this.http.get<Board[]>(this.boardsUrl, { context: checkToken() });
  }

  getMeBoards(): Observable<Board[]> {
    const cached = this.cache.getMeBoards();
    if (cached) {
      return of(cached);
    }

    return this.http.get<Board[]>(`${this.meUrl}/boards`, { context: checkToken() }).pipe(
      tap(boards => this.cache.setMeBoards(boards)),
    );
  }

  getMeProfile() {
    return this.http.get<User>(`${this.meUrl}/profile`, { context: checkToken() });
  }

  createBoard(data: CreateBoardDto) {
    this.cache.clearMeBoards();
    return this.http.post<Board>(this.boardsUrl, data, { context: checkToken() }).pipe(
      tap((board) => {
        this.cache.clearMeBoards();
        this.boardCreationNotify.next(board);
      }),
    );
  }

  getBoardById(id: number): Observable<Board> {
    const cached = this.cache.getBoardById(id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Board>(`${this.boardsUrl}/${id}`, { context: checkToken() }).pipe(
      tap(board => this.cache.setBoardById(board)),
    );
  }

  updateBoard(id: number, data: UpdateBoardDto) {
    this.cache.removeBoardDetail(id);
    this.cache.clearMeBoards();
    return this.http.put<Board>(`${this.boardsUrl}/${id}`, data, { context: checkToken() }).pipe(
      tap(updatedBoard => {
        this.cache.setBoardById(updatedBoard);
        this.cache.clearMeBoards();
      }),
    );
  }
}
