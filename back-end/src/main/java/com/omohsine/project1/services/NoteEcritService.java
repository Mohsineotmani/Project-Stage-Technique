package com.omohsine.project1.services;

import com.omohsine.project1.config.EmailService;
import com.omohsine.project1.entities.NoteEcritEntity;
import com.omohsine.project1.entities.NoteEcritEntity;
import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.entities.NoteOralEntity;
import com.omohsine.project1.exceptions.ResourceNotFoundException;
import com.omohsine.project1.exceptions.UserException;
import com.omohsine.project1.repositories.NoteEcritRepository;
import com.omohsine.project1.repositories.NoteOralRepository;
import com.omohsine.project1.repositories.NoteRepository;
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
public class NoteEcritService {

    @Autowired
    private NoteEcritRepository noteEcritRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NoteRepository noteRepository;
    @Autowired
    private NoteOralRepository noteOralRepository;

    ///////////////////////////////////
    // Get results based on publication status
    public List<NoteEcritEntity> getResultatsByStatus(boolean status) {
        return noteEcritRepository.findByStatusPublication(status);
    }

    // Get results filtered by filière and publication status
    public List<NoteEcritEntity> getResultatsByFiliereAndStatus(String filiere, boolean status) {
        if (filiere == null || filiere.isEmpty() || filiere.equals("Tous")) {
            return getResultatsByStatus(status); // Return all results with the given status if no specific filière is provided
        }
        return noteEcritRepository.findByFiliereAndStatusPublicationOrderByNoteDesc(filiere, status);
    }

    // Get notes filtered by filière with status_publication = true
    public List<NoteEcritEntity> getNotesByFiliereAndTrueStatusPublication(String filiere) {
        return getResultatsByFiliereAndStatus(filiere, true); // Only retrieve results with status_publication = true
    }

    // Récupérer les résultats avec statuAdminOrale = true
    public List<NoteEcritEntity> getResultatByStatuSendAdmin(boolean statuSendAdmin) {
        return noteEcritRepository.findByStatuSendAdmin(statuSendAdmin);
    }
    ///////////////////////////////////////////////


    public List<NoteEcritEntity> getAllNotes() {
        return noteEcritRepository.findAll();
    }

    public Optional<NoteEcritEntity> getNoteById(Long id) {
        return noteEcritRepository.findById(id);
    }

    @Transactional
    public NoteEcritEntity updateNoteEcrit(Long id, NoteEcritEntity updatedNote) {
        // 1. Vérifier l'existence de la note écrite
        NoteEcritEntity existingNote = noteEcritRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note écrite non trouvée"));

        // 2. Vérifier la cohérence du CIN
        if (!existingNote.getCin().equals(updatedNote.getCin())) {
            throw new UserException("Modification du CIN non autorisée");
        }

        // 3. Mettre à jour la note écrite
        existingNote.setNote(updatedNote.getNote());
        existingNote.setNom(updatedNote.getNom());
        existingNote.setEmail(updatedNote.getEmail());
        existingNote.setFiliere(updatedNote.getFiliere());

        NoteEcritEntity savedNote = noteEcritRepository.save(existingNote);

        // 4. Si note orale existe, mettre à jour la note finale
        noteOralRepository.findByCin(existingNote.getCin()).ifPresent(noteOral -> {
            double nouvelleNoteFinale = calculateNoteFinale(savedNote.getNote(), noteOral);
            updateOrCreateNoteFinale(savedNote, noteOral, nouvelleNoteFinale);
        });

        return savedNote;
    }

    private double calculateNoteFinale(double noteEcrit, NoteOralEntity noteOral) {
        return (noteEcrit * (100 - noteOral.getPourcentageOral()) / 100)
                + (noteOral.getNote() * noteOral.getPourcentageOral() / 100);
    }

    private void updateOrCreateNoteFinale(NoteEcritEntity noteEcrit, NoteOralEntity noteOral, double noteFinale) {
        NoteEntity noteFinaleEntity = noteRepository.findByCin(noteEcrit.getCin())
                .orElseGet(() -> {
                    NoteEntity n = new NoteEntity();
                    n.setCin(noteEcrit.getCin());
                    return n;
                });

        noteFinaleEntity.setNom(noteEcrit.getNom());
        noteFinaleEntity.setEmail(noteEcrit.getEmail());
        noteFinaleEntity.setFiliere(noteEcrit.getFiliere());
        noteFinaleEntity.setNote(noteFinale);
        noteRepository.save(noteFinaleEntity);
    }




