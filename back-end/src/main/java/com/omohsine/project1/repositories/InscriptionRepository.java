package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.InscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscriptionRepository extends JpaRepository<InscriptionEntity, Long> {
}
