import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  constructor(private http: HttpClient) { }

  // Retourne l'Observable pour permettre la souscription (subscribe)
  submitForm1(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:8082/PasserelleApi/candidate', formData)
      .pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return throwError(error); // Renvoie l'erreur à la couche appelante
        })
      );

  }

  submitForm(formData: FormData): Observable<any> {
    const url = 'http://localhost:8082/PasserelleApi/candidate';  
    return this.http.post(url, formData);
  }
}
