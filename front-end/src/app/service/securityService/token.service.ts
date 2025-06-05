import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}


  // Stocker le token, l'ID et le rôle dans le localStorage
  set(data: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const nestedData = data.data || data;
      const token = nestedData.token || nestedData.Token;
      const id = nestedData.id; // Assurez-vous que cela vient de votre réponse de connexion
      const role = nestedData.role; // Récupérer le rôle

      if (token && id && role) { // Vérifiez que le rôle est également présent
        localStorage.setItem('token', token);
        localStorage.setItem('id', id);
        localStorage.setItem('role', role); // Stocker le rôle
        console.log('Token, ID, and role stored:', token, id, role); // Vérifiez ce qui est stocké
      } else {
        console.error('Invalid data passed to set. Available keys:', Object.keys(data), 'Data:', data);
      }
    }
  }

  handle(data: any): void {
    this.set(data); // Appelle la méthode set pour stocker les données
  }

  // Récupérer le token depuis localStorage
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  // Récupérer l'ID depuis localStorage
  getId(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('id') : null;
  }

  // Supprimer le token et l'ID du localStorage
  remove(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('role'); // Supprimer également le rôle
    }
  }

  // Décoder le payload du token JWT
  decode(payload: string): any {
    try {
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding payload:', error);
      return null;
    }
  }

  // Extraire le payload du token
  payload(token: string): any {
    if (!token || token.split('.').length < 3) {
      console.error('Invalid token format:', token);
      return null;
    }
    const payload = token.split('.')[1];
    return this.decode(payload);
  }

  // Vérifier si le token est valide en fonction du payload
  isValid(): boolean {
    const token = this.getToken();
    const id = this.getId();

    if (token) {
      const payload = this.payload(token);
      if (payload) {
        return id === String(payload.id); // Vérification basée sur l'ID
      }
    }
    return false;
  }

  // Récupérer les informations du payload du token
  getInfos(): any {
    const token = this.getToken();

    if (token) {
      const payload = this.payload(token);
      //console.log('Token payload:', payload); // Vérifiez que les informations sont bien récupérées
      return payload ? payload : null;
    }

    return null;
  }

  // Vérifier si l'utilisateur est connecté
  loggedIn(): boolean {
    return this.isValid();
  }

  // Récupérer le rôle de l'utilisateur
  getRole(): string | null {
    const payload = this.getInfos();
    if (payload && payload.role) {
      return payload.role; // Récupérer le rôle depuis le payload
    }
    return localStorage.getItem('role'); // Si non présent dans le payload, récupérer depuis localStorage
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    const roles = this.getRole();
    if (!roles) {
      return false;
    }
    const rolesArray = Array.isArray(roles) ? roles : roles.split(','); // Assurez-vous que c'est un tableau
    return rolesArray.includes(role); // Vérifiez si le rôle est présent dans le tableau des rôles
  }
}
