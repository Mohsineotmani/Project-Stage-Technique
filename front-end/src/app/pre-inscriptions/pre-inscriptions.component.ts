import { Component, OnInit } from '@angular/core';
import { PreInscriptionsService } from '../service/pre-inscriptions.service';
import { PublishService } from '../service/publish.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-pre-inscriptions',
  templateUrl: './pre-inscriptions.component.html',
  styleUrls: ['./pre-inscriptions.component.scss']
})
export class PreInscriptionsComponent implements OnInit {
  candidates: any[] = [];  // Liste complète des candidats
  filteredCandidates: any[] = [];  // Liste des candidats filtrés selon la filière sélectionnée
  selectedFiliere: string = '';  // Filtre sélectionné par l'utilisateur
  seuil: number = 0;
  logoBase64: string = '';
  publishSuccessMessage: string = '';  // Base64 string of the logo
  cancelPublishMessage: string = '';
  isPublished: boolean = false;

  constructor(
    private preInscriptionsService: PreInscriptionsService,  // Service pour accéder aux candidats
    private publishService: PublishService,
    private router: Router,
    private http: HttpClient,  // HttpClient to load the image
    private errorMessageService:ErrorMessageService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();  // Charger les candidats dès l'initialisation du composant
    this.loadSeuil(); // Charger le seuil stocké


   }

  loadCandidates(): void {
    this.preInscriptionsService.getAllCandidates().subscribe(
      (data) => {
        this.candidates = this.sortCandidatesByHighestNote(data); // Trier les candidats
        this.filteredCandidates = this.candidates; // Initialement, pas de filtre
        this.restoreHighlightedCandidates(); // Restaurer les surbrillances
      },
      (error) => {
        console.error('Erreur lors du chargement des candidats :', error);
      }
    );
  }

  publishResults(): void {
    if(this.seuil === 0 ){
          this.errorMessageService.showErrorMessage("Choisé une valeur déffirente a 0 pour le seuil ." , "Seuil de Concours :" )
      return;
    }
    this.publishService.publierResultats().subscribe({
      next: (response: string) => {
        console.log('Réponse du backend :', response);
        this.publishSuccessMessage = response; // Utilisez directement la réponse du backend
        setTimeout(() => {
          this.publishSuccessMessage = '';
        }, 10000);
      },
      error: (err) => {
        console.error('Erreur lors de la publication :', err);
        this.publishSuccessMessage = 'Erreur lors de la publication des résultats.';
        setTimeout(() => {
          this.publishSuccessMessage = '';
        }, 5000);
        this.errorMessageService.showErrorMessage("Erreur lors de la publication des résultats." , "Publication des résultats:" )
      }
    });
  }

