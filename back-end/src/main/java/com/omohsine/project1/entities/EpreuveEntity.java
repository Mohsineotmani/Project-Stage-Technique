package com.omohsine.project1.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EpreuveEntity {
    @Id @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private LocalDate dateDebut;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "concours_id", nullable = false)
    private ConcoursEntity concours;

    @OneToMany(mappedBy = "epreuve", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<SalleEntity> salles;

    @OneToMany(mappedBy = "epreuve", fetch = FetchType.EAGER)
    private List<ResultatEntity> resultats;
}
