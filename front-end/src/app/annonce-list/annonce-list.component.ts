import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnnonceService, Annonce } from '../service/annonce.service';
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-annonce-list',
  templateUrl: './annonce-list.component.html',
  styleUrls: ['./annonce-list.component.scss'],
})
export class AnnonceListComponent implements OnInit {
  annonces: Annonce[] = [];

  constructor(
    private annonceService: AnnonceService,
    private router: Router,
  private errorMessageService : ErrorMessageService) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

  loadAnnonces() {
    this.annonceService.getAllAnnonces().subscribe(
      (data) => {
        this.annonces = data;
      },
      (error) => {
        console.error('Une erreur est survenue lors du chargement des annonces', error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    );
  }

  goToAddAnnonce() {
    this.router.navigate(['/ajouter']);
  }

  goToEditAnnonce(id: number | undefined) {
    if (id !== undefined) {
      this.router.navigate(['/modifier', id]);
    } else {
      console.error("ID de l'annonce invalide");
      alert("ID de l'annonce invalide");
    }
  }

  deleteAnnonce(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.annonceService.deleteAnnonce(id).subscribe(
        () => {
          this.errorMessageService.showSuccessMessage("Annonce supprimée avec succès" , "Supprimée");
          this.loadAnnonces(); // Recharge la liste après suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression de l’annonce', error);
          alert('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
        }
      );
    }
  }

  publishAnnonce(id: number) {
    if (confirm('Êtes-vous sûr de vouloir publier cette annonce ?')) {
      this.annonceService.publishAnnonce(id).subscribe(
        () => {
          this.errorMessageService.showSuccessMessage("Annonce publiée avec succès!" , "Annonce publiée");
          this.loadAnnonces(); // Recharge la liste après publication
        },
        (error) => {
          console.error('Erreur lors de la publication de l’annonce', error);
          alert('Une erreur est survenue lors de la publication. Veuillez réessayer.');
        }
      );
    }
  }

  getImageForAnnonce(annonce: Annonce): string {
      console.log(annonce.type.toLowerCase() ,annonce.title );
    switch(annonce.type.toLowerCase()) {
      case 'résultat':
        return 'assets/annonce.jfif';
      case 'info':
        return 'assets/annonce-2.jpg';
      case 'urgent':
        return 'assets/concour.jpg';
      default:
        return 'assets/annonce9.jpg';
    }
  }
}
