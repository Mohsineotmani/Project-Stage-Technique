package com.omohsine.project1.controllers;

import com.omohsine.project1.entities.CandidatEntity;
import com.omohsine.project1.repositories.CandidatRepository;
import com.omohsine.project1.services.CandidatService;
import com.omohsine.project1.shared.dto.CandidatNoteDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/PasserelleApi/candidate")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class CandidatController {

    private static final Logger logger = LoggerFactory.getLogger(CandidatController.class);

    @Autowired
    private CandidatService candidatService;

    @Autowired
    private CandidatRepository candidatRepository;

    private final String baseDir = "concourPasserelleFiles/";

    //get all candidat  for note
    @GetMapping("/for-notes")
    public ResponseEntity<List<CandidatNoteDto>> getAllCandidatNotDot() {
        return ResponseEntity.ok(candidatService.getAllCandidatNotDot()) ;
    }

    // Endpoint pour vérifier l'unicité du CIN
    @GetMapping("/check-cin")
    public ResponseEntity<Map<String, Boolean>> checkCinUnique(
            @RequestParam String cin) {

        logger.info("Vérification de l'unicité du CIN: {}", cin);

        boolean exists = candidatRepository.existsByCin(cin);

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getIdByUserId")
    public Long getIdCandidat(@RequestParam String userId) {
        return candidatService.getIdCandidatByUserId(userId);
    }

    @GetMapping("/mostRequestedFiliere")
    public ResponseEntity<String> getMostRequestedFiliere() {
        String filiere = candidatService.getMostRequestedFiliere();
        return ResponseEntity.ok(filiere);
    }

    @GetMapping("/mostRequestedFilierePercentage")
    public ResponseEntity<Double> getMostRequestedFilierePercentage() {
        double percentage = candidatService.getMostRequestedFilierePercentage();
        return ResponseEntity.ok(percentage);
    }

    @GetMapping("/average-scores")
    public ResponseEntity<Double> getAverageScores() {
        double average = candidatService.getAverageScores();
        return ResponseEntity.ok(average);
    }

    @GetMapping("/filiere-distribution")
    public Map<String, Long> getFiliereDistribution() {
        List<Object[]> results = candidatRepository.countByFiliereChoisi();
        Map<String, Long> filiereDistribution = new HashMap<>();

        if (results != null) {
            for (Object[] result : results) {
                String filiere = (String) result[0]; // Nom de la filière
                Long count = (Long) result[1]; // Nombre de candidats
                filiereDistribution.put(filiere, count);
            }
        }
        return filiereDistribution;
    }

    @GetMapping("/hommes-femmes")
    public Map<String, Long> getNombreHommesFemmes() {
        long hommes = candidatService.getNombreHommes();
        long femmes = candidatService.getNombreFemmes();
        return Map.of("hommes", hommes, "femmes", femmes);
    }


    @GetMapping("/countTotalCandidates")
    public ResponseEntity<Long> getTotalCandidats() {
        long count = candidatService.countAllCandidats();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/is-registered/{userId}")
    @PreAuthorize("hasRole('CANDIDAT')")
    public ResponseEntity<Boolean> isUserRegistered(@PathVariable String userId) {
        boolean isRegistered = candidatService.isUserRegistered(userId);
        return ResponseEntity.ok(isRegistered);
    }

    @PostMapping("/publier")
    public ResponseEntity<String> publierResultats() {
        candidatService.publierResultats();
        return ResponseEntity.ok("Les résultats de présélection ont été publiés avec succès.");
    }


    @GetMapping("/isPublished")
    public ResponseEntity<Boolean> areResultsPublished() {
        boolean isPublished = candidatService.areResultsPublished();
        return ResponseEntity.ok(isPublished);
    }

    @PostMapping("/annulerPublication")
    public ResponseEntity<String> annulerPublication() {
        boolean resultsPublished = candidatService.areResultsPublished();

        if (!resultsPublished) {
            return ResponseEntity.status(HttpStatus.OK).body("Les résultats ne sont pas encore publiés");
        }

        boolean success = candidatService.annulerPublication();
        if (success) {
            return ResponseEntity.ok("La publication a été annulée avec succès.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'annulation de la publication.");
        }
    }

    //modifier Profil
    @PutMapping("/{id}")
    public ResponseEntity<CandidatEntity> updateCandidate(
            @PathVariable String id,
            @RequestParam("candidat") String candidatJson,
            @RequestParam(value = "copieBac", required = false) MultipartFile copieBac,
            @RequestParam(value = "releveBac", required = false) MultipartFile releveBac,
            @RequestParam(value = "copieDiplome", required = false) MultipartFile copieDiplome,
            @RequestParam(value = "releveDiplomeAnnee1", required = false) MultipartFile releveDiplomeAnnee1,
            @RequestParam(value = "releveDiplomeAnnee2", required = false) MultipartFile releveDiplomeAnnee2) {

        ObjectMapper objectMapper = new ObjectMapper();
        CandidatEntity candidat;

        try {
            candidat = objectMapper.readValue(candidatJson, CandidatEntity.class);
            CandidatEntity updatedCandidat = candidatService.updateCandidate(id, candidat, copieBac, releveBac,
                    copieDiplome, releveDiplomeAnnee1, releveDiplomeAnnee2);
            return ResponseEntity.ok(updatedCandidat);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(null); // Bad request for JSON parsing errors
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Internal server error for other exceptions
        }
    }


    @GetMapping("/files/{filePath:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filePath) {
        try {
            // Construire le chemin complet à partir de baseDir
            Path file = Paths.get(baseDir).resolve(filePath).normalize();
            logger.info("Trying to retrieve file at path: {}", file.toString());

            // Vérifier si le fichier existe
            if (Files.exists(file)) {
                Resource resource = new UrlResource(file.toUri());
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                logger.error("File not found at path: {}", file.toString());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }
        } catch (IOException e) {
            logger.error("Error retrieving file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    // Méthode pour ajouter un candidat avec les fichiers
    @PostMapping
    public ResponseEntity<CandidatEntity> addCandidate(
            @RequestParam("candidat") String candidatJson,
            @RequestParam("userId") String userId,
            @RequestParam("copieBac") MultipartFile copieBac,
            @RequestParam("releveBac") MultipartFile releveBac,
            @RequestParam("copieDiplome") MultipartFile copieDiplome,
            @RequestParam("releveDiplomeAnnee1") MultipartFile releveDiplomeAnnee1,
            @RequestParam("releveDiplomeAnnee2") MultipartFile releveDiplomeAnnee2) {

        ObjectMapper objectMapper = new ObjectMapper();
        CandidatEntity candidat;
        try {
            // Désérialiser le JSON en objet CandidatEntity
            candidat = objectMapper.readValue(candidatJson, CandidatEntity.class);
            candidat.setUserId(userId); // Associer le userId au candidat
        } catch (IOException e) {
            logger.error("Error deserializing candidat JSON", e);
            return ResponseEntity.badRequest().build(); // Retourner une réponse 400 si la désérialisation échoue
        }

        try {
           /* Optional<CandidatEntity> loadedUserbyCin = candidatRepository.findByCin(candidat.getCin());
            if(loadedUserbyCin.isPresent()){
                System.out.println("loadedUserByEmail != null: true");
                throw new UserException(ErrorMessages.CANDIDAT_WITH_CIN_ALREADY_EXIST.getErrorMessage());
            }*/
            // Appeler le service pour ajouter le candidat avec les fichiers
            CandidatEntity savedCandidat = candidatService.addCandidate(candidat, copieBac, releveBac,
                    copieDiplome, releveDiplomeAnnee1, releveDiplomeAnnee2);
            return ResponseEntity.ok(savedCandidat);
        } catch (Exception e) {
            logger.error("Error adding candidate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pré-inscrits")
    public ResponseEntity<List<CandidatEntity>> getAllCandidatesWithDetails() {
        List<CandidatEntity> candidats = candidatService.findAllCandidates();
        return ResponseEntity.ok(candidats);
    }

    // Méthode pour obtenir un candidat par son ID
    @GetMapping("/{id}")
    public ResponseEntity<CandidatEntity> findCandidateById(@PathVariable Long id) {
        return candidatService.findCandidateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Méthode pour obtenir un candidat par son userID
    @GetMapping("/user/{userId}")
    public ResponseEntity<CandidatEntity> getCandidatByUserId(@PathVariable String userId) {
        logger.info("Fetching candidate for userId: {}", userId);
        try {
            Optional<CandidatEntity> candidat = candidatService.findCandidatByUserId(userId);
            return candidat.map(ResponseEntity::ok).orElseGet(() -> {
                logger.error("Candidate not found for userId: {}", userId);
                return ResponseEntity.notFound().build();
            });
        } catch (Exception e) {
            logger.error("Error fetching candidate by userId: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Méthode pour rechercher des candidats par leur nom
    @GetMapping("/rechercher")
    public List<CandidatEntity> findCandidateByName(@RequestParam String nom) {
        return candidatService.findCandidateByName(nom);
    }

    @PutMapping("/publish-results")
    public ResponseEntity<Void> publishResults(@RequestParam double seuil) {
        try {
            candidatService.updatePreselectedCandidates(seuil);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error publishing results", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Méthode pour servir un fichier
    private ResponseEntity<Resource> getFile0(String filePath) {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            Resource resource = new FileSystemResource(path);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint pour récupérer la copie Bac d'un candidat
    @GetMapping("/{id}/copieBac")
    public ResponseEntity<Resource> getCopieBac0(@PathVariable Long id) {
        Optional<CandidatEntity> candidat = candidatService.findCandidateById(id);
        if (candidat.isPresent()) {
            String filePath = candidat.get().getCopieBac();
            return getFile(filePath);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/candidate/{id}/copieBac")
    public ResponseEntity<Resource> getCopieBac(@PathVariable Long id) {
        CandidatEntity candidat = candidatRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Candidat not found"));

        Path filePath = Paths.get(baseDir + candidat.getCopieBac());
        if (Files.exists(filePath)) {
            Resource resource = new FileSystemResource(filePath);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filePath.getFileName().toString())
                    .body(resource);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


}