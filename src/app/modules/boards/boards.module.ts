import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DialogModule } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
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

@NgModule({
  declarations: [
    BoardsComponent,
    BoardComponent,
    TodoDialogComponent,
    BoardCardComponent,
    CreateBoardDialogComponent,
    UpdateBoardDialogComponent,
    SkeletonLoaderComponent,
  ],
  imports: [
    CommonModule,
    BoardsRoutingModule,
    SharedModule,
    DragDropModule,
    CdkAccordionModule,
    DialogModule,
    ScrollingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule,
  ]
})
export class BoardsModule { }