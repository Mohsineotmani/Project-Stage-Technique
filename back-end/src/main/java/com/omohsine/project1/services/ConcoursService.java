package com.omohsine.project1.services;


import com.omohsine.project1.entities.ConcoursEntity;
import com.omohsine.project1.repositories.ConcoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConcoursService {
    @Autowired
    private ConcoursRepository concoursRepository;

    public List<ConcoursEntity> getAllConcours() {
        return concoursRepository.findAll();
    }

    public ConcoursEntity getConcoursById(Long id) {
        return concoursRepository.findById(id).orElseThrow(() -> new RuntimeException("Concours introuvable avec ID : "+id));
    }
}
