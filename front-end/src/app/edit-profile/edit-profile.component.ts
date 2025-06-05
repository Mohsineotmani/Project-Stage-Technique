import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../service/securityService/token.service';

@Component({
  selector: 'app-profil-edit',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  candidat: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      cin: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      tel: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      email: ['', [Validators.required, Validators.email]],
      pays: ['', Validators.required],
      ville: ['', Validators.required],
      codeEtudiant: ['', Validators.required],
      filiereChoisi: ['', Validators.required],
      etablissement: ['', Validators.required],
      serieBac: ['', Validators.required],
      mentionBac: ['', Validators.required],
      titreDiplome: ['', Validators.required],
      notePremiereAnnee: ['', [Validators.required, Validators.min(0)]],
      noteDeuxiemeAnnee: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCandidatProfile();
  }

  loadCandidatProfile(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      const url = `http://localhost:8082/PasserelleApi/candidate/user/${userId}`;
      this.http.get(url).subscribe(
        (data) => {
          this.candidat = data;
          this.profileForm.patchValue(data);
        },
        (error) => {
          console.error('Erreur lors du chargement des données candidat', error);
          this.errorMessage = 'Impossible de charger les données candidat.';
        }
      );
    } else {
      this.errorMessage = 'Utilisateur non trouvé';
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const userId = this.tokenService.getId();
    if (userId) {
      const url = `http://localhost:8082/PasserelleApi/candidate/${userId}`;

      // Prepare form data
      const formData = new FormData();
      formData.append('candidat', JSON.stringify(this.profileForm.value));

      // Make the PUT request
      this.http.put(url, formData).subscribe(
        (response) => {
          console.log('Profil mis à jour avec succès:', response);
          this.successMessage = 'Profil mis à jour avec succès.';
          this.router.navigate(['/profil', userId]);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du profil', error);
          this.errorMessage = 'Échec de la mise à jour du profil.';
        }
      );
    }
  }
}