    public NoteEcritEntity saveNote(NoteEcritEntity note) {
        if (noteEcritRepository.findByCin(note.getCin()).isPresent()) {
            throw new UserException("La note pour le CIN " + note.getCin() + " existe déjà.");
        }
        return noteEcritRepository.save(note);
    }

    @Transactional
    public void deleteNoteById(Long id) {
        // 1. Vérifier l'existence de la note écrite
        NoteEcritEntity noteEcrit = noteEcritRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note écrite non trouvée avec l'id: " + id));

        String cin = noteEcrit.getCin();

        // 2. Vérifier s'il existe une note orale associée
        if (noteOralRepository.existsByCin(cin)) {
            throw new UserException("Impossible de supprimer la note écrite. "
                    + "Veuillez d'abord supprimer la note orale pour le CIN: " + cin);
        }

        // 3. Supprimer la note finale associée si elle existe
        noteRepository.deleteByCin(cin);

        // 4. Supprimer la note écrite
        noteEcritRepository.deleteById(id);
    }


    public void saveAll(List<NoteEcritEntity> notes) {
        noteEcritRepository.saveAll(notes);
    }

    public List<NoteEcritEntity> getNotesByFiliere(String filiere) {
        switch (filiere.toLowerCase()) {
            case "Génie Informatique":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Génie Informatique");
            case "Gestion & Administration":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Gestion & Administration");
            case "Comptabilité & Finance":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Comptabilité & Finance");
            case "Génie RST":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Génie RST");
            case "Marketing & Vente":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Marketing & Vente");
            case "Réseaux & Télécommunications":
                return noteEcritRepository.findByFiliereOrderByNoteDesc("Réseaux & Télécommunications");
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
        List<NoteEcritEntity> admittedCandidates = noteEcritRepository.findByNoteGreaterThanEqual(seuil);

        if (admittedCandidates.isEmpty()) {
            throw new IllegalStateException("Aucun candidat admissible pour le seuil " + seuil);
        }

        // Filtrer seulement les candidats dont l'email est dans la liste fournie
        List<NoteEcritEntity> candidatesToNotify = admittedCandidates.stream()
                .filter(candidate -> emails.contains(candidate.getEmail()))
                .collect(Collectors.toList());

        if (candidatesToNotify.isEmpty()) {
            throw new IllegalStateException("Aucun candidat trouvé avec les emails fournis");
        }

        int successCount = 0;
        int failCount = 0;
        List<String> failedEmails = new ArrayList<>();

        for (NoteEcritEntity candidate : candidatesToNotify) {
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
                                "       <p>Nous avons le plaisir de vous informer que vous avez été admis au concours écrit <strong>'%s'</strong> avec une note de <span class=\"highlight\">%.2f/20</span>.</p>" +
                                "       <p>Vous avez également choisi de participer au concours oral.</p>" +
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
                noteEcritRepository.save(candidate);
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
        List<NoteEcritEntity> notes = noteEcritRepository.findAll();
        for (NoteEcritEntity note : notes) {
            note.setStatusPublication(true);
        }
        noteEcritRepository.saveAll(notes); // Mettre à jour en base de données
    }

    public ByteArrayInputStream generateCsv() throws IOException {
        List<NoteEcritEntity> notes = noteEcritRepository.findAll();

        // Configuration pour écrire les données CSV
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withHeader("ID", "Nom", "Concours", "Note", "Filiere", "Email"));

        // Écriture des données
        for (NoteEcritEntity note : notes) {
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
        noteEcritRepository.flush(); // Utilise la méthode flush() de JpaRepository
    }

    public List<NoteEcritEntity> getNotesByNoteGreaterThanOrEqualTo(double seuil) {
        return noteEcritRepository.findByNoteGreaterThanEqual(seuil);
    }


    public List<NoteEcritEntity> getNotesByStatusPublication(boolean statusPublication) {
        return noteEcritRepository.findByStatusPublication(statusPublication);
    }

    public boolean areResultsEcritPublished() {
        // Vérifie si au moins un candidat a resultatPreselections = 1
        return noteEcritRepository.existsByStatusPublication(true);
    }

    public Optional<NoteEcritEntity> getNoteByCin(String cin) {
        return noteEcritRepository.findByCin(cin);
    }


}