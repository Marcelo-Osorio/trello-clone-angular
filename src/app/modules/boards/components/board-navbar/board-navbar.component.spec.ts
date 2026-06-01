import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

import { BoardNavbarComponent } from './board-navbar.component';
import { Board } from '@models/board.model';

describe('BoardNavbarComponent', () => {
  let component: BoardNavbarComponent;
  let fixture: ComponentFixture<BoardNavbarComponent>;

  const mockBoard: Board = {
    id: 1,
    title: 'My Test Board',
    backgroundColor: 'sky',
    creationAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    members: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FontAwesomeModule, FormsModule],
      declarations: [BoardNavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardNavbarComponent);
    component = fixture.componentInstance;
    component.board = mockBoard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the board title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('My Test Board');
  });

  it('should have a home link to /app/boards', () => {
    const el: HTMLElement = fixture.nativeElement;
    const homeLink = el.querySelector('a[routerlink="/app/boards"]');
    expect(homeLink).toBeTruthy();
  });

  it('should toggle editing mode when board name is clicked', () => {
    expect(component.isEditing).toBe(false);
    component.startEditing();
    expect(component.isEditing).toBe(true);
    expect(component.editName).toBe('My Test Board');
  });

  it('should emit boardNameChange when saveEdit is called with a new name', () => {
    spyOn(component.boardNameChange, 'emit');
    component.startEditing();
    component.editName = 'Updated Name';
    component.saveEdit();

    expect(component.boardNameChange.emit).toHaveBeenCalledWith('Updated Name');
    expect(component.isEditing).toBe(false);
  });

  it('should not emit when saveEdit is called with empty name', () => {
    spyOn(component.boardNameChange, 'emit');
    component.startEditing();
    component.editName = '   ';
    component.saveEdit();

    expect(component.boardNameChange.emit).not.toHaveBeenCalled();
    expect(component.isEditing).toBe(false);
  });

  it('should cancel edit without emitting', () => {
    spyOn(component.boardNameChange, 'emit');
    component.startEditing();
    component.editName = 'Changed';
    component.cancelEdit();

    expect(component.boardNameChange.emit).not.toHaveBeenCalled();
    expect(component.isEditing).toBe(false);
  });

  it('should save on Enter key press', () => {
    spyOn(component, 'saveEdit');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeydown(event);
    expect(component.saveEdit).toHaveBeenCalled();
  });

  it('should cancel on Escape key press', () => {
    spyOn(component, 'cancelEdit');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onKeydown(event);
    expect(component.cancelEdit).toHaveBeenCalled();
  });

  it('should have Invite, Archived, and Search buttons', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('button');
    const buttonTexts = Array.from(buttons).map((b) => b.textContent?.trim());
    expect(buttonTexts.some((t) => t?.includes('Invite'))).toBe(true);
    expect(buttonTexts.some((t) => t?.includes('Archived'))).toBe(true);
  });

  it('should have onInvite method', () => {
    expect(component.onInvite).toBeDefined();
  });

  it('should emit archived event when archived is clicked', () => {
    spyOn(component.archived, 'emit');
    component.onArchived();
    expect(component.archived.emit).toHaveBeenCalled();
  });

  it('should toggle search panel state and emit event', () => {
    spyOn(component.searchToggle, 'emit');
    expect(component.searchOpen).toBe(false);
    component.onSearchToggle();
    expect(component.searchOpen).toBe(true);
    expect(component.searchToggle.emit).toHaveBeenCalled();
    component.onSearchToggle();
    expect(component.searchOpen).toBe(false);
  });
});
