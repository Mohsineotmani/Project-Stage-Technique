package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.NoteEcritEntity;
import com.omohsine.project1.entities.NoteEcritEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteEcritRepository extends JpaRepository<NoteEcritEntity, Long> {
    List<NoteEcritEntity> findByFiliereOrderByNoteDesc(String filiere);
    List<NoteEcritEntity> findByNoteGreaterThanEqual(double seuil);

    List<NoteEcritEntity> findByStatusPublication(boolean statusPublication);

    boolean existsByStatusPublication(boolean statusPublication);

    Optional<NoteEcritEntity> findByCin(String cin);

    // Find notes by filière and status_publication
    List<NoteEcritEntity> findByFiliereAndStatusPublication(String filiere, boolean statusPublication);
    List<NoteEcritEntity> findByFiliereAndStatusPublicationOrderByNoteDesc(String filiere, boolean statusPublication);
    List<NoteEcritEntity> findByStatuSendAdmin(boolean statuAdmin);

    int deleteByCin(String cin) ;
}
