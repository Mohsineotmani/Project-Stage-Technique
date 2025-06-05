package com.omohsine.project1.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.services.ResultatCandService;

@RestController
@RequestMapping("/resultats")
public class ResultatCandController {

    @Autowired
    private ResultatCandService resultatcandService;

    // Get all results with status_publication = true
    @GetMapping
    public List<NoteEntity> getResultatsByStatus() {
        return resultatcandService.getResultatsByStatus(true);
    }

    // Récupérer tous les résultats avec statuAdminOrale = true
    @GetMapping("/oral")
    public List<NoteEntity> getResultatsOral() {
        return resultatcandService.getResultatsOralByStatus(true); // Filtrer avec statuAdminOrale = true
    }


}