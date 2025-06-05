package com.omohsine.project1.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.repositories.ResultatCordRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ResultatCordService {

    @Autowired
    private ResultatCordRepository noteRepository;

    private static final Logger log = LoggerFactory.getLogger(ResultatCordService.class); // Logger

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

    public NoteEntity updateStatusOraleAndRemarque(Long id, String statusOrale, String remarque) {
        Optional<NoteEntity> optionalNote = noteRepository.findById(id);
        if (optionalNote.isPresent()) {
            NoteEntity note = optionalNote.get();
            log.info("Found note: " + note); // Log the found note
            note.setStatusOrale(statusOrale);
            note.setRemarque(remarque);
            NoteEntity updatedNote = noteRepository.save(note); // Save the updated note
            log.info("Updated note: " + updatedNote); // Log the updated note
            return updatedNote;
        }
        log.error("Note with ID {} not found", id); // Log error if the note is not found
        return null; // Return null if entity doesn't exist
    }

}