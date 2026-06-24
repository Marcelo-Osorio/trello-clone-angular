import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { ListComponent } from './list.component';
import { CardPreviewComponent } from '../card-preview/card-preview.component';
import { List } from '@models/list.model';
import { Card } from '@models/card.model';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  function createList(cards: Card[] = []): List {
    return {
      id: 1,
      title: 'To Do',
      position: 0,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
      cards,
    };
  }

  function createCard(id: number, title: string): Card {
    return {
      id,
      title,
      position: id,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropModule, FontAwesomeModule, FormsModule],
      declarations: [ListComponent, CardPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    component.list = createList([createCard(1, 'Card 1'), createCard(2, 'Card 2')]);
    component.listIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the list title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('To Do');
  });

  it('should render card-preview for each card', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cardPreviews = el.querySelectorAll('app-card-preview');
    expect(cardPreviews.length).toBe(2);
  });

  it('should show add card form when button is clicked', () => {
    expect(component.showAddForm).toBe(false);
    component.toggleAddForm();
    expect(component.showAddForm).toBe(true);
  });

  it('should hide add card form on cancel', () => {
    component.toggleAddForm();
    component.newCardTitle = 'Some text';
    component.cancelAdd();
    expect(component.showAddForm).toBe(false);
    expect(component.newCardTitle).toBe('');
  });

  it('should emit addCard when submitCard is called with a title', () => {
    spyOn(component.addCard, 'emit');
    component.newCardTitle = 'New Card';
    component.submitCard();
    expect(component.addCard.emit).toHaveBeenCalledWith({ listId: 1, title: 'New Card' });
    expect(component.showAddForm).toBe(false);
    expect(component.newCardTitle).toBe('');
  });

  it('should not emit addCard when title is empty', () => {
    spyOn(component.addCard, 'emit');
    component.newCardTitle = '   ';
    component.submitCard();
    expect(component.addCard.emit).not.toHaveBeenCalled();
  });

  it('should submit on Enter keydown', () => {
    spyOn(component, 'submitCard');
    component.newCardTitle = 'Test';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onAddKeydown(event);
    expect(component.submitCard).toHaveBeenCalled();
  });

  it('should cancel on Escape keydown', () => {
    spyOn(component, 'cancelAdd');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onAddKeydown(event);
    expect(component.cancelAdd).toHaveBeenCalled();
  });

  it('should emit cardDropped when a card is dropped', () => {
    spyOn(component.cardDropped, 'emit');
    const mockEvent = {
      previousIndex: 0,
      currentIndex: 1,
      item: {} as any,
      container: {} as any,
      previousContainer: {} as any,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
    } as CdkDragDrop<Card[]>;
    component.onCardDrop(mockEvent);
    expect(component.cardDropped.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should emit cardClick when a card is clicked', () => {
    spyOn(component.cardClick, 'emit');
    component.onCardClick(42);
    expect(component.cardClick.emit).toHaveBeenCalledWith(42);
  });

  it('should toggle menu open and closed', () => {
    expect(component.menuOpen).toBe(false);
    component.toggleMenu();
    expect(component.menuOpen).toBe(true);
    component.toggleMenu();
    expect(component.menuOpen).toBe(false);
  });

  it('should emit archiveList when onArchiveList is called', () => {
    spyOn(component.archiveList, 'emit');
    component.onArchiveList();
    expect(component.archiveList.emit).toHaveBeenCalledWith(component.list);
    expect(component.menuOpen).toBe(false);
  });

  it('should emit archiveAllCards when onArchiveAllCards is called', () => {
    spyOn(component.archiveAllCards, 'emit');
    component.onArchiveAllCards();
    expect(component.archiveAllCards.emit).toHaveBeenCalledWith(1);
    expect(component.menuOpen).toBe(false);
  });

  it('should handle list with no cards', () => {
    component.list = createList([]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cardPreviews = el.querySelectorAll('app-card-preview');
    expect(cardPreviews.length).toBe(0);
  });
});
