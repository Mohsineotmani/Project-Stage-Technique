package com.omohsine.project1.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CandidatNoteDto {

    private Long idCandidat;
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String filiereChoisi;

}
