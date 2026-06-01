import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';

import { InviteDialogComponent } from './invite-dialog.component';
import { UsersService } from '@services/users.service';
import { User } from '@models/user.model';

describe('InviteDialogComponent', () => {
  let component: InviteDialogComponent;
  let fixture: ComponentFixture<InviteDialogComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<void>>;

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.com', avatar: '', creationAt: '', updatedAt: '' },
    { id: 2, name: 'Bob', email: 'bob@test.com', avatar: '', creationAt: '', updatedAt: '' },
  ];

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);
    usersServiceSpy.getUsers.and.returnValue(of(mockUsers));
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [InviteDialogComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: DIALOG_DATA, useValue: { boardId: 1 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(usersServiceSpy.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(2);
  });

  it('should close dialog', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should add member to board', () => {
    component.addMember(mockUsers[0]);
    expect(component.selectedMembers.length).toBe(1);
    expect(component.selectedMembers[0].id).toBe(1);
  });

  it('should remove member from board', () => {
    component.addMember(mockUsers[0]);
    component.removeMember(mockUsers[0].id);
    expect(component.selectedMembers.length).toBe(0);
  });

  it('should save members to localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.addMember(mockUsers[0]);
    component.onSave();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'board-members-1',
      jasmine.any(String)
    );
  });
});
