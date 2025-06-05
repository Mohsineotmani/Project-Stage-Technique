package com.omohsine.project1.entities;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ConcoursEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String filiere;
    private String description;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    @OneToMany(mappedBy = "concours", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<EpreuveEntity> epreuves = new ArrayList<>();
}
