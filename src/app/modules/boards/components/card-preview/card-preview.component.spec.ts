import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CardPreviewComponent } from './card-preview.component';
import { Card, CardDescription } from '@models/card.model';

describe('CardPreviewComponent', () => {
  let component: CardPreviewComponent;
  let fixture: ComponentFixture<CardPreviewComponent>;

  function createCard(overrides: Partial<Card> = {}): Card {
    return {
      id: 1,
      title: 'Test Card',
      position: 0,
      creationAt: '2026-01-01',
      updatedAt: '2026-01-01',
      ...overrides,
    };
  }

  function buildDescription(desc: Partial<CardDescription>): string {
    return JSON.stringify({
      textField: '',
      checklist: [],
      labels: [],
      dueDate: '',
      ...desc,
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropModule, FontAwesomeModule],
      declarations: [CardPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.card = createCard();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the card title', () => {
    component.card = createCard({ title: 'My Task' });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('My Task');
  });

  it('should emit cardClick with card id when clicked', () => {
    component.card = createCard({ id: 42 });
    fixture.detectChanges();
    spyOn(component.cardClick, 'emit');
    component.onCardClick();
    expect(component.cardClick.emit).toHaveBeenCalledWith(42);
  });

  describe('labels strip', () => {
    it('should not render labels strip when no labels', () => {
      component.card = createCard();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const labels = el.querySelectorAll('.rounded-full');
      expect(labels.length).toBe(0);
    });

    it('should render colored bars for each label', () => {
      component.card = createCard({
        description: buildDescription({
          labels: [
            { color: 'green', labelName: 'Feature' },
            { color: 'red', labelName: 'Bug' },
          ],
        }),
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const labels = el.querySelectorAll('.rounded-full');
      expect(labels.length).toBe(2);
      expect(labels[0].classList.contains('bg-green-500')).toBe(true);
      expect(labels[1].classList.contains('bg-red-500')).toBe(true);
    });
  });

  describe('checklist badge', () => {
    it('should not render checklist badge when no checklists', () => {
      component.card = createCard();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('fa-icon')).toBeFalsy();
    });

    it('should render checklist count badge', () => {
      component.card = createCard({
        description: buildDescription({
          checklist: [
            {
              groupName: 'Tasks',
              items: [
                { item: 'Task 1', checked: true },
                { item: 'Task 2', checked: false },
                { item: 'Task 3', checked: true },
              ],
            },
          ],
        }),
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('2/3');
    });
  });

  describe('parseDescription', () => {
    it('should handle plain text description gracefully', () => {
      component.card = createCard({ description: 'plain text' });
      fixture.detectChanges();
      expect(component.parsedDescription.textField).toBe('plain text');
      expect(component.hasLabels).toBe(false);
      expect(component.checklistStats).toBeNull();
    });
  });
});
