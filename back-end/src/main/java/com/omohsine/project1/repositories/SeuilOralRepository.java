package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.SeuilOraleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeuilOralRepository extends JpaRepository<SeuilOraleEntity, Long> {



}