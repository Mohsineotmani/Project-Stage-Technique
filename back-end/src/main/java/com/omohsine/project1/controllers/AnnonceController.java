package com.omohsine.project1.controllers;

import com.omohsine.project1.entities.AnnonceEntity;
import com.omohsine.project1.services.AnnonceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class AnnonceController {

    private final AnnonceService annonceService;

    public AnnonceController(AnnonceService annonceService) {
        this.annonceService = annonceService;
    }

    @PostMapping
    public ResponseEntity<AnnonceEntity> createAnnonce(@RequestBody AnnonceEntity annonce) {
        AnnonceEntity newAnnonce = annonceService.createAnnonce(annonce);
        return ResponseEntity.ok(newAnnonce);
    }

    @GetMapping
    public ResponseEntity<List<AnnonceEntity>> getAllAnnonces() {
        List<AnnonceEntity> annonces = annonceService.getAllAnnonces();
        return ResponseEntity.ok(annonces);
    }

    @GetMapping("/{id}") // MÃ©thode pour rÃ©cupÃ©rer une annonce par ID
    public ResponseEntity<AnnonceEntity> getAnnonceById(@PathVariable Long id) {
        AnnonceEntity annonce = annonceService.getAnnonceById(id);
        if (annonce != null) {
            return ResponseEntity.ok(annonce);
        } else {
            return ResponseEntity.notFound().build(); // Retourne 404 si l'annonce n'est pas trouvÃ©e
        }
    }

    @PutMapping("/{id}") // MÃ©thode pour mettre Ã  jour une annonce
    public ResponseEntity<AnnonceEntity> updateAnnonce(@PathVariable Long id, @RequestBody AnnonceEntity annonce) {
        AnnonceEntity updatedAnnonce = annonceService.updateAnnonce(id, annonce);
        if (updatedAnnonce != null) {
            return ResponseEntity.ok(updatedAnnonce);
        } else {
            return ResponseEntity.notFound().build(); // Retourne 404 si l'annonce n'est pas trouvÃ©e
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnonce(@PathVariable Long id) {
        annonceService.deleteAnnonce(id);
        return ResponseEntity.noContent().build();
    }

    // Nouvelle mÃ©thode pour publier une annonce
    @PutMapping("/{id}/publish")
    public ResponseEntity<AnnonceEntity> publishAnnonce(@PathVariable Long id) {
        AnnonceEntity annonce = annonceService.getAnnonceById(id);
        if (annonce == null) {
            return ResponseEntity.notFound().build(); // Retourne 404 si l'annonce n'existe pas
        }

        // Mettre Ã  jour le statut de l'annonce en 'PubliÃ©'
        annonce.setVisibility("Publique");
        AnnonceEntity updatedAnnonce = annonceService.updateAnnonce(id, annonce);
        return ResponseEntity.ok(updatedAnnonce);
    }
}
