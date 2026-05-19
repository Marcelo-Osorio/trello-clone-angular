import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, tap } from 'rxjs';

import { Board, CreateBoardDto, UpdateBoardDto } from '@models/board.model';
import { User } from '@models/user.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  private apiUrl = environment.API_URL;
  private boardsUrl = `${this.apiUrl}/api/v1/boards`;
  private meUrl = `${this.apiUrl}/api/v1/me`;

  constructor(private http: HttpClient) {}

  getBoards() {
    return this.http.get<Board[]>(this.boardsUrl, { context: checkToken() });
  }

  getMeBoards() {
    return this.http.get<Board[]>(`${this.meUrl}/boards`, { context: checkToken() });
  }

  getMeProfile() {
    return this.http.get<User>(`${this.meUrl}/profile`, { context: checkToken() });
  }

  createBoard(data: CreateBoardDto) {
    return this.http.post<Board>(this.boardsUrl, data, { context: checkToken() });
  }

  getBoardById(id: number) {
    return this.http.get<Board>(`${this.boardsUrl}/${id}`, { context: checkToken() });
  }

  updateBoard(id: number, data: UpdateBoardDto) {
    return this.http.put<Board>(`${this.boardsUrl}/${id}`, data, { context: checkToken() });
  }
}
