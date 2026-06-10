import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

import { CardModalComponent } from './card-modal.component';
import { ChecklistGroupComponent } from '../checklist-group/checklist-group.component';
import { MemberPickerComponent } from '../member-picker/member-picker.component';
import { UsersService } from '@services/users.service';
import { Card } from '@models/card.model';
import { Board } from '@models/board.model';

describe('CardModalComponent', () => {
  let component: CardModalComponent;
  let fixture: ComponentFixture<CardModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef>;
  let dialogSpy: jasmine.SpyObj<Dialog>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let cardForm: FormGroup;

  const mockCard: Card = {
    id: 1,
    title: 'Test Card',
    description: JSON.stringify({
      textField: 'Some description',
      checklist: [],
      labels: [{ color: 'green', labelName: 'Feature' }],
      dueDate: '',
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

  function buildCardForm(): FormGroup {
    const fb = new FormBuilder();
    return fb.group({
      cardTitle: ['Test Card', [Validators.required, Validators.maxLength(25)]],
      textDescription: ['Some description', [Validators.maxLength(200)]],
      labels: fb.array([]),
      checklist: fb.array([]),
      dueDate: [''],
    });
  }

  function createComponent(cardOverride?: Card): ComponentFixture<CardModalComponent> {
    const card = cardOverride || mockCard;
    cardForm = buildCardForm();
    const mockInput = {
      cardForm,
      card,
      board: mockBoard,
      listTitle: 'To Do',
      currentUser: null,
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FontAwesomeModule],
      declarations: [CardModalComponent, ChecklistGroupComponent, MemberPickerComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: Dialog, useValue: dialogSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: DIALOG_DATA, useValue: mockInput },
      ],
    }).compileComponents();

    return TestBed.createComponent(CardModalComponent);
  }

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    dialogSpy = jasmine.createSpyObj('Dialog', ['open']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getBoardMembers']);
    usersServiceSpy.getBoardMembers.and.returnValue([]);
  });

  beforeEach(() => {
    fixture = createComponent();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Component creation ---

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept FormGroup via DIALOG_DATA', () => {
    expect(component.cardForm).toBeTruthy();
    expect(component.cardForm.get('cardTitle')).toBeTruthy();
    expect(component.cardForm.get('textDescription')).toBeTruthy();
  });

  // --- Display ---

  it('should display card title in input', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="cardTitle"]');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Test Card');
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
    const plainFixture = createComponent(plainCard);
    const plainComponent = plainFixture.componentInstance;
    expect(plainComponent.description.textField).toBe('plain text');
    expect(plainComponent.description.labels.length).toBe(0);
  });

  // --- Form control writes (no API calls) ---

  it('should write title changes to cardTitle form control', () => {
    component.onTitleChange('New Title');
    expect(component.cardForm.get('cardTitle')!.value).toBe('New Title');
  });

  it('should write description changes to textDescription form control', () => {
    component.onDescriptionChange('Updated description');
    expect(component.cardForm.get('textDescription')!.value).toBe('Updated description');
  });

  it('should append @mention to textDescription on member select', () => {
    const member = mockBoard.members[0];
    component.onMemberSelect(member);
    expect(component.cardForm.get('textDescription')!.value).toContain('@Alice');
  });

  // --- No CardsService dependency ---

  it('should NOT have a persistCard method', () => {
    expect((component as any).persistCard).toBeUndefined();
  });

  it('should NOT have draft variables', () => {
    expect((component as any).titleDraft).toBeUndefined();
    expect((component as any).descriptionDraft).toBeUndefined();
    expect((component as any).editingTitle).toBeUndefined();
    expect((component as any).editingDescription).toBeUndefined();
    expect((component as any).newChecklistName).toBeUndefined();
  });

  it('should NOT have save/cancel edit methods', () => {
    expect((component as any).saveTitle).toBeUndefined();
    expect((component as any).cancelEditTitle).toBeUndefined();
    expect((component as any).saveDescription).toBeUndefined();
    expect((component as any).cancelEditDescription).toBeUndefined();
    expect((component as any).submitNewChecklist).toBeUndefined();
    expect((component as any).startAddChecklist).toBeUndefined();
    expect((component as any).onChecklistGroupDelete).toBeUndefined();
  });

  // --- Close ---

  it('should close dialog without passing card data', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
    // close() should not pass card data — board page handles it
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  // --- Sub-modals ---

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

  // --- Helpers ---

  it('should format due date', () => {
    component.description = {
      ...component.description,
      dueDate: '2026-06-15T14:30:00.000Z',
    };
    expect(component.formattedDueDate).toBeTruthy();
  });

  it('should toggle member picker visibility', () => {
    expect(component.showMemberPicker).toBe(false);
    component.toggleMemberPicker();
    expect(component.showMemberPicker).toBe(true);
    component.toggleMemberPicker();
    expect(component.showMemberPicker).toBe(false);
  });
});
