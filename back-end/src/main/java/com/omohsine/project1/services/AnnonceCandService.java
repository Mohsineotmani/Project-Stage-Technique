package com.omohsine.project1.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.omohsine.project1.entities.AnnonceEntity;
import com.omohsine.project1.repositories.AnnonceCandRepository;


/*
affichage des Annonces Côté candidat
*/
@Service
public class AnnonceCandService {
 @Autowired
    private AnnonceCandRepository annoncecandRepository;

    public List<AnnonceEntity> getAnnonceByVisibility(String visibility) {
        return annoncecandRepository.findByVisibility(visibility);
    }

}