import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {AuthService} from "../service/securityService/auth.service";


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const expectedRoles = next.data['expectedRoles'] as Array<string>;
    const userRole = this.authService.getUserRole();

    if (this.authService.isLoggedIn() && expectedRoles.includes(userRole!)) {
      return true;
    }

    // Redirection selon le cas
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    } else {
      this.router.navigate(['/unauthorized']); // Créez cette route si nécessaire
    }
    return false;
  }
}
