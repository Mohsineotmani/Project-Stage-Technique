package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.CandidatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatRepository extends JpaRepository<CandidatEntity, Long> {

    Optional<CandidatEntity> findByCin(String cin);
    Optional<CandidatEntity> findByCodeEtudiant(String codeEtudiant);
    Optional<CandidatEntity> findCandidatByEmail(String email);
    Optional<CandidatEntity> findByTel(String tel);
    List<CandidatEntity> findByNom(String nom);
    List<CandidatEntity> findByFiliereChoisi(String filiereChoisi);
    List<CandidatEntity> findByNomContaining(String nom);
    Optional<CandidatEntity> findByUserId(String userId);
    boolean existsByUserId(String userId);
    // Vérifie si un CIN existe déjà
    boolean existsByCin(String cin);



    @Transactional
    @Modifying
    @Query("UPDATE Candidat c SET c.resultatPreselections = 0 WHERE c.resultatPreselections = 1")
    int updatePublicationStatusToZero();

    @Modifying
    @Query("UPDATE Candidat c SET c.resultatPreselections = 1")
    void publierResultats();

    boolean existsByResultatPreselections(int resultatPreselections);

    @Query("SELECT c.filiereChoisi, COUNT(c) FROM Candidat c GROUP BY c.filiereChoisi ORDER BY COUNT(c) DESC")
    List<Object[]> countByFiliereChoisi();

    @Query("SELECT COUNT(c) FROM Candidat c WHERE c.genre = 'H'")
    long countHommes();

    @Query("SELECT COUNT(c) FROM Candidat c WHERE c.genre = 'F'")
    long countFemmes();



}