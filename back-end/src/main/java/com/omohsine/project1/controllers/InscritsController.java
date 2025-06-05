package com.omohsine.project1.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.omohsine.project1.entities.CandidatEntity;
import com.omohsine.project1.services.InscritsService;

@RestController

@RequestMapping("/inscrits")
public class InscritsController {
    @Autowired
    private InscritsService inscritsService;

    @GetMapping("/filiere/{filiere}")
    public List<CandidatEntity> getInscritsByFiliere(
            @PathVariable String filiere  
    ) {
        return inscritsService.getInscritsByFiliere(filiere); 
    }
}




    

