package com.omohsine.project1.services;

import com.omohsine.project1.config.EmailService;
import com.omohsine.project1.entities.NoteEcritEntity;
import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.entities.NoteOralEntity;
import com.omohsine.project1.exceptions.ResourceNotFoundException;
import com.omohsine.project1.exceptions.UserException;
import com.omohsine.project1.repositories.NoteOralRepository;
import com.omohsine.project1.repositories.NoteRepository;
import net.bytebuddy.utility.nullability.AlwaysNull;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class NoteOralService {

    @Autowired
    private NoteOralRepository noteOralRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NoteService noteService;
    @Autowired
    private NoteEcritService noteEcritService;
    @Autowired
    private NoteRepository noteRepository;

    ///////////////////////////////////
    // Get results based on publication status
    public List<NoteOralEntity> getResultatsByStatus(boolean status) {
        return noteOralRepository.findByStatusPublication(status);
    }

    // Get results filtered by filière and publication status
    public List<NoteOralEntity> getResultatsByFiliereAndStatus(String filiere, boolean status) {
        if (filiere == null || filiere.isEmpty() || filiere.equals("Tous")) {
            return getResultatsByStatus(status); // Return all results with the given status if no specific filière is provided
        }
        return noteOralRepository.findByFiliereAndStatusPublicationOrderByNoteDesc(filiere, status);
    }

    // Get notes filtered by filière with status_publication = true
    public List<NoteOralEntity> getNotesByFiliereAndTrueStatusPublication(String filiere) {
        return getResultatsByFiliereAndStatus(filiere, true); // Only retrieve results with status_publication = true
    }

    // Récupérer les résultats avec statuAdminOrale = true
    public List<NoteOralEntity> getResultatByStatuSendAdmin(boolean statuSendAdmin) {
        return noteOralRepository.findByStatuSendAdmin(statuSendAdmin);
    }
    ///////////////////////////////////////////////

    public List<NoteOralEntity> getAllNotes() {
        return noteOralRepository.findAll();
    }

    public Optional<NoteOralEntity> getNoteById(Long id) {
        return noteOralRepository.findById(id);
    }


    public NoteOralEntity updateNote(Long id, NoteOralEntity updatedNote) {
        // 1. Vérifier l'existence de la note orale
        NoteOralEntity existingNote = noteOralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note orale non trouvée avec l'id: " + id));

        // 2. Vérifier que le CIN n'est pas modifié
        if (!existingNote.getCin().equals(updatedNote.getCin())) {
            throw new UserException("La modification du CIN n'est pas autorisée");
        }

        // 3. Récupérer la note écrite
        NoteEcritEntity noteEcrite = noteEcritService.getNoteByCin(existingNote.getCin())
                .orElseThrow(() -> new UserException("Aucune note écrite trouvée pour ce CIN"));

        // 4. Calculer la nouvelle note finale
        double nouvelleNoteFinale = (noteEcrite.getNote() * (100 - updatedNote.getPourcentageOral()) / 100)
                + (updatedNote.getNote() * updatedNote.getPourcentageOral() / 100);

        // 5. Mettre à jour la note finale
        NoteEntity noteFinale = noteRepository.findByCin(existingNote.getCin())
                .orElse(new NoteEntity()); // Crée une nouvelle instance si non trouvée

// Mettre à jour les champs
        noteFinale.setCin(existingNote.getCin());
        noteFinale.setNom(updatedNote.getNom());
        noteFinale.setEmail(updatedNote.getEmail());
        noteFinale.setFiliere(updatedNote.getFiliere());
        noteFinale.setNote(nouvelleNoteFinale);

        noteRepository.save(noteFinale);

        // 6. Mettre à jour la note orale
        existingNote.setNote(updatedNote.getNote());
        existingNote.setPourcentageOral(updatedNote.getPourcentageOral());
        existingNote.setNom(updatedNote.getNom());
        existingNote.setEmail(updatedNote.getEmail());
        existingNote.setFiliere(updatedNote.getFiliere());
        return noteOralRepository.save(existingNote);
    }



    public NoteOralEntity saveNote(NoteOralEntity noteOrale) {

        if (noteOralRepository.findByCin(noteOrale.getCin()).isPresent()) {
            throw new UserException("La note pour le CIN " + noteOrale.getCin() + " existe déjà.");
        }

        // Récupérer la note écrite
        NoteEcritEntity noteEcrite = noteEcritService.getNoteByCin(noteOrale.getCin())
                .orElseThrow(() -> new UserException("Aucune note écrite trouvée pour le CIN : " + noteOrale.getCin()));

        // Calcul de la note finale
        double noteFinale = (noteEcrite.getNote() * (100 - noteOrale.getPourcentageOral()) / 100)
                + (noteOrale.getNote() * noteOrale.getPourcentageOral() / 100);

        // Création de l'entité NoteOraleEntity
        NoteEntity noteEntity = new NoteEntity();
        noteEntity.setCin(noteOrale.getCin());
        noteEntity.setNom(noteOrale.getNom());
        noteEntity.setEmail(noteOrale.getEmail());
        noteEntity.setFiliere(noteOrale.getFiliere());
        noteEntity.setNote(noteFinale);
        noteRepository.save(noteEntity);
        return noteOralRepository.save(noteOrale);
    }

    @Transactional
    public void deleteNoteById(Long id) {
        NoteOralEntity loadedNoteOral = noteOralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note orale non trouvée avec l'id: " + id));
        ;
        noteRepository.deleteByCin(loadedNoteOral.getCin());
        noteOralRepository.deleteById(id);
    }


    public void saveAll(List<NoteOralEntity> notes) {
        noteOralRepository.saveAll(notes);
    }

    public List<NoteOralEntity> getNotesByFiliere(String filiere) {
        switch (filiere.toLowerCase()) {
            case "Génie Informatique":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Génie Informatique");
            case "Gestion & Administration":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Gestion & Administration");
            case "Comptabilité & Finance":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Comptabilité & Finance");
            case "Génie RST":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Génie RST");
            case "Marketing & Vente":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Marketing & Vente");
            case "Réseaux & Télécommunications":
                return noteOralRepository.findByFiliereOrderByNoteDesc("Réseaux & Télécommunications");
            default:
                return new ArrayList<>();
        }
    }

    public void sendEmailsToAdmittedCandidates(double seuil, List<String> emails) {
        // Validation des paramètres d'entrée
        if (emails == null || emails.isEmpty()) {
            throw new IllegalArgumentException("La liste des emails ne peut pas être vide");
        }

        // Récupérer tous les candidats avec une note >= seuil
        List<NoteOralEntity> admittedCandidates = noteOralRepository.findByNoteGreaterThanEqual(seuil);

        if (admittedCandidates.isEmpty()) {
            throw new IllegalStateException("Aucun candidat admissible pour le seuil " + seuil);
        }

        // Filtrer seulement les candidats dont l'email est dans la liste fournie
        List<NoteOralEntity> candidatesToNotify = admittedCandidates.stream()
                .filter(candidate -> emails.contains(candidate.getEmail()))
                .collect(Collectors.toList());

        if (candidatesToNotify.isEmpty()) {
            throw new IllegalStateException("Aucun candidat trouvé avec les emails fournis");
        }

        int successCount = 0;
        int failCount = 0;
        List<String> failedEmails = new ArrayList<>();

        for (NoteOralEntity candidate : candidatesToNotify) {
            String candidateEmail = candidate.getEmail();

            try {
                // Vérification de l'état avant envoi
               /* if (candidate.isStatuSendAdmin()) {
                    System.out.println("Email déjà envoyé à " + candidateEmail);
                    continue;
                }*/

                if (!isValidEmail(candidateEmail)) {
                    throw new IllegalArgumentException("Email invalide: " + candidateEmail);
                }

                // Préparation du contenu de l'email
                String subject = "Félicitations ! Vous êtes admis au concours Passerelle écrit";
                String body = String.format(
                        "<!DOCTYPE html>" +
                                "<html lang=\"fr\">" +
                                "<head>" +
                                "   <meta charset=\"UTF-8\">" +
                                "   <style type=\"text/css\">" +
                                "       body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }" +
                                "       .header { color: #2c3e50; font-size: 24px; font-weight: bold; margin-bottom: 20px; }" +
                                "       .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }" +
                                "       .footer { margin-top: 30px; font-size: 14px; color: #7f8c8d; }" +
                                "       .highlight { color: #e74c3c; font-weight: bold; }" +
                                "       .signature { font-style: italic; }" +
                                "       a { color: #3498db; text-decoration: none; }" +
                                "       a:hover { text-decoration: underline; }" +
                                "   </style>" +
                                "</head>" +
                                "<body>" +
                                "   <div class=\"header\">Félicitations !</div>" +
                                "   <div class=\"content\">" +
                                "       <p>Bonjour <span class=\"highlight\">%s</span>,</p>" +
                                "       <p>Nous avons le plaisir de vous informer que vous avez été admis au concours oral <strong>'%s'</strong> avec une note de <span class=\"highlight\">%.2f/20</span>.</p>" +
                                "       <p>Félicitations pour cette réussite ! Nous vous souhaitons bonne chance pour la suite de votre parcours.</p>" +
                                "   </div>" +
                                "   <div class=\"footer\">" +
                                "       <p>Cordialement,</p>" +
                                "       <p class=\"signature\">L'équipe du concours Passerelle</p>" +
                                "       <p><small>Ceci est un message automatique, merci de ne pas y répondre.</small></p>" +
                                "   </div>" +
                                "</body>" +
                                "</html>",
                        candidate.getNom(),
                        candidate.getConcours(),
                        candidate.getNote()
                );

                // Envoi de l'email
                emailService.sendEmailWithHtml(candidateEmail, subject, body);

                // Mise à jour du statut
                candidate.setStatuSendAdmin(true);
                noteOralRepository.save(candidate);
                successCount++;

            } catch (Exception e) {
                failCount++;
                failedEmails.add(candidateEmail);
                System.err.printf("Erreur pour %s: %s%n", candidateEmail, e.getMessage());
            }
        }

        // Log récapitulatif
        System.out.printf(
                "Résultat d'envoi: %d succès, %d échecs%n",
                successCount, failCount
        );

        if (!failedEmails.isEmpty()) {
            System.err.println("Emails en échec: " + String.join(", ", failedEmails));
        }
    }


    // Fonction utilitaire pour vérifier la validité de l'email
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(emailRegex);
    }


    // Méthode pour générer un email à partir du nom
    // Méthode pour générer un email à partir du nom avec un domaine personnalisé
