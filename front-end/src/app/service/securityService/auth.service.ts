import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SignupRequest} from '../../models/signup-request';
import {Observable} from 'rxjs';
import {SignupResponse} from '../../models/signup-response';
import {TokenService} from "./token.service";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private tokenService:TokenService,
    private router: Router,
  ) {
  }

  login(data: { email: string, password: string }) {
    return this.http.post(`http://localhost:8082/users/login`, data);
  }

  doRegister(request: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`http://localhost:8082/users`, request);
  }


  // Méthode pour vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.tokenService.loggedIn();
  }

  // Méthode pour obtenir le rôle de l'utilisateur
  getUserRole(): string | null {
    return this.tokenService.getRole();
  }

  // Méthode pour vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.tokenService.hasRole(role);
  }

  // Méthode de déconnexion
  logout() {
    this.tokenService.remove();
    this.router.navigate(['/login']);
  }

  // Méthode pour gérer la réponse de connexion
  handleLoginResponse(response: any): void {
    this.tokenService.handle(response)
  }
}
