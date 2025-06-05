package com.omohsine.project1.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.omohsine.project1.entities.CandidatEntity;
import com.omohsine.project1.repositories.InscritsRepository;

@Service
public class InscritsService {
    

    @Autowired
    private InscritsRepository inscritsRepository;

    // Méthode pour obtenir la liste des inscrits  par filière
    public List<CandidatEntity> getInscritsByFiliere(String filiere) {
        
        return inscritsRepository.findInscritsByFiliereChoisi(filiere);
    }
}
