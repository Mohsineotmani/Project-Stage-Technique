/*
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/securityService/auth.service';
import { TokenService } from '../service/securityService/token.service';
import { Router } from '@angular/router';
import { AccountService } from '../service/account.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
  });

  // Ajout de errorMsg et showPassword
  public errorMsg: string | null = null;
  public showPassword: boolean = false;  // Variable pour gérer la visibilité du mot de passe
  currentUser: any = null;
  role: string | null = null;
  isRegistered: boolean | null = null;
  userId: string | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (this.tokenService.loggedIn()) {
      this.redirectByRole();
    }

    this.accountService.authStatus.subscribe(() => {

      this.currentUser = this.tokenService.getInfos();
      this.role = this.tokenService.getRole(); // Initialisation du rôle
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
  /!*checkRegistration(userId: string): void {
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
  }*!/

  checkRegistration(userId: string): Promise<void> {

    return new Promise((resolve, reject) => {
      this.http.get<boolean>(`http://localhost:8082/PasserelleApi/candidate/is-registered/${userId}`)
        .subscribe({
          next: (response) => {
            this.isRegistered = response;
            resolve();
          },
          error: (err) => {
            console.error('Erreur lors de la vérification de l\'inscription :', err);
            this.isRegistered = null;
            resolve(); // On résout quand même pour ne pas bloquer la navigation
          }
        });
    });
  }



  login(): void {
    if (this.loginForm.invalid) {
      this.errorMsg = 'Veuillez remplir correctement les champs.';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        this.handleResponse(res);
      },
      (err) => {
        this.errorMsg = 'Identifiants incorrects ou problème de connexion.';
        console.error(err);
      }
    );
  }
/!*

  handleResponse(res: any): void {
    if (res && res.Token && res.role) {
      this.tokenService.handle(res);
      this.accountService.changeAuthStatus(true);
      const role = res.role;
      if (role === 'ADMIN') {
        this.router.navigateByUrl('/dashboard');

      } else if (role === 'CANDIDAT' && this.isRegistered === false) {
        this.router.navigateByUrl('/inscription');

      } else if (role === 'CANDIDAT' && this.isRegistered === true) {
        this.router.navigateByUrl(`/profil/${this.userId}`);
        console.log("this.router.navigateByUrl(`/profil/${this.userId}`); ")

      } else if (role === 'COORDINATEUR') {
        this.router.navigateByUrl('/gestion-resultats-oral');

      } else {
        this.router.navigateByUrl('/login');
      }
    } else {
      this.errorMsg = 'Réponse invalide du serveur.';
    }
  }
*!/

  handleResponse(res: any): void {
    if (res && res.Token && res.role) {
      this.tokenService.handle(res);
      this.accountService.changeAuthStatus(true);

      this.userId = this.tokenService.getId(); // stocker l'id après token

      if (!this.userId) {

        return;
      }
      // Appel à checkRegistration avant navigation
      this.checkRegistration(this.userId).then(() => {
        const role = res.role;

        if (role === 'ADMIN') {
          this.router.navigateByUrl('/dashboard');

        } else if (role === 'CANDIDAT' && this.isRegistered === false) {
          this.router.navigateByUrl('/inscription');

        } else if (role === 'CANDIDAT' && this.isRegistered === true) {
          this.router.navigateByUrl(`/profil/${this.userId}`);
          console.log("Navigation vers profil OK");

        } else if (role === 'COORDINATEUR') {
          this.router.navigateByUrl('/gestion-resultats-oral');

        } else {
          this.router.navigateByUrl('/login');
        }
      });
    } else {
      this.errorMsg = 'Réponse invalide du serveur.';
    }
  }


  redirectByRole(): void {
    this.userId = this.tokenService.getId();

    const role = this.tokenService.getRole();
    if (role === 'ADMIN') {
      this.router.navigateByUrl('/pré-inscriptions');
    } else if (role === 'CANDIDAT' && this.isRegistered === false) {
      this.router.navigateByUrl('/inscription');

    } else if (role === 'CANDIDAT' && this.isRegistered === true) {
      this.router.navigateByUrl(`/profil/${this.userId}`);
    }
     else if (role === 'COORDINATEUR') {
      this.router.navigateByUrl('/gestion-resultats-oral');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
*/
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/securityService/auth.service';
import { TokenService } from '../service/securityService/token.service';
import { Router } from '@angular/router';
import { AccountService } from '../service/account.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
  });

  public errorMsg: string | null = null;
  public showPassword: boolean = false;
  currentUser: any = null;
  role: string | null = null;
  isRegistered: boolean | null | undefined = null;
  userId: string | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (this.tokenService.loggedIn()) {
      this.redirectByRole();
    }

    this.accountService.authStatus.subscribe(() => {
      this.currentUser = this.tokenService.getInfos();
      this.role = this.tokenService.getRole();
      this.userId = this.tokenService.getId();

      if (this.userId) {
        this.checkRegistration(this.userId);
      }
    });
  }

  async checkRegistration(userId: string): Promise<void> {
    try {
      this.isRegistered = await this.http.get<boolean>(
        `http://localhost:8082/PasserelleApi/candidate/is-registered/${userId}`
      ).toPromise();
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'inscription :', err);
      this.isRegistered = null;
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMsg = 'Veuillez remplir correctement les champs.';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe(
      async (res) => {
        await this.handleResponse(res);
      },
      (err) => {
        this.errorMsg = 'Identifiants incorrects ou problème de connexion.';
        console.error(err);
      }
    );
  }

  async handleResponse(res: any): Promise<void> {
    if (!res?.Token || !res?.role) {
      this.errorMsg = 'Réponse invalide du serveur.';
      return;
    }

    this.tokenService.handle(res);
    this.accountService.changeAuthStatus(true);
    this.userId = this.tokenService.getId();
    this.role = res.role;

    if (!this.userId) {
      this.errorMsg = 'ID utilisateur non disponible.';
      return;
    }

    // Attendre la vérification de l'inscription
    await this.checkRegistration(this.userId);

    // Navigation basée sur le rôle et l'état d'inscription
    switch (this.role) {
      case 'ADMIN':
        await this.router.navigateByUrl('/dashboard');
        break;
      case 'CANDIDAT':
        if (this.isRegistered === false) {
          await this.router.navigateByUrl('/inscription');
        } else if (this.isRegistered === true) {
          await this.router.navigateByUrl(`/profil/${this.userId}`);
        }
        break;
      case 'COORDINATEUR':
        await this.router.navigateByUrl('/gestion-resultats-oral');
        break;
      default:
        await this.router.navigateByUrl('/login');
    }
  }

  async redirectByRole(): Promise<void> {
    this.userId = this.tokenService.getId();
    this.role = this.tokenService.getRole();

    if (!this.userId || !this.role) {
      await this.router.navigateByUrl('/login');
      return;
    }

    // Attendre la vérification de l'inscription
    await this.checkRegistration(this.userId);

    switch (this.role) {
      case 'ADMIN':
        await this.router.navigateByUrl('/pré-inscriptions');
        break;
      case 'CANDIDAT':
        if (this.isRegistered === false) {
          await this.router.navigateByUrl('/inscription');
        } else if (this.isRegistered === true) {
          await this.router.navigateByUrl(`/profil/${this.userId}`);
        }
        break;
      case 'COORDINATEUR':
        await this.router.navigateByUrl('/gestion-resultats-oral');
        break;
      default:
        await this.router.navigateByUrl('/login');
    }
  }
}
