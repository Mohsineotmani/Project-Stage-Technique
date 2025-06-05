import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormNoteComponent } from './form-note/form-note.component';
import { NotesComponent } from './notes/notes.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './service/securityService/auth.interceptor';
import { AnnonceListComponent } from './annonce-list/annonce-list.component';
import { AnnonceFormComponent } from './annonce-form/annonce-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { InscriptionComponent } from './inscription/inscription.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ListeAnnonceCandidatComponent } from './liste-annonce-candidat/liste-annonce-candidat.component';
import { ResultatConcoursEcritComponent } from './resultat-concours-ecrit/resultat-concours-ecrit.component';
import { InscriptionFormComponent } from './inscription-form/inscription-form.component';
import { DetailCandidatComponent } from './detail-candidat/detail-candidat.component';
import { PreInscriptionsComponent } from './pre-inscriptions/pre-inscriptions.component';
import { ProfilComponent } from './profil/profil.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ConvocationEcritComponent } from './convocation-ecrit/convocation-ecrit.component';
import { ResultatsOraleComponent } from './resultats-orale/resultats-orale.component';
import { GestionResultatsOralComponent } from './gestion-resultats-oral/gestion-resultats-oral.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {ErrorDialogComponent} from "./service/Error/error-dialog/error-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {SuccessDialogComponent} from "./service/Error/success-dialog/success-dialog.component";
import {OralNotesComponent} from "./oral-notes/oral-notes.component";
import {EcritNotesComponent} from "./ecrit-notes/ecrit-notes.component";
import {FormEcritNoteComponent} from "./form-ecrit-note/form-ecrit-note.component";
import {FormOralNoteComponent} from "./form-oral-note/form-oral-note.component";
import {ResultatConcoursOralComponent} from "./resultat-concours-oral/resultat-concours-oral.component";
import { GeneralErrorDialogComponent } from './service/Error/general-error-dialog/general-error-dialog.component';



@NgModule({
  declarations: [
    AppComponent,
    FormNoteComponent,
    NotesComponent,
    AnnonceListComponent,
    AnnonceFormComponent,
    LoginComponent,
    InscriptionComponent,
    ForgotPasswordComponent,
    ListeAnnonceCandidatComponent,
    ResultatConcoursEcritComponent,
    InscriptionFormComponent,
    DetailCandidatComponent,
    PreInscriptionsComponent,
    ProfilComponent,
    EditProfileComponent,
    ConvocationEcritComponent,
    ResultatsOraleComponent,
    GestionResultatsOralComponent,
    DashboardComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    OralNotesComponent,
    EcritNotesComponent,
    FormOralNoteComponent,
    FormEcritNoteComponent,
    ResultatConcoursOralComponent,
    GeneralErrorDialogComponent

   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule  ,
    CommonModule,
    RegisterComponent,
    MatDialogModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
