package com.omohsine.project1.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity(name = "EntretienOral")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntretienOralEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long cin; // cin du candidat unique
    private String notes;    // Notes données pendant l'entretien
    private String appreciation; // Appréciation générale donnée
    private Double score;    // Score global de l'entretien


}
