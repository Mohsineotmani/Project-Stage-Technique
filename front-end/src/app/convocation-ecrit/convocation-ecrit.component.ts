import {Component, Input, OnInit} from '@angular/core';
import {jsPDF} from 'jspdf';
import {PreInscriptionsService} from '../service/pre-inscriptions.service'; // Assurez-vous que le chemin est correct
import {TokenService} from '../service/securityService/token.service';
import {HttpClient} from '@angular/common/http';
import {PublishService} from '../service/publish.service';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ErrorMessageService} from "../service/Error/error-message.service";

@Component({
  selector: 'app-convocation-ecrit',
  templateUrl: './convocation-ecrit.component.html',
  styleUrls: ['./convocation-ecrit.component.scss']
})
export class ConvocationEcritComponent implements OnInit {
  @Input() candidat: any;  // Le candidat dont la convocation sera générée
  errorMessage: string = '';
  publishSuccessMessage: string = '';
  userIdTok: string = '';
  candidateId: number = 0;
  cinCandidat: string = '';

  isSeuilLoaded: boolean = false;  // Indicateur pour savoir si le seuil est chargé
  isSeuilOralLoaded: boolean = false;  // Indicateur pour savoir si le seuil Oral est chargé

  seuil: number = 0;   // Initialisation de la propriété seuil
  isEligiblePreSelections: boolean = false;  // Indicateur pour vérifier si le candidat dépasse le seuil
  isPublishedPreSelections: boolean = false;
  moyennePreSelections: number = 0;

  seuilOrale: number = 0;
  isEcritEligible: boolean = false;
  isEcritPublished: boolean = false;
  noteEcritCandidat: number = 0;

  isFinalEligible: boolean = false;
  isFinalPublished: boolean = false;
  noteFinalCandidat: number = 0;


  constructor(
    private tokenService: TokenService,
    private preInscriptionsService: PreInscriptionsService,
    private http: HttpClient,
    private publishService: PublishService,
    private route: ActivatedRoute,
    private  errorMessageService:ErrorMessageService
  ) {
  }

  ngOnInit(): void {

    const userId = this.tokenService.getId();

    this.checkIfPublishedPreSelections();
    this.checkIfPublishedEcrit();
    this.loadSeuil();
    this.loadCandidatProfile();
    this.loadSeuilOrale();
    this.getCandidateId();
  }


  //charge candidat
  getCandidateId(): void {
    const userId = this.tokenService.getId();
    if (userId === null) {
      console.error('User ID is null');
      return;
    }
    this.userIdTok = userId;

    const url = `http://localhost:8082/PasserelleApi/candidate/getIdByUserId?userId=${userId}`;
    this.http.get<number>(url).subscribe({
      next: (response) => {
        this.candidateId = response;
        this.getCandidatCin(this.candidateId);
        this.getNoteByCin(this.candidateId);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID candidat:', err);
      }
    });

  }

