import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotesComponent } from './notes/notes.component';
import { FormNoteComponent } from './form-note/form-note.component';
import { AnnonceListComponent } from './annonce-list/annonce-list.component';
import { AnnonceFormComponent } from './annonce-form/annonce-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ListeAnnonceCandidatComponent } from './liste-annonce-candidat/liste-annonce-candidat.component';
import { ResultatConcoursEcritComponent } from './resultat-concours-ecrit/resultat-concours-ecrit.component';
import {InscriptionFormComponent} from './inscription-form/inscription-form.component'
import  {DetailCandidatComponent} from './detail-candidat/detail-candidat.component'
import  {PreInscriptionsComponent} from './pre-inscriptions/pre-inscriptions.component'
import { ProfilComponent } from './profil/profil.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component'; // Import the new component
import { ConvocationEcritComponent } from './convocation-ecrit/convocation-ecrit.component';
import { ResultatsOraleComponent } from './resultats-orale/resultats-orale.component'; // Import the component
import { GestionResultatsOralComponent } from './gestion-resultats-oral/gestion-resultats-oral.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {OralNotesComponent} from "./oral-notes/oral-notes.component";
import {EcritNotesComponent} from "./ecrit-notes/ecrit-notes.component";
import {FormEcritNoteComponent} from "./form-ecrit-note/form-ecrit-note.component";
import {FormOralNoteComponent} from "./form-oral-note/form-oral-note.component";
import {ResultatConcoursOralComponent} from "./resultat-concours-oral/resultat-concours-oral.component";
import {AuthGuard} from "./guards/auth.guard";
import {RoleGuard} from "./guards/role.guard";

const routes: Routes = [
 //admin
  { path: 'dashboard', component: DashboardComponent },
  { path: 'notes', component: NotesComponent },
  { path: 'form', component: FormNoteComponent }, // Route pour ajouter une note
  { path: 'form/:id', component: FormNoteComponent }, // Route pour modifier une note
  { path: 'oral-notes', component: OralNotesComponent },
  { path: 'ecrit-notes', component: EcritNotesComponent },
  { path: 'oral-form', component: FormOralNoteComponent }, // Route pour ajouter une note
  { path: 'oral-form/:id', component: FormOralNoteComponent }, // Route pour modifier une note
  { path: 'ecrit-form', component: FormEcritNoteComponent }, // Route pour ajouter une note
  { path: 'ecrit-form/:id', component: FormEcritNoteComponent }, // Route pour modifier une note
  { path: 'ajouter', component: AnnonceFormComponent }, //admin annonce
  { path: 'modifier/:id', component: AnnonceFormComponent },//adminannonce
  { path: 'annonces', component: AnnonceListComponent },
  { path: 'pré-inscriptions', component: PreInscriptionsComponent},


  //candidat
  { path: 'mes-convocations', component: ConvocationEcritComponent},
  { path: 'resultatsOrale', component: ResultatsOraleComponent },///mohsine modifier
  { path: 'resultatsOrale2', component: ResultatConcoursOralComponent },
  { path: 'resultatsEcrit', component: ResultatConcoursEcritComponent } ,
  { path: 'annonces-candidat', component: ListeAnnonceCandidatComponent },
  { path: 'inscription', component: InscriptionFormComponent},
  { path: 'candidat-details/:id', component: DetailCandidatComponent },
  { path: 'profil/:id', component: ProfilComponent },
  { path: 'edit-profile/:id', component: EditProfileComponent },


  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "forgot", component: ForgotPasswordComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'gestion-resultats-oral', component: GestionResultatsOralComponent },
/*
// Routes admin (nécessitent le rôle 'admin')
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'notes', component: NotesComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'form', component: FormNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'form/:id', component: FormNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'oral-notes', component: OralNotesComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'ecrit-notes', component: EcritNotesComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'oral-form', component: FormOralNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'oral-form/:id', component: FormOralNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'ecrit-form', component: FormEcritNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'ecrit-form/:id', component: FormEcritNoteComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'ajouter', component: AnnonceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'modifier/:id', component: AnnonceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'annonces', component: AnnonceListComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'pré-inscriptions', component: PreInscriptionsComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},
  { path: 'gestion-resultats-oral', component: GestionResultatsOralComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['admin'] }},

  // Routes candidat (nécessitent le rôle 'candidat')
  { path: 'mes-convocations', component: ConvocationEcritComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'resultatsOrale', component: ResultatsOraleComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'resultatsOrale2', component: ResultatConcoursOralComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'resultatsEcrit', component: ResultatConcoursEcritComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'annonces-candidat', component: ListeAnnonceCandidatComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'inscription', component: InscriptionFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'candidat-details/:id', component: DetailCandidatComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'profil/:id', component: ProfilComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},
  { path: 'edit-profile/:id', component: EditProfileComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRoles: ['candidat'] }},

  // Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot', component: ForgotPasswordComponent },

  // Redirection par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  */
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
