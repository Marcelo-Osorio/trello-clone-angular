import { FormControl } from '@angular/forms';
import { CustomValidators } from './validators';

describe('CustomValidators', () => {
  describe('dateAfterNow', () => {
    it('should return dateAfterNow error for a past date (yesterday)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday.toISOString());
      const result = CustomValidators.dateAfterNow()(control);
      expect(result).toEqual({ dateAfterNow: true });
    });

    it('should return null for a future date (tomorrow)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow.toISOString());
      const result = CustomValidators.dateAfterNow()(control);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const control = new FormControl('');
      const result = CustomValidators.dateAfterNow()(control);
      expect(result).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const result = CustomValidators.dateAfterNow()(control);
      expect(result).toBeNull();
    });

    it('should return dateAfterNow error for today (date must be AFTER now, not equal)', () => {
      const today = new Date();
      const control = new FormControl(today.toISOString());
      const result = CustomValidators.dateAfterNow()(control);
      expect(result).toEqual({ dateAfterNow: true });
    });
  });
});