  getCandidatCin(candidateId: number): void {
    this.preInscriptionsService.getCandidateById(candidateId).subscribe({
      next: (data) => {
        if (data && data.cin) {
          this.cinCandidat = data.cin;  // Assigner le CIN
          console.log('CIN Candidat:', this.cinCandidat);  // Afficher le CIN dans la console
        } else {
          console.error('CIN non trouvé dans la réponse.');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du CIN :', error);
      }
    });
  }

  loadCandidatProfile(): void {
    const userId = this.tokenService.getId();
    if (userId) {
      const url = `http://localhost:8082/PasserelleApi/candidate/user/${userId}`;
      this.http.get(url).subscribe(
        (data: any) => {
          console.log('Données candidat récupérées:', data);
          this.candidat = data;
          this.calculateMoyennePreSelections(); // Calculer la moyennePreSelections après récupération
          this.checkIfPublishedPreSelections(); // Vérifier l'éligibilité
        },
        (error: any) => {
          console.error(`Erreur lors du chargement des données candidat pour l'URL ${url}`, error);
          this.errorMessage = 'Impossible de charger les données du candidat.';
        }
      );
    }
  }



  // Vérifier note PreSelections
  checkEligibilityPreSelections(): void {
    if (this.isSeuilLoaded && this.candidat) {
      this.isEligiblePreSelections = this.moyennePreSelections >= this.seuil;
    }
  }

  calculateMoyennePreSelections(): void {
    if (this.candidat?.notePremiereAnnee != null && this.candidat?.noteDeuxiemeAnnee != null) {
      // Convertir les notes en nombres avant d'effectuer le calcul
      const note1 = parseFloat(this.candidat.notePremiereAnnee);
      const note2 = parseFloat(this.candidat.noteDeuxiemeAnnee);

      if (!isNaN(note1) && !isNaN(note2)) {
        this.moyennePreSelections = (note1 + note2) / 2;
      } else {
        console.error('Les notes du candidat ne sont pas valides.');
      }
    } else {
      console.error('Les notes du candidat ne sont pas disponibles.');
    }
  }

  loadSeuil(): void {
    this.preInscriptionsService.getSeuil().subscribe((response) => {
      this.seuil = response.seuil;  // Mettre à jour la valeur de seuil avec la réponse
      this.isSeuilLoaded = true;  // Indiquer que le seuil a été chargé
      this.calculateMoyennePreSelections();  // Calculer la moyennePreSelections
      this.checkIfPublishedPreSelections();  // Vérifier si le candidat est éligible
    });
  }

  checkIfPublishedPreSelections(): void {
    this.preInscriptionsService.getIsPublishedPreSelections().subscribe(
      (isPublishedPreSelections: boolean) => {
        this.isPublishedPreSelections = isPublishedPreSelections;
      },
      (error: any) => {
        console.error('Erreur lors de la vérification de la publication des résultats de Préselection', error);
      }
    );
    if(this.isPublishedPreSelections )  this.checkEligibilityPreSelections() ;
  }

  generateConvocation(candidat: any): void {
    const doc = new jsPDF();
    const logoPath = 'assets/esma/logo-removebg-1.png';
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 80;
    const logoHeight = 40;
    const logoX = (pageWidth - logoWidth) / 2; // Center the logo
    const logoY = 10;

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Titles
      const title = "Convocation";
      const title2 = "CONCOURS COMMUN D'ACCES AUX LICENCE PROFESSIONNELLE SIDI BENNOUR ";
      const title3 = "Septembre 2025";

      const titleY = logoY + logoHeight + 10;
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text(title, pageWidth / 2, titleY, {align: "center"});
      doc.setFontSize(12);
      doc.text(title2, pageWidth / 2, titleY + 8, {align: "center"});
      doc.setTextColor(255, 0, 0); // Red for title3
      doc.text(title3, pageWidth / 2, titleY + 16, {align: "center"});

      let startY = titleY + 26; // Adjusted start position for the next section
      doc.setTextColor(0, 0, 0); // Reset text color to black

      // Tableau de données
      const data = [
        {label: 'Nom et Prénom :', value: `${candidat.nom} ${candidat.prenom}`},
        {label: 'N° de convocation :', value: candidat.idCandidat},
        {label: 'CIN :', value: candidat.cin},
        {label: 'CNE :', value: candidat.codeEtudiant},
        {label: 'Filière :', value: candidat.filiereChoisi}
      ];

      // Utilisation d'autoTable pour créer un tableau
      const tableData = data.map(item => [item.label, item.value]); // Mapper les données pour le tableau

      (doc as any).autoTable({
        body: tableData,           // Données du tableau
        startY: startY,            // Position de départ du tableau
        margin: {top: 2},        // Marge au-dessus du tableau
        theme: 'plain',            // Aucune bordure, simple tableau
        styles: {
          cellPadding: 1,
          fontSize: 12,
          font: 'Arial',
        },
        columnStyles: {
          0: {textColor: [0, 0, 0], cellWidth: 45, fontStyle: 'bold',}, // Texte rouge pour la première colonne
          1: {textColor: [0, 0, 0], cellWidth: 35},   // Texte noir pour la deuxième colonne
        },
      });

      //********* */
      //************ */

      // Paragraphe avec la date en rouge, en gras et soulignée
      const paragraph = 'Veuillez-vous présenter aux épreuves écrites du concours qui se déroulera le';

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);  // Texte noir pour le reste du paragraphe
      doc.setFont('Arial', 'normal')
      // Utilisation de splitTextToSize pour gérer le retour à la ligne
      const paragraphLines = doc.splitTextToSize(paragraph, pageWidth - 30); // 40 est la marge à gauche et à droite

      // Affichage du paragraphe ligne par ligne
      let paragraphStartY = startY + 40;  // Position du début du paragraphe
      for (let i = 0; i < paragraphLines.length; i++) {
        doc.text(paragraphLines[i], 20, paragraphStartY + (i * 10)); // Décalage de 10 pour chaque nouvelle ligne
      }

      // Texte en rouge, en gras et souligné pour la date
      const dateText = 'dimanche 14 septembre 2025 à 8h00 du matin';
      doc.setFont('Arial', 'bold');
      doc.setTextColor(255, 0, 0); // Rouge pour la date


     // Positionner correctement la date en bas du paragraphe
      const dateXPos = 20 + doc.getStringUnitWidth(paragraph.slice(0, paragraph.indexOf(dateText))) * doc.internal.scaleFactor;
      const dateYPos = paragraphStartY + (paragraphLines.length * 10); // La date doit être à la fin du dernier paragraphe

      doc.text(dateText, dateXPos, dateYPos);

      // Souligner la date
      doc.setLineWidth(0.5);
      const xPos = dateXPos;
      const yPos = dateYPos + 2;  // Position légèrement sous le texte
      doc.line(xPos, yPos, xPos + doc.getStringUnitWidth(dateText) * doc.internal.scaleFactor, yPos);


      //!********************************* *!/




      const examLocationParagraph = 'L\'examen aura lieu à l\'École Supérieure de Marrakech, dans la salle C2 du Batiment C. Veuillez vous présenter une heure avant le début de l\'examen pour l\'enregistrement et la vérification des informations.';
      let tableStartY = startY + (data.length * 10) + 12;

      // Titre du tableau
      doc.setFontSize(12);
      doc.setFont("Arial", "bold");

      // Données du tableau avec deux lignes
      const locationTableData = [
        ['Lieu d\'examen'],                // Première ligne : titre
        [examLocationParagraph]            // Deuxième ligne : texte du lieu
      ];

      // Création du tableau avec bordures
      (doc as any).autoTable({
        body: locationTableData,           // Données du tableau
        startY: tableStartY,          // Position de départ pour la table
        margin: {top: 5},
        theme: 'grid',                     // Utilisation du thème avec bordures
        styles: {
          cellPadding: 3,                  // Espacement entre les bordures des cellules et le contenu
          fontSize: 12,
          font: 'Arial',
          valign: 'top',                   // Assurez-vous que le texte soit aligné en haut
          lineWidth: 0.5,                  // Largeur des bordures
          lineColor: [0, 0, 0],
          halign: 'center',
        },
        columnStyles: {
          0: {
            cellWidth: pageWidth - 40,
            fontStyle: 'normal',
            fillColor: '#FBFBFB',
            halign: 'center',
          },
        },
      });

//**************************** */

// Ajouter un titre après la table du lieu d'examen
      const additionalTitle = "Consignes Importantes";
      const additionalTitleY = tableStartY + 40;  // Position du titre après la table (ajustez selon la taille de la table)

      // Définir la police et la taille pour le titre
      doc.setFontSize(12);
      doc.setFont("Arial", "bold");
      doc.setTextColor(0, 0, 0);

      // Ajouter le titre
      doc.text(additionalTitle, pageWidth / 2, additionalTitleY, {align: "center"});

      const consignes = [
        {title: "Consignes Générales :"},
        {text: "¤ Les candidats doivent se présenter au centre du concours à ", boldText: "8 heures ", nextText: ""},
        {text: "¤ Les cartables et sacs doivent être déposés au devant de la salle avant le démarrage du concours."},
        {text: "¤ Aucune communication et aucun prêt de matériel n'est autorisé entre les candidats pendant le concours."},
        {text: "¤ Il est fortement interdit d'introduire dans la salle d'examen le téléphone portable, la calculatrice, \ntout document et tout appareil."},

        {text: " "},

        {title: "Documents à apporter :"},
        {text: "    ¤ la présente convocation au concours"},
        {text: "    ¤ la carte nationale d'identité"},
        {text: "    ¤ un stylo bleu ou noir"},
      ];

      let consignesStartY = additionalTitleY + 10;
      doc.setFontSize(12);
      doc.setFont("Arial", "normal");

      for (let i = 0; i < consignes.length; i++) {
        const consigne = consignes[i];

        if (consigne.title) {

          // Afficher le titre en gras
          doc.setFont("Arial", "bold");
          doc.text(consigne.title.trim(), 20, consignesStartY); // Utiliser trim() pour supprimer les espaces ou sauts de ligne inutiles

          // Calculer la largeur du titre pour la ligne de soulignement
          const titleWidth = doc.getTextWidth(consigne.title.trim());

          // Ajouter une ligne pour souligner
          doc.setDrawColor(0); // Couleur de la ligne (noir)
          doc.setLineWidth(0.5); // Épaisseur de la ligne
          doc.line(20, consignesStartY + 1, 20 + titleWidth, consignesStartY + 1); // Tracer la ligne

          consignesStartY += 10; // Ajouter un espace après le titre
          doc.setFont("Arial", "normal");

        } else if (consigne.text) {
          const consigneText = consigne.text;

          doc.text(consigneText, 20, consignesStartY);

          if (consigne.boldText) {
            const boldText = consigne.boldText;
            const boldTextWidth = doc.getStringUnitWidth(consigneText) * doc.internal.scaleFactor;
            doc.setFont("Arial", "bold");
            doc.text(boldText, 55 + boldTextWidth, consignesStartY);
            doc.setFont("Arial", "normal");
          }
          if (consigne.nextText) {
            const nextTextWidth = doc.getStringUnitWidth(consigneText + consigne.boldText) * doc.internal.scaleFactor;
            doc.text(consigne.nextText, 60 + nextTextWidth, consignesStartY);
          }
          consignesStartY += 8;
        }

      }

      //**************************************** */
      // Ouvrir le PDF dans un nouvel onglet
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newTab = window.open(pdfUrl, '_blank');

      if (newTab) {
        newTab.document.title = `${candidat.nom}_${candidat.prenom}_convocation.pdf`;
      }
    };

