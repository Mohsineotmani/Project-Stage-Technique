package com.omohsine.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.omohsine.project1.entities.CandidatEntity;

public interface InscritsRepository extends JpaRepository <CandidatEntity, Long> {
    List<CandidatEntity>  findInscritsByFiliereChoisi(String filiere);
    
}
