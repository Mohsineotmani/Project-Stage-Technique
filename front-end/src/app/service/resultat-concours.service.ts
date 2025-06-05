import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the ResultatConcours interface
export interface ResultatConcours {
  id?: number;
  nom: string;
  concours: string;
  statut: string;
  note: number;
  filiere: string;
  cin: string;
  email: string; // Candidate's email
}

@Injectable({
  providedIn: 'root', // This service will be available throughout the application
})
export class ResultatConcoursService {
  private apiUrl = 'http://localhost:8082/'; // URL de l'API Spring Boot

  constructor(private http: HttpClient) {}

  // Method to get all results
  getAllResultatsOral(): Observable<ResultatConcours[]> {
    return this.http.get<ResultatConcours[]>(this.apiUrl+'api/oral-notes/resultat/status-publication/oral');
  }

  getAllResultatsEcrit(): Observable<ResultatConcours[]> {
    return this.http.get<ResultatConcours[]>(this.apiUrl+'api/ecrit-notes/resultat/status-publication/ecrit');
  }

  getAllResultats(): Observable<ResultatConcours[]> {
    return this.http.get<ResultatConcours[]>(this.apiUrl+'resultats');
  }


}
