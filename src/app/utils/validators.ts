import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from "@services/auth.service";
import { map } from "rxjs/operators";

export class CustomValidators {
  static MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }

  static validEmail(control:AbstractControl) {
    const value = control.value;
    if (value.indexOf(".com") !== -1) {
      return null;
    }
    return {email_invalid:true};
  }

  static dateAfterNow(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return inputDate <= today ? { dateAfterNow: true } : null;
    };
  }

  static validateExistingEmail(service : AuthService) {
    return (control : AbstractControl) => {
      const email = control.value;

      return service.emailExists(email)
      .pipe(
        map(response => {
          console.log(response);
          if (response.isAvailable) {
            return null;
          }
          return {not_available:true};
        })
      )
    }
  }
}
