import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs'; 
import { catchError } from 'rxjs/operators';

// Define the UserDto interface locally
export interface UserDto {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; 
  encryptedPassword?: string; 
  emailVerificationToken?: string; 
  emailVerificationStatus?: boolean; 
  role: string; 
}

export interface CandidatEntity {
  idCandidat: number;
  prenom: string;
  nom: string;
  genre: string;
  cin: string;
  codeEtudiant: string;
  dateNaissance: Date;
  pays: string;
  ville: string;
  tel: string;
  email: string;
  copieBac: string; // Peut être un lien ou un blob
  serieBac: string;
  mentionBac: string;
  releveBac: string; // Peut être un lien ou un blob
  copieDiplome: string; // Peut être un lien ou un blob
  titreDiplome: string;
  releveDiplomeAnnee1: string; // Peut être un lien ou un blob
  releveDiplomeAnnee2: string; // Peut être un lien ou un blob
  notePremiereAnnee: number;
  noteDeuxiemeAnnee: number;
  etablissement: string;
  filiereChoisi: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8082/users'; 
  private baseUrl = 'http://localhost:8082/PasserelleApi'; // Endpoint pour d'autres opérations (détails, suppression)

  constructor(private http: HttpClient) {}

   // Créer un nouvel utilisateur
   createUser(user: UserDto): Observable<UserDto> {
     return this.http.post<UserDto>(this.apiUrl, user, {
       headers: new HttpHeaders({ 'Content-Type': 'application/json' })
     }).pipe(
       catchError(this.handleError<UserDto>('createUser'))
     );
   }

   // Mettre à jour un utilisateur existant
   updateUser(userId: string, user: UserDto): Observable<UserDto> {
     const token = localStorage.getItem('token');
     const headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     });

     return this.http.put<UserDto>(`${this.apiUrl}/${userId}`, user, { headers }).pipe(
       catchError(this.handleError<UserDto>('updateUser'))
     );
   }

   // Mettre à jour plusieurs utilisateurs
   updateMultipleUsers(users: UserDto[]): Observable<UserDto[]> {
     const token = localStorage.getItem('token');
     const headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     });

     const updateRequests = users.map(user => 
       this.http.put<UserDto>(`${this.apiUrl}/${user.userId}`, user, { headers })
         .pipe(catchError(this.handleError<UserDto>('updateUser')))
     );

     return forkJoin(updateRequests);
   }

   // Supprimer un utilisateur
   deleteUser(userId: string): Observable<{}> {
     const headers = new HttpHeaders({
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     });

     return this.http.delete(`${this.apiUrl}/${userId}`, { headers }).pipe(
       catchError(this.handleError<{}>('deleteUser'))
     );
   }

   // Gérer les erreurs
   private handleError<T>(operation = 'operation', result?: T) {
     return (error: any): Observable<T> => {
       console.error(`${operation} failed: ${error.message}`); 
       return of(result as T); 
     };
   }

   // Obtenir un utilisateur par son ID
   getUserById(userId: string): Observable<UserDto> {
     return this.http.get<UserDto>(`${this.apiUrl}/${userId}`).pipe(
       catchError(this.handleError<UserDto>('getUserById'))
     );
   }

   // Obtenir un candidat par userId
   getCandidatByUserId(userId: string): Observable<CandidatEntity> {
     return this.http.get<CandidatEntity>(`${this.baseUrl}/${userId}`).pipe(
       catchError(this.handleError<CandidatEntity>('getCandidatByUserId'))
     );
   }

   getUser(userId: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/user/${userId}`);
  }

  getCandidat(userId: string): Observable<CandidatEntity> {
    return this.http.get<CandidatEntity>(`${this.baseUrl}/candidate/user/${userId}`);
  }
}
