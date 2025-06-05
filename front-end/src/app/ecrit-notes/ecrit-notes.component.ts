import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SeuilOralService} from '../service/seuil-oral.service'; // Si nécessaire pour le seuil oral
import {HttpClient, HttpErrorResponse} from '@angular/common/http'; // Added HttpClient import
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import {EcritNotesService} from "../service/ecrit-notes.service";
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-ecrit-notes',
  templateUrl: './ecrit-notes.component.html',
  styleUrls: ['./ecrit-notes.component.scss'],
})
export class EcritNotesComponent implements OnInit {
  notes: any[] = []; // Liste des notes des étudiants
  filteredNotes: any[] = []; // Liste filtrée des notes des étudiants
  selectedFiliere: string | null = null; // Filière sélectionnée
  seuilOral: number = 0; // Seuil oral
  title: string = ''; // Titre dynamique du composant

  // Messages pour notifications
  emailSuccessMessage: string = '';
  emailErrorMessage: string = '';
  publishSuccessMessage: string = '';
  publishErrorMessage: string = '';

  // Indicateur pour l'envoi des emails
  isSendingEmails: boolean = false;

  constructor(
    private ecritNotesService: EcritNotesService,
    private seuilOralService: SeuilOralService,
    private router: Router,
    private http: HttpClient,
    private errorMessageService : ErrorMessageService
  ) {
  }

  ngOnInit(): void {
    this.fetchNotes();
    this.loadSeuilOral();
  }

  fetchNotes(): void {
    this.ecritNotesService.getAllNotes().subscribe((data: any[]) => {
      this.notes = data; // Charger toutes les notes
      this.filteredNotes = [...this.notes]; // Par défaut, afficher toutes les notes
    });
  }

