package com.omohsine.project1.entities;

import com.omohsine.project1.entities.enums.TypeConcours;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*; // Import de javax pour compatibilité avec Spring Boot 2.x

@Entity
@Table(name = "notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String email;
    private String filiere;
    private String concours;//
    private Double note;

    @Column(name = "statu_send_admin", nullable = false)
    private boolean statuSendAdmin = false;

    @Column(name = "status_publication", nullable = false)
    private boolean statusPublication = false; // Par défaut false

    // New fields
    @Column(name = "remarque")
    private String remarque = null; // Remarque column, defaults to null

    @Column(name = "status_orale")
    private String statusOrale = null; // Status Orale column, default value set

    @Column(name = "statu_admin_orale")
    private boolean statuAdminOrale = false; // Statu Admin Orale column

    @Column(name = "cin")
    private String cin = null;  // CIN column, defaults to null






}