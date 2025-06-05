import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Extension pour ajouter des tableaux
import { ResultatConcoursService, ResultatConcours } from '../service/resultat-concours.service';

@Component({
  selector: 'app-resultat-concours-oral',
  templateUrl: './resultat-concours-oral.component.html',
  styleUrls: ['./resultat-concours-oral.component.scss']
})
export class ResultatConcoursOralComponent implements OnInit {
  concoursResults: ResultatConcours[] = []; // Tous les résultats
  filteredResults: ResultatConcours[] = []; // Résultats filtrés
  selectedFiliere: string = ''; // Filière sélectionnée

  constructor(private resultatConcoursService: ResultatConcoursService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.resultatConcoursService.getAllResultats().subscribe(
      (data) => {
        this.concoursResults = data;
        this.filteredResults = data;
      },
      (error) => {
        console.error('Error loading results', error);
        alert('Une erreur s’est produite. Veuillez réessayer plus tard.');
      }
    );
  }

  filterResults(): void {
    if (this.selectedFiliere) {
      this.filteredResults = this.concoursResults.filter(
        (result) => result.filiere === this.selectedFiliere
      );
    } else {
      this.filteredResults = this.concoursResults;
    }
  }
  generatePdf(): void {
    const admitCandidates = this.filteredResults.length ? this.filteredResults : this.concoursResults;

    if (!admitCandidates.length) {
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

        // Titre principal
        const title = this.selectedFiliere
            ? `Résultats Écrits (${this.selectedFiliere})`
            : 'Résultats Écrits de toutes les Filières';
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, imgHeight + 20, { align: 'center' });

        let startY = imgHeight + 40;

        // Liste des filières
        const filieres = [...new Set(admitCandidates.map(candidate => candidate.filiere))];

        filieres.forEach((filiere, index) => {
            const candidatesByFiliere = admitCandidates.filter(candidate => candidate.filiere === filiere);

            if (index > 0) startY += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#3498db'); // Couleur bleue pour le titre de la filière
            doc.text(`Filière : ${filiere}`, pageWidth / 2, startY, { align: 'center' });
            startY += 10;

            // Colonnes et contenu de la table
            const tableColumn = ['Nom Complet', 'CIN', 'Filière'];
            const tableRows = candidatesByFiliere.map(candidate => [
                candidate.nom || 'Non spécifié',
                candidate.cin || 'Non spécifié',
                candidate.filiere || 'Non spécifié',
            ]);

            // Ajouter la table
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
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 12,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 10, left: 14, right: 14 },
            });

            startY = (doc as any).autoTable.previous.finalY + 10;

            // Ajouter une nouvelle page si nécessaire
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
