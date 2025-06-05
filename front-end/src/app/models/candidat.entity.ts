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
  