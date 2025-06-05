import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SeuilService {

  
private apiUrl = 'http://localhost:8082/Passerelle/seuil';  
  constructor(private http: HttpClient) {}

  getSeuil(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  
  updateSeuil(newSeuil: number): Observable<any> {
    return this.http.put<any>(this.apiUrl, newSeuil);
  }
}
