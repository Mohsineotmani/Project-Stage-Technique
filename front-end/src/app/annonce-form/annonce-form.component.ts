import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnnonceService, Annonce } from '../service/annonce.service';
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-annonce-form',
  templateUrl: './annonce-form.component.html',
  styleUrls: ['./annonce-form.component.scss'],
})
export class AnnonceFormComponent implements OnInit {
  annonceForm: FormGroup;
  isEditing = false;
  currentAnnonceId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private annonceService: AnnonceService,
    private route: ActivatedRoute,
    private router: Router,
    private   errorMessageService :ErrorMessageService,
  ) {
    this.annonceForm = this.formBuilder.group({
      title: ['', Validators.required],
      visibility: ['Publique', Validators.required],
      type: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditing = true;
        this.currentAnnonceId = +params['id'];
        this.loadAnnonce(this.currentAnnonceId);
      }
    });
  }

  loadAnnonce(id: number) {
    this.annonceService.getAnnonceById(id).subscribe((annonce) => {
      console.log('Annonce récupérée:', annonce); // Ajoutez ceci
      this.annonceForm.patchValue(annonce);
    });
  }

  submitAnnonce() {
    if (this.annonceForm.valid) {
      const annonceData = this.annonceForm.value;
      console.log('Données de l\'annonce à soumettre:', annonceData); // Log des données

      if (this.isEditing && this.currentAnnonceId !== null) {
        this.annonceService
          .updateAnnonce(this.currentAnnonceId, annonceData)
          .subscribe(
            () => {
              console.log('Annonce modifiée avec succès');
              this.router.navigate(['/annonces']);
            },
            (error) => {
              console.error('Erreur lors de la modification de l\'annonce:', error);
            }
          );
      } else {
        this.annonceService.createAnnonce(annonceData).subscribe(() => {
          this.router.navigate(['/annonces']);
        });
      }
    } else {
      console.log('Le formulaire n\'est pas valide', this.annonceForm.errors);
    }
  }

  cancel() {
    this.router.navigate(['/annonces']);
  }
}
