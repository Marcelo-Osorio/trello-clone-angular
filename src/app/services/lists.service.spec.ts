import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ListsService } from './lists.service';
import { CreateListDto, List } from '@models/list.model';
import { environment } from '@environments/environment';

describe('ListsService', () => {
  let service: ListsService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.API_URL;
  const listsUrl = `${apiUrl}/api/v1/lists`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ListsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createList', () => {
    it('should POST a new list', () => {
      const dto: CreateListDto = {
        title: 'To Do',
        boardId: 1,
        position: 0,
      };

      const mockResponse: List = {
        id: 10,
        title: 'To Do',
        position: 0,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      service.createList(dto).subscribe((list) => {
        expect(list.id).toBe(10);
        expect(list.title).toBe('To Do');
      });

      const req = httpMock.expectOne(listsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should POST a new list at a different position', () => {
      const dto: CreateListDto = {
        title: 'Done',
        boardId: 1,
        position: 2,
      };

      const mockResponse: List = {
        id: 11,
        title: 'Done',
        position: 2,
        creationAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      service.createList(dto).subscribe((list) => {
        expect(list.id).toBe(11);
        expect(list.position).toBe(2);
      });

      const req = httpMock.expectOne(listsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });
});
