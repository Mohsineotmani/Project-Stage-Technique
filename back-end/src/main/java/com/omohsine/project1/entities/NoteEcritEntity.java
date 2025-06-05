package com.omohsine.project1.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import javax.persistence.*;

@Entity(name = "NoteEcrit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteEcritEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cin; // Identifiant unique du candidat
    private String nom;
    private String email;
    private String filiere;
    private String concours;//

    private Double note; // Note de l’épreuve écrite

    @Column(name = "remarque")
    private String remarque; // commentaire du correcteur

    @Column(name = "status_publication", nullable = false)
    private boolean statusPublication = false;
    @Column(name = "statu_send_admin", nullable = false)
    private boolean statuSendAdmin = false;


}
