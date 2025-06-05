import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CandidatService} from '../service/candidat/candidat.service'; // Service renommé
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EcritNotesService} from "../service/ecrit-notes.service";
import {Observable} from "rxjs";
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-ecirt-form-note',
  templateUrl: './form-ecrit-note.component.html',
  styleUrls: ['./form-ecrit-note.component.scss']
})
export class FormEcritNoteComponent implements OnInit {
  noteForm: FormGroup;
  isEditing: boolean = false;
  candidats: any[] = []; // Liste des candidats
  selectedCandidat: any = null;
  notes: any[] = []; // Liste des notes des étudiants

  constructor(
    private fb: FormBuilder,
    private notesService: EcritNotesService,
    private candidatService: CandidatService, // Service renommé
    private route: ActivatedRoute,
    private router: Router,
    private errorMessageService :ErrorMessageService,
  ) {
    this.noteForm = this.fb.group({
      id: [null], // ← ceci est l'id de la NOTE
      candidatId: ['', Validators.required],
      nom: ['', Validators.required],
      cin: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      //concours: ['', Validators.required],
      note: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      filiere: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');


    //
    this.notesService.getAllNotes().subscribe((notes: any[]) => {
      this.notes = notes;
      this.candidatService.getAllCandidats().subscribe((candidats: any[]) => {
        // Filtrer pour garder seulement les candidats qui n'ont pas de note
        if (id) {
          this.isEditing = true;
          this.candidats = candidats ;
        }else {
          this.candidats = candidats.filter(candidat =>
            !notes.some(note => note.cin === candidat.cin)
          );
        }
       // alert(this.isEditing);
        // Ensuite, si édition, récupérer la note
        if (id) {
          this.notesService.getNoteById(+id).subscribe(data => {
            this.noteForm.patchValue(data);

            // Rechercher le candidat correspondant
            const candidatTrouve = this.candidats.find(c =>
              c.cin === data.cin || c.email === data.email
            );

            if (candidatTrouve) {
              this.selectedCandidat = candidatTrouve;
              this.noteForm.patchValue({
                candidatId: candidatTrouve.idCandidat,
                nom: `${candidatTrouve.prenom} ${candidatTrouve.nom}`,
                cin: candidatTrouve.cin,
                email: candidatTrouve.email,
                filiere: candidatTrouve.filiereChoisi
              });
            }
          });
        }
      });
    });
  }




  onCandidatSelect(event: any): void {
    const candidatId = event.target.value;
    this.selectedCandidat = this.candidats.find(c => c.idCandidat == candidatId); // Modifié 'id' en 'idCandidat'

    if (this.selectedCandidat) {
      this.noteForm.patchValue({
        nom: `${this.selectedCandidat.prenom} ${this.selectedCandidat.nom}`,
        cin: this.selectedCandidat.cin,
        email: this.selectedCandidat.email,
        filiere: this.selectedCandidat.filiereChoisi // Ajout de la filière auto-remplie
      });
    } else {
      this.noteForm.patchValue({
        nom: '',
        cin: '',
        email: '',
        filiere: ''
      });
    }
  }

  isSubmitting = false ;

  submitForm(): void {
    // Vérification du formulaire
    if (this.noteForm.invalid) {
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      this.markFormGroupTouched(this.noteForm);
      return;
    }

    // Préparation des données
    const noteData = {
      ...this.noteForm.value,
      candidatId: this.selectedCandidat.id
    };

    // Gestion de l'indicateur de chargement
    this.isSubmitting = true;

    // Choix entre création et mise à jour
    const operation$ = this.isEditing
      ? this.notesService.updateNote(noteData.id, noteData)
      : this.notesService.createNote(noteData);

    // Exécution de l'opération
    operation$.subscribe({
      next: () => {
        this.showSuccessMessage(
          this.isEditing
            ? 'Note mise à jour avec succès'
            : 'Note créée avec succès'
        );
        this.router.navigate(['/ecrit-notes']);
      },
      error: (error) => {
        console.log("Erreur reçue :", error);
        let errorMessage = "";
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Une erreur est survenue: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = error?.error?.message || error?.statusText || "Erreur inconnue";
        }
        this.errorMessageService.showErrorMessage(errorMessage, "Une erreur");
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

// Méthodes utilitaires
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private handleFormError(error: any): void {
    let errorMessage = 'Une erreur est survenue';

    if (error.status === 400) {
      errorMessage = 'Données invalides: ' + (error.error?.message || 'Vérifiez les valeurs saisies');
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée';
    } else if (error.status === 409) {
      errorMessage = 'Conflit: ' + (error.error?.message || 'Cette note existe déjà');
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
    }

    this.showErrorMessage(errorMessage);
  }

  private showSuccessMessage(message: string): void {
    // Implémentez votre logique d'affichage de message (toast, snackbar, etc.)
    console.log('Succès:', message);
  }

  private showErrorMessage(message: string): void {
    // Implémentez votre logique d'affichage d'erreur
    console.error('Erreur:', message);
  }

  cancel(): void {
    this.router.navigate(['/ecrit-notes']);
  }
}
