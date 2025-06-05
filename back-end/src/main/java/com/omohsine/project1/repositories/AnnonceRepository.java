package com.omohsine.project1.repositories;


import com.omohsine.project1.entities.AnnonceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnonceRepository extends JpaRepository<AnnonceEntity, Long> {
}
