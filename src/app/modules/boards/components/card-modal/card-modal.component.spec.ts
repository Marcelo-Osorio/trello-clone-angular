import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { of } from 'rxjs';

import { CardModalComponent } from './card-modal.component';
import { ChecklistGroupComponent } from '../checklist-group/checklist-group.component';
import { MemberPickerComponent } from '../member-picker/member-picker.component';
import { CardsService } from '@services/cards.service';
import { UsersService } from '@services/users.service';
import { Card } from '@models/card.model';
import { Board } from '@models/board.model';

describe('CardModalComponent', () => {
  let component: CardModalComponent;
  let fixture: ComponentFixture<CardModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef>;
  let dialogSpy: jasmine.SpyObj<Dialog>;
  let cardsServiceSpy: jasmine.SpyObj<CardsService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  const mockCard: Card = {
    id: 1,
    title: 'Test Card',
    description: JSON.stringify({
      textField: 'Some description',
      checklist: [],
      labels: [{ color: 'green', labelName: 'Feature' }],
      dueDates: [],
    }),
    position: 0,
    creationAt: '2026-01-01',
    updatedAt: '2026-01-01',
    board: { id: 1, title: 'Board', backgroundColor: 'sky', creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    list: { id: 1, title: 'To Do', position: 0, creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    members: [],
  };

  const mockBoard: Board = {
    id: 1,
    title: 'Test Board',
    backgroundColor: 'sky',
    creationAt: '2026-01-01',
    updatedAt: '2026-01-01',
    members: [
      { id: 1, name: 'Alice', email: 'a@t.com', avatar: '', creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    ],
  };

  const mockInput = {
    card: mockCard,
    board: mockBoard,
    listTitle: 'To Do',
    currentUser: null,
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    dialogSpy = jasmine.createSpyObj('Dialog', ['open']);
    cardsServiceSpy = jasmine.createSpyObj('CardsService', ['updateCard']);
    cardsServiceSpy.updateCard.and.returnValue(of(mockCard));
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getBoardMembers']);
    usersServiceSpy.getBoardMembers.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [CardModalComponent, ChecklistGroupComponent, MemberPickerComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: Dialog, useValue: dialogSpy },
        { provide: CardsService, useValue: cardsServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: DIALOG_DATA, useValue: mockInput },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display card title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Card');
  });

  it('should display list title in subtitle', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('To Do');
  });

  it('should parse description from JSON', () => {
    expect(component.description.textField).toBe('Some description');
    expect(component.description.labels.length).toBe(1);
  });

  it('should handle plain text description gracefully', () => {
    const plainCard = { ...mockCard, description: 'plain text' };
    const plainInput = { ...mockInput, card: plainCard };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [CardModalComponent, ChecklistGroupComponent, MemberPickerComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: Dialog, useValue: dialogSpy },
        { provide: CardsService, useValue: cardsServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: DIALOG_DATA, useValue: plainInput },
      ],
    }).compileComponents();

    const plainFixture = TestBed.createComponent(CardModalComponent);
    const plainComponent = plainFixture.componentInstance;
    expect(plainComponent.description.textField).toBe('plain text');
    expect(plainComponent.description.labels.length).toBe(0);
  });

  it('should close dialog with card data', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(component.card);
  });

  it('should toggle title editing', () => {
    expect(component.editingTitle).toBe(false);
    component.startEditTitle();
    expect(component.editingTitle).toBe(true);
    expect(component.titleDraft).toBe('Test Card');
  });

  it('should save title and call API', () => {
    const updatedCard = { ...mockCard, title: 'Updated Title' };
    cardsServiceSpy.updateCard.and.returnValue(of(updatedCard));

    component.startEditTitle();
    component.titleDraft = 'Updated Title';
    component.saveTitle();
    expect(component.card.title).toBe('Updated Title');
    expect(cardsServiceSpy.updateCard).toHaveBeenCalled();
  });

  it('should toggle description editing', () => {
    expect(component.editingDescription).toBe(false);
    component.startEditDescription();
    expect(component.editingDescription).toBe(true);
  });

  it('should save description and call API', () => {
    component.startEditDescription();
    component.descriptionDraft = 'Updated description';
    component.saveDescription();
    expect(component.description.textField).toBe('Updated description');
    expect(cardsServiceSpy.updateCard).toHaveBeenCalled();
  });

  it('should add a new checklist group', () => {
    component.startAddChecklist();
    component.newChecklistName = 'My Checklist';
    component.submitNewChecklist();
    expect(component.description.checklist.length).toBe(1);
    expect(component.description.checklist[0].groupName).toBe('My Checklist');
    expect(cardsServiceSpy.updateCard).toHaveBeenCalled();
  });

  it('should delete a checklist group', () => {
    component.description = {
      ...component.description,
      checklist: [{ groupName: 'Test', items: [] }],
    };
    component.onChecklistGroupDelete(0);
    expect(component.description.checklist.length).toBe(0);
  });

  it('should append @mention to description textField when member is selected', () => {
    const member = mockBoard.members[0];
    component.onMemberSelect(member);
    expect(component.description.textField).toContain('@Alice');
    expect(cardsServiceSpy.updateCard).toHaveBeenCalled();
  });

  it('should format due date', () => {
    component.description = {
      ...component.description,
      dueDates: ['2026-06-15T14:30:00.000Z'],
    };
    expect(component.formattedDueDate).toBeTruthy();
  });

  it('should open labels modal', () => {
    const mockClosedSub = { closed: { subscribe: jasmine.createSpy('subscribe') } };
    dialogSpy.open.and.returnValue(mockClosedSub as any);
    component.openLabelsModal();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should open due date modal', () => {
    const mockClosedSub = { closed: { subscribe: jasmine.createSpy('subscribe') } };
    dialogSpy.open.and.returnValue(mockClosedSub as any);
    component.openDueDateModal();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});
