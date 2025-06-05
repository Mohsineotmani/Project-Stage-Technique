package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.SeuilEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeuilRepository extends JpaRepository<SeuilEntity, Long> {

}
