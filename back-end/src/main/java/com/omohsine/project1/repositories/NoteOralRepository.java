package com.omohsine.project1.repositories;

import com.omohsine.project1.entities.NoteEcritEntity;
import com.omohsine.project1.entities.NoteEntity;
import com.omohsine.project1.entities.NoteOralEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteOralRepository extends JpaRepository<NoteOralEntity, Long> {
    List<NoteOralEntity> findByFiliereOrderByNoteDesc(String filiere);
    List<NoteOralEntity> findByNoteGreaterThanEqual(double seuil);

    List<NoteOralEntity> findByStatusPublication(boolean statusPublication);

    boolean existsByStatusPublication(boolean statusPublication);

    Optional<NoteOralEntity> findByCin(String cin);


    //////

    // Find notes by filière and status_publication
    List<NoteOralEntity> findByFiliereAndStatusPublication(String filiere, boolean statusPublication);
    List<NoteOralEntity> findByFiliereAndStatusPublicationOrderByNoteDesc(String filiere, boolean statusPublication);
    List<NoteOralEntity> findByStatuSendAdmin(boolean statuAdmin);

    int deleteByCin(String cin) ;
    boolean existsByCin(String cin);


}
