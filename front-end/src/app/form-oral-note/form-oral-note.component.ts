
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NotesService} from '../service/notes.service';
import {CandidatService} from '../service/candidat/candidat.service'; // Service renommé
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OralNotesService} from "../service/oral-notes.service";
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-oral-form-note',
  templateUrl: './form-oral-note.component.html',
  styleUrls: ['./form-oral-note.component.scss']
})
export class FormOralNoteComponent implements OnInit {
  noteForm: FormGroup;
  isEditing: boolean = false;
  candidats: any[] = []; // Liste des candidats
  selectedCandidat: any = null;
  notes: any[] = []; // Liste des notes des étudiants

  constructor(
    private fb: FormBuilder,
    private notesService: OralNotesService,
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
      note: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      filiere: ['', Validators.required],
      pourcentageOral: ['', [Validators.required,Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.notesService.getAllNotes().subscribe((notes: any[]) => {
      this.notes = notes;
      this.candidatService.getAllCandidats().subscribe((candidats: any[]) => {
        // Filtrer pour garder seulement les candidats qui n'ont pas de note

        if (id) {
          this.isEditing = true;
          this.candidats = candidats;
        } else {
          this.candidats = candidats.filter(candidat =>
            !notes.some(note => note.cin === candidat.cin)
          );
        }
        //alert(this.isEditing);
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

  submitForm(): void {
    //console.log("appler");
    if (this.noteForm.invalid) {
      return;
    }

    const noteData = this.noteForm.value;
    noteData.candidatId = this.selectedCandidat.id;

    if (this.isEditing) {
      this.notesService.updateNote(noteData.id, noteData).subscribe({
        next: data => {
        this.router.navigate(['/oral-notes']);
      }, error: err => {
        console.log("Erreur reçue :", err);
        let errorMessage = "";
        if (err.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Une erreur est survenue: ${err.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = err?.error?.message || err?.statusText || "Erreur inconnue";
        }

        this.errorMessageService.showErrorMessage(errorMessage, "Une erreur");
      }
    });
    } else {
      this.notesService.createNote(noteData).subscribe({
        next: data => {
          this.router.navigate(['/oral-notes']);
        }, error: err => {
          console.log("Erreur reçue :", err);

          let errorMessage = "";
          if (err.error instanceof ErrorEvent) {
            // Erreur côté client
            errorMessage = `Une erreur est survenue: ${err.error.message}`;
          } else {
            // Erreur côté serveur
            errorMessage = err?.error?.message || err?.statusText || "Erreur inconnue";
          }

          this.errorMessageService.showErrorMessage(errorMessage, "Une erreur");
        }

      });
    }
  }

  cancel(): void {
    this.router.navigate(['/oral-notes']);
  }
}
