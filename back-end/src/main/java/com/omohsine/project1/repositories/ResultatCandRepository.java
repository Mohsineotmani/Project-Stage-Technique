package com.omohsine.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.omohsine.project1.entities.NoteEntity;

@Repository
public interface ResultatCandRepository extends JpaRepository<NoteEntity, Long> {

    // Find notes by status_publication
    List<NoteEntity> findByStatusPublication(boolean statusPublication);

    // Find notes by filière and status_publication
    List<NoteEntity> findByFiliereAndStatusPublication(String filiere, boolean statusPublication);

    // Find notes by filière and status_publication, sorted by note in descending order
    List<NoteEntity> findByFiliereAndStatusPublicationOrderByNoteDesc(String filiere, boolean statusPublication);
    List<NoteEntity> findByStatuAdminOrale(boolean statuAdminOrale);

}