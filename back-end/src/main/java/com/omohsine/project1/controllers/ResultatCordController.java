package com.omohsine.project1.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.services.ResultatCordService;

@RestController
@RequestMapping("/resultats_orale")
public class ResultatCordController {

    @Autowired
    private ResultatCordService resultatcordService;

    private static final Logger log = LoggerFactory.getLogger(ResultatCordController.class);

    // Get all results with status_publication = true
    @GetMapping
    public ResponseEntity<List<NoteEntity>> getResultatsByStatus() {
        try {
            List<NoteEntity> resultats = resultatcordService.getResultatsByStatus(true);
            if (resultats.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(resultats);
        } catch (Exception e) {
            log.error("Error fetching results: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Update status_orale and remarque of a specific NoteEntity by ID
    @PutMapping("/{id}")
    public ResponseEntity<NoteEntity> updateStatusOraleAndRemarque(
            @PathVariable Long id,
            @RequestBody UpdateStatusOraleRequest request) {
        try {
            log.info("Received request to update note with ID {}: statusOrale={}, remarque={}", id, request.getStatusOrale(), request.getRemarque());
            NoteEntity updatedNote = resultatcordService.updateStatusOraleAndRemarque(id, request.getStatusOrale(), request.getRemarque());
            if (updatedNote == null) {
                log.error("Note with ID {} not found", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedNote);
        } catch (Exception e) {
            log.error("Error updating note with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}