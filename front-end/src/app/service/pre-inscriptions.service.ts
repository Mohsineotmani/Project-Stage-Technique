import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TokenService } from './securityService/token.service';


@Injectable({
  providedIn: 'root'
})
export class PreInscriptionsService {

  private apiUrl = 'http://localhost:8082/PasserelleApi/candidate/pré-inscrits'; // Endpoint pour obtenir tous les pré-inscrits
  private baseUrl = 'http://localhost:8082/PasserelleApi/candidate';
  private apiUrlseuil = 'http://localhost:8082/Passerelle';


  constructor(
    private http: HttpClient,
    private tokenService: TokenService,

    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  getNoteEcritByCin(cin: string): Observable<number> {
    return this.http.get<number>(`http://localhost:8082/api/ecrit-notes/note/cin/${cin}`);
  }


  getNoteFinalByCin(cin: string): Observable<number> {
    return this.http.get<number>(`http://localhost:8082/api/notes/note/cin/${cin}`);
  }


  getIsPublishedEcrit(): Observable<boolean> {
    return this.http.get<boolean>('http://localhost:8082/api/ecrit-notes/isPublished');
  }
  getIsPublishedFinal(): Observable<boolean> {
  return this.http.get<boolean>('http://localhost:8082/api/notes/isPublished');
}

  getCandidatId(userId: string): Observable<number> {
    const url = `${this.baseUrl}/getIdByUserId?userId=${userId}`;
    return this.http.get<number>(url);  // La réponse est directement un nombre
  }




  // pre-inscriptions.service.ts
  getIsPublishedPreSelections(): Observable<boolean> {
    return this.http.get<boolean>('http://localhost:8082/PasserelleApi/candidate/isPublished');
  }

  // Récupérer le seuil depuis la base de données
  getSeuil(): Observable<{ seuil: number }> {
    return this.http.get<{ seuil: number }>(`${this.apiUrlseuil}/seuil`);
  }

  getSeuilOrale(): Observable<{ seuil: number }> {
    return this.http.get<{ seuil: number }>(`${this.apiUrlseuil}/seuil_orale`);
  }

  // Mettre à jour le seuil dans la base de données
  updateSeuil(newSeuil: number): Observable<any> {
    return this.http.put(`${this.apiUrlseuil}/seuil`, { seuil: newSeuil });
  }

  // Obtenir tous les candidats pré-inscrits
  getAllCandidates(): Observable<any> {
    return this.http.get<any>('http://localhost:8082/PasserelleApi/candidate/pré-inscrits'); // Vérifiez l'URL
  }



  // Obtenir les détails d'un candidat par son ID
  getCandidateById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un candidat par son ID
  deleteCandidateById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  // Envoyer des convocations à tous les candidats inscrits
  sendConvocationsToAll(): Observable<any> {
    const url = `${this.baseUrl}/send-convocations`; // Endpoint pour envoyer les convocations
    return this.http.post<any>(url, {}).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  // Méthode pour gérer les erreurs HTTP
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
