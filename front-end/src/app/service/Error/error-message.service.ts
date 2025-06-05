import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from './error-dialog/error-dialog.component';
import {SuccessDialogComponent} from "./success-dialog/success-dialog.component";
import {GeneralErrorDialogComponent} from "./general-error-dialog/general-error-dialog.component";


interface ErrorDialogData {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  constructor(private dialog: MatDialog) {
  }

  showValidationErrors(errors: any): void {
    let messages: string[] = [];

    if (errors.firstName) messages.push('📝 : ' + errors.firstName);
    if (errors.lastName) messages.push('📝 : ' + errors.lastName);
    if (errors.email) messages.push('📧 :' + errors.email);
    if (errors.password) messages.push('🔒 : ' + errors.password);


    const fullMessage = messages.join('\n');
    this.dialog.open(ErrorDialogComponent, {
      position: {top: '20px'}, // Position absolue en haut
      panelClass: 'top-position-dialog', // Classe CSS personnalisée
      autoFocus: true,
      restoreFocus: true,
      data: {
        title: 'Erreur de validation',
        message: fullMessage
      }
    });
  }

  showInternalError(): void {
    this.dialog.open(ErrorDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Erreur interne',
        message: 'Une erreur interne est survenue pendant votre requête.'
      }
    });
  }

  showSuccessMessage(message: string, title: string): void {
    this.dialog.open(SuccessDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        title: title,
        message: message
      }
    });
  }

  showErrorMessage(message: string, title: string): void {
    this.dialog.open(GeneralErrorDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        title: title,
        message: message
      }
    });
  }

}
