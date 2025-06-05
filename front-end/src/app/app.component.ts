import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from './service/account.service';
import { TokenService } from './service/securityService/token.service';
import { HttpClient } from '@angular/common/http';
import {AuthService} from "./service/securityService/auth.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUser: any = null; // Informations de l'utilisateur, y compris le rôle
  title = 'Concour';
  sidebarOpen = true; // État de la sidebar, fermée par défaut
  role: string | null = null; // Stocker le rôle de l'utilisateur
  isRegistered: boolean | null = null;

  constructor(
    private router: Router,
    public accountService: AccountService,
    public tokenService: TokenService,
    private http: HttpClient,
    private authService:AuthService
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    this.accountService.authStatus.subscribe(() => {

      this.currentUser = this.tokenService.getInfos();
      this.role = this.authService.getUserRole(); // Initialisation du rôle
      console.log('currentUser:', this.currentUser);

      // Vérification de l'inscription
      const userId: string | null =  localStorage.getItem('id');
      if (userId) {
        this.checkRegistration(userId);
        console.log('Vérification des données stockées - id:', localStorage.getItem('id'));

      } else {
        console.log('Erreur : userId est null');
      }

    });
  }

  checkRegistration(userId: string): void {
    this.http.get<boolean>(`http://localhost:8082/PasserelleApi/candidate/is-registered/${userId}`)
      .subscribe({
        next: (response) => {
          this.isRegistered = response;
        },
        error: (err) => {
          console.error('Erreur lors de la vérification de l\'inscription :', err);
          this.isRegistered = null;
        }
      });
  }

/*
  logout(): void {
    this.tokenService.remove();
    this.accountService.changeAuthStatus(false);
    this.currentUser = null; // Réinitialisation de l'utilisateur
    this.role = null; // Réinitialisation du rôle
    this.router.navigateByUrl('/login');
  }
*/

  logout(): void {
    this.accountService.changeAuthStatus(false);
    this.currentUser = null; // Réinitialisation de l'utilisateur
    this.role = null; // Réinitialisation du rôle
    this.authService.logout();
  }

  canAccessAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  canAccessCandidat(): boolean {
    return this.role === 'CANDIDAT';
  }

  canAccessCoordinateur(): boolean {
    return this.role === 'COORDINATEUR';
  }
}
