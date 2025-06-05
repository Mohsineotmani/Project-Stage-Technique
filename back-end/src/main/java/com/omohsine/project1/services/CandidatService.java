package com.omohsine.project1.services;

import com.omohsine.project1.entities.CandidatEntity;
import com.omohsine.project1.repositories.CandidatRepository;
import com.omohsine.project1.shared.dto.CandidatNoteDto;
import com.omohsine.project1.shared.mapper.AppMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CandidatService {

    private static final Logger logger = LoggerFactory.getLogger(CandidatService.class);

    @Autowired
    private CandidatRepository candidatRepository;
    @Autowired
    private AppMapper mapper ;

    private final String baseDir = "concourPasserelleFiles/";

    public boolean isUserRegistered(String userId) {
        return candidatRepository.existsByUserId(userId);
    }

    public List<CandidatNoteDto> getAllCandidatNotDot(){
        List<CandidatEntity> allCandidats = candidatRepository.findAll();
        return allCandidats.stream()
                .map(candidat -> mapper.formCandidat(candidat))
                .collect(Collectors.toList());

    }

    @Transactional
    public void publierResultats() {
        candidatRepository.publierResultats();
    }

    public boolean annulerPublication() {
        // Réinitialiser la valeur de 'resultatPreselections' à 0 pour tous les candidats dont la valeur est 1
        int updatedCount = candidatRepository.updatePublicationStatusToZero();

        return updatedCount > 0;  // Si au moins un candidat a été mis à jour, la publication est annulée avec succès
    }

    public boolean areResultsPublished() {
        // Vérifie si au moins un candidat a resultatPreselections = 1
        return candidatRepository.existsByResultatPreselections(1);
    }

    public Long getIdCandidatByUserId(String userId) {
        Optional<CandidatEntity> candidat = candidatRepository.findByUserId(userId);
        return candidat.map(CandidatEntity::getIdCandidat)
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé pour userId: " + userId));
    }

    // Méthode pour enregistrer un fichier
    private String saveFile(MultipartFile file, String subDir, String fileName) throws IOException {
        String dirPath = baseDir + subDir;
        Path directory = Paths.get(dirPath);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }
        Path filePath = directory.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("File saved at: " + filePath.toString());
        return subDir + "/" + fileName; 
    }

    public CandidatEntity addCandidate(CandidatEntity candidat, MultipartFile copieBac, MultipartFile releveBac,
                                       MultipartFile copieDiplome, MultipartFile releveDiplomeAnnee1,
                                       MultipartFile releveDiplomeAnnee2) {
        //mohsine
/*

        // Vérifier si un candidat existe déjà avec le même userId
        if (candidatRepository.findByUserId(candidat.getUserId()).isPresent()) {
            throw new IllegalArgumentException("Un candidat avec le même userId existe déjà.");
        }
        // Vérifier si un candidat existe déjà avec les mêmes informations (CIN, Code Étudiant, Email, Téléphone)
        if (candidatRepository.findByCin(candidat.getCin()).isPresent()) {
            throw new IllegalArgumentException("Un candidat avec le même CIN existe déjà.");
        }
        if (candidatRepository.findByCodeEtudiant(candidat.getCodeEtudiant()).isPresent()) {
            throw new IllegalArgumentException("Un candidat avec le même Code Étudiant existe déjà.");
        }
        if (candidatRepository.findCandidatByEmail(candidat.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Un candidat avec le même Email existe déjà.");
        }

*/

        try {
            // Enregistrer les fichiers et assigner les chemins relatifs aux propriétés du candidat
            if (copieBac != null && !copieBac.isEmpty()) {
                candidat.setCopieBac(saveFile(copieBac, "copiesBac", copieBac.getOriginalFilename()));
            }
            if (releveBac != null && !releveBac.isEmpty()) {
                candidat.setReleveBac(saveFile(releveBac, "relevesBac", releveBac.getOriginalFilename()));
            }
            if (copieDiplome != null && !copieDiplome.isEmpty()) {
                candidat.setCopieDiplome(saveFile(copieDiplome, "copiesDiplomes", copieDiplome.getOriginalFilename()));
            }
            if (releveDiplomeAnnee1 != null && !releveDiplomeAnnee1.isEmpty()) {
                candidat.setReleveDiplomeAnnee1(saveFile(releveDiplomeAnnee1, "relevesDiplomesAnnee1", releveDiplomeAnnee1.getOriginalFilename()));
            }
            if (releveDiplomeAnnee2 != null && !releveDiplomeAnnee2.isEmpty()) {
                candidat.setReleveDiplomeAnnee2(saveFile(releveDiplomeAnnee2, "relevesDiplomesAnnee2", releveDiplomeAnnee2.getOriginalFilename()));
            }

        } catch (IOException e) {
            logger.error("Erreur lors du stockage des fichiers", e);
            throw new IllegalArgumentException("Erreur lors du stockage des fichiers: " + e.getMessage());
        }

        // Sauvegarder le candidat avec les fichiers
        CandidatEntity savedCandidat = candidatRepository.save(candidat);
        logger.info("Candidat saved with ID: " + savedCandidat.getIdCandidat());
        return savedCandidat;
    }

    public List<CandidatEntity> findAllCandidates() {
        logger.info("Fetching all candidates");
        return candidatRepository.findAll();
    }

    public Optional<CandidatEntity> findCandidateById(Long id) {
        return candidatRepository.findById(id);
    }

    public Optional<CandidatEntity> findCandidatByUserId(String userId) {
        logger.info("Finding candidate by userId: {}", userId);
        return candidatRepository.findByUserId(userId);
    }

    public List<CandidatEntity> findCandidateByName(String nom) {
        return candidatRepository.findByNom(nom);
    }

    public void updatePreselectedCandidates(double seuil) {
        List<CandidatEntity> candidats = candidatRepository.findAll();
        for (CandidatEntity candidat : candidats) {
            double moyenne = (Double.parseDouble(candidat.getNotePremiereAnnee()) + Double.parseDouble(candidat.getNoteDeuxiemeAnnee())) / 2;
            if (moyenne >= seuil) {
                candidat.setStatusPreselectionne(1); // Preselected
            } else {
                candidat.setStatusPreselectionne(0); // Not preselected
            }
            candidatRepository.save(candidat);
        }
    }

    public void updatePreselectedCandidatesByUserIds(List<String> userIds, double seuil) {
        List<CandidatEntity> candidats = candidatRepository.findAll();
        for (CandidatEntity candidat : candidats) {
            if (userIds.contains(candidat.getUserId())) {
                double moyenne = (Double.parseDouble(candidat.getNotePremiereAnnee()) + Double.parseDouble(candidat.getNoteDeuxiemeAnnee())) / 2;
                if (moyenne >= seuil) {
                    candidat.setStatusPreselectionne(1); // Preselected
                } else {
                    candidat.setStatusPreselectionne(0); // Not preselected
                }
                candidatRepository.save(candidat);
            }
        }
    }


    public CandidatEntity updateCandidate(String userId, CandidatEntity updatedCandidat,
                                          MultipartFile copieBac, MultipartFile releveBac,
                                          MultipartFile copieDiplome, MultipartFile releveDiplomeAnnee1,
                                          MultipartFile releveDiplomeAnnee2) {

        Optional<CandidatEntity> candidatOptional = candidatRepository.findByUserId(userId);

        if (candidatOptional.isEmpty()) {
            throw new IllegalArgumentException("Le candidat avec l'ID " + userId + " n'existe pas.");
        }

        CandidatEntity candidat = candidatOptional.get();

// Update fields with non-null values
        updateCandidatFields(candidat, updatedCandidat);

        try {
// Handle file uploads if present
            handleFileUploads(candidat, copieBac, releveBac, copieDiplome, releveDiplomeAnnee1, releveDiplomeAnnee2);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la mise à jour des fichiers: " + e.getMessage(), e);
        }

        return candidatRepository.save(candidat);
    }

    private void updateCandidatFields(CandidatEntity existingCandidat, CandidatEntity updatedCandidat) {
        if (updatedCandidat.getNom() != null) existingCandidat.setNom(updatedCandidat.getNom());
        if (updatedCandidat.getPrenom() != null) existingCandidat.setPrenom(updatedCandidat.getPrenom());
        if (updatedCandidat.getCin() != null) existingCandidat.setCin(updatedCandidat.getCin());
        if (updatedCandidat.getDateNaissance() != null) existingCandidat.setDateNaissance(updatedCandidat.getDateNaissance());
        if (updatedCandidat.getTel() != null) existingCandidat.setTel(updatedCandidat.getTel());
        if (updatedCandidat.getEmail() != null) existingCandidat.setEmail(updatedCandidat.getEmail());
        if (updatedCandidat.getPays() != null) existingCandidat.setPays(updatedCandidat.getPays());
        if (updatedCandidat.getVille() != null) existingCandidat.setVille(updatedCandidat.getVille());
        if (updatedCandidat.getCodeEtudiant() != null) existingCandidat.setCodeEtudiant(updatedCandidat.getCodeEtudiant());
        if (updatedCandidat.getFiliereChoisi() != null) existingCandidat.setFiliereChoisi(updatedCandidat.getFiliereChoisi());
        if (updatedCandidat.getEtablissement() != null) existingCandidat.setEtablissement(updatedCandidat.getEtablissement());
        if (updatedCandidat.getSerieBac() != null) existingCandidat.setSerieBac(updatedCandidat.getSerieBac());
        if (updatedCandidat.getMentionBac() != null) existingCandidat.setMentionBac(updatedCandidat.getMentionBac());
        if (updatedCandidat.getTitreDiplome() != null) existingCandidat.setTitreDiplome(updatedCandidat.getTitreDiplome());
        if (updatedCandidat.getNotePremiereAnnee() != null) existingCandidat.setNotePremiereAnnee(updatedCandidat.getNotePremiereAnnee());
        if (updatedCandidat.getNoteDeuxiemeAnnee() != null) existingCandidat.setNoteDeuxiemeAnnee(updatedCandidat.getNoteDeuxiemeAnnee());
    }

    private void handleFileUploads(CandidatEntity candidat,
                                   MultipartFile copieBac, MultipartFile releveBac,
                                   MultipartFile copieDiplome, MultipartFile releveDiplomeAnnee1,
                                   MultipartFile releveDiplomeAnnee2) throws IOException {

// Save each file and update the corresponding field in the CandidatoEntity
        if (copieBac != null && !copieBac.isEmpty()) {
            String copieBacPath = saveFile(copieBac, "copiesBac", copieBac.getOriginalFilename());
            candidat.setCopieBac(copieBacPath);
        }

        if (releveBac != null && !releveBac.isEmpty()) {
            String releveBacPath = saveFile(releveBac, "relevesBac", releveBac.getOriginalFilename());
            candidat.setReleveBac(releveBacPath);
        }

        if (copieDiplome != null && !copieDiplome.isEmpty()) {
            String copieDiplomePath = saveFile(copieDiplome, "copiesDiplomes", copieDiplome.getOriginalFilename());
            candidat.setCopieDiplome(copieDiplomePath);
        }

        if (releveDiplomeAnnee1 != null && !releveDiplomeAnnee1.isEmpty()) {
            String releveDiplomeAnnee1Path = saveFile(releveDiplomeAnnee1, "relevesDiplomesAnnee1", releveDiplomeAnnee1.getOriginalFilename());
            candidat.setReleveDiplomeAnnee1(releveDiplomeAnnee1Path);
        }

        if (releveDiplomeAnnee2 != null && !releveDiplomeAnnee2.isEmpty()) {
            String releveDiplomeAnnee2Path = saveFile(releveDiplomeAnnee2, "relevesDiplomesAnnee2", releveDiplomeAnnee2.getOriginalFilename());
            candidat.setReleveDiplomeAnnee2(releveDiplomeAnnee2Path);
        }
    }

    public long countAllCandidats() {
        return candidatRepository.count();
    }

    public String getMostRequestedFiliere() {
        // Supposons que vous utilisez JPA pour récupérer les candidats et compter la filière la plus demandée
        List<Object[]> results = candidatRepository.countByFiliereChoisi();

        // Logique pour trouver la filière la plus demandée
        if (results != null && !results.isEmpty()) {
            Object[] mostRequested = results.get(0); // Le premier élément est la filière la plus demandée
            return (String) mostRequested[0];
        }
        return "Aucune filière demandée";
    }
    public double getMostRequestedFilierePercentage() {
        // Supposons que vous utilisez JPA pour récupérer les candidats et leur filière choisie
        List<Object[]> results = candidatRepository.countByFiliereChoisi();
        long totalCandidats = candidatRepository.count();

        // Logique pour trouver le pourcentage de la filière la plus demandée
        if (results != null && !results.isEmpty() && totalCandidats > 0) {
            Object[] mostRequested = results.get(0); // Le premier élément est la filière la plus demandée
            long count = (long) mostRequested[1]; // Le deuxième élément est le nombre d'inscriptions
            double percentage = (count * 100.0) / totalCandidats; // Calculer le pourcentage
            return Math.round(percentage * 100.0) / 100.0; // Arrondir à deux décimales
        }
        return 0.0; // Retourne 0 si aucun candidat n'est présent
    }

    public double getAverageScores() {
        List<CandidatEntity> candidats = candidatRepository.findAll();

        if (candidats.isEmpty()) {
            return 0.0; // Retourner 0 si aucun candidat
        }

        double totalScores = 0.0;
        int count = 0;

        for (CandidatEntity candidat : candidats) {
            try {
                // Convertir les notes de String à double
                double notePremiereAnnee = Double.parseDouble(candidat.getNotePremiereAnnee());
                double noteDeuxiemeAnnee = Double.parseDouble(candidat.getNoteDeuxiemeAnnee());

                // Calculer la moyenne des deux notes
                double moyenne = (notePremiereAnnee + noteDeuxiemeAnnee) / 2.0;
                totalScores += moyenne;
                count++;
            } catch (NumberFormatException e) {
                // Si la conversion échoue (par exemple, si la chaîne n'est pas un nombre valide)
                System.out.println("Erreur de conversion pour le candidat " + candidat.getIdCandidat());
            }
        }

        // Si aucun candidat n'a pu être traité, on retourne 0
        if (count == 0) {
            return 0.0;
        }
        return Math.round((totalScores / count) * 100.0) / 100.0;
    }

    public long getNombreHommes() {
        return candidatRepository.countHommes();
    }

    public long getNombreFemmes() {
        return candidatRepository.countFemmes();
    }





}