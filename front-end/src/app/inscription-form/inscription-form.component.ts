/*
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../service/token.service'; // Assurez-vous d'importer le service
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidat-form',
  templateUrl: './inscription-form.component.html',
  styleUrls: ['./inscription-form.component.scss']
})
export class InscriptionFormComponent implements OnInit {
  currentStep = 0;
  personalInfoForm!: FormGroup;
  bacInfoForm!: FormGroup;
  diplomaInfoForm!: FormGroup;
  formData: FormData = new FormData();
  errorMessages: string[] = [];
  userId: string | null = null; // Pour stocker le userId

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getId(); // Récupérer le userId depuis le TokenService

    this.personalInfoForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      genre: ['', Validators.required],
      cin: ['', Validators.required],
      codeEtudiant: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      pays: ['', Validators.required],
      ville: ['', Validators.required],
      tel: ['', [Validators.required]],//, Validators.pattern('^[0-9]{10}$')
      email: ['', [Validators.required, Validators.email]],
      filiereChoisi: ['', Validators.required],
    });


    this.bacInfoForm = this.fb.group({
      copieBac: [null, Validators.required],
      serieBac: ['', Validators.required],
      mentionBac: ['', Validators.required],
      releveBac: [null, Validators.required],
    });

    this.diplomaInfoForm = this.fb.group({
      copieDiplome: [null, Validators.required],
      titreDiplome: ['', Validators.required],
      releveDiplomeAnnee1: [null, Validators.required],
      releveDiplomeAnnee2: [null, Validators.required],
      notePremiereAnnee: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      noteDeuxiemeAnnee: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      etablissement: ['', Validators.required],
    });
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.set(controlName, file, file.name);
      if (controlName === 'copieBac' || controlName === 'releveBac') {
        this.bacInfoForm.get(controlName)?.setValue(file);
      } else if (controlName === 'copieDiplome' || controlName === 'releveDiplomeAnnee1' || controlName === 'releveDiplomeAnnee2') {
        this.diplomaInfoForm.get(controlName)?.setValue(file);
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  nextStep() {
    // Forcer la validation des champs en marquant tous les champs comme "touched"
    if (this.currentStep === 0) {
      this.personalInfoForm.markAllAsTouched();
    } else if (this.currentStep === 1) {
      this.bacInfoForm.markAllAsTouched();
    } else if (this.currentStep === 2) {
      this.diplomaInfoForm.markAllAsTouched();
    }

    console.log("3" + this.personalInfoForm.invalid)
    if (this.currentStep === 0 && this.personalInfoForm.invalid) {
      this.errorMessages = ['Veuillez remplir tous les champs requis dans les informations personnelles.'];
      return; // Empêche le passage à l'étape suivante si le formulaire est invalide
    }

    if (this.currentStep === 1 && this.bacInfoForm.invalid) {
      this.errorMessages = ['Veuillez remplir tous les champs requis dans les informations Bac.'];
      return; // Empêche le passage à l'étape suivante si le formulaire est invalide
    }

    if (this.currentStep === 2 && this.diplomaInfoForm.invalid) {
      this.errorMessages = ['Veuillez remplir tous les champs requis dans les informations Diplôme.'];
      return; // Empêche le passage à l'étape suivante si le formulaire est invalide
    }

    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault(); // Empêche l'envoi automatique du formulaire

    // Réinitialiser formData pour éviter les doublons
    this.formData = new FormData();

    // Ajouter les données textuelles
    this.formData.append('candidat', JSON.stringify({
      prenom: this.personalInfoForm.value.prenom,
      nom: this.personalInfoForm.value.nom,
      genre: this.personalInfoForm.value.genre,
      cin: this.personalInfoForm.value.cin,
      codeEtudiant: this.personalInfoForm.value.codeEtudiant,
      dateNaissance: this.personalInfoForm.value.dateNaissance,
      pays: this.personalInfoForm.value.pays,
      ville: this.personalInfoForm.value.ville,
      tel: this.personalInfoForm.value.tel,
      email: this.personalInfoForm.value.email,
      filiereChoisi: this.personalInfoForm.value.filiereChoisi,
      serieBac: this.bacInfoForm.value.serieBac,
      mentionBac: this.bacInfoForm.value.mentionBac,
      titreDiplome: this.diplomaInfoForm.value.titreDiplome,
      notePremiereAnnee: this.diplomaInfoForm.value.notePremiereAnnee,
      noteDeuxiemeAnnee: this.diplomaInfoForm.value.noteDeuxiemeAnnee,
      etablissement: this.diplomaInfoForm.value.etablissement,
      userId: this.userId // Ajouter le userId
    }));

    // Ajouter les fichiers
    if (this.userId) {
      this.formData.append('userId', this.userId); // Ensure userId is added as a separate field
    }
    this.formData.append('copieBac', this.bacInfoForm.get('copieBac')?.value);
    this.formData.append('releveBac', this.bacInfoForm.get('releveBac')?.value);
    this.formData.append('copieDiplome', this.diplomaInfoForm.get('copieDiplome')?.value);
    this.formData.append('releveDiplomeAnnee1', this.diplomaInfoForm.get('releveDiplomeAnnee1')?.value);
    this.formData.append('releveDiplomeAnnee2', this.diplomaInfoForm.get('releveDiplomeAnnee2')?.value);

    // Réinitialiser les messages d'erreur
    this.errorMessages = [];

    // Soumettre le formulaire si tout est valide
    console.log('Soumission du formulaire réussie !');

    // Envoi des données avec les fichiers
    this.http.post('http://localhost:8082/PasserelleApi/candidate', this.formData).subscribe(response => {
      console.log('Réponse du serveur:', response);
      alert('Candidature soumise avec succès !');
    }, error => {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission de la candidature.');
      this.router.navigate([`/profil/${this.userId}`]);
    });
  }

  // Fonction pour vérifier la validité de l'email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  // Fonction pour vérifier la validité du numéro de téléphone (10 chiffres)
  isValidPhoneNumber(tel: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(tel);
  }
}
*/

