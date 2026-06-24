import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Observable,
  Subscription,
  concatMap,
  forkJoin,
  map,
  of,
  tap,
} from 'rxjs';

import { BoardsService } from '@services/boards.service';
import { CardsService } from '@services/cards.service';
import { ListsService } from '@services/lists.service';
import { BoardsCacheService } from '@services/boards-cache.service';
import { ArchivedService } from '@services/archived.service';
import { SearchService } from '@services/search.service';
import { AuthService } from '@services/auth.service';
import { LabelRenameEvent, LabelsService } from '@services/labels.service';
import { Board } from '@models/board.model';
import { Card, Label, UpdateCardDto } from '@models/card.model';
import { List } from '@models/list.model';
import { User } from '@models/user.model';
import { CardModalComponent } from '../../components/card-modal/card-modal.component';
import { ArchivedModalComponent } from '../../components/archived-modal/archived-modal.component';
import {
  ValidationPopupComponent,
  ValidationPopupData,
  ValidationPopupResult,
} from '../../components/validation-popup/validation-popup.component';
import { RecentBoardsService } from '@services/recent-boards.service';
import { parseDescription } from '@utils/parse-description';
import { CustomValidators } from '@utils/validators';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  lists: List[] = [];
  loading = true;
  error: string | null = null;
  searchOpen = false;
  showAddListForm = false;
  newListTitle = '';
  currentUser: User | null = null;

  private paramsSub: Subscription | null = null;
  private authSub: Subscription | null = null;
  private labelRenameSub: Subscription | null = null;
  private readonly CONTROL_LABELS: Record<string, string> = {
    cardTitle: 'Title',
    textDescription: 'Description',
    dueDate: 'Due date',
    groupName: 'Checklist name',
    itemName: 'Item',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardsService: BoardsService,
    private cardsService: CardsService,
    private listsService: ListsService,
    private boardsCacheService: BoardsCacheService,
    private archivedService: ArchivedService,
    private searchService: SearchService,
    private authService: AuthService,
    private dialog: Dialog,
    private recentBoardsService: RecentBoardsService,
    private formBuilder: FormBuilder,
    private labelsService: LabelsService,
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.loadBoard(id);
      }
    });
    this.authSub = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
    this.labelRenameSub = this.labelsService
      .getRenamedLabels$()
      .pipe(concatMap((event) => this.syncRenamedLabelAcrossCards(event)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.labelRenameSub?.unsubscribe();
  }

  onBoardNameChange(newName: string): void {
    if (!this.board || !newName.trim()) {
      return;
    }
    this.boardsService
      .updateBoard(this.board.id, { title: newName.trim() })
      .subscribe({
        next: (updated) => {
          this.board = updated;
        },
      });
  }

  onSearchToggle(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchService.clearFilter();
    }
  }

  onArchived(): void {
    if (!this.board) return;
    this.dialog
      .open<void>(ArchivedModalComponent, {
        data: {
          boardId: this.board.id,
          lists: this.lists,
        },
      })
      .closed.subscribe(() => {
        // Reload board after recovery
        if (this.board) {
          this.loadBoard(this.board.id);
        }
      });
  }

  onSearchClose(): void {
    this.searchOpen = false;
    this.searchService.clearFilter();
  }

  get filteredLists(): List[] {
    if (!this.searchService.getActiveFilter()) {
      return this.lists;
    }
    return this.lists.map((list) => ({
      ...list,
      cards: this.searchService.filterCards(list.cards || []),
    }));
  }

  get cardDropListIds(): string[] {
    return this.lists.map((list) => `card-drop-${list.id}`);
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetList: List): void {
    if (event.previousContainer === event.container) {
      // Reorder within same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const movedCard = event.container.data[event.currentIndex];
      if (movedCard && this.board) {
        this.cardsService
          .updateCard(movedCard.id, {
            title: movedCard.title,
            description: movedCard.description,
            position: event.currentIndex,
            listId: targetList.id,
            boardId: this.board.id,
          })
          .subscribe({
            next: () => {
              this.boardsCacheService.removeBoardDetail(this.board!.id);
            },
          });
      }
    } else {
      // Transfer between lists
      const card = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if (card && this.board) {
        this.cardsService
          .updateCard(card.id, {
            title: card.title,
            description: card.description,
            position: event.currentIndex,
            listId: targetList.id,
            boardId: this.board.id,
          })
          .subscribe({
            next: () => {
              this.boardsCacheService.removeBoardDetail(this.board!.id);
            },
          });
      }
    }
  }

  onListDrop(event: CdkDragDrop<List[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.lists, event.previousIndex, event.currentIndex);
    }
  }

  onAddCard(event: { listId: number; title: string }): void {
    if (!this.board) {
      return;
    }
    const targetList = this.lists.find((l) => l.id === event.listId);
    if (!targetList) {
      return;
    }
    const nextPosition = (targetList.cards || []).length;
    this.cardsService
      .createCard({
        title: event.title,
        listId: event.listId,
        boardId: this.board.id,
        position: nextPosition,
        description: '',
      })
      .subscribe({
        next: (newCard) => {
          this.boardsCacheService.removeBoardDetail(this.board!.id);
          if (!targetList.cards) {
            targetList.cards = [];
          }
          targetList.cards.push(newCard);
        },
      });
  }

  onArchiveList(list: List): void {
    if (!this.board) {
      return;
    }

    const currentList = this.lists.find((candidate) => candidate.id === list.id);
    if (!currentList) {
      return;
    }

    const didArchive = this.archivedService.archiveList(this.board.id, currentList);
    if (didArchive) {
      this.lists = this.lists.filter((candidate) => candidate.id !== currentList.id);
    }
  }

  onArchiveAllCards(listId: number): void {
    if (!this.board) {
      return;
    }
    const list = this.lists.find((l) => l.id === listId);
    if (!list || !list.cards) {
      return;
    }
    list.cards.forEach((card) => {
      this.archivedService.archiveCard(this.board!.id, card);
    });
    list.cards = [];
  }

  toggleAddListForm(): void {
    this.showAddListForm = !this.showAddListForm;
    if (!this.showAddListForm) {
      this.newListTitle = '';
    }
  }

  cancelAddList(): void {
    this.showAddListForm = false;
    this.newListTitle = '';
  }

  addList(): void {
    const title = this.newListTitle.trim();
    if (!title || !this.board) {
      return;
    }
    const position = this.lists.length;
    this.listsService
      .createList({ title, boardId: this.board.id, position })
      .subscribe({
        next: (newList) => {
          this.boardsCacheService.removeBoardDetail(this.board!.id);
          this.lists.push(newList);
          this.newListTitle = '';
          this.showAddListForm = false;
        },
      });
  }

  onAddListKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addList();
    } else if (event.key === 'Escape') {
      this.cancelAddList();
    }
  }

  onCardClick(cardId: number): void {
    if (!this.board) return;

    const cardContext = this.findCardContext(cardId);
    if (!cardContext) return;

    const cardForm = this.buildCardForm(cardContext.card);
    this.openCardModal(
      cardContext.card,
      cardContext.listId,
      cardContext.listTitle,
      cardForm,
    );
  }

  private openCardModal(
    card: Card,
    listId: number,
    listTitle: string,
    cardForm: FormGroup,
  ): void {
    if (!this.board) {
      return;
    }

    this.dialog
      .open<void>(CardModalComponent, {
        data: {
          cardForm,
          card,
          board: this.board,
          listTitle,
          currentUser: this.currentUser,
        },
        width: '800px',
        maxHeight: '90vh',
      })
      .closed.subscribe(() => {
        this.onCardModalClose(card, listId, listTitle, cardForm);
      });
  }

  private onCardModalClose(
    card: Card,
    listId: number,
    listTitle: string,
    cardForm: FormGroup,
  ): void {
    if (!this.board) {
      return;
    }

    if (cardForm.invalid) {
      cardForm.markAllAsTouched();
      this.openValidationPopup(card, listId, listTitle, cardForm);
      return;
    }

    const labelChanges = this.collectLabelChanges(card, cardForm);
    this.applyLabelChanges(card.id, labelChanges);

    const updateDto = this.buildUpdateCardDto(card, listId, cardForm);
    this.cardsService.updateCard(card.id, updateDto).subscribe({
      next: (updatedCard) => {
        this.refreshCardInLists(updatedCard);
        this.boardsCacheService.removeBoardDetail(this.board!.id);
      },
    });
  }

  private openValidationPopup(
    card: Card,
    listId: number,
    listTitle: string,
    cardForm: FormGroup,
  ): void {
    const errors = this.collectFormErrors(cardForm);
    this.dialog
      .open<ValidationPopupResult, ValidationPopupData>(
        ValidationPopupComponent,
        {
          data: { errors },
          disableClose: true,
        },
      )
      .closed.subscribe((result) => {
        if (result?.action === 'continue') {
          this.openCardModal(card, listId, listTitle, cardForm);
        }
      });
  }

  private refreshCardInLists(updatedCard: Card): void {
    for (const list of this.lists) {
      const cards = list.cards || [];
      const idx = cards.findIndex((c) => c.id === updatedCard.id);
      if (idx !== -1) {
        cards[idx] = updatedCard;
        break;
      }
    }
  }

  private findCardContext(
    cardId: number,
  ): { card: Card; listId: number; listTitle: string } | null {
    for (const list of this.lists) {
      const found = (list.cards || []).find(
        (candidate) => candidate.id === cardId,
      );
      if (found) {
        return {
          card: found,
          listId: list.id,
          listTitle: list.title,
        };
      }
    }

    return null;
  }

  private buildUpdateCardDto(
    card: Card,
    listId: number,
    cardForm: FormGroup,
  ): UpdateCardDto {
    const formValue = cardForm.getRawValue();
    const labels = ((formValue.labels || []) as Label[]).map((label) =>
      this.normalizeLabel(label),
    );
    const description = JSON.stringify({
      textField: formValue.textDescription,
      checklist: formValue.checklist,
      labels,
      dueDate: formValue.dueDate || '',
    });

    return {
      title: (formValue.cardTitle || '').trim(),
      description,
      position: card.position,
      listId,
      boardId: this.board?.id ?? 0,
    };
  }

  private collectFormErrors(
    cardForm: FormGroup,
  ): { control: string; message: string }[] {
    const errors: { control: string; message: string }[] = [];

    Object.keys(cardForm.controls).forEach((key) => {
      const control = cardForm.get(key);

      if (control && control.invalid) {
        if (control.errors) {
          const label = this.CONTROL_LABELS[key] || 'Field';
          Object.keys(control.errors).forEach((errorKey) => {
            errors.push({
              control: label,
              message: this.getErrorMessage(
                label,
                errorKey,
                control.errors![errorKey],
              ),
            });
          });
        }

        if (control instanceof FormArray) {
          control.controls.forEach((group, index) => {
            if (group instanceof FormGroup) {
              Object.keys(group.controls).forEach((subKey) => {
                const subControl = group.get(subKey);
                if (subControl?.errors) {
                  const baseLabel = this.CONTROL_LABELS[subKey] || 'Element';
                  const labelWithIndex = `${baseLabel} ${index + 1}`;

                  Object.keys(subControl.errors).forEach((errorKey) => {
                    errors.push({
                      control: labelWithIndex,
                      message: this.getErrorMessage(
                        labelWithIndex,
                        errorKey,
                        subControl.errors![errorKey],
                      ),
                    });
                  });
                }
              });
            }
          });
        }
      }
    });

    return errors;
  }

  private getErrorMessage(
    controlLabel: string,
    errorKey: string,
    errorValue: any,
  ): string {
    const errorMessages: Record<string, string> = {
      required: `${controlLabel} is required.`,
      dateAfterNow: 'The date must be later than the current time.',
      maxlength: `${controlLabel} cannot exceed ${errorValue?.requiredLength} characters.`,
      minlength: `${controlLabel} must be at least ${errorValue?.requiredLength} characters.`,
    };

    return errorMessages[errorKey] || `${controlLabel} has an invalid value.`;
  }

  private buildCardForm(card: Card): FormGroup {
    const desc = parseDescription(card.description);
    const labels = this.formBuilder.array(
      desc.labels.map((label) =>
        this.formBuilder.group({
          labelName: [this.normalizeLabel(label).labelName],
          color: [label.color],
        }),
      ),
    ) as FormArray;
    const checklist = this.formBuilder.array(
      desc.checklist.map((group) =>
        this.formBuilder.group({
          groupName: [group.groupName],
          items: this.formBuilder.array(
            group.items.map((item) =>
              this.formBuilder.group({
                item: [item.item],
                checked: [item.checked],
              }),
            ),
          ),
        }),
      ),
    ) as FormArray;

    return this.formBuilder.group({
      cardTitle: [card.title, [Validators.required, Validators.maxLength(25)]],
      textDescription: [desc.textField, [Validators.maxLength(200)]],
      labels,
      checklist,
      dueDate: [desc.dueDate, [CustomValidators.dateAfterNow()]],
    });
  }

  private collectLabelChanges(
    card: Card,
    cardForm: FormGroup,
  ): {
    newLabels: Label[];
    addedExistingLabels: Label[];
    renamedExistingLabels: Label[];
    removedLabels: Label[];
  } {
    const originalLabels = parseDescription(card.description).labels.map(
      (label) => this.normalizeLabel(label),
    );

    const finalLabels = (
      ((cardForm.getRawValue().labels as Label[]) || []) as Label[]
    ).map((label) => this.normalizeLabel(label));
    const serviceLabels = this.labelsService.getLabelsSnapshot();

    const originalByColor = new Map(
      originalLabels.map((label) => [label.color, label]),
    );
    const finalByColor = new Map(
      finalLabels.map((label) => [label.color, label]),
    );
    const serviceByColor = new Map(
      serviceLabels.map((label) => [label.color, label]),
    );

    const newLabels: Label[] = [];
    const addedExistingLabels: Label[] = [];
    const renamedExistingLabels: Label[] = [];
    const removedLabels: Label[] = [];

    for (const label of finalLabels) {
      const serviceLabel = serviceByColor.get(label.color);
      const originalLabel = originalByColor.get(label.color);

      if (!serviceLabel) {
        newLabels.push(label);
        continue;
      }

      if (!originalLabel) {
        addedExistingLabels.push(label);
      }

      if (serviceLabel.labelName !== label.labelName) {
        renamedExistingLabels.push(label);
      }
    }

    for (const label of originalLabels) {
      if (!finalByColor.has(label.color)) {
        removedLabels.push(label);
      }
    }

    return {
      newLabels,
      addedExistingLabels,
      renamedExistingLabels,
      removedLabels,
    };
  }

  private applyLabelChanges(
    cardId: number,
    changes: {
      newLabels: Label[];
      addedExistingLabels: Label[];
      renamedExistingLabels: Label[];
      removedLabels: Label[];
    },
  ): void {
    if (!this.board) {
      return;
    }

    changes.newLabels.forEach((label) => {
      this.labelsService.addLabelToCard(
        this.board!.id,
        label.color,
        label.labelName,
        cardId,
      );
    });

    changes.addedExistingLabels.forEach((label) => {
      this.labelsService.addLabelToCard(
        this.board!.id,
        label.color,
        label.labelName,
        cardId,
      );
    });

    changes.renamedExistingLabels.forEach((label) => {
      this.labelsService.renameLabel(
        this.board!.id,
        label.color,
        label.labelName,
        cardId,
      );
    });

    changes.removedLabels.forEach((label) => {
      this.labelsService.removeLabelFromCard(
        this.board!.id,
        label.color,
        cardId,
      );
    });
  }

  private syncRenamedLabelAcrossCards(
    event: LabelRenameEvent,
  ): Observable<void> {
    if (!this.board) {
      return of(void 0);
    }

    const updates = event.affectedCardIds
      .filter((cardId) => cardId !== event.sourceCardId)
      .map((cardId) => this.buildRenamedLabelUpdateRequest(cardId, event))
      .filter((request): request is Observable<Card> => request !== null);

    if (updates.length === 0) {
      return of(void 0);
    }

    return forkJoin(updates).pipe(
      tap((updatedCards) => {
        updatedCards.forEach((updatedCard) =>
          this.refreshCardInLists(updatedCard),
        );
        this.boardsCacheService.removeBoardDetail(this.board!.id);
      }),
      map(() => void 0),
    );
  }

  private buildRenamedLabelUpdateRequest(
    cardId: number,
    event: LabelRenameEvent,
  ): Observable<Card> | null {
    if (!this.board) {
      return null;
    }

    const cardContext = this.findCardContext(cardId);
    if (!cardContext) {
      return null;
    }

    const description = parseDescription(cardContext.card.description);
    let didChange = false;
    const updatedLabels = description.labels.map((label) => {
      const normalizedLabel = this.normalizeLabel(label);
      if (normalizedLabel.color !== event.color) {
        return normalizedLabel;
      }

      didChange = true;
      return {
        ...normalizedLabel,
        labelName: event.labelName,
      };
    });

    if (!didChange) {
      return null;
    }

    return this.cardsService.updateCard(cardContext.card.id, {
      title: cardContext.card.title,
      description: JSON.stringify({
        ...description,
        labels: updatedLabels,
      }),
      position: cardContext.card.position,
      listId: cardContext.listId,
      boardId: this.board.id,
    });
  }

  private normalizeLabel(label: Label): Label {
    return {
      color: label.color,
      labelName:
        label.labelName?.trim() || this.labelsService.getAutoName(label.color),
    };
  }

  private loadBoard(id: number): void {
    this.loading = true;
    this.error = null;
    this.boardsService.getBoardById(id).subscribe({
      next: (board) => {
        this.recentBoardsService.pushBoard(board);
        this.board = board;
        this.lists = this.filterArchived(board);
        const cards = this.lists.flatMap((list) => list.cards || []);
        this.labelsService.initFromBoard(id, cards);
        this.loading = false;

        // Clean stale archived entries
        const serverListIds = (board.lists || []).map((l) => l.id);
        const serverCardIds = (board.cards || []).map((c) => c.id);
        this.archivedService.cleanStale(id, serverListIds, serverCardIds);
      },
      error: () => {
        this.error = 'Failed to load board. Please try again.';
        this.loading = false;
      },
    });
  }

  private filterArchived(board: Board): List[] {
    const archivedListIds = new Set(
      this.archivedService
        .getArchivedListIds(board.id)
        .map((archivedListId) => archivedListId.listID),
    );
    const archivedCardIds = new Set(
      this.archivedService.getArchived(board.id).cards.map((card) => card.id),
    );

    const lists = board.lists || [];
    return lists
      .filter((list) => !archivedListIds.has(list.id))
      .map((list) => ({
        ...list,
        cards: (list.cards || []).filter(
          (card) => !archivedCardIds.has(card.id),
        ),
      }));
  }
}
