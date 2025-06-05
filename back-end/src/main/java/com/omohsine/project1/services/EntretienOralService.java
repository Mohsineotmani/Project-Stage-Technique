package com.omohsine.project1.services;

import com.omohsine.project1.entities.EntretienOralEntity;  // Correct import
import com.omohsine.project1.repositories.EntretienOralRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntretienOralService {

    @Autowired
    private EntretienOralRepository entretienOralRepository;
    private NoteService noteService ; 

    // Sauvegarder un entretien oral
    public EntretienOralEntity saveEntretienOral(EntretienOralEntity entretienOral) {  // Corrected parameter and return type

        return entretienOralRepository.save(entretienOral);
    }

    // Obtenir tous les entretiens oraux
    public List<EntretienOralEntity> getAllEntretiensOraux() {  // Corrected return type
        return entretienOralRepository.findAll();
    }

    // Obtenir un entretien oral par ID
    public EntretienOralEntity getEntretienOralById(Long id) {  // Corrected return type
        return entretienOralRepository.findById(id).orElseThrow(() -> new RuntimeException("Entretien oral non trouvé"));
    }

        // EntretienOralService.java
    public EntretienOralEntity updateEntretienOral(Long id, EntretienOralEntity updatedDetails) {
        EntretienOralEntity existingEntretien = getEntretienOralById(id); // Lève une exception si introuvable
        existingEntretien.setNotes(updatedDetails.getNotes());
        existingEntretien.setAppreciation(updatedDetails.getAppreciation());
        existingEntretien.setScore(updatedDetails.getScore());
        return entretienOralRepository.save(existingEntretien);
    }

    public void deleteEntretienOral(Long id) {
        if (!entretienOralRepository.existsById(id)) {
            throw new RuntimeException("Entretien oral avec l'ID " + id + " n'existe pas");
        }
        entretienOralRepository.deleteById(id);
    }


}