  loadSeuilOral(): void {
    this.seuilOralService.getSeuil().subscribe(
      (data: any) => {
        // Vérifiez que le seuil est bien récupéré
        if (data && data.seuil !== undefined) {
          this.seuilOral = data.seuil;
        } else {
          console.error('Seuil oral non trouvé');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement du seuil oral', error);
      }
    );
  }

  filterNotes(): void {
    this.filteredNotes = this.notes.filter(note => {
      // Filtrer par filière si une filière spécifique est sélectionnée
      const filiereMatch = this.selectedFiliere
        ? note.filiere === this.selectedFiliere
        : true;

      // Filtrer par seuil si une valeur est définie
      const seuilMatch = this.seuilOral
        ? note.note >= this.seuilOral
        : true;

      return filiereMatch && seuilMatch;
    });
  }

  updateSeuil(): void {
    if (this.seuilOral <= 0) {
      alert('Veuillez entrer un seuil oral valide.');
      return;
    }

    this.http.put('http://localhost:8082/Passerelle/seuil_orale', {seuil: this.seuilOral}).subscribe(
      () => {

        this.filterNotes();  // Re-filtrer les notes après mise à jour du seuil
      },
      (error) => {
        console.error('Erreur lors de la sauvegarde du seuil oral:', error);
        alert('Une erreur est survenue.');
      }
    );

  }

  generatePdf(): void {
    // Filtrer les candidats admis pour l'oral en fonction du seuil
    const admitCandidates = this.filteredNotes.filter(note => note.note >= this.seuilOral);

    if (admitCandidates.length === 0) {
      alert(
        this.selectedFiliere
          ? `Aucun candidat admis pour l'oral dans la filière ${this.selectedFiliere}`
          : "Aucun candidat admis pour l'oral dans toutes les filières."
      );
      return;
    }

    // Initialiser le document PDF en mode portrait
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const logoUrl = 'assets/esma/logo-removebg-1.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 70; // Taille du logo
      const imgHeight = 30; // Ajuster la hauteur du logo
      const imgX = (pageWidth - imgWidth) / 2;

      // Ajouter le logo
      doc.addImage(img, 'PNG', imgX, 10, imgWidth, imgHeight);

      // Ajouter le titre principal
      const title = this.selectedFiliere
        ? `Résultats Ecrit (${this.selectedFiliere})`
        : "Résultats Ecrit de toutes les filières";

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, imgHeight + 20, {align: 'center'}); // Adjusted spacing to be closer to the logo

      let startY = imgHeight + 30; // Adjusted starting Y position for tables

      // Définir une couleur uniforme pour toutes les filières
      const filiereColor = '#3498db'; // Couleur bleue uniforme pour toutes les filières

      // Obtenir la liste unique des filières
      const filieres = [...new Set(admitCandidates.map(candidate => candidate.filiere))];

      // Ajouter une table pour chaque filière
      filieres.forEach((filiere, index) => {
        const candidatesByFiliere = admitCandidates.filter(candidate => candidate.filiere === filiere);

        // Ajouter un sous-titre pour chaque filière avec couleur uniforme
        if (index > 0) startY += 10; // Espacement entre les tableaux
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(filiereColor); // Utiliser la couleur uniforme
        doc.text(`Filière : ${filiere}`, pageWidth / 2, startY, {align: 'center'});
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
          margin: {top: 10, left: 14, right: 14},
        });

        // Mettre à jour la position verticale pour la prochaine table
        startY = (doc as any).autoTable.previous.finalY + 10;

        // Ajouter une nouvelle page si nécessaire
        if (startY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          startY = 20;
        }
      });

      // Ouvrir le PDF dans une nouvelle fenêtre ou un nouvel onglet
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };

    // Gestion d'erreur si le logo ne se charge pas
    img.onerror = () => {
      alert('Impossible de charger le logo. Vérifiez l’URL.');
    };
  }


  generateFinalResultsPdf(): void {
    const finalResults = this.filteredNotes.filter(note => note.statusOrale === 'admit');

    if (finalResults.length === 0) {
      alert("Aucun candidat n'a le statut 'admit' pour l'oral.");
      return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4'); // Changed to portrait for consistency
    const logoUrl = 'assets/esma/logo-removebg-1.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 70; // Adjusted logo width
      const imgHeight = 30; // Adjusted logo height
      const imgX = (pageWidth - imgWidth) / 2;

      // Ajouter le logo
      doc.addImage(img, 'PNG', imgX, 10, imgWidth, imgHeight);

      // Titre principal
      const title = this.selectedFiliere
        ? `Résultats finaux (${this.selectedFiliere})`
        : "Résultats finaux de toutes les filières";
      const year = new Date().getFullYear();
      const titleY = imgHeight + 30; // Adjusted to position below the logo

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, titleY, {align: 'center'});


      let startY = titleY + 20;

      if (!this.selectedFiliere) {
        // Obtenir la liste des filières
        const filieres = [...new Set(finalResults.map(candidate => candidate.filiere))];

        filieres.forEach(filiere => {
          // Sous-titre de la filière avec couleur correspondante
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#3498db'); // Couleur bleue pour le titre de la filière
          doc.text(`Filière : ${filiere}`, pageWidth / 2, startY, {align: 'center'});
          startY += 10;

          // Filtrer les candidats pour la filière
          const candidatesByFiliere = finalResults.filter(candidate => candidate.filiere === filiere);

          // Colonnes et contenu de la table
          const tableColumn = ['Nom', 'CIN', 'Filière'];
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
            styles: {fontSize: 10, cellPadding: 3, halign: 'center'},
            headStyles: {fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold'},
            alternateRowStyles: {fillColor: [240, 240, 240]},
          });

          startY = (doc as any).autoTable.previous.finalY + 10;

          // Ajouter une nouvelle page si nécessaire
          if (startY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            startY = 20;
          }
        });
      } else {
        // Résultats pour une seule filière
        const tableColumn = ['Nom', 'CIN', 'Filière'];
        const tableRows = finalResults.map(candidate => [
          candidate.nom || 'Non spécifié',
          candidate.cin || 'Non spécifié',
          candidate.filiere || 'Non spécifié',
        ]);

        // Ajouter la table
        (doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: startY,
          styles: {fontSize: 10, cellPadding: 3, halign: 'center'},
          headStyles: {fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold'},
          alternateRowStyles: {fillColor: [240, 240, 240]},
        });
      }

      // Générer et ouvrir le PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');
      if (newWindow) {
        newWindow.document.title = title;
        newWindow.focus();
      } else {
        alert("Impossible d'ouvrir le PDF dans un nouvel onglet.");
      }
    };

    img.onerror = () => {
      console.error("Erreur lors du chargement du logo.");
      alert("Erreur lors de l'ajout du logo au PDF.");
    };
  }


  addNote(): void {
    this.router.navigate(['/ecrit-form']);
  }

  editNote(id: number): void {
    this.router.navigate(['/ecrit-form', id]);
  }

  deleteNote(id: number): void {
    this.ecritNotesService.deleteNoteById(id).subscribe({
      next  :() => {
        this.fetchNotes();
      },error: (error) => {
        console.log("Erreur reçue :", error);
        let errorMessage = "";
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Une erreur est survenue: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = error?.error?.message || error?.statusText || "Erreur inconnue";
        }
        this.errorMessageService.showErrorMessage(errorMessage, "Une erreur");
      }
    });
  }

  downloadCsv(): void {
    this.ecritNotesService.downloadCsv().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notes.csv';
      a.click();
    });
  }

  sendEmailsToAdmitted(): void {

    if (this.seuilOral == null || this.seuilOral <= 0) {
      this.emailErrorMessage = 'Veuillez entrer un seuil valide.';
      return;
    }

    this.isSendingEmails = true;
    this.emailSuccessMessage = '';
    this.emailErrorMessage = '';

    // Filtrer les notes et extraire les emails
    const emails = this.filteredNotes
      .filter(note => note.note >= this.seuilOral) // Filter according to your logic
      .map(note => note.email); // Collecting all valid email addresses

    if (emails.length > 0) {
      this.ecritNotesService.sendEmailsToAdmitted(this.seuilOral, emails).subscribe({
        next: (response: string) => {
          this.emailSuccessMessage = response;  // Show success message
          this.isSendingEmails = false;
        },
        error: (error) => {
          console.log("sendEmailsToAdmitted ==>" + error)
          this.emailErrorMessage = "Erreur lors de l'envoi des emails. Veuillez réessayer.";  // Show error message
          this.isSendingEmails = false;
        },
      });
    } else {
      this.emailErrorMessage = "Aucun email à envoyer.";
      this.isSendingEmails = false;
    }
  }


  publishResults(): void {
    if (this.filteredNotes.length === 0) {
      this.errorMessageService.showErrorMessage("Aucune donnée à publier." ,"Vide");
      return;
    }
    if(this.seuilOral <= 0 ) {
      this.errorMessageService.showErrorMessage("Choisée un  seuil valid","Seuil invalide");
      return;
    }

    this.isSendingEmails = true;

    this.ecritNotesService.publishResults().subscribe({
      next: () => {
        this.errorMessageService.showSuccessMessage("'Les résultats ont été publiés avec succès." , "Publiés");
        this.fetchNotes();
      },
      error: (error) => {
        if (error.status == 409) {
          this.errorMessageService.showErrorMessage(error.error?.message || "Error ecritNotesService publishResults 409 ." ,"Erreur de publication :");
        } else {
          this.errorMessageService.showErrorMessage(error.error?.message || "Erreur lors de la publication des résultats ecrite." ,"Erreur de publication :");

        }
        console.error('Erreur lors de la publication des résultats:', error);
      },
    });
  }


  publishOralResults(): void {
    if (this.filteredNotes.length === 0) {
      alert("Aucune donnée à publier.");
      return;
    }

    this.isSendingEmails = true;
    this.publishSuccessMessage = '';
    this.publishErrorMessage = '';

    this.ecritNotesService.publishOralResults().subscribe({
      next: (response) => {
        console.log(response.message);
        this.errorMessageService.showSuccessMessage("Les résultats de l’oral ont été publiés avec succès." , "Publiés");
      },
      error: (error) => {
        console.error('Erreur lors de la publication des résultats de l’oral:', error);
        alert('Erreur lors de la publication des résultats de l’oral.');
      }
    });
  }

  // Annuler la publication des résultats écrits
  cancelPublishResults(): void {
    this.http.post<any>('http://localhost:8082/api/ecrit-notes/cancelPublish', {})
      .subscribe(
        response => {
          console.log('Réponse:', response);
          this.errorMessageService.showSuccessMessage(response.message, "Annulée")

          // Clear the seuilOral value
          //this.seuilOral = 0;
        },
        error => {
          console.error('Erreur:', error);
          alert('Une erreur s\'est produite lors de l\'annulation de la publication des résultats.');
        }
      );
  }


// Annuler la publication des résultats finaux
  cancelPublishFinalResults(): void {
    this.http.post<any>('http://localhost:8082/api/ecrit-notes/cancelPublishFinalResults', {})
      .subscribe(
        response => {
          console.log('Réponse:', response);
          this.errorMessageService.showSuccessMessage(response.message, "Cancelled");
        },
        error => {
          console.error('Erreur:', error);
          alert('Une erreur s\'est produite lors de l\'annulation de la publication des résultats finaux.');
        }
      );
  }

}
