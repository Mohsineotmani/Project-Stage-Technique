package com.omohsine.project1.services;


import com.omohsine.project1.entities.SeuilEntity;
import com.omohsine.project1.repositories.SeuilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SeuilService {

    @Autowired
    private SeuilRepository seuilRepository;

    // Récupérer le seuil actuel
    public SeuilEntity getSeuil() {
        return seuilRepository.findAll().stream().findFirst().orElse(null);
    }

    // Mettre à jour le seuil
    public SeuilEntity updateSeuil(double newSeuil) {
        SeuilEntity seuil = getSeuil();
        if (seuil == null) {
            seuil = new SeuilEntity();
        }
        seuil.setSeuil(newSeuil);
        return seuilRepository.save(seuil);
    }
}
