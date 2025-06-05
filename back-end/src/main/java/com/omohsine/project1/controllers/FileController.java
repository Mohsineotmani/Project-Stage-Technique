package com.omohsine.project1.controllers;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@RequestMapping("/files") // Point de base pour accéder aux fichiers
public class FileController {

    private final Path rootLocation = Paths.get("C:/Users/hp/OneDrive/Desktop/projet_VF/back-end/concourPasserelleFiles");

    @GetMapping("/{folder}/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String folder, @PathVariable String filename) {
        try {
            Path filePath = rootLocation.resolve(folder).resolve(filename);

            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            Resource resource = new UrlResource(filePath.toUri());

            // Détecter le type MIME
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream"; // Par défaut
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType)) // Définit le type MIME correct
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"") // inline pour afficher dans le navigateur
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
