package com.omohsine.project1.services;

import com.omohsine.project1.entities.AnnonceEntity;
import com.omohsine.project1.repositories.AnnonceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnonceService {

    private final AnnonceRepository annonceRepository;

    public AnnonceService(AnnonceRepository annonceRepository) {
        this.annonceRepository = annonceRepository;
    }

    public AnnonceEntity createAnnonce(AnnonceEntity annonce) {
        return annonceRepository.save(annonce);
    }

    public List<AnnonceEntity> getAllAnnonces() {
        return annonceRepository.findAll();
    }

    public AnnonceEntity getAnnonceById(Long id) { // Nouvelle mÃ©thode ajoutÃ©e
        return annonceRepository.findById(id).orElse(null); // Retourne l'annonce ou null si non trouvÃ©e
    }

    public AnnonceEntity updateAnnonce(Long id, AnnonceEntity annonce) {
        if (annonceRepository.existsById(id)) {
            annonce.setId(id); // Assurez-vous que l'ID est bien mis Ã  jour
            return annonceRepository.save(annonce);
        }
        return null; // Retourne null si l'annonce n'existe pas
    }

    public void deleteAnnonce(Long id) {
        annonceRepository.deleteById(id);
    }

    // MÃ©thode pour publier une annonce
    public AnnonceEntity publishAnnonce(Long id) {
        AnnonceEntity annonce = getAnnonceById(id);
        if (annonce != null) {
            annonce.setStatus("PubliÃ©"); // Change le statut en "PubliÃ©"
            return annonceRepository.save(annonce); // Sauvegarde la modification
        }
        return null; // Retourne null si l'annonce n'existe pas
    }
}
