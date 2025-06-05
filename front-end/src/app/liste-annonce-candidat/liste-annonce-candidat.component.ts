import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnnonceCandidatService, Annonce } from '../service/annonce-candidat.service';

@Component({
  selector: 'app-liste-annonce-candidat',
  templateUrl: './liste-annonce-candidat.component.html',
  styleUrls: ['./liste-annonce-candidat.component.scss']
})
/*

export class ListeAnnonceCandidatComponent implements OnInit {
  annonces: Annonce[] = [];
  displayedAnnonces: Annonce[] = []; // Propriété pour stocker les annonces affichées
  currentIndex: number = 0; // Index de l'annonce actuellement affichée

  @ViewChild('arrowContainer', { static: false }) arrowContainer!: ElementRef; // Référence au conteneur de la flèche

  images = [
    'assets/concour.jpg',//image if type Résultat
    'assets/annonce-2.jpg',//image if type Info
    'assets/annonce.jfif',
  ];

  constructor(private annonceService: AnnonceCandidatService) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

 /!* getImageForAnnonce(index: number): string {
    return this.images[index % this.images.length]; // Cycle sur les images si il y en a moins que les annonces
  }*!/
  getImageForAnnonce(annonce: Annonce): string {
    switch(annonce.type.toLowerCase()) {
      case 'Résultat':
        return 'assets/concour.jpg';
      case 'Info':
        return 'assets/annonce-2.jpg';
      default:
        return 'assets/annonce.jfif'; // Image par défaut
    }
  }


  loadAnnonces(): void {
    this.annonceService.getAllAnnoncesPublic().subscribe(
      (data: Annonce[]) => {
        this.annonces = data;
        this.displayedAnnonces = this.annonces.slice(this.currentIndex, this.currentIndex + 3); // Affiche les trois premières annonces
      },
      (error: any) => {
        console.error('Erreur lors du chargement des annonces', error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    );
  }


  showMore(): void {
    this.currentIndex += 3; // Incrémente l'index de trois
    if (this.currentIndex >= this.annonces.length) {
      this.currentIndex = this.annonces.length - 3; // Ne dépasse pas le nombre total d'annonces
    }

    this.displayedAnnonces = this.annonces.slice(this.currentIndex, this.currentIndex + 3); // Met à jour les annonces affichées

    // Si toutes les annonces sont affichées, cacher la flèche
    if (this.currentIndex + 3 >= this.annonces.length) {
      if (this.arrowContainer) {
        this.arrowContainer.nativeElement.style.display = 'none'; // Cache la flèche si toutes les annonces sont affichées
      }
    }
  }
}
*/

export class ListeAnnonceCandidatComponent implements OnInit {
  annonces: Annonce[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 2; // Nombre d'annonces par page
  totalPages: number = 0;
  paginatedAnnonces: Annonce[] = [];

  @ViewChild('arrowContainer', { static: false }) arrowContainer!: ElementRef;

  constructor(private annonceService: AnnonceCandidatService) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

  loadAnnonces(): void {
    this.annonceService.getAllAnnoncesPublic().subscribe(
      (data: Annonce[]) => {
        this.annonces = data;
        this.totalPages = Math.ceil(this.annonces.length / this.itemsPerPage);
        this.updatePaginatedAnnonces();
      },
      (error: any) => {
        console.error('Erreur lors du chargement des annonces', error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    );
  }

  updatePaginatedAnnonces(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAnnonces = this.annonces.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedAnnonces();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedAnnonces();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAnnonces();
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

  getPagesArray(): number[] {
    const pages = [];
    const maxVisiblePages = 5; // Nombre maximum de pages visibles dans la pagination

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Ajuster si on est près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
