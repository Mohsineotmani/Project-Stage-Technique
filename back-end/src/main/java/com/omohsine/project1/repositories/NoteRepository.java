package com.omohsine.project1.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.omohsine.project1.entities.NoteEntity;

public interface NoteRepository extends JpaRepository<NoteEntity, Long> {
    List<NoteEntity> findByFiliereOrderByNoteDesc(String filiere);
    List<NoteEntity> findByStatusOrale(String statusOrale);
    List<NoteEntity> findByNoteGreaterThanEqual(double seuil);
    List<NoteEntity> findByStatuAdminOrale(boolean statuAdminOrale);

    List<NoteEntity> findByStatusPublication(boolean statusPublication);

    boolean existsByStatusPublication(boolean statusPublication);

    Optional<NoteEntity> findByCin(String cin);

    int deleteByCin(String cin) ;
}