import { BoardBackgroundColor } from '@models/board.model';

export const BOARD_COLOR_MAP: Record<BoardBackgroundColor, string> = {
  sky: 'bg-sky-700',
  green: 'bg-green-700',
  violet: 'bg-violet-700',
  yellow: 'bg-amber-600',
};

export const BOARD_COLOR_HOVER_MAP: Record<BoardBackgroundColor, string> = {
  sky: 'hover:bg-sky-600',
  green: 'hover:bg-green-600',
  violet: 'hover:bg-violet-600',
  yellow: 'hover:bg-amber-500',
};