import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../service/securityService/token.service';
import { Router } from '@angular/router';
import {ErrorMessageService} from "../service/Error/error-message.service";
import {CinValidatorService} from "../service/verification/cin-validator.service";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";

@Component({
  selector: 'app-candidat-form',
  templateUrl: './inscription-form.component.html',
  styleUrls: ['./inscription-form.component.scss']
})
export class InscriptionFormComponent implements OnInit {
  currentStep = 0;
  personalInfoForm!: FormGroup;
  bacInfoForm!: FormGroup;
  diplomaInfoForm!: FormGroup;
  formData: FormData = new FormData();
  errorMessages: string[] = [];
  userId: string | null = null;
  isLoading = false; // Added loading state

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private errorMessageService : ErrorMessageService,
    private cinValidator: CinValidatorService,
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getId();
    this.initForms();
  }
  private cinUniqueValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.cinValidator.checkCinUnique(control.value).pipe(
      map(response => response.exists ? { notUnique: true } : null),
      catchError(() => of(null)) // En cas d'erreur, on ne bloque pas
    );
  }
  private initForms(): void {
    this.personalInfoForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      genre: ['', Validators.required],
      cin: ['',
        [Validators.required],
        [this.cinUniqueValidator.bind(this)]
      ],
      codeEtudiant: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      pays: ['', Validators.required],
      ville: ['', Validators.required],
      tel: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      filiereChoisi: ['', Validators.required],
    });

    this.bacInfoForm = this.fb.group({
      copieBac: [null, Validators.required],
      serieBac: ['', Validators.required],
      mentionBac: ['', Validators.required],
      releveBac: [null, Validators.required],
    });

    this.diplomaInfoForm = this.fb.group({
      copieDiplome: [null, Validators.required],
      titreDiplome: ['', Validators.required],
      releveDiplomeAnnee1: [null, Validators.required],
      releveDiplomeAnnee2: [null, Validators.required],
      notePremiereAnnee: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      noteDeuxiemeAnnee: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      etablissement: ['', Validators.required],
    });
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.set(controlName, file, file.name);
      const formGroup = controlName.includes('Bac') ? this.bacInfoForm : this.diplomaInfoForm;
      formGroup.get(controlName)?.setValue(file);
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.errorMessages = [];
    }
  }

  /*nextStep(): void {
    const forms = [this.personalInfoForm, this.bacInfoForm, this.diplomaInfoForm];
    const errorMessages = [
      'Veuillez remplir tous les champs requis dans les informations personnelles.',
      'Veuillez remplir tous les champs requis dans les informations Bac.',
      'Veuillez remplir tous les champs requis dans les informations Diplôme.'
    ];

    ////

    // Vérification spécifique pour l'étape 0 (CIN)
    if (this.currentStep === 0) {
      const cinControl = this.personalInfoForm.get('cin');

      if (cinControl?.invalid) {
        this.errorMessages = ['Veuillez saisir un CIN valide'];
        return;
      }

      try {
        this.isLoading = true;
        const cin = cinControl?.value;
        const response = await this.cinValidator.checkCinUnique(cin).toPromise();

        if (response?.exists) {
          this.errorMessages = ['Ce CIN est déjà utilisé'];
          cinControl?.setErrors({ notUnique: true });
          return;
        }
      } catch (error) {
        console.error('Erreur de vérification CIN:', error);
        this.errorMessages = ['Erreur lors de la vérification du CIN'];
        return;
      } finally {
        this.isLoading = false;
      }
    }*/
  async nextStep(): Promise<void> {  // Changé de void à Promise<void> et ajouté async
    const forms = [this.personalInfoForm, this.bacInfoForm, this.diplomaInfoForm];
    const errorMessages = [
      'Veuillez remplir tous les champs requis dans les informations personnelles.',
      'Veuillez remplir tous les champs requis dans les informations Bac.',
      'Veuillez remplir tous les champs requis dans les informations Diplôme.'
    ];

    forms[this.currentStep].markAllAsTouched();

    // Vérification spécifique pour l'étape 0 (CIN)
    if (this.currentStep === 0) {
      const cinControl = this.personalInfoForm.get('cin');

      if (cinControl?.invalid) {
        this.errorMessages = ['Veuillez saisir un CIN valide'];
        return;
      }

      try {
        this.isLoading = true;
        const cin = cinControl?.value;
        const response = await this.cinValidator.checkCinUnique(cin).toPromise();

        if (response?.exists) {
          this.errorMessages = ['Ce CIN est déjà utilisé'];
          cinControl?.setErrors({ notUnique: true });
          return;
        }
      } catch (error) {
        console.error('Erreur de vérification CIN:', error);
        this.errorMessages = ['Erreur lors de la vérification du CIN'];
        return;
      } finally {
        this.isLoading = false;
      }
    }

    if (forms[this.currentStep].invalid) {
      this.errorMessages = [errorMessages[this.currentStep]];
      return;
    }

    if (this.currentStep < 2) {
      this.currentStep++;
      this.errorMessages = [];
    }

//////////////

    forms[this.currentStep].markAllAsTouched();

    if (forms[this.currentStep].invalid) {
      this.errorMessages = [errorMessages[this.currentStep]];
      return;
    }

    if (this.currentStep < 2) {
      this.currentStep++;
      this.errorMessages = [];
    }
  }

  validationErrors: any = {};


  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading = true;
    this.formData = new FormData(); // Reset form data

    // Combine all form data
    const candidatData = {
      ...this.personalInfoForm.value,
      ...this.bacInfoForm.value,
      ...this.diplomaInfoForm.value,
      userId: this.userId
    };

    // Remove file objects from the JSON data
    delete candidatData.copieBac;
    delete candidatData.releveBac;
    delete candidatData.copieDiplome;
    delete candidatData.releveDiplomeAnnee1;
    delete candidatData.releveDiplomeAnnee2;

    this.formData.append('candidat', JSON.stringify(candidatData));

    // Add files
    if (this.userId) {
      this.formData.append('userId', this.userId);
    }
    this.addFileToFormData('copieBac');
    this.addFileToFormData('releveBac');
    this.addFileToFormData('copieDiplome');
    this.addFileToFormData('releveDiplomeAnnee1');
    this.addFileToFormData('releveDiplomeAnnee2');



    this.http.post('http://localhost:8082/PasserelleApi/candidate', this.formData).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.errorMessageService.showSuccessMessage("Candidature soumise avec succès !" , "Soumise");
        this.isLoading = false;
        this.router.navigate([`/profil/${this.userId}`]);
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
        if (error.status === 400 || error.status === 422 || (error.status ===500 && error.error.message)){
          this.validationErrors = error.error;
        } else  {
          this.errorMessageService.showInternalError();
        }
        this.isLoading = false;
      }
    });
  }

  private addFileToFormData(controlName: string): void {
    const formGroup = controlName.includes('Bac') ? this.bacInfoForm : this.diplomaInfoForm;
    const file = formGroup.get(controlName)?.value;
    if (file) {
      this.formData.append(controlName, file);
    }
  }

  // Utility methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(tel: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(tel);
  }
}
