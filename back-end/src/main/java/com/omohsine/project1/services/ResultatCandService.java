package com.omohsine.project1.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.repositories.ResultatCandRepository;

@Service
public class ResultatCandService {

    @Autowired
    private ResultatCandRepository noteRepository;

    // Get results based on publication status
    public List<NoteEntity> getResultatsByStatus(boolean status) {
        return noteRepository.findByStatusPublication(status);
    }

    // Get results filtered by filière and publication status
    public List<NoteEntity> getResultatsByFiliereAndStatus(String filiere, boolean status) {
        if (filiere == null || filiere.isEmpty() || filiere.equals("Tous")) {
            return getResultatsByStatus(status); // Return all results with the given status if no specific filière is provided
        }
        return noteRepository.findByFiliereAndStatusPublicationOrderByNoteDesc(filiere, status);
    }

    // Get notes filtered by filière with status_publication = true
    public List<NoteEntity> getNotesByFiliere(String filiere) {
        return getResultatsByFiliereAndStatus(filiere, true); // Only retrieve results with status_publication = true
    }

    // Récupérer les résultats avec statuAdminOrale = true
    public List<NoteEntity> getResultatsOralByStatus(boolean statuAdminOrale) {
        return noteRepository.findByStatuAdminOrale(statuAdminOrale);
    }
}