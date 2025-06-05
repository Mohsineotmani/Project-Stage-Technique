package com.omohsine.project1.requests;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/*
authorotmani 
*/
@Setter
@Getter
public class UserRequest {

    @NotNull(message = "Ce champ ne doit pas etre null")
    @Size(min = 3, message = "Le prénom doit contenir au moins 3 caractères")
    private String firstName;

    @NotNull(message = "Ce champ ne doit pas etre null")
    @Size(min = 3, message = "Le nom doit contenir au moins 3 caractères")
    private String lastName;

    @NotNull(message = "Ce champ ne doit pas etre null")
    @Email(message = "Ce champ doit avoir la forme d'un email valide")
    private String email;

    @NotNull(message = "Mot de passe est obligatoire")
    @Size(min = 8, max = 12, message = "Le mot de passe doit contenir entre 8 et 12 caractères")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,12}$",
            message = "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, et un caractère spécial"
    )
    private String password;

    private String role; // Champ pour le rôle, pas obligatoire

    public String getRole() {
        return role != null ? role : "CANDIDAT"; // Retourne "CANDIDAT" si le rôle n'est pas défini
    }
}
