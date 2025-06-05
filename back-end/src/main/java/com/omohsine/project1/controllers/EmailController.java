package com.omohsine.project1.controllers;

import com.omohsine.project1.config.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.omohsine.project1.entities.EmailRequest;
@RestController
public class EmailController {

     @Autowired
    private EmailService emailService;

    @PostMapping("/api/notes/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        emailService.sendEmail(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody());
        return ResponseEntity.ok("Email sent successfully!");
    }
}