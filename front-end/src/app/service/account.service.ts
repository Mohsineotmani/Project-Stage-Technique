import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenService } from './securityService/token.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private loggedIn = new BehaviorSubject<boolean>(false); // Initialisation par défaut
  authStatus = this.loggedIn.asObservable();

  constructor(private tokenService: TokenService) {
    // On met à jour l'état de la connexion après l'initialisation du service
    this.loggedIn.next(this.tokenService.loggedIn());
  }

  changeAuthStatus(value: boolean) {
    this.loggedIn.next(value);
  }
}
