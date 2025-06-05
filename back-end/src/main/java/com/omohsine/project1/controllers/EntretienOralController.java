package com.omohsine.project1.controllers;

import com.omohsine.project1.entities.EntretienOralEntity; // Ensure you're using the correct entity class
import com.omohsine.project1.services.EntretienOralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entretiens-oraux")
public class EntretienOralController {
/*

    @Autowired
    private EntretienOralService entretienOralService;

    // Récupérer tous les entretiens oraux
    @GetMapping
    public ResponseEntity<List<EntretienOralEntity>> getAllEntretiensOraux() {
        List<EntretienOralEntity> entretiens = entretienOralService.getAllEntretiensOraux();
        return new ResponseEntity<>(entretiens, HttpStatus.OK);
    }

    // Récupérer un entretien oral par ID
    @GetMapping("/{id}")
    public ResponseEntity<EntretienOralEntity> getEntretienOral(@PathVariable Long id) {
        try {
            EntretienOralEntity entretienOral = entretienOralService.getEntretienOralById(id);
            return new ResponseEntity<>(entretienOral, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Créer un nouvel entretien oral
    @PostMapping
    public ResponseEntity<EntretienOralEntity> createEntretienOral(@RequestBody EntretienOralEntity entretienOral) {
        try {
            EntretienOralEntity createdEntretien = entretienOralService.saveEntretienOral(entretienOral);
            return new ResponseEntity<>(createdEntretien, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

        // EntretienOralController.java
    @PutMapping("/{id}")
    public ResponseEntity<EntretienOralEntity> updateEntretienOral(
            @PathVariable Long id, @RequestBody EntretienOralEntity updatedDetails) {
        try {
            EntretienOralEntity updatedEntretien = entretienOralService.updateEntretienOral(id, updatedDetails);
            return new ResponseEntity<>(updatedEntretien, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntretienOral(@PathVariable Long id) {
        try {
            entretienOralService.deleteEntretienOral(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

*/




}
