import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ChecklistGroupComponent } from './checklist-group.component';
import { ChecklistGroup } from '@models/card.model';

describe('ChecklistGroupComponent', () => {
  let component: ChecklistGroupComponent;
  let fixture: ComponentFixture<ChecklistGroupComponent>;

  function createGroup(overrides: Partial<ChecklistGroup> = {}): ChecklistGroup {
    return {
      groupName: 'Test Checklist',
      items: [
        { item: 'Task 1', checked: false },
        { item: 'Task 2', checked: true },
        { item: 'Task 3', checked: false },
      ],
      ...overrides,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [ChecklistGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistGroupComponent);
    component = fixture.componentInstance;
    component.group = createGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display group name', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Checklist');
  });

  it('should calculate progress correctly', () => {
    expect(component.totalItems).toBe(3);
    expect(component.checkedItems).toBe(1);
    expect(component.progressPercent).toBe(33);
  });

  it('should toggle item checked state', () => {
    spyOn(component.groupChange, 'emit');
    component.toggleItem(0);
    expect(component.group.items[0].checked).toBe(true);
    expect(component.groupChange.emit).toHaveBeenCalled();
  });

  it('should toggle expanded state', () => {
    expect(component.expanded).toBe(true);
    component.toggleExpanded();
    expect(component.expanded).toBe(false);
  });

  it('should toggle hide checked items', () => {
    expect(component.hideChecked).toBe(false);
    component.toggleHideChecked();
    expect(component.hideChecked).toBe(true);
    expect(component.visibleItems.length).toBe(2);
  });

  it('should add a new item', () => {
    spyOn(component.groupChange, 'emit');
    component.addingItem = true;
    component.newItemText = 'New Task';
    component.submitNewItem();
    expect(component.group.items.length).toBe(4);
    expect(component.group.items[3].item).toBe('New Task');
    expect(component.groupChange.emit).toHaveBeenCalled();
  });

  it('should not add empty item', () => {
    component.addingItem = true;
    component.newItemText = '   ';
    component.submitNewItem();
    expect(component.group.items.length).toBe(3);
  });

  it('should emit groupDelete when delete is clicked', () => {
    spyOn(component.groupDelete, 'emit');
    component.deleteGroup();
    expect(component.groupDelete.emit).toHaveBeenCalled();
  });

  it('should save title on saveTitle()', () => {
    spyOn(component.groupChange, 'emit');
    component.editingTitle = true;
    component.titleDraft = 'Updated Name';
    component.saveTitle();
    expect(component.group.groupName).toBe('Updated Name');
    expect(component.groupChange.emit).toHaveBeenCalled();
    expect(component.editingTitle).toBe(false);
  });

  it('should handle empty items', () => {
    component.group = createGroup({ items: [] });
    fixture.detectChanges();
    expect(component.totalItems).toBe(0);
    expect(component.progressPercent).toBe(0);
  });
});
