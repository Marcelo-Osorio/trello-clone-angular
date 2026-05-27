import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

import { Card, CreateCardDto, UpdateCardDto } from '@models/card.model';
import { checkToken } from '@interceptors/token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private apiUrl = environment.API_URL;
  private cardsUrl = `${this.apiUrl}/api/v1/cards`;

  constructor(private http: HttpClient) {}

  createCard(dto: CreateCardDto): Observable<Card> {
    return this.http.post<Card>(this.cardsUrl, dto, { context: checkToken() });
  }

  updateCard(id: number, dto: UpdateCardDto): Observable<Card> {
    return this.http.put<Card>(`${this.cardsUrl}/${id}`, dto, { context: checkToken() });
  }
}
