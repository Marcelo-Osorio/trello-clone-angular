import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SearchPanelComponent } from './search-panel.component';
import { SearchService } from '@services/search.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';

describe('SearchPanelComponent', () => {
  let component: SearchPanelComponent;
  let fixture: ComponentFixture<SearchPanelComponent>;
  let searchService: SearchService;

  const mockBoard: Board = {
    id: 1,
    title: 'Test Board',
    backgroundColor: 'sky',
    creationAt: '2026-01-01',
    updatedAt: '2026-01-01',
    members: [],
    cards: [
      {
        id: 1,
        title: 'Card 1',
        description: JSON.stringify({ dueDates: ['2026-06-15', '2026-07-01'] }),
        position: 0,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 2,
        title: 'Card 2',
        description: JSON.stringify({ dueDates: ['2026-06-15', '2026-08-01'] }),
        position: 1,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [SearchPanelComponent],
      providers: [SearchService],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPanelComponent);
    component = fixture.componentInstance;
    component.board = mockBoard;
    searchService = TestBed.inject(SearchService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should apply term filter on search', () => {
    component.searchTerm = 'test';
    component.onSearchSubmit();
    const filter = searchService.getActiveFilter();
    expect(filter).toEqual({ type: 'term', value: 'test' });
  });

  it('should apply label filter when label clicked', () => {
    const label = { color: 'green' as const, labelName: 'Bug' };
    component.onLabelClick(label);
    const filter = searchService.getActiveFilter();
    expect(filter).toEqual({ type: 'label', value: label });
  });

  it('should apply due date filter when chip clicked', () => {
    component.onDueDateClick('2026-06-15');
    const filter = searchService.getActiveFilter();
    expect(filter).toEqual({ type: 'dueDate', value: '2026-06-15' });
  });

  it('should clear filter', () => {
    searchService.setFilter('term', 'test');
    component.onClearFilter();
    expect(searchService.getActiveFilter()).toBeNull();
  });

  it('should get all due dates from board cards', () => {
    const dates = component.allDueDates;
    expect(dates).toEqual(['2026-06-15', '2026-07-01', '2026-08-01']);
  });

  it('should show only first 5 due dates by default', () => {
    const manyCards: Card[] = [];
    for (let i = 1; i <= 10; i++) {
      manyCards.push({
        id: i,
        title: `Card ${i}`,
        description: JSON.stringify({ dueDates: [`2026-06-${String(i).padStart(2, '0')}`] }),
        position: i,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });
    }
    component.board = { ...mockBoard, cards: manyCards };
    fixture.detectChanges();
    expect(component.visibleDueDates.length).toBe(5);
    expect(component.hasMoreDueDates).toBe(true);
  });

  it('should show all due dates when expanded', () => {
    const manyCards: Card[] = [];
    for (let i = 1; i <= 10; i++) {
      manyCards.push({
        id: i,
        title: `Card ${i}`,
        description: JSON.stringify({ dueDates: [`2026-06-${String(i).padStart(2, '0')}`] }),
        position: i,
        creationAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });
    }
    component.board = { ...mockBoard, cards: manyCards };
    fixture.detectChanges();
    component.showAllDueDates();
    expect(component.visibleDueDates.length).toBe(10);
  });
});
