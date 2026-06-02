import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';

import { BoardComponent } from './board.component';
import { BoardNavbarComponent } from '@boards/components/board-navbar/board-navbar.component';
import { ListComponent } from '@boards/components/list/list.component';
import { CardPreviewComponent } from '@boards/components/card-preview/card-preview.component';
import { BoardsService } from '@services/boards.service';
import { CardsService } from '@services/cards.service';
import { ArchivedService } from '@services/archived.service';
import { Board } from '@models/board.model';
import { List } from '@models/list.model';
import { Card } from '@models/card.model';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let boardsServiceSpy: jasmine.SpyObj<BoardsService>;
  let cardsServiceSpy: jasmine.SpyObj<CardsService>;
  let archivedServiceSpy: jasmine.SpyObj<ArchivedService>;
  let dialogSpy: jasmine.SpyObj<Dialog>;

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
    cardsServiceSpy = jasmine.createSpyObj('CardsService', ['createCard', 'updateCard']);
    archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale', 'archiveCard', 'archiveList']);
    archivedServiceSpy.getArchived.and.returnValue({ lists: [], cards: [] });
    dialogSpy = jasmine.createSpyObj('Dialog', ['open']);
    dialogSpy.open.and.returnValue({
      closed: { subscribe: jasmine.createSpy('subscribe') },
    } as any);

    if (error) {
      boardsServiceSpy.getBoardById.and.returnValue(throwError(() => new Error('API Error')));
    } else if (boardResponse) {
      boardsServiceSpy.getBoardById.and.returnValue(of(boardResponse));
    }

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, FontAwesomeModule, DragDropModule, DialogModule],
      declarations: [BoardComponent, BoardNavbarComponent, ListComponent, CardPreviewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: routeParamId }),
          },
        },
        { provide: BoardsService, useValue: boardsServiceSpy },
        { provide: CardsService, useValue: cardsServiceSpy },
        { provide: ArchivedService, useValue: archivedServiceSpy },
        { provide: Dialog, useValue: dialogSpy },
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
      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale', 'archiveCard', 'archiveList']);
      archivedServiceSpy.getArchived.and.returnValue({
        lists: [{ ...mockLists[1] }],
        cards: [],
      });

      boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
      boardsServiceSpy.getBoardById.and.returnValue(of(mockBoard));
      cardsServiceSpy = jasmine.createSpyObj('CardsService', ['createCard', 'updateCard']);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule, DragDropModule, DialogModule],
        declarations: [BoardComponent, BoardNavbarComponent, ListComponent, CardPreviewComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({ id: '1' }),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: CardsService, useValue: cardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
          { provide: Dialog, useValue: jasmine.createSpyObj('Dialog', ['open']) },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(BoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.lists.length).toBe(1);
      expect(component.lists[0].title).toBe('To Do');
    });

    it('should filter out archived cards from lists', () => {
      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale', 'archiveCard', 'archiveList']);
      archivedServiceSpy.getArchived.and.returnValue({
        lists: [],
        cards: [{ ...mockCards[0] }],
      });

      boardsServiceSpy = jasmine.createSpyObj('BoardsService', ['getBoardById', 'updateBoard']);
      boardsServiceSpy.getBoardById.and.returnValue(of(mockBoard));
      cardsServiceSpy = jasmine.createSpyObj('CardsService', ['createCard', 'updateCard']);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule, DragDropModule, DialogModule],
        declarations: [BoardComponent, BoardNavbarComponent, ListComponent, CardPreviewComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({ id: '1' }),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: CardsService, useValue: cardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
          { provide: Dialog, useValue: jasmine.createSpyObj('Dialog', ['open']) },
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
      cardsServiceSpy = jasmine.createSpyObj('CardsService', ['createCard', 'updateCard']);

      archivedServiceSpy = jasmine.createSpyObj('ArchivedService', ['getArchived', 'cleanStale', 'archiveCard', 'archiveList']);
      archivedServiceSpy.getArchived.and.returnValue({ lists: [], cards: [] });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, FormsModule, FontAwesomeModule, DragDropModule, DialogModule],
        declarations: [BoardComponent, BoardNavbarComponent, ListComponent, CardPreviewComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({ id: '1' }),
            },
          },
          { provide: BoardsService, useValue: boardsServiceSpy },
          { provide: CardsService, useValue: cardsServiceSpy },
          { provide: ArchivedService, useValue: archivedServiceSpy },
          { provide: Dialog, useValue: jasmine.createSpyObj('Dialog', ['open']) },
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

  describe('add card', () => {
    it('should call cardsService.createCard when onAddCard is called', () => {
      setup('1');
      fixture.detectChanges();

      const newCard: Card = {
        id: 99,
        title: 'New Card',
        position: 2,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      cardsServiceSpy.createCard.and.returnValue(of(newCard));

      component.onAddCard({ listId: 1, title: 'New Card' });

      expect(cardsServiceSpy.createCard).toHaveBeenCalledWith({
        title: 'New Card',
        listId: 1,
        boardId: 1,
        position: 2,
        description: '',
      });
      expect(component.lists[0].cards!.length).toBe(3);
    });

    it('should not call createCard when board is null', () => {
      setup('1');
      fixture.detectChanges();
      component.board = null;

      component.onAddCard({ listId: 1, title: 'New Card' });

      expect(cardsServiceSpy.createCard).not.toHaveBeenCalled();
    });
  });

  describe('archive list', () => {
    it('should archive list and remove from view', () => {
      setup('1');
      fixture.detectChanges();

      component.onArchiveList(2);

      expect(archivedServiceSpy.archiveList).toHaveBeenCalled();
      expect(component.lists.length).toBe(1);
      expect(component.lists[0].id).toBe(1);
    });
  });

  describe('archive all cards', () => {
    it('should archive all cards in a list', () => {
      setup('1');
      fixture.detectChanges();

      component.onArchiveAllCards(1);

      expect(archivedServiceSpy.archiveCard).toHaveBeenCalledTimes(2);
      expect(component.lists[0].cards!.length).toBe(0);
    });
  });

  describe('card click', () => {
    it('should open card modal dialog when card is clicked', () => {
      setup('1');
      fixture.detectChanges();

      component.onCardClick(10);
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should not open dialog if card is not found', () => {
      setup('1');
      fixture.detectChanges();

      component.onCardClick(9999);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should not open dialog if board is null', () => {
      setup('1');
      fixture.detectChanges();
      component.board = null;

      component.onCardClick(10);
      // dialog.open should have been called once for the first detectChanges, not again
      const callCount = dialogSpy.open.calls.count();
      component.onCardClick(10);
      expect(dialogSpy.open.calls.count()).toBe(callCount);
    });
  });
});