    img.onerror = () => {
      console.error("Erreur de chargement de l'image.");
    };
  }



  // Vérifier note Ecrite pour passé l'oral
  checkEcritEligibility(): void {
    if (this.isSeuilOralLoaded && this.noteEcritCandidat >= this.seuilOrale) {
      this.isEcritEligible = true;
    } else {
      this.isEcritEligible = false;
    }
  }

  getNoteByCin(candidateId: number): void {
    // Appel à la méthode pour récupérer le candidat en fonction de l'ID
    this.preInscriptionsService.getCandidateById(candidateId).subscribe({
      next: (data) => {
        if (data && data.cin) {
          this.cinCandidat = data.cin;  // Assigner le CIN récupéré
          console.log('CIN récupéré:', this.cinCandidat);
          // Appeler la méthode pour récupérer la note avec le CIN
          this.preInscriptionsService.getNoteEcritByCin(this.cinCandidat).subscribe(
            (note) => {
              console.log('Note récupérée :', note);  // Vérifiez ici la valeur retournée
              this.noteEcritCandidat = note;
              this.checkIfPublishedEcrit(); // Vérifier l'éligibilité après avoir récupéré la note
            },
            (error) => {
              console.error('Erreur lors de la récupération de la note :', error);
            }
          );
        } else {
          console.error('CIN non trouvé pour le candidat.');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du candidat :', error);
      }
    });
  }

  loadSeuilOrale(): void {
    this.preInscriptionsService.getSeuilOrale().subscribe((response) => {
      this.seuilOrale = response.seuil;
      //alert("this.seuilOrale"+this.seuilOrale);
      this.isSeuilOralLoaded = true;
      this.checkIfPublishedEcrit();
    });
  }

  checkIfPublishedEcrit(): void {
    this.preInscriptionsService.getIsPublishedEcrit().subscribe(
      (isEcritPublished: boolean) => {
        this.isEcritPublished = isEcritPublished;
        //alert("checkIfPublishedEcrit : " + isEcritPublished);
      },
      (error: any) => {
        console.error('Erreur lors de la vérification de la publication des résultats écrits', error);
        this.errorMessage = 'Impossible de vérifier l’état de publication des résultats écrits.';
      }
    );
    if(this.isEcritPublished) this.checkEcritEligibility();
  }

  generateConvocationOrale(candidat: any): void {
    const doc = new jsPDF();
    const logoPath = 'assets/esma/logo-removebg-1.png';
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 80;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2; // Center the logo
    const logoY = 10;

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Titles
      const title = "Convocation";
      const title2 = "CONCOURS COMMUN D'ACCES AUX llICENCE PROFESSIONNELLE SIDI BENNOUR";
      const title3 = "Octobre 2025";

      const titleY = logoY + logoHeight + 10;
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text(title, pageWidth / 2, titleY, {align: "center"});
      doc.setFontSize(12);
      doc.text(title2, pageWidth / 2, titleY + 8, {align: "center"});
      doc.setTextColor(255, 0, 0); // Red for title3
      doc.text(title3, pageWidth / 2, titleY + 16, {align: "center"});

      let startY = titleY + 26; // Adjusted start position for the next section
      doc.setTextColor(0, 0, 0); // Reset text color to black

      // Tableau de données
      const data = [
        {label: 'Nom et Prénom :', value: `${candidat.nom} ${candidat.prenom}`},
        {label: 'N° de convocation :', value: candidat.idCandidat},
        {label: 'CIN :', value: candidat.cin},
        {label: 'CNE :', value: candidat.codeEtudiant},
        {label: 'Filière :', value: candidat.filiereChoisi}
      ];

      // Utilisation d'autoTable pour créer un tableau
      const tableData = data.map(item => [item.label, item.value]); // Mapper les données pour le tableau

      (doc as any).autoTable({
        body: tableData,           // Données du tableau
        startY: startY,            // Position de départ du tableau
        margin: {top: 2},        // Marge au-dessus du tableau
        theme: 'plain',            // Aucune bordure, simple tableau
        styles: {
          cellPadding: 1,
          fontSize: 12,
          font: 'Arial',
        },
        columnStyles: {
          0: {textColor: [0, 0, 0], cellWidth: 45, fontStyle: 'bold',}, // Texte rouge pour la première colonne
          1: {textColor: [0, 0, 0], cellWidth: 35},   // Texte noir pour la deuxième colonne
        },
      });

      //********* */
      //************ */

      // Paragraphe avec la date en rouge, en gras et soulignée
      const paragraph = 'Veuillez-vous présenter aux entretiens orales du concours qui se déroulera ';

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);  // Texte noir pour le reste du paragraphe
      doc.setFont('Arial', 'normal')
      // Utilisation de splitTextToSize pour gérer le retour à la ligne
      const paragraphLines = doc.splitTextToSize(paragraph, pageWidth - 30); // 40 est la marge à gauche et à droite

      // Affichage du paragraphe ligne par ligne
      let paragraphStartY = startY + 40;  // Position du début du paragraphe
      for (let i = 0; i < paragraphLines.length; i++) {
        doc.text(paragraphLines[i], 20, paragraphStartY + (i * 10)); // Décalage de 10 pour chaque nouvelle ligne
      }

      // Texte en rouge, en gras et souligné pour la date
      const dateText = 'dimanche 04 Octobre 2025 à 10h00 du matin';
      doc.setFont('Arial', 'bold');
      doc.setTextColor(255, 0, 0); // Rouge pour la date

      // Positionner correctement la date en bas du paragraphe
      const dateXPos = 20 + doc.getStringUnitWidth(paragraph.slice(0, paragraph.indexOf(dateText))) * doc.internal.scaleFactor;
      const dateYPos = paragraphStartY + (paragraphLines.length * 10); // La date doit être à la fin du dernier paragraphe

      doc.text(dateText, dateXPos, dateYPos);

      // Souligner la date
      doc.setLineWidth(0.5);
      const xPos = dateXPos;
      const yPos = dateYPos + 2;  // Position légèrement sous le texte
      doc.line(xPos, yPos, xPos + doc.getStringUnitWidth(dateText) * doc.internal.scaleFactor, yPos);


      //********************************* */

      const examLocationParagraph = 'L\'entretien aura lieu à l\' École Supérieure de Marrakech, dans la salle B6 du Batiment B. Veuillez vous présenter une heure avant le début de l\'examen pour l\'enregistrement et la vérification des informations.';
      let tableStartY = startY + (data.length * 10) + 12;

      // Titre du tableau
      doc.setFontSize(12);
      doc.setFont("Arial", "bold");

      // Données du tableau avec deux lignes
      const locationTableData = [
        ['Lieu d\'examen'],                // Première ligne : titre
        [examLocationParagraph]            // Deuxième ligne : texte du lieu
      ];

      // Création du tableau avec bordures
      (doc as any).autoTable({
        body: locationTableData,           // Données du tableau
        startY: tableStartY,          // Position de départ pour la table
        margin: {top: 5},
        theme: 'grid',                     // Utilisation du thème avec bordures
        styles: {
          cellPadding: 3,                  // Espacement entre les bordures des cellules et le contenu
          fontSize: 12,
          font: 'Arial',
          valign: 'top',                   // Assurez-vous que le texte soit aligné en haut
          lineWidth: 0.5,                  // Largeur des bordures
          lineColor: [0, 0, 0],
          halign: 'center',
        },
        columnStyles: {
          0: {
            cellWidth: pageWidth - 40,
            fillColor: '#FBFBFB',
            fontStyle: 'normal',
            halign: 'center',
          },
        },
      });

//**************************** */

// Ajouter un titre après la table du lieu d'examen
      const additionalTitle = "Consignes Importantes Pour l'entretien Oral";
      const additionalTitleY = tableStartY + 40;  // Position du titre après la table (ajustez selon la taille de la table)

      // Définir la police et la taille pour le titre
      doc.setFontSize(12);
      doc.setFont("Arial", "bold");
      doc.setTextColor(0, 0, 0);

      // Ajouter le titre
      doc.text(additionalTitle, pageWidth / 2, additionalTitleY, {align: "center"});

      const consignes = [
        {title: "Consignes Générales :"},
        {
          text: "¤ Les candidats doivent se présenter au centre du concours à ",
          boldText: "10 heures du matin",
          nextText: ""
        },
        {
          text: "¤ Veuillez arriver au moins  ",
          boldText2: "30 minutes",
          nextText2: " avant l’heure de l’entretien pour les formalités d’inscription."
        },
        {text: "¤ L’entretien dure environ ", boldText2: "20 à 30 minutes."},
        {text: "¤ Assurez-vous d’être ponctuel(e). Tout retard pourrait entraîner l'annulation de votre entretien."},
        {text: "¤ Adoptez une tenue correcte et professionnelle."},
        {text: "¤ Préparez-vous à répondre à des questions techniques et à présenter vos motivations, vos projets \nprofessionnels, et vos expériences académiques ou extra-académiques.\n"},
        {text: " "},

        {title: "Documents à apporter :"},
        {text: "   ¤ Une copie de votre carte nationale d'identité (CIN) ou passeport."},
        {text: "   ¤ Votre convocation imprimée."},
        {text: "   ¤ Les originaux et copies certifiées conformes des diplômes et relevés de notes mentionnés dans votre \n    dossier."},
        {text: ""},

      ];

      let consignesStartY = additionalTitleY + 10;
      doc.setFontSize(12);
      doc.setFont("Arial", "normal");

      for (let i = 0; i < consignes.length; i++) {
        const consigne = consignes[i];

        if (consigne.title) {

          // Afficher le titre en gras
          doc.setFont("Arial", "bold");
          doc.text(consigne.title.trim(), 20, consignesStartY); // Utiliser trim() pour supprimer les espaces ou sauts de ligne inutiles

          // Calculer la largeur du titre pour la ligne de soulignement
          const titleWidth = doc.getTextWidth(consigne.title.trim());

          // Ajouter une ligne pour souligner
          doc.setDrawColor(0); // Couleur de la ligne (noir)
          doc.setLineWidth(0.5); // Épaisseur de la ligne
          doc.line(20, consignesStartY + 1, 20 + titleWidth, consignesStartY + 1); // Tracer la ligne

          consignesStartY += 10; // Ajouter un espace après le titre
          doc.setFont("Arial", "normal");

        } else if (consigne.text) {

          const consigneText = consigne.text;
          doc.text(consigneText, 20, consignesStartY);

          if (consigne.boldText) {
            const boldText = consigne.boldText;
            const boldTextWidth = doc.getStringUnitWidth(consigneText) * doc.internal.scaleFactor;
            doc.setFont("Arial", "bold");
            doc.text(boldText, 55 + boldTextWidth, consignesStartY);
            doc.setFont("Arial", "normal");
          }
          if (consigne.boldText2) {
            const boldText2 = consigne.boldText2;
            const boldTextWidth = doc.getStringUnitWidth(consigneText) * doc.internal.scaleFactor;
            doc.setFont("Arial", "bold");
            doc.text(boldText2, 36 + boldTextWidth, consignesStartY);
            doc.setFont("Arial", "normal");
          }
          if (consigne.nextText) {
            const nextTextWidth = doc.getStringUnitWidth(consigneText + consigne.boldText) * doc.internal.scaleFactor;
            doc.text(consigne.nextText, 60 + nextTextWidth, consignesStartY);
          }
          if (consigne.nextText2) {
            const nextTextWidth = doc.getStringUnitWidth(consigneText + consigne.boldText2) * doc.internal.scaleFactor;
            doc.text(consigne.nextText2, 45 + nextTextWidth, consignesStartY);
          }
          consignesStartY += 8;
        }
        const consigneText = consigne.text;


      }

      //**************************************** */
      // Ouvrir le PDF dans un nouvel onglet
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newTab = window.open(pdfUrl, '_blank');

      if (newTab) {
        newTab.document.title = `${candidat.nom}_${candidat.prenom}_convocation.pdf`;
      }
    };

    img.onerror = () => {
      console.error("Erreur de chargement de l'image.");
    };
  }



