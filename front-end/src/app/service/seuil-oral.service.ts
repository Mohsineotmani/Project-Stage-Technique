import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeuilOralService {
  private apiUrl = 'http://localhost:8082/Passerelle/seuil_orale'; // Adjust this URL based on your backend configuration

  constructor(private http: HttpClient) {}

  // Method to get the current oral threshold
  getSeuil(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Method to update the oral threshold
  updateSeuil(seuilData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, seuilData);
  }
}