import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../service/securityService/auth.service';
import { SignupRequest } from '../models/signup-request';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {ErrorDialogComponent} from "../service/Error/error-dialog/error-dialog.component";
import {ErrorMessageService} from "../service/Error/error-message.service";


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']

})
export class RegisterComponent {

  constructor(
    private integrationService: AuthService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) { }

  request: SignupRequest = new SignupRequest;
  msg: string | undefined;
  showSuccess: boolean = false;
  validationErrors: any = {};


  signupForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  public onSubmit() {

    const formValue =  this.signupForm.value;

    this.request.firstName = formValue.firstName;
    this.request.lastName = formValue.lastName;
    this.request.email = formValue.email;
    this.request.password = formValue.password;

    if (this.signupForm.valid) {
      console.log("Form is valid");

      this.integrationService.doRegister(this.request).subscribe({
        next: (res) => {
          console.log("integrationService : " ,res.response);

          this.msg = res.response;
           // Automatically hide the success message after 5 seconds
           this.showSuccess = true;
           setTimeout(() => {
             this.showSuccess = false; // Cacher le message après 20 secondes
           }, 20000);

           this.router.navigate(['/login']);
        }, error: (err) => {
          if (err.status === 500 || err.status === 400) {
            this.validationErrors =  err.error;// 👈 erreurs de validation par champ
            console.log(this.validationErrors.message);
          } else {
            this.errorMessageService.showInternalError();
          }
          console.log("Error Received:", err);
        }
      })
    } else {
      this.showSuccess = true;
      console.log("On submit failed.");
    }
  }
}
