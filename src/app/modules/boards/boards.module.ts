import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DialogModule } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@shared/shared.module';
import { BoardsRoutingModule } from './boards-routing.module';
import { BoardsComponent } from './pages/boards/boards.component';
import { BoardComponent } from './pages/board/board.component';
import { TodoDialogComponent } from './components/todo-dialog/todo-dialog.component';
import { BoardCardComponent } from './components/board-card/board-card.component';
import { CreateBoardDialogComponent } from './components/create-board-dialog/create-board-dialog.component';
import { UpdateBoardDialogComponent } from './components/update-board-dialog/update-board-dialog.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { BoardNavbarComponent } from './components/board-navbar/board-navbar.component';
import { ListComponent } from './components/list/list.component';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { CardModalComponent } from './components/card-modal/card-modal.component';
import { LabelsModalComponent } from './components/labels-modal/labels-modal.component';
import { DueDateModalComponent } from './components/due-date-modal/due-date-modal.component';
import { ChecklistGroupComponent } from './components/checklist-group/checklist-group.component';
import { MemberPickerComponent } from './components/member-picker/member-picker.component';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { ArchivedModalComponent } from './components/archived-modal/archived-modal.component';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';
import { ValidationPopupComponent } from './components/validation-popup/validation-popup.component';

@NgModule({
  declarations: [
    BoardsComponent,
    BoardComponent,
    TodoDialogComponent,
    BoardCardComponent,
    CreateBoardDialogComponent,
    UpdateBoardDialogComponent,
    SkeletonLoaderComponent,
    BoardNavbarComponent,
    ListComponent,
    CardPreviewComponent,
    CardModalComponent,
    LabelsModalComponent,
    DueDateModalComponent,
    ChecklistGroupComponent,
    MemberPickerComponent,
    SearchPanelComponent,
    ArchivedModalComponent,
    InviteDialogComponent,
    ValidationPopupComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BoardsRoutingModule,
    SharedModule,
    DragDropModule,
    CdkAccordionModule,
    DialogModule,
    ScrollingModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatCheckboxModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule,
  ]
})
export class BoardsModule { }
