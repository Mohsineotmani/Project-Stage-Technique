import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './securityService/token.service'; // Import the TokenService

export interface Annonce {
  id?: number;
  title: string;
  visibility: string;
  type: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnnonceService {
  private apiUrl = 'http://localhost:8082/api/annonces'; // Replace with your API URL

  constructor(private http: HttpClient, private tokenService: TokenService) {} // Inject TokenService

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken(); // Get the token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Set the Authorization header
    });
  }

  getAllAnnonces(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(this.apiUrl, { headers: this.getHeaders() }); // Add headers
  }

  getAnnonceById(id: number): Observable<Annonce> {
    return this.http.get<Annonce>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }); // Add headers
  }

  createAnnonce(annonce: Annonce): Observable<Annonce> {
    return this.http.post<Annonce>(this.apiUrl, annonce, { headers: this.getHeaders() }); // Add headers
  }

  updateAnnonce(id: number, annonce: Annonce): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.apiUrl}/${id}`, annonce, { headers: this.getHeaders() }); // Add headers
  }

  deleteAnnonce(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }); // Add headers
  }

  publishAnnonce(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/publish`, null, { headers: this.getHeaders() }); // Add headers
  }
}
