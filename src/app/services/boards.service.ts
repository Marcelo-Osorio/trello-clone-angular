import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, tap } from 'rxjs';

import { Board, CreateBoardDto, UpdateBoardDto } from '@models/board.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  private apiUrl = environment.API_URL;
  private boardsUrl = `${this.apiUrl}/api/v1/boards`;

  constructor(private http: HttpClient) {}

  getBoards() {
    return this.http
      .get<Board[]>(this.boardsUrl, { context: checkToken() })
      .pipe(
        tap((response) => {
          console.log('GET /boards response:', response);
        }),
      );
  }

  createBoard(data: CreateBoardDto){
    return this.http
      .post<Board>(this.boardsUrl, data, { context: checkToken() })
      .pipe(
        tap((response) => {
          console.log('POST /boards response:', response);
        }),
      );
  }

  getBoardById(id: number) {
    const url = `${this.boardsUrl}/${id}`;

    return this.http.get<Board>(url, { context: checkToken() }).pipe(
      tap((response) => {
        console.log(`GET /boards/${id} response:`, response);
      }),
    );
  }

  updateBoard(id: number, data: UpdateBoardDto) {
    const url = `${this.boardsUrl}/${id}`;

    return this.http.put<Board>(url, data, { context: checkToken() }).pipe(
      tap((response) => {
        console.log(`PUT /boards/${id} response:`, response);
      }),
    );
  }
}
