import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définir l'interface Annonce pour une meilleure gestion des types
export interface Annonce {
  id?: number;
  title: string;
  visibility: string;
  type: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnonceCandidatService {

  private apiUrl = 'http://localhost:8082/annonces'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  getAllAnnoncesPublic(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(this.apiUrl+'/visibility'); // Nous spécifions que la méthode renvoie un tableau d'objets Annonce public
  }
}
