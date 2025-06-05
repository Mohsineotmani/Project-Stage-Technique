package com.omohsine.project1.entities;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SeuilOrale")
public class SeuilOraleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double seuil;

    // Getters et Setters
    public Long getId() { return id;}

    public void setId(Long id) { this.id = id;}

    public double getSeuil() { return seuil;}

    public void setSeuil(double seuil) { this.seuil = seuil;}
}