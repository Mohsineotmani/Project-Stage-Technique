package com.omohsine.project1.entities;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

/*
authorotmani 
    */
@Setter
@Getter
@Entity(name="users")


public class UserEntity implements Serializable {

    @Id
    @GeneratedValue
    private long id;

    @Column(nullable=false)
    private String userId;

    @Column(nullable=false, length=50)
    private String firstName;

    @Column(nullable=false, length=50)
    private String lastName;

    @Column(nullable=false, length=120, unique=true)
    private String email;


    @Column(nullable=false)
    private String encryptedPassword;

    @Column(nullable=true)
    private String emailVerificationToken;

    @Column(nullable=true)
    private Boolean emailVerificationStatus = true;
    @Column(nullable = false, length = 20)
    private String role; // Possible values: "ADMIN", "CANDIDAT"



}
