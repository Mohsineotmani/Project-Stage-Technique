package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.EntretienOralEntity;  // Use the correct entity class yesss
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntretienOralRepository extends JpaRepository<EntretienOralEntity, Long> {  // Corrected to use EntretienOralEntity
}