  cancelPublish(): void {
    this.publishService.annulerPublication().subscribe({
      next: (response: string) => {
        console.log('Réponse du backend pour annulation :', response);
        this.cancelPublishMessage = response; // Message de succès pour l'annulation
        setTimeout(() => {
          this.cancelPublishMessage = '';
        }, 10000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation de la publication :', err);
        this.cancelPublishMessage = 'Erreur lors de l\'annulation de la publication.';
        setTimeout(() => {
          this.cancelPublishMessage = '';
        }, 10000);
      }
    });
  }
  checkPublicationStatus() {
    this.publishService.areResultsPublished().subscribe((isPublished: boolean) => {
      this.isPublished = isPublished;
    });
  }

  // Charger le seuil depuis localStorage
  loadSeuil(): void {
    this.preInscriptionsService.getSeuil().subscribe(
      (data) => {
        this.seuil = data.seuil || 0;
      },
      (error) => {
        console.error('Erreur lors du chargement du seuil :', error);
        this.seuil = 0; // Valeur par défaut en cas d'erreur
      }
    );
  }
  updateSeuil(newSeuil: number): void {
    this.preInscriptionsService.updateSeuil(newSeuil).subscribe(
      (response) => {
        // Mise à jour réussie dans la base de données
        this.seuil = newSeuil;
        localStorage.setItem('seuil', this.seuil.toString()); // Enregistrer dans le localStorage
        this.applySeuilHighlighting(); // Appliquer les surbrillances selon le seuil
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du seuil :', error);
        // Vous pouvez afficher un message d'erreur ou gérer l'échec de la mise à jour
      }
    );
  }

  applySeuilHighlighting(): void {
    const highlightedIds: number[] = []; // Liste des ID des candidats surlignés

    this.filteredCandidates = this.candidates.map((candidate) => {
      const moyenne = (+candidate.notePremiereAnnee + +candidate.noteDeuxiemeAnnee) / 2;
      candidate.isBelowThreshold = moyenne < this.seuil; // Utiliser le seuil actuel

      if (candidate.isBelowThreshold) {
        highlightedIds.push(candidate.idCandidat); // Ajouter les candidats sous le seuil
      }

      return candidate;
    });

    // Sauvegarder les ID des candidats surlignés dans le localStorage
    localStorage.setItem('highlightedCandidates', JSON.stringify(highlightedIds));
  }

  // Restaurer les candidats surlignés
  restoreHighlightedCandidates(): void {
    // Charger le seuil à partir du localStorage ou de l'API avant d'appliquer le surlignage
    this.loadSeuil(); // Vous pouvez appeler la méthode pour charger le seuil ici, si nécessaire

    const highlightedIds = JSON.parse(localStorage.getItem('highlightedCandidates') || '[]');

    this.filteredCandidates = this.candidates.map((candidate) => {
      candidate.isBelowThreshold = highlightedIds.includes(candidate.idCandidat);
      return candidate;
    });
  }


  sortCandidatesByHighestNote(candidates: any[]): any[] {
    return candidates.sort((a, b) => {
      const moyenneA = (+a.notePremiereAnnee + +a.noteDeuxiemeAnnee) / 2;
      const moyenneB = (+b.notePremiereAnnee + +b.noteDeuxiemeAnnee) / 2;
      return moyenneB - moyenneA; // Décroissant
    });
  }

  filterCandidates(): void {
    this.filteredCandidates = this.selectedFiliere
      ? this.candidates.filter((c) => c.filiereChoisi === this.selectedFiliere)  // Appliquer le filtre par filière
      : this.candidates;  // Si aucun filtre n'est appliqué, afficher tous les candidats
  }

  viewCandidateDetails(id: number): void {
    // Naviguer vers une page de détails pour le candidat sélectionné
    this.router.navigate(['/candidat-details', id]);
  }

  deleteCandidate(id: number): void {
    // Supprimer un candidat (cela nécessite de la logique dans le service)
    if (confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      this.preInscriptionsService.deleteCandidateById(id).subscribe(
        () => {
          this.errorMessageService.showSuccessMessage("Candidat supprimé avec succès." , "Supprimé");
          this.loadCandidates();  // Recharger la liste des candidats après suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression du candidat :', error);
        }
      );
    }
  }

  groupCandidatesByFiliere(): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    // Grouper les candidats par filière
    this.candidates.forEach((candidate) => {
      const moyenne = (+candidate.notePremiereAnnee + +candidate.noteDeuxiemeAnnee) / 2;
      if (moyenne >= this.seuil) { // Ne prendre que les candidats au-dessus du seuil
        if (!grouped[candidate.filiereChoisi]) {
          grouped[candidate.filiereChoisi] = [];
        }
        grouped[candidate.filiereChoisi].push(candidate);
      }
    });

    return grouped;
  }

  generatePDF(): void {
    const doc = new jsPDF();
    const logoPath = 'assets/esma/logo-removebg-1.png';
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2; // Center the logo
    const logoY = 10;

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);

        // Titles
        const title = "Liste de Pré-sélectionnés pour les Concours Passerelles";
        const title2 = "Année Universitaire 2025-2026";

        const titleY = logoY + logoHeight + 10;
        doc.setFontSize(14);
        doc.setFont("Helvetica", "bold");
        doc.text(title, pageWidth / 2, titleY, { align: "center" });
        doc.setFontSize(12);
        doc.text(title2, pageWidth / 2, titleY + 8, { align: "center" });

        const candidatsParFiliere = this.groupCandidatesByFiliere();

        let startY = titleY + 20;
        for (const filiere in candidatsParFiliere) {
            doc.setFontSize(10);
            doc.text(` ${filiere}`, 10, startY);
            startY += 10;

            const filiereData = candidatsParFiliere[filiere].map(c => {
                const moyenne = ((+c.notePremiereAnnee + +c.noteDeuxiemeAnnee) / 2).toFixed(2);
                const nomComplet = `${c.nom} ${c.prenom}`;
                return [nomComplet, c.cin, c.codeEtudiant, c.filiereChoisi];
            });

            (doc as any).autoTable({
                head: [['Nom Complet', 'CIN', 'Code Étudiant', 'Filière']],
                body: filiereData,
                startY: startY,
                margin: { top: 10 },
            });

            startY = (doc as any).autoTable.previous.finalY + 10;

            if (startY > doc.internal.pageSize.height - 20) {
                doc.addPage();
                startY = 20;
            }
        }

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const newTab = window.open(pdfUrl, '_blank');

        if (newTab) {
            newTab.document.title = "Copie_de_liste_de_presélection.pdf";
        }

        const pdfBase64 = doc.output('datauristring');
        localStorage.setItem('publishedResultsUrl', pdfBase64);
    };
}


}
