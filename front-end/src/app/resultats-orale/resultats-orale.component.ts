/*

import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-resultats-orale',
  templateUrl: './resultats-orale.component.html',
  styleUrls: ['./resultats-orale.component.scss']
})
export class ResultatsOraleComponent implements OnInit {
  results: any[] = [];  // Tous les résultats
  filteredResults: any[] = [];  // Résultats filtrés
  selectedFiliere: string = '';  // Filtrage par filière

  filieres: string[] = [
    'Génie Informatique', 'Gestion & Administration', 'Comptabilité & Finance',
    'Génie RST', 'Marketing & Vente', 'Réseaux & Télécommunications'
  ];

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.fetchOralResults();  // Charger les résultats au démarrage
  }

  // Fonction pour récupérer les résultats du concours oral
  fetchOralResults(): void {
    let url = 'http://localhost:8082/resultats/oral'; // URL pour récupérer tous les résultats oraux
    this.http.get<any[]>(url).subscribe(
      (data) => {
        this.results = data;  // Stocker tous les résultats récupérés
        this.filterResults();  // Filtrer les résultats après les avoir récupérés
      },
      (error) => {
        console.error('Erreur lors de la récupération des résultats du concours oral', error);
      }
    );
  }

  // Filtrer les résultats en fonction de la filière sélectionnée
  filterResults(): void {
    if (this.selectedFiliere) {
      // Filtrer par filière sélectionnée
      this.filteredResults = this.results.filter(result => result.filiere === this.selectedFiliere);
    } else {
      // Afficher tous les résultats si aucune filière n'est sélectionnée
      this.filteredResults = this.results;
    }
  }

  // Générer le PDF pour tous les résultats ou les résultats filtrés
  generatePdf(): void {
    const oralResults = this.filteredResults.length ? this.filteredResults : this.results;

    if (!oralResults.length) {
      alert('Aucun résultat à afficher.');
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4'); // Changement de 'landscape' à 'portrait'
    const logoUrl = 'assets/esma/logo-removebg-1.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgWidth = 50;
      const imgHeight = 20;
      const imgX = (pageWidth - imgWidth) / 2;

      // Ajouter le logo
      doc.addImage(img, 'PNG', imgX, 10, imgWidth, imgHeight);

      // Ajouter le titre
      const title = this.selectedFiliere
        ? `Résultats du Concours Oral (${this.selectedFiliere})`
        : 'Résultats du Concours Oral de toutes les Filières';
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, imgHeight + 20, {align: 'center'});


      let startY = imgHeight + 40;

      // Grouper les résultats par filière
      const filieres = [...new Set(oralResults.map(result => result.filiere))];

      filieres.forEach((filiere, index) => {
        const candidatesByFiliere = oralResults.filter(result => result.filiere === filiere);

        if (index > 0) startY += 10; // Ajouter un petit espace entre les sections

        // Ajouter un titre pour chaque filière avec une couleur spécifique
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#3498db'); // Couleur bleue pour le titre de la filière
        doc.text(`Filière : ${filiere}`, pageWidth / 2, startY, {align: 'center'});
        startY += 10;

        const tableColumn = ['Nom Complet', 'CIN', 'Filière'];
        const tableRows = candidatesByFiliere.map(result => [
          result.nom || 'Non spécifié',
          result.cin || 'Non spécifié',
          result.filiere || 'Non spécifié',
        ]);

        // Ajouter la table des résultats
        (doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: startY,
          styles: {
            fontSize: 10,
            cellPadding: 4,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [41, 128, 185], // Couleur d'en-tête bleue
            textColor: 255, // Texte en blanc
            fontSize: 12,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245], // Couleur alternée des lignes
          },
          margin: {top: 10, left: 14, right: 14},
        });

        // Mise à jour de la position de départ pour la prochaine section
        startY = (doc as any).autoTable.previous.finalY + 10;

        // Si le contenu dépasse la page, ajouter une nouvelle page
        if (startY > pageHeight - 20) {
          doc.addPage();
          startY = 20;
        }
      });

      // Générer et ouvrir le PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };

    img.onerror = () => {
      alert('Impossible de charger le logo. Vérifiez l’URL.');
    };
  }
}
*/
import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import jsPDF from 'jspdf';
import {CandidatService} from "../service/candidat/candidat.service";
import {CandidatEntity} from "../service/user.service";

@Component({
  selector: 'app-resultats-orale',
  templateUrl: './resultats-orale.component.html',
  styleUrls: ['./resultats-orale.component.scss']
})
export class ResultatsOraleComponent implements OnInit {
  results: any[] = [];  // Tous les résultats
  filteredResults: any[] = [];  // Résultats filtrés
  selectedFiliere: string = '';  // Filtrage par filière
  errorMessage= "";
  currentCandidat! : CandidatEntity ;
  myNote: any = null;  // Stocke la note du candidat actuel
  isMyNoteView = false;

  filieres: string[] = [
    'Génie Informatique', 'Gestion & Administration', 'Comptabilité & Finance',
    'Génie RST', 'Marketing & Vente', 'Réseaux & Télécommunications'
  ];