// Vérifier note Finale

  ///oral est final ici

  checkFinalEligibility(): void {
    if (this.isSeuilOralLoaded && this.noteFinalCandidat >= this.seuilOrale) {
      this.isFinalEligible = true;
    } else {
      this.isFinalEligible = false;
    }
  }

  getFinalByCin(candidateId: number): void {
    // Appel à la méthode pour récupérer le candidat en fonction de l'ID
    this.preInscriptionsService.getCandidateById(candidateId).subscribe({
      next: (data) => {
        if (data && data.cin) {
          this.cinCandidat = data.cin;  // Assigner le CIN récupéré
          console.log('CIN récupéré:', this.cinCandidat);
          // Appeler la méthode pour récupérer la note avec le CIN
          this.preInscriptionsService.getNoteFinalByCin(this.cinCandidat).subscribe(
            (note) => {
              console.log('Note récupérée :', note);  // Vérifiez ici la valeur retournée
              this.noteFinalCandidat = note;
              this.checkIfPublishedFinal(); // Vérifier l'éligibilité après avoir récupéré la note
            },
            (error) => {
              console.error('Erreur lors de la récupération de la note :', error);
            }
          );
        } else {
          console.error('CIN non trouvé pour le candidat.');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du candidat :', error);
      }
    });
  }


  checkIfPublishedFinal(): void {
    this.preInscriptionsService.getIsPublishedFinal().subscribe(
      (isFinalPublished: boolean) => {
        this.isFinalPublished = isFinalPublished;
        //alert("checkIfPublishedFinal : " + isFinalPublished);
      },
      (error: any) => {
        console.error('Erreur lors de la vérification de la publication des résultats écrits', error);
        this.errorMessage = 'Impossible de vérifier l’état de publication des résultats écrits.';
      }
    );
    if(this.isFinalPublished) this.checkFinalEligibility();
  }

  generateConvocationAdmission(candidat: any): void {
    const doc = new jsPDF();
    const logoPath = 'assets/esma/logo-removebg-1.png';
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 80;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 10;

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      // En-tête avec logo
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Titres
      doc.setFontSize(16);
      doc.setFont("Helvetica", "bold");
      doc.text("Lettre d'Admission Officielle", pageWidth / 2, logoY + logoHeight + 15, {align: "center"});

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("CONCOURS COMMUN D'ACCÈS AUX LICENCES PROFESSIONNELLES", pageWidth / 2, logoY + logoHeight + 25, {align: "center"});
      doc.text("Session Octobre 2025", pageWidth / 2, logoY + logoHeight + 32, {align: "center"});

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, logoY + logoHeight + 40, pageWidth - 20, logoY + logoHeight + 40);

      // Informations du candidat
      let startY = logoY + logoHeight + 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      const infoCandidat = [
        {label: 'Référence Admission :', value: `ADM-${candidat.idCandidat}-2025`},
        {label: 'Nom et Prénom :', value: `${candidat.nom.toUpperCase()} ${candidat.prenom}`},
        {label: 'CIN :', value: candidat.cin},
        {label: 'CNE :', value: candidat.codeEtudiant},
        {label: 'Filière Admise :', value: candidat.filiereChoisi}
      ];

      // Tableau d'informations
      (doc as any).autoTable({
        body: infoCandidat.map(item => [item.label, item.value]),
        startY: startY,
        margin: {top: 5},
        theme: 'plain',
        styles: {
          cellPadding: 5,
          fontSize: 12,
          font: 'Helvetica',
        },
        columnStyles: {
          0: {cellWidth: 60, fontStyle: 'bold', textColor: [70, 70, 70]},
          1: {cellWidth: 'auto'}
        }
      });

      // Message de félicitations
      startY += (infoCandidat.length * 15) + 10;
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(40, 100, 40); // Vert foncé
      doc.text("FÉLICITATIONS !", 20, startY);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const messageLines = doc.splitTextToSize(
        `Nous avons le plaisir de vous informer que vous avez réussi avec succès les deux épreuves du concours (écrit et oral) et êtes admis(e) en ${candidat.filiereChoisi}.`,
        pageWidth - 40
      );
      doc.text(messageLines, 20, startY + 10);

      // Détails des résultats
      startY += 25;
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.text("Détail de vos résultats :", 20, startY);

      const resultsData = [
        ['Épreuve', 'Note', 'Moyenne Requise', 'Statut'],
        ['Examen Écrit',  '--', '', 'Admis'],
        ['Entretien Oral','--', '≥ 12/20', 'Admis']
      ];

      (doc as any).autoTable({
        head: [resultsData[0]],
        body: resultsData.slice(1),
        startY: startY + 5,
        margin: {top: 5},
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: {cellWidth: 60},
          1: {cellWidth: 30, halign: 'center'},
          2: {cellWidth: 40, halign: 'center'},
          3: {cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [40, 100, 40]}
        }
      });

      // Instructions pour l'inscription
      startY += 60;
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.text("PROCHAINES ÉTAPES :", 20, startY);

      doc.setFont("Helvetica", "normal");
      const instructions = [
        "1. Confirmez votre acceptation en signant et renvoyant ce document avant le 15/10/2025",
        "2. Présentez-vous au secrétariat de l'école avec les documents originaux",
        "3. Paiement des frais d'inscription (5 000 Dhs) avant le 20/10/2025",
        "4. Réunion d'accueil le 25/10/2025 à 10h en salle B6"
      ];

      instructions.forEach((item, index) => {
        doc.text(item, 25, startY + 15 + (index * 7));
      });

      // Pied de page
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(" École Supérieure de Marrakech", pageWidth / 2, footerY, {align: "center"});
      doc.text("Avenue Prince Moulay Abdellah, Rouidate 1, Guéliz, Marrakech , Maroc- Tél: +212 5 24 33 11 25", pageWidth / 2, footerY + 6, {align: "center"});

      // Signature
      doc.setFontSize(10);
      doc.text("Le Directeur des Admissions,", pageWidth - 70, footerY - 20);
      doc.setTextColor(150, 150, 150);
      doc.text("Dr.  Mohamed Berrada", pageWidth - 70, footerY - 10);

      // Génération du PDF
      const fileName = `Admission_${candidat.nom}_${candidat.prenom}.pdf`;
      doc.save(fileName);
    };

    img.onerror = () => {
      console.error("Erreur de chargement du logo");
      this.errorMessageService.showErrorMessage("Erreur lors de la génération du PDF","");
    };
  }

}
