package com.omohsine.project1.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.omohsine.project1.entities.AnnonceEntity;
import com.omohsine.project1.services.AnnonceCandService;

/**
 * Affichage des annonces côté candidat
 */
@RestController
@RequestMapping("/annonces")
public class AnnonceCandController {

    @Autowired
    private AnnonceCandService annonceCandService;

    @GetMapping("/visibility")
    public List<AnnonceEntity> getResultatsByVisibility() {
        return annonceCandService.getAnnonceByVisibility("Publique");
    }
}