// Méthode pour générer un email à partir d'un email complet
    private String generateEmail(String nom, String email) {
        // Ici, nous utilisons simplement l'email fourni, sans modification
        return email;
    }


    public void publishResults() {
        List<NoteOralEntity> notes = noteOralRepository.findAll();
        for (NoteOralEntity note : notes) {
            note.setStatusPublication(true);
        }
        noteOralRepository.saveAll(notes); // Mettre à jour en base de données
    }

    public ByteArrayInputStream generateCsv() throws IOException {
        List<NoteOralEntity> notes = noteOralRepository.findAll();

        // Configuration pour écrire les données CSV
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withHeader("ID", "Nom", "Concours", "Note", "Filiere", "Email"));

        // Écriture des données
        for (NoteOralEntity note : notes) {
            csvPrinter.printRecord(
                    note.getId(),
                    note.getNom(),
                    note.getConcours(),
                    note.getNote(),
                    note.getFiliere(),
                    note.getEmail()
            );
        }

        csvPrinter.flush();
        return new ByteArrayInputStream(out.toByteArray());
    }


    // Cette méthode appelle flush() pour forcer la persistance immédiate
    public void flush() {
        noteOralRepository.flush(); // Utilise la méthode flush() de JpaRepository
    }

    public List<NoteOralEntity> getNotesByNoteGreaterThanOrEqualTo(double seuil) {
        return noteOralRepository.findByNoteGreaterThanEqual(seuil);
    }


    public List<NoteOralEntity> getNotesByStatusPublication(boolean statusPublication) {
        return noteOralRepository.findByStatusPublication(statusPublication);
    }

    public boolean areResultsEcritPublished() {
        // Vérifie si au moins un candidat a resultatPreselections = 1
        return noteOralRepository.existsByStatusPublication(true);
    }

    public Optional<NoteOralEntity> getNoteByCin(String cin) {
        return noteOralRepository.findByCin(cin);
    }


}