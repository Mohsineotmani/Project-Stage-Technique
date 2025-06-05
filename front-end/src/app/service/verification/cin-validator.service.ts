// cin-validator.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CinValidatorService {
  constructor(private http: HttpClient) {}

  checkCinUnique(cin: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`http://localhost:8082/PasserelleApi/candidate/check-cin?cin=${cin}`);
  }
}
