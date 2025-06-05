/*
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesService } from '../service/notes.service';

@Component({
  selector: 'app-form-note',
  templateUrl: './form-note.component.html',
  styleUrls: ['./form-note.component.scss']
})
export class FormNoteComponent implements OnInit {
  note: any = { id: null, nom: '', concours: '', statut: '', note: null, filiere: '', email: '' };
  isEditing: boolean = false;

  constructor(
    private notesService: NotesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.notesService.getNoteById(+id).subscribe((data) => {
        this.note = data; // L'email sera également récupéré ici
      });
    }
  }




  submitForm(): void {
    if (this.isEditing) {
      this.notesService.updateNote(this.note.id, this.note).subscribe(() => {
        this.router.navigate(['/notes']); // Redirection vers la liste après modification
      });
    } else {
      this.notesService.createNote(this.note).subscribe(() => {
        this.router.navigate(['/notes']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/notes']); // Retour à la liste si annulation
  }
}
*/
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NotesService} from '../service/notes.service';
import {CandidatService} from '../service/candidat/candidat.service'; // Service renommé
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-form-note',
  templateUrl: './form-note.component.html',
  styleUrls: ['./form-note.component.scss']
})
export class FormNoteComponent implements OnInit {
  noteForm: FormGroup;
  isEditing: boolean = false;
  candidats: any[] = []; // Liste des candidats
  selectedCandidat: any = null;

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private candidatService: CandidatService, // Service renommé
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.noteForm = this.fb.group({
      id: [null], // ← ceci est l'id de la NOTE
      candidatId: ['', Validators.required],
      nom: ['', Validators.required],
      cin: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      note: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      filiere: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Charger les candidats d'abord
    this.candidatService.getAllCandidats().subscribe(candidats => {
      this.candidats = candidats;

      // Ensuite, si édition, récupérer la note
      if (id) {
        this.isEditing = true;
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
  }

  /*ngOnInit(): void {
    this.loadCandidats();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.notesService.getNoteById(+id).subscribe(data => {
        this.noteForm.patchValue(data);
        this.selectedCandidat = {
          id: data.candidatId,
          nom: data.nom,
          cin: data.cin,
          email: data.email
        };
      });
    }
  }

  loadCandidats(): void {
    this.candidatService.getAllCandidats().subscribe(candidats => {
      console.log('Candidats reçus:', candidats); // Vérifiez la structure des données
      this.candidats = candidats;
    });
  }

   */

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
      this.notesService.updateNote(noteData.id, noteData).subscribe(() => {
        this.router.navigate(['/notes']);
      });
    } else {
      this.notesService.createNote(noteData).subscribe(() => {
        this.router.navigate(['/notes']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/notes']);
  }
}
