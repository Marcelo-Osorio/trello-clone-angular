import { Component, Inject, Optional } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Board, BoardBackgroundColor, UpdateBoardDto } from '@models/board.model';
import { BOARD_COLOR_MAP } from '@boards/utils/board-colors';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { faClose, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-update-board-dialog',
  template: `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-900">Update board</h2>
        <button
          type="button"
          (click)="close(false)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <fa-icon [icon]="faClose" class="text-lg"></fa-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="update-title" class="block text-sm font-medium text-gray-700 mb-1">Board title</label>
          <input
            id="update-title"
            type="text"
            formControlName="title"
            placeholder="e.g. Project planning"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            [class.border-red-500]="form.get('title')?.invalid && form.get('title')?.touched"
          />
          <p *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="mt-1 text-xs text-red-500">
            Title is required
          </p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Background color</label>
          <div class="flex gap-3">
            <button
              *ngFor="let color of availableColors"
              type="button"
              (click)="selectColor(color)"
              [ngClass]="BOARD_COLOR_MAP[color]"
              class="w-12 h-12 rounded-lg transition-all border-2"
              [class.border-white]="form.get('backgroundColor')?.value === color"
              [class.border-transparent]="form.get('backgroundColor')?.value !== color"
              [class.ring-2]="form.get('backgroundColor')?.value === color"
              [class.ring-offset-2]="form.get('backgroundColor')?.value === color"
              [class.ring-sky-500]="form.get('backgroundColor')?.value === color"
              [class.scale-110]="form.get('backgroundColor')?.value === color"
            >
              <fa-icon
                *ngIf="form.get('backgroundColor')?.value === color"
                [icon]="faCheck"
                class="text-white"
              ></fa-icon>
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="close(false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="form.invalid"
            class="px-4 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  `
})
export class UpdateBoardDialogComponent {
  form: FormGroup;
  availableColors: BoardBackgroundColor[] = ['sky', 'green', 'violet', 'yellow'];
  BOARD_COLOR_MAP = BOARD_COLOR_MAP;
  faClose = faClose;
  faCheck = faCheck;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(DIALOG_DATA) public data: { board: Board },
    @Optional() private dialogRef: DialogRef<UpdateBoardDialogComponent>
  ) {
    this.form = this.formBuilder.group({
      title: [data.board.title, Validators.required],
      backgroundColor: [data.board.backgroundColor as BoardBackgroundColor, Validators.required],
    });
  }

  selectColor(color: BoardBackgroundColor): void {
    this.form.patchValue({ backgroundColor: color });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.close(this.form.value as UpdateBoardDto);
    }
  }

  close(result: any): void {
    if (this.dialogRef) {
      this.dialogRef.close(result);
    }
  }
}
