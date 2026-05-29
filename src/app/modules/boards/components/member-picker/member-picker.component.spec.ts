import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MemberPickerComponent } from './member-picker.component';
import { User } from '@models/user.model';

describe('MemberPickerComponent', () => {
  let component: MemberPickerComponent;
  let fixture: ComponentFixture<MemberPickerComponent>;

  const mockMembers: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@test.com', avatar: '', creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 2, name: 'Bob Smith', email: 'bob@test.com', avatar: '', creationAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@test.com', avatar: '', creationAt: '2026-01-01', updatedAt: '2026-01-01' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [MemberPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberPickerComponent);
    component = fixture.componentInstance;
    component.members = mockMembers;
    component.selectedIds = [1];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all members', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Alice Johnson');
    expect(el.textContent).toContain('Bob Smith');
    expect(el.textContent).toContain('Charlie Brown');
  });

  it('should show check icon for selected members', () => {
    expect(component.isSelected(mockMembers[0])).toBe(true);
    expect(component.isSelected(mockMembers[1])).toBe(false);
  });

  it('should emit memberSelect when member is clicked', () => {
    spyOn(component.memberSelect, 'emit');
    component.toggleMember(mockMembers[1]);
    expect(component.memberSelect.emit).toHaveBeenCalledWith(mockMembers[1]);
  });

  it('should get initials from name', () => {
    expect(component.getInitials('Alice Johnson')).toBe('AJ');
    expect(component.getInitials('Bob')).toBe('B');
    expect(component.getInitials('Charlie Brown Davis')).toBe('CB');
  });

  it('should show empty message when no members', () => {
    component.members = [];
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No members available');
  });
});
