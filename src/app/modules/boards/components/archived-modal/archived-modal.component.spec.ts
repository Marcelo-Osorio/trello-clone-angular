import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ArchivedModalComponent } from './archived-modal.component';
import { ArchivedService } from '@services/archived.service';
import { Card, ArchivedData } from '@models/card.model';
import { List } from '@models/list.model';

describe('ArchivedModalComponent', () => {
  let component: ArchivedModalComponent;
  let fixture: ComponentFixture<ArchivedModalComponent>;
  let archivedService: ArchivedService;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<void>>;

  const mockArchivedData: ArchivedData = {
    lists: [
      {
        id: 101,
        title: 'Archived List',
        position: 0,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
        cards: [],
      },
    ],
    cards: [
      {
        id: 201,
        title: 'Archived Card',
        description: '',
        position: 0,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
        list: { id: 1, title: 'Target List', position: 0, creationAt: '2026-01-01', updatedAt: '2026-01-01' },
      },
    ],
  };

  const mockLists: List[] = [
    { id: 1, title: 'List 1', position: 0, creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 2, title: 'List 2', position: 1, creationAt: '2026-01-01', updatedAt: '2026-01-01' },
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [ArchivedModalComponent],
      providers: [
        ArchivedService,
        { provide: DialogRef, useValue: dialogRefSpy },
        {
          provide: DIALOG_DATA,
          useValue: {
            boardId: 1,
            lists: mockLists,
          },
        },
      ],
    }).compileComponents();

    archivedService = TestBed.inject(ArchivedService);
    spyOn(archivedService, 'getArchived').and.returnValue(mockArchivedData);

    fixture = TestBed.createComponent(ArchivedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load archived data on init', () => {
    expect(component.archivedLists.length).toBe(1);
    expect(component.archivedCards.length).toBe(1);
  });

  it('should close dialog', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should recover archived list', () => {
    spyOn(archivedService, 'recoverList');
    spyOn(component.recovered, 'emit');

    component.onRecoverList(101);

    expect(archivedService.recoverList).toHaveBeenCalledWith(1, 101);
    expect(component.recovered.emit).toHaveBeenCalled();
    expect(component.archivedLists.length).toBe(0);
  });

  it('should recover archived card', () => {
    spyOn(archivedService, 'recoverCard');
    spyOn(component.recovered, 'emit');

    component.selectedListId = 1;
    component.onRecoverCard(201);

    expect(archivedService.recoverCard).toHaveBeenCalledWith(1, 201);
    expect(component.recovered.emit).toHaveBeenCalled();
    expect(component.archivedCards.length).toBe(0);
  });

  it('should not recover card without selected list', () => {
    spyOn(archivedService, 'recoverCard');

    component.selectedListId = 0;
    component.onRecoverCard(201);

    expect(archivedService.recoverCard).not.toHaveBeenCalled();
  });
});
