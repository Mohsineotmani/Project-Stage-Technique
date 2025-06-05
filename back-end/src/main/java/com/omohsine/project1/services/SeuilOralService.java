package com.omohsine.project1.services;
import com.omohsine.project1.entities.SeuilOraleEntity;
import com.omohsine.project1.repositories.SeuilOralRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SeuilOralService {

    @Autowired
    private SeuilOralRepository seuilRepository;

    // Récupérer le seuil actuel
    public SeuilOraleEntity getSeuil() {
        return seuilRepository.findAll().stream().findFirst().orElse(null);
    }

    // Mettre à jour le seuil
    public SeuilOraleEntity updateSeuil(double newSeuil) {
        SeuilOraleEntity  seuil = getSeuil();
        if (seuil == null) {
            seuil = new SeuilOraleEntity();
        }
        seuil.setSeuil(newSeuil);
        return seuilRepository.save(seuil);
    }
}