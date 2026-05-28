import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of, throwError } from 'rxjs';

import { BoardComponent } from './board.component';
import { BoardNavbarComponent } from '@boards/components/board-navbar/board-navbar.component';
import { BoardsService } from '@services/boards.service';
import { ArchivedService } from '@services/archived.service';
import { Board } from '@models/board.model';
import { List } from '@models/list.model';
import { Card } from '@models/card.model';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let boardsServiceSpy: jasmine.SpyObj<BoardsService>;
  let archivedServiceSpy: jasmine.SpyObj<ArchivedService>;

  const mockLists: List[] = [
    {
      id: 1,
      title: 'To Do',
      position: 0,
      creationAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      cards: [
        {
          id: 10,
          title: 'Card A',
          position: 0,
          creationAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 11,
          title: 'Card B',
          position: 1,
          creationAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
    {
      id: 2,
      title: 'Done',
      position: 1,
      creationAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      cards: [],
    },
  ];

  const mockCards: Card[] = [
    {
      id: 10,
      title: 'Card A',
      position: 0,
      creationAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 11,
      title: 'Card B',
      position: 1,
      creationAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockBoard: Board = {
    id: 1,
    title: 'Test Board',
    backgroundColor: 'sky',
    creationAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    members: [],
    lists: mockLists,
    cards: mockCards,
  };

  function setup(routeParamId: string, boardResponse: Board | null = mockBoard, error = false) {
    boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
    archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale']);
    archivedServiceSpy.getArchived.and.returnValue({ lists: [], cards: [] });

    if (error) {
      boardsServiceSpy.getBoardById.and.returnValue(throwError(() => new Error('API Error')));
    } else if (boardResponse) {
      boardsServiceSpy.getBoardById.and.returnValue(of(boardResponse));
    }

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, FontAwesomeModule],
      declarations: [BoardComponent, BoardNavbarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of(convertToParamMap({ id: routeParamId })),
          },
        },
        { provide: BoardsService, useValue: boardsServiceSpy },
        { provide: ArchivedService, useValue: archivedServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
  }

  describe('board loading', () => {
    it('should call getBoardById with route param id on init', () => {
      setup('42');
      fixture.detectChanges();

      expect(boardsServiceSpy.getBoardById).toHaveBeenCalledWith(42);
    });

    it('should store board data after successful load', () => {
      setup('1');
      fixture.detectChanges();

      expect(component.board).toBeTruthy();
      expect(component.board!.title).toBe('Test Board');
      expect(component.lists.length).toBe(2);
    });

    it('should set loading to false after board loads', () => {
      setup('1');
      expect(component.loading).toBe(true);
      fixture.detectChanges();
      expect(component.loading).toBe(false);
    });

    it('should set error state when API fails', () => {
      setup('1', null, true);
      fixture.detectChanges();

      expect(component.error).toBeTruthy();
      expect(component.loading).toBe(false);
      expect(component.board).toBeNull();
    });

    it('should filter out archived lists from the board view', () => {
      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale']);
      archivedServiceSpy.getArchived.and.returnValue({
        lists: [{ ...mockLists[1] }],
        cards: [],
      });

      boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
      boardsServiceSpy.getBoardById.and.returnValue(of(mockBoard));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule],
        declarations: [BoardComponent, BoardNavbarComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of(convertToParamMap({ id: '1' })),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(BoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.lists.length).toBe(1);
      expect(component.lists[0].title).toBe('To Do');
    });

    it('should filter out archived cards from lists', () => {
      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale']);
      archivedServiceSpy.getArchived.and.returnValue({
        lists: [],
        cards: [{ ...mockCards[0] }],
      });

      boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
      boardsServiceSpy.getBoardById.and.returnValue(of(mockBoard));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule],
        declarations: [BoardComponent, BoardNavbarComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of(convertToParamMap({ id: '1' })),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(BoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const todoList = component.lists[0];
      expect(todoList.cards!.length).toBe(1);
      expect(todoList.cards![0].title).toBe('Card B');
    });

    it('should call cleanStale on archived service after loading', () => {
      setup('1');
      fixture.detectChanges();

      expect(archivedServiceSpy.cleanStale).toHaveBeenCalled();
    });
  });

  describe('board name update', () => {
    it('should update board title when boardNameChange event fires', () => {
      boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
      boardsServiceSpy.getBoardById.and.returnValue(of(mockBoard));
      boardsServiceSpy.updateBoard.and.returnValue(of({ ...mockBoard, title: 'New Name' }));

      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale']);
      archivedServiceSpy.getArchived.and.returnValue({ lists: [], cards: [] });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule],
        declarations: [BoardComponent, BoardNavbarComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of(convertToParamMap({ id: '1' })),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(BoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.onBoardNameChange('New Name');

      expect(boardsServiceSpy.updateBoard).toHaveBeenCalledWith(1, { title: 'New Name' });
      expect(component.board!.title).toBe('New Name');
    });
  });
});
