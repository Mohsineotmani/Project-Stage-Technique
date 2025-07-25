package com.omohsine.project1.entities;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter
@Setter
@AllArgsConstructor @NoArgsConstructor
public class InscriptionEntity {
    @Id @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

}
