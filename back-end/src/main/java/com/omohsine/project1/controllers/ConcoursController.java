package com.omohsine.project1.controllers;

import com.omohsine.project1.entities.ConcoursEntity;
import com.omohsine.project1.services.ConcoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping ("/concours")
public class ConcoursController {
    @Autowired
    private ConcoursService concoursService;

    @GetMapping
    public ResponseEntity<List<ConcoursEntity>> getAllConcours() {
        List<ConcoursEntity> concours = concoursService.getAllConcours();
        return new ResponseEntity<>(concours, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConcoursEntity> getConcours(@PathVariable Long id) {
        try{
            ConcoursEntity concours = concoursService.getConcoursById(id);
            return new ResponseEntity<>(concours, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
