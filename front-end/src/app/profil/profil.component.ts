import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TokenService } from '../service/securityService/token.service'; // Adjust the path as necessary
import { UserService } from '../service/user.service'; // Adjust the path as necessary
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  user: any;
  candidat: any;
  errorMessage: string = '';

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCandidatProfile();
  }

  loadUserProfile(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          console.log('Données utilisateur récupérées:', data);
          this.user = data;
        },
        (error: any) => {
          console.error('Erreur lors du chargement des données utilisateur', error);
          this.errorMessage = 'Impossible de charger les données utilisateur.';
        }
      );
    }
  }

  loadCandidatProfile(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      const url = `http://localhost:8082/PasserelleApi/candidate/user/${userId}`;
      this.http.get(url).subscribe(
        (data: any) => {
          console.log('Données candidat récupérées:', data);
          this.candidat = data;

        },
        (error: any) => {
          console.error(`Erreur lors du chargement des données candidat pour l'URL ${url}`, error);
          this.errorMessage = 'Impossible de charger les données candidat.';
        }
      );
    }
  }

  /**
   * Navigate to the profile edit page
   */
  navigateToEditProfile(): void {
    const userId = this.tokenService.getId(); // Retrieve the logged-in user ID
    if (userId) {
      this.router.navigate(['/edit-profile', userId]); // Navigate to the edit profile page with the user ID
    } else {
      this.errorMessage = 'ID utilisateur introuvable. Impossible de rediriger.';
    }
  }
}
