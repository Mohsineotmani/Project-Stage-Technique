import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class PublishService {

  private apiUrl = 'http://localhost:8082/PasserelleApi/candidate';

  constructor(
    private http: HttpClient
  ) {}

  publierResultats() {
    return this.http.post(`${this.apiUrl}/publier`, null, { responseType: 'text' });
  }
  
  annulerPublication() {
    return this.http.post(`${this.apiUrl}/annulerPublication`, null, { responseType: 'text' });
  }
  areResultsPublished() {
    return this.http.get<boolean>(`${this.apiUrl}/isPublished`);
  }
  
  getCandidatsPreslectionnes() {
    return this.http.get(`${this.apiUrl}?resultatPreselections=1`);
  }
  
}
