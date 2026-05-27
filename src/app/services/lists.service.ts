import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

import { List, CreateListDto } from '@models/list.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private apiUrl = environment.API_URL;
  private listsUrl = `${this.apiUrl}/api/v1/lists`;

  constructor(private http: HttpClient) {}

  createList(dto: CreateListDto): Observable<List> {
    return this.http.post<List>(this.listsUrl, dto, { context: checkToken() });
  }
}
