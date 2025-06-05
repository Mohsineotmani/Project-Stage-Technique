import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gestion-resultats-oral',
  templateUrl: './gestion-resultats-oral.component.html',
  styleUrls: ['./gestion-resultats-oral.component.scss']
})
export class GestionResultatsOralComponent implements OnInit {

  concoursResults: any[] = [];   // Tous les résultats récupérés depuis l'API
  filteredResults: any[] = [];    // Résultats après filtrage
  selectedFiliere: string = 'Tous';  // Valeur par défaut pour la sélection de la filière
  filieres: string[] = [
    'Tous', 'Génie Informatique', 'Gestion & Administration', 'Comptabilité & Finance',
    'Génie RST', 'Marketing & Vente', 'Réseaux & Télécommunications'
  ];
  editingResult: any = null;
  private apiUrl: string = 'http://localhost:8082/resultats_orale';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getResults(); // Récupérer les résultats lors de l'initialisation
  }

  getResults(): void {
    // Appel API pour récupérer tous les résultats
    this.http.get<any[]>(this.apiUrl).subscribe(
      (results) => {
        console.log('Résultats récupérés:', results); // Ajoutez cette ligne pour déboguer
        this.concoursResults = results;  // Stocker les résultats dans la variable
        this.filteredResults = results;  // Initialiser les résultats filtrés avec tous les résultats
      },
      (error) => {
        console.error('Erreur lors de la récupération des résultats:', error);
      }
    );
  }

  filterResults(): void {
    // Appliquer un filtre en fonction de la filière sélectionnée
    if (this.selectedFiliere === 'Tous') {
      this.filteredResults = [...this.concoursResults];
    } else {
      this.filteredResults = this.concoursResults.filter(result => result.filiere === this.selectedFiliere);
    }
    console.log('Résultats filtrés:', this.filteredResults); // Ajoutez cette ligne pour déboguer
  }

  editResult(result: any): void {
    this.editingResult = { ...result }; // Copier les données pour éviter de modifier l'original
  }

  saveEdit(): void {
    if (!this.editingResult) return;

    // Récupérer les données modifiées à partir de l'objet d'édition
    const { id, statusOrale, remarque } = this.editingResult;

    // Envoyer les modifications au backend via l'API
    this.http.put(`${this.apiUrl}/${id}`, { statusOrale, remarque }).subscribe(
      (updatedResult) => {
        // Mettre à jour les résultats dans la liste principale
        const index = this.concoursResults.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.concoursResults[index] = { ...this.concoursResults[index], statusOrale, remarque };
        }

        // Réinitialiser les résultats filtrés et désactiver le mode édition
        this.filteredResults = [...this.concoursResults];
        this.editingResult = null;
      },
      (error) => {
        console.error('Erreur lors de la sauvegarde des modifications:', error);
      }
    );
  }



  cancelEdit(): void {
    this.editingResult = null; // Réinitialiser les données d'édition
  }
}
