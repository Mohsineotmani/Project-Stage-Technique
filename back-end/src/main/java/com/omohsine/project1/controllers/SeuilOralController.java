package com.omohsine.project1.controllers;


import com.omohsine.project1.entities.SeuilOraleEntity;
import com.omohsine.project1.services.SeuilOralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Passerelle/seuil_orale")
public class SeuilOralController {


    @Autowired
    private SeuilOralService seuilService;

    // Récupérer le seuil actuel
    @GetMapping
    public SeuilOraleEntity getSeuil() {
        return seuilService.getSeuil();
    }
    // Mettre à jour le seuil
    @PutMapping
    public SeuilOraleEntity updateSeuil(@RequestBody SeuilOraleEntity seuil) {
        return seuilService.updateSeuil(seuil.getSeuil());
    }
}