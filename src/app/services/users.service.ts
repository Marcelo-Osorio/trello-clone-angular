import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { TokenService } from './token.service';
import { User } from '@models/user.model';
import { checkToken } from '@interceptors/token.interceptor';

const BOARD_MEMBERS_KEY_PREFIX = 'board-members-';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/api/v1/users`, {
      context: checkToken(),
    });
  }

  saveBoardMembers(boardId: number, members: User[]): void {
    localStorage.setItem(
      `${BOARD_MEMBERS_KEY_PREFIX}${boardId}`,
      JSON.stringify(members),
    );
  }

  getBoardMembers(boardId: number): User[] {
    const stored = localStorage.getItem(`${BOARD_MEMBERS_KEY_PREFIX}${boardId}`);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as User[];
    } catch {
      return [];
    }
  }

  clearBoardMembers(boardId: number): void {
    localStorage.removeItem(`${BOARD_MEMBERS_KEY_PREFIX}${boardId}`);
  }
}
