package com.omohsine.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.omohsine.project1.entities.AnnonceEntity;

/*
affichage des Annonces Côté candidat
*/
public interface AnnonceCandRepository extends JpaRepository<AnnonceEntity, Long> {

    List<AnnonceEntity> findByVisibility(String visibility);
}
    
