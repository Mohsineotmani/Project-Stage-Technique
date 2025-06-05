package com.omohsine.project1.controllers;

import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.entities.SeuilOraleEntity;
import com.omohsine.project1.repositories.NoteRepository;
import com.omohsine.project1.services.NoteService;
import com.omohsine.project1.services.SeuilOralService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class NoteController {

    @Autowired
    private NoteService noteService;
    @Autowired
    private SeuilOralService seuilOralService;
    @Autowired
    private NoteRepository noteRepository;


    // Récupérer toutes les notes
    @GetMapping
    public ResponseEntity<List<NoteEntity>> getAllNotes() {
        List<NoteEntity> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }

    // Récupérer une note par son ID
    @GetMapping("/{id}")
    public ResponseEntity<NoteEntity> getNoteById(@PathVariable Long id) {
        Optional<NoteEntity> note = noteService.getNoteById(id);
        return note.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Créer une nouvelle note
    @PostMapping
    public ResponseEntity<NoteEntity> createNote(@RequestBody NoteEntity note) {
        try {
            NoteEntity createdNote = noteService.saveNote(note);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Mettre à jour une note existante
    @PutMapping("/{id}")
    public ResponseEntity<NoteEntity> updateNote(@PathVariable Long id, @RequestBody NoteEntity note) {
        try {
            Optional<NoteEntity> existingNote = noteService.getNoteById(id);
            if (existingNote.isPresent()) {
                note.setId(id);
                NoteEntity updatedNote = noteRepository.save(note);
                return ResponseEntity.ok(updatedNote);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Supprimer une note par son ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNoteById(@PathVariable Long id) {
        try {
            noteService.deleteNoteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Récupérer les notes par filière
    @GetMapping("/filiere/{filiere}")
    public ResponseEntity<List<NoteEntity>> getNotesByFiliere(@PathVariable String filiere) {
        List<NoteEntity> notes = noteService.getNotesByFiliere(filiere);
        if (notes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(notes);
    }

    //mohsine
    @PostMapping("/sendEmailsToAdmitted")
    public ResponseEntity<String> sendEmailsToAdmittedCandidates(
            @RequestParam("seuil") double seuil,
            @RequestBody List<String> emails) {  // Recevoir une liste d'emails dans le body
        try {
            noteService.sendEmailsToAdmittedCandidates(seuil, emails);
            return ResponseEntity.ok("Emails envoyés avec succès aux " + emails.size() + " candidats avec une note >= " + seuil);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'envoi des emails : " + e.getMessage());
        }
    }

    // Télécharger les résultats au format CSV
    @GetMapping("/downloadCsv")
    public ResponseEntity<InputStreamResource> downloadCsv() {
        try {
            // Générer le CSV en mémoire
            ByteArrayInputStream csvData = noteService.generateCsv();

            // Configurer les en-têtes HTTP pour le téléchargement
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=notes.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/csv"))
                    .body(new InputStreamResource(csvData));
        } catch (IOException e) {
            // Gérer les exceptions et retourner un code d'erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Publier les résultats des candidats admis
    // Publier les résultats des candidats admis en fonction du seuil
    @PostMapping("/publish")
    public ResponseEntity<ResponseMessage> publishResults() {
        try {
            // Récupérer le seuil actuel depuis la base de données
            SeuilOraleEntity seuil = seuilOralService.getSeuil();

            // Vérifier que le seuil est bien récupéré et non null
            if (seuil == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseMessage("Le seuil oral n'est pas défini."));
            }


            // Filtrer les notes des candidats dont la note est supérieure ou égale au seuil
            List<NoteEntity> notesToPublish = noteService.getNotesByNoteGreaterThanOrEqualTo(seuil.getSeuil());



            // Vérifier si des notes sont déjà publiées
            List<NoteEntity> alreadyPublished = notesToPublish.stream()
                    .filter(NoteEntity::isStatusPublication)
                    .collect(Collectors.toList());

            if (!alreadyPublished.isEmpty()) {
                String errorMessage = String.format(
                        "%d note(s) sont déjà publiées (CNEs: %s). Annulation de la publication.",
                        alreadyPublished.size(),
                        alreadyPublished.stream()
                                .map(NoteEntity::getCin)
                                .map(String::valueOf)
                                .collect(Collectors.joining(", "))
                );
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ResponseMessage(errorMessage));
            }

            // Mettre à jour leur statut pour indiquer que les résultats ont été publiés
            notesToPublish.forEach(note -> note.setStatusPublication(true)); // Par exemple, un champ pour marquer si les résultats ont été publiés

            // Enregistrer les notes mises à jour
            noteService.saveAll(notesToPublish);

            // Retourner une réponse JSON avec un message de succès
            return ResponseEntity.ok(new ResponseMessage("Les résultats des candidats admis ont été publiés."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMessage("Erreur lors de la publication des résultats : " + e.getMessage()));
        }
    }


    // Publier les résultats de l'oral
    @PostMapping("/publishOralResults")
    public ResponseEntity<ResponseMessage> publishOralResults() {
        try {
            // Récupérer les notes dont le statut oral est "admit"
            List<NoteEntity> oralNotesToPublish = noteService.getNotesByStatusOrale("admit");

            // Mettre à jour leur statut oral pour indiquer que les résultats ont été publiés
            oralNotesToPublish.forEach(note -> {
                note.setStatuAdminOrale(true); // Changer le statut à true
            });

            // Enregistrer les notes mises à jour
            noteService.saveAll(oralNotesToPublish);
            noteService.flush(); // Force la persistance immédiate

            // Retourner une réponse avec un message de succès
            return ResponseEntity.ok(new ResponseMessage("Les résultats de l'oral ont été publiés."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMessage("Erreur lors de la publication des résultats de l'oral : " + e.getMessage()));
        }
    }



    // Classe interne pour structurer la réponse de message
    public static class ResponseMessage {
        private String message;

        public ResponseMessage(String message) {
            this.message = message;
        }

        // Getter et Setter
        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    @PostMapping("/cancelPublish")
    public ResponseEntity<ResponseMessage> cancelPublishResults() {
        try {
            List<NoteEntity> publishedNotes = noteService.getNotesByStatusPublication(true);
            publishedNotes.forEach(note -> note.setStatusPublication(false));
            noteService.saveAll(publishedNotes);
            return ResponseEntity.ok(new ResponseMessage("La publication des résultats écrits a été annulée."));
        } catch (DataAccessException dae) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMessage("Erreur d'accès aux données : " + dae.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMessage("Erreur lors de l'annulation de la publication : " + e.getMessage()));
        }
    }


    // Annuler les résultats publiés pour les résultats finaux
    @PostMapping("/cancelPublishFinalResults")
    public ResponseEntity<ResponseMessage> cancelPublishFinalResults() {
        try {
            // Récupérer toutes les notes ayant le statut final "true"
            List<NoteEntity> finalPublishedNotes = noteService.getNotesByStatuAdminOrale(true);

            // Mettre à jour leur statut pour indiquer qu'ils ne sont plus publiés
            finalPublishedNotes.forEach(note -> note.setStatuAdminOrale(false));

            // Enregistrer les notes mises à jour
            noteService.saveAll(finalPublishedNotes);

            // Retourner une réponse JSON avec un message de succès
            return ResponseEntity.ok(new ResponseMessage("La publication des résultats finaux a été annulée."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseMessage("Erreur lors de l'annulation de la publication des résultats finaux : " + e.getMessage()));
        }
    }


    @GetMapping("/isPublished")
    public ResponseEntity<Boolean> areResultsPublished() {
        boolean isPublished = noteService.areResultsEcritPublished();
        return ResponseEntity.ok(isPublished);
    }

    @GetMapping("note/cin/{cin}")
    public ResponseEntity<Double> getNoteByCin(@PathVariable String cin) {
        Optional<NoteEntity> noteEntity = noteService.getNoteByCin(cin);

        // Retourne la note si elle est trouvée, sinon retourne 0
        return ResponseEntity.ok(noteEntity.map(NoteEntity::getNote).orElse(0.0));
    }
}