import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TokenService } from './securityService/token.service'; // Import the TokenService

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = 'http://localhost:8082/api/notes';

  constructor(private http: HttpClient, private tokenService: TokenService) {} // Inject TokenService

  // Récupérer toutes les notes
  getAllNotes(): Observable<any[]> {
    const token = this.tokenService.getToken();
    console.log('Sending request with token:', token); // Log the token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Set the Authorization header
    });

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer une note par son ID
  getNoteById(id: number): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Créer une nouvelle note
  createNote(note: any): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(this.apiUrl, note, { headers });
  }

  // Mettre à jour une note existante
  updateNote(id: number, note: any): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}`, note, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  // Supprimer une note par son ID
  deleteNoteById(id: number): Observable<void> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Envoyer des emails aux admis - Version corrigée
  sendEmailsToAdmitted(seuil: number, emails: string[]): Observable<string> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${this.apiUrl}/sendEmailsToAdmitted?seuil=${seuil}`,
      emails, // Envoi direct du tableau sans wrapper dans un objet
      {
        headers: headers,
        responseType: 'text' // Simplification du traitement de la réponse
      }
    ).pipe(
      catchError(this.handleError)
    );
  }




  // Télécharger un fichier CSV
  downloadCsv(): Observable<Blob> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/downloadCsv`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Méthode pour gérer les erreurs HTTP
  // Méthode pour gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Erreur HTTP:', error.status);
    console.error('Détails de l\'erreur:', error.message);
    if (error.error instanceof ErrorEvent) {
      console.error('Erreur côté client:', error.error.message);
    } else {
      console.error('Erreur côté serveur:', error.error);
    }
    return throwError('Une erreur s\'est produite, veuillez réessayer.');
  }

  getNotesByFiliere(filiere: string): Observable<any[]> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/filiere/${filiere}`, { headers }).pipe(
      catchError (this.handleError)
    );
  }

  // Publier les résultats
  publishResults(): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>('http://localhost:8082/api/notes/publish', {}, { headers });
  }

  // Méthode pour publier les résultats de l'oral
  publishOralResults(): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Utilisation des backticks pour l'interpolation
    });

    return this.http.post<any>('http://localhost:8082/api/notes/publishOralResults', {}, { headers }).pipe(
      catchError((error) => this.handleError(error)) // Utilisation de la fonction anonyme
    );
  }



}
