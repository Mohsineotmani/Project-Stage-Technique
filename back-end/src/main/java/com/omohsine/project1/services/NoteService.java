package com.omohsine.project1.services;

import com.omohsine.project1.config.EmailService;
import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.exceptions.UserException;
import com.omohsine.project1.repositories.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

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
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private EmailService emailService;

    public List<NoteEntity> getAllNotes() {
        return noteRepository.findAll();
    }

    public Optional<NoteEntity> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public NoteEntity saveNote(NoteEntity note) {
        if (noteRepository.findByCin(note.getCin()).isPresent()) {
            throw new UserException("La note pour le CIN " + note.getCin() + " existe déjà.");
        }
        return noteRepository.save(note);
    }

    public void deleteNoteById(Long id) {
        noteRepository.deleteById(id);
    }


    public void saveAll(List<NoteEntity> notes) {
        noteRepository.saveAll(notes);
    }

    public List<NoteEntity> getNotesByFiliere(String filiere) {
        switch (filiere.toLowerCase()) {
            case "Génie Informatique":
                return noteRepository.findByFiliereOrderByNoteDesc("Génie Informatique");
            case "Gestion & Administration":
                return noteRepository.findByFiliereOrderByNoteDesc("Gestion & Administration");
            case "Comptabilité & Finance":
                return noteRepository.findByFiliereOrderByNoteDesc("Comptabilité & Finance");
            case "Génie RST":
                return noteRepository.findByFiliereOrderByNoteDesc("Génie RST");
            case "Marketing & Vente":
                return noteRepository.findByFiliereOrderByNoteDesc("Marketing & Vente");
            case "Réseaux & Télécommunications":
                return noteRepository.findByFiliereOrderByNoteDesc("Réseaux & Télécommunications");
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
        List<NoteEntity> admittedCandidates = noteRepository.findByNoteGreaterThanEqual(seuil);

        if (admittedCandidates.isEmpty()) {
            throw new IllegalStateException("Aucun candidat admissible pour le seuil " + seuil);
        }

        // Filtrer seulement les candidats dont l'email est dans la liste fournie
        List<NoteEntity> candidatesToNotify = admittedCandidates.stream()
                .filter(candidate -> emails.contains(candidate.getEmail()))
                .collect(Collectors.toList());

        if (candidatesToNotify.isEmpty()) {
            throw new IllegalStateException("Aucun candidat trouvé avec les emails fournis");
        }

        int successCount = 0;
        int failCount = 0;
        List<String> failedEmails = new ArrayList<>();

        for (NoteEntity candidate : candidatesToNotify) {
            String candidateEmail = candidate.getEmail();

            try {
                //line 157
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
                                "       <p>Nous avons le plaisir de vous informer que vous avez été admis au concours d acceptation <strong>'%s'</strong> avec une note de <span class=\"highlight\">%.2f/20</span>.</p>" +
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
                noteRepository.save(candidate);
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





    public void publishResults() {

        List<NoteEntity> notes = noteRepository.findAll();
        for (NoteEntity note : notes) {
            note.setStatusPublication(true);
        }
        noteRepository.saveAll(notes); // Mettre à jour en base de données
    }

    public ByteArrayInputStream generateCsv() throws IOException {
        List<NoteEntity> notes = noteRepository.findAll();

        // Configuration pour écrire les données CSV
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withHeader("ID", "Nom", "Concours", "Note", "Filiere", "Email"));

        // Écriture des données
        for (NoteEntity note : notes) {
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

    public List<NoteEntity> getNotesByStatusOrale(String statusOrale) {
        return noteRepository.findByStatusOrale(statusOrale);
    }

    // Cette méthode appelle flush() pour forcer la persistance immédiate
    public void flush() {
        noteRepository.flush(); // Utilise la méthode flush() de JpaRepository
    }

    public List<NoteEntity> getNotesByNoteGreaterThanOrEqualTo(double seuil) {
        return noteRepository.findByNoteGreaterThanEqual(seuil);
    }

    public List<NoteEntity> getNotesByStatuAdminOrale(boolean statuAdminOrale) {
        return noteRepository.findByStatuAdminOrale(statuAdminOrale);
    }

    public List<NoteEntity> getNotesByStatusPublication(boolean statusPublication) {
        return noteRepository.findByStatusPublication(statusPublication);
    }

    public boolean areResultsEcritPublished() {
        // Vérifie si au moins un candidat a resultatPreselections = 1
        return noteRepository.existsByStatusPublication(true);
    }

    public Optional<NoteEntity> getNoteByCin(String cin) {
        return noteRepository.findByCin(cin);
    }
}