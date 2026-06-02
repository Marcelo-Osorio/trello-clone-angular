import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto, Card } from '@models/card.model';
import { environment } from '@environments/environment';

describe('CardsService', () => {
  let service: CardsService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.API_URL;
  const cardsUrl = `${apiUrl}/api/v1/cards`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCard', () => {
    it('should POST a new card with description', () => {
      const dto: CreateCardDto = {
        title: 'New Card',
        listId: 1,
        boardId: 2,
        position: 0,
        description: 'A description',
      };

      const mockResponse: Card = {
        id: 42,
        title: 'New Card',
        description: 'A description',
        position: 0,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      service.createCard(dto).subscribe((card) => {
        expect(card.id).toBe(42);
        expect(card.title).toBe('New Card');
      });

      const req = httpMock.expectOne(cardsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should POST a new card without description', () => {
      const dto: CreateCardDto = {
        title: 'Simple Card',
        listId: 3,
        boardId: 4,
        position: 1,
      };

      const mockResponse: Card = {
        id: 43,
        title: 'Simple Card',
        position: 1,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      service.createCard(dto).subscribe((card) => {
        expect(card.id).toBe(43);
        expect(card.description).toBeUndefined();
      });

      const req = httpMock.expectOne(cardsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('updateCard', () => {
    it('should PUT an existing card with all fields', () => {
      const id = 42;
      const dto: UpdateCardDto = {
        title: 'Updated Card',
        description: 'Updated description',
        position: 1,
        listId: 1,
        boardId: 2,
      };

      const mockResponse: Card = {
        id: 42,
        title: 'Updated Card',
        description: 'Updated description',
        position: 1,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      service.updateCard(id, dto).subscribe((card) => {
        expect(card.id).toBe(42);
        expect(card.title).toBe('Updated Card');
      });

      const req = httpMock.expectOne(`${cardsUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should PUT an existing card without description', () => {
      const id = 7;
      const dto: UpdateCardDto = {
        title: 'Minimal Update',
        position: 0,
        listId: 3,
        boardId: 4,
      };

      const mockResponse: Card = {
        id: 7,
        title: 'Minimal Update',
        position: 0,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      service.updateCard(id, dto).subscribe((card) => {
        expect(card.id).toBe(7);
        expect(card.description).toBeUndefined();
      });

      const req = httpMock.expectOne(`${cardsUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });
});
