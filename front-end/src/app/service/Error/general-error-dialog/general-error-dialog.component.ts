import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";


export interface ErrorDialogData {
  title: string;
  message: string;
}


@Component({
  selector: 'app-general-error-dialog',
  templateUrl: './general-error-dialog.component.html',
  styleUrls: ['./general-error-dialog.component.scss']
})
export class GeneralErrorDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<GeneralErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {
  }

  close(): void {
    this.dialogRef.close();
  }
}
