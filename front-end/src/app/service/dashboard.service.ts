import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashboardService  {

  private apiUrl = 'http://localhost:8082/PasserelleApi/candidate'; // L'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer le nombre total des préinscrits
  getTotalCandidats(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/countTotalCandidates`);
  }

  getMostRequestedFiliere(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/mostRequestedFiliere`, { responseType: 'text' as 'json' });
  }
  getMostRequestedFilierePercentage(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/mostRequestedFilierePercentage`);
  }
  getAverageScores(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average-scores`);
  }

  getFiliereDistribution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/filiere-distribution`);
  }

  getGender(): Observable<{ hommes: number, femmes: number }> {
    return this.http.get<{ hommes: number, femmes: number }>(`${this.apiUrl}/hommes-femmes`);
  }
}