  constructor(
    private http: HttpClient,
    private candidatService :CandidatService,
  ) {
  }


  ngOnInit(): void {
    this.fetchOralResults();  // Charger les résultats au démarrage
  }

  getCandidatByUserId() :void{
    const candidatSorageId = this.getCandidatSorageId();
    if (candidatSorageId) {
      this.candidatService.getCandidatByUserId(candidatSorageId).subscribe(
        (data: any) => {
          console.log('Données Candidat récupérées:', data);
          this.currentCandidat = data;
        },
        (error: any) => {
          console.error('Erreur lors du chargement des données Candidat', error);
          this.errorMessage = 'Impossible de charger les données Candidat.';
        }
      );
    }
  }

  getCandidatSorageId(): string | null {
    const id = localStorage.getItem('id');
    return id ? id: null;
  }

  fetchMyResults():void {
    //par cin en getCandidatByUserId et sotck dans currentCandidat! : CandidatEntity ;
    this.getCandidatByUserId(); // Assure-toi que currentCandidat est bien rempli
    const cin = this.currentCandidat?.cin;
    if (!cin) {
      alert('Chargement de vos informations...');
      return;
    }
    this.myNote = this.results.filter(
      result => result.cin === this.currentCandidat?.cin
    );
    // Gérer les cas où la note n'est pas trouvée
    if (this.myNote.length === 0) {
      this.errorMessage = 'Votre note n\'est pas encore disponible';
    }

    // Activer le mode "ma note"
    this.isMyNoteView = true;
  }


  // Fonction pour récupérer les résultats du concours oral
  fetchOralResults(): void {
    let url = 'http://localhost:8082/resultats'; // URL pour récupérer tous les résultats oraux
    this.http.get<any[]>(url).subscribe(
      (data) => {
        this.results = data;  // Stocker tous les résultats récupérés
        console.log("##fetchOralResults-->" , this.results);
        this.filterResults();  // Filtrer les résultats après les avoir récupérés
        this.isMyNoteView = false; // Réinitialiser la vue
      },
      (error) => {
        console.error('Erreur lors de la récupération des résultats du concours oral', error);
      }
    );
  }

  // Filtrer les résultats en fonction de la filière sélectionnée
  filterResults(): void {
    if (this.selectedFiliere) {
      // Filtrer par filière sélectionnée
      this.filteredResults = this.results.filter(result => result.filiere === this.selectedFiliere);
      this.isMyNoteView = false;
    } else {
      // Afficher tous les résultats si aucune filière n'est sélectionnée
      this.filteredResults = this.results;
    }
  }

  // Générer le PDF pour tous les résultats ou les résultats filtrés
  generatePdf(): void {
    const oralResults = this.filteredResults.length ? this.filteredResults : this.results;

    if (!oralResults.length) {
      alert('Aucun résultat à afficher.');
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4'); // Changement de 'landscape' à 'portrait'
    const logoUrl = 'assets/esma/logo-removebg-1.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgWidth = 50;
      const imgHeight = 20;
      const imgX = (pageWidth - imgWidth) / 2;

      // Ajouter le logo
      doc.addImage(img, 'PNG', imgX, 10, imgWidth, imgHeight);

      // Ajouter le titre
      const title = this.selectedFiliere
        ? `Résultats du Concours Oral (${this.selectedFiliere})`
        : 'Résultats du Concours Oral de toutes les Filières';
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, imgHeight + 20, {align: 'center'});


      let startY = imgHeight + 40;

      // Grouper les résultats par filière
      const filieres = [...new Set(oralResults.map(result => result.filiere))];

      filieres.forEach((filiere, index) => {
        const candidatesByFiliere = oralResults.filter(result => result.filiere === filiere);

        if (index > 0) startY += 10; // Ajouter un petit espace entre les sections

        // Ajouter un titre pour chaque filière avec une couleur spécifique
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#3498db'); // Couleur bleue pour le titre de la filière
        doc.text(`Filière : ${filiere}`, pageWidth / 2, startY, {align: 'center'});
        startY += 10;

        const tableColumn = ['Nom Complet', 'CIN', 'Filière'];
        const tableRows = candidatesByFiliere.map(result => [
          result.nom || 'Non spécifié',
          result.cin || 'Non spécifié',
          result.filiere || 'Non spécifié',
        ]);

        // Ajouter la table des résultats
        (doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: startY,
          styles: {
            fontSize: 10,
            cellPadding: 4,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [41, 128, 185], // Couleur d'en-tête bleue
            textColor: 255, // Texte en blanc
            fontSize: 12,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245], // Couleur alternée des lignes
          },
          margin: {top: 10, left: 14, right: 14},
        });

        // Mise à jour de la position de départ pour la prochaine section
        startY = (doc as any).autoTable.previous.finalY + 10;

        // Si le contenu dépasse la page, ajouter une nouvelle page
        if (startY > pageHeight - 20) {
          doc.addPage();
          startY = 20;
        }
      });

      // Générer et ouvrir le PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };

    img.onerror = () => {
      alert('Impossible de charger le logo. Vérifiez l’URL.');
    };
  }
}
