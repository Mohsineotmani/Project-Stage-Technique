package com.omohsine.project1.entities;

import java.util.Date;
import javax.persistence.*;

@Entity(name = "Candidat")
public class CandidatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_candidat", nullable = false)
    private Long idCandidat;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(columnDefinition = "int default 0") // Valeur par défaut 0
    private int resultatPreselections;


    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "genre", nullable = false)
    private String genre;

    @Column(name = "cin")
    private String cin;

    @Column(name = "code_etudiant")
    private String codeEtudiant;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_naissance")
    private Date dateNaissance;

    @Column(name = "pays")
    private String pays;

    @Column(name = "ville")
    private String ville;

    @Column(name = "tel")
    private String tel;

    @Column(name = "email")
    private String email;

    @Lob
    @Column(name = "copie_bac")
    private String copieBac;

    @Column(name = "serie_bac")
    private String serieBac;

    @Column(name = "mention_bac")
    private String mentionBac;

    @Lob
    @Column(name = "releve_bac")
    private String releveBac;

    @Lob
    @Column(name = "copie_diplome")
    private String copieDiplome;

    @Column(name = "titre_diplome")
    private String titreDiplome;

    @Lob
    @Column(name = "releve_diplome_annee_1")
    private String releveDiplomeAnnee1;

    @Lob
    @Column(name = "releve_diplome_annee_2")
    private String releveDiplomeAnnee2;

    @Column(name = "note_premiere_annee")
    private String notePremiereAnnee;

    @Column(name = "note_deuxieme_annee")
    private String noteDeuxiemeAnnee;

    @Column(name = "etablissement")
    private String etablissement;

    @Column(name = "filiere_choisie")
    private String filiereChoisi;

    @Column(name = "status_preselectionne")
    private int statusPreselectionne = 0; // 0: Not preselected, 1: Preselected

    // Getters and Setters
    public Long getIdCandidat() {
        return idCandidat;
    }

    public void setIdCandidat(Long idCandidat) {
        this.idCandidat = idCandidat;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getResultatPreselections() {
        return resultatPreselections;
    }

    public void setResultatPreselections(int resultatPreselections) {
        this.resultatPreselections = resultatPreselections;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getCodeEtudiant() {
        return codeEtudiant;
    }

    public void setCodeEtudiant(String codeEtudiant) {
        this.codeEtudiant = codeEtudiant;
    }

    public Date getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(Date dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCopieBac() {
        return copieBac;
    }

    public void setCopieBac(String copieBac) {
        this.copieBac = copieBac;
    }

    public String getSerieBac() {
        return serieBac;
    }

    public void setSerieBac(String serieBac) {
        this.serieBac = serieBac;
    }

    public String getMentionBac() {
        return mentionBac;
    }

    public void setMentionBac(String mentionBac) {
        this.mentionBac = mentionBac;
    }

    public String getReleveBac() {
        return releveBac;
    }

    public void setReleveBac(String releveBac) {
        this.releveBac = releveBac;
    }

    public String getCopieDiplome() {
        return copieDiplome;
    }

    public void setCopieDiplome(String copieDiplome) {
        this.copieDiplome = copieDiplome;
    }

    public String getTitreDiplome() {
        return titreDiplome;
    }

    public void setTitreDiplome(String titreDiplome) {
        this.titreDiplome = titreDiplome;
    }

    public String getReleveDiplomeAnnee1() {
        return releveDiplomeAnnee1;
    }

    public void setReleveDiplomeAnnee1(String releveDiplomeAnnee1) {
        this.releveDiplomeAnnee1 = releveDiplomeAnnee1;
    }

    public String getReleveDiplomeAnnee2() {
        return releveDiplomeAnnee2;
    }

    public void setReleveDiplomeAnnee2(String releveDiplomeAnnee2) {
        this.releveDiplomeAnnee2 = releveDiplomeAnnee2;
    }

    public String getNotePremiereAnnee() {
        return notePremiereAnnee;
    }

    public void setNotePremiereAnnee(String notePremiereAnnee) {
        this.notePremiereAnnee = notePremiereAnnee;
    }

    public String getNoteDeuxiemeAnnee() {
        return noteDeuxiemeAnnee;
    }

    public void setNoteDeuxiemeAnnee(String noteDeuxiemeAnnee) {
        this.noteDeuxiemeAnnee = noteDeuxiemeAnnee;
    }

    public String getEtablissement() {
        return etablissement;
    }

    public void setEtablissement(String etablissement) {
        this.etablissement = etablissement;
    }

    public String getFiliereChoisi() {
        return filiereChoisi;
    }

    public void setFiliereChoisi(String filiereChoisi) {
        this.filiereChoisi = filiereChoisi;
    }

    public int getStatusPreselectionne() {
        return statusPreselectionne;
    }

    public void setStatusPreselectionne(int statusPreselectionne) {
        this.statusPreselectionne = statusPreselectionne;
    }
}