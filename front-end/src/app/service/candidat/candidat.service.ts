import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CandidatEntity} from "../user.service";

@Injectable({
  providedIn: 'root'
})
export class CandidatService {

  private apiUrl = 'http://localhost:8082/PasserelleApi/candidate'; // Adaptez à votre API

  constructor(private http: HttpClient) {}

  getAllCandidats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/for-notes');
  }
  getCandidatByUserId(userId: string): Observable<CandidatEntity> {
    return this.http.get<CandidatEntity>(`${this.apiUrl}/user/${userId}`);
  }
}
