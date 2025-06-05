package com.omohsine.project1.controllers;


import com.omohsine.project1.entities.SeuilEntity;
import com.omohsine.project1.services.SeuilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Passerelle/seuil")
public class SeuilController {


    @Autowired
    private SeuilService seuilService;

    // Récupérer le seuil actuel
    @GetMapping
    public SeuilEntity getSeuil() {
        return seuilService.getSeuil();
    }

    // Mettre à jour le seuil
    @PutMapping
    public SeuilEntity updateSeuil(@RequestBody SeuilEntity seuil) {
        return seuilService.updateSeuil(seuil.getSeuil());
    }
}
