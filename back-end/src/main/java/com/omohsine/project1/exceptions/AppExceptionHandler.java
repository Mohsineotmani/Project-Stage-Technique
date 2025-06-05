package com.omohsine.project1.exceptions;

import com.omohsine.project1.responses.ErrorMessage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/*
author otmani
    */

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@RestControllerAdvice
@ControllerAdvice
public class AppExceptionHandler {

  /*  @ExceptionHandler(value = UserException.class)
    public ResponseEntity<Object>HandleUserException(UserException ex, WebRequest request){
        System.err.println("Exception capturée : " + ex.getMessage()); // temporaire
        ErrorMessage errorMessage = new ErrorMessage(new Date(),ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body(errorMessage);
    }
*/

    // Pour UserException - retourne 404 Not Found au lieu de 500

    @ExceptionHandler(UserException.class)
    public ResponseEntity<Object> handleUserException(UserException ex , WebRequest request) {
        ErrorMessage errorMessage = new ErrorMessage(new Date(), ex.getMessage());
        return new ResponseEntity<>(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }


 /*   @ExceptionHandler(value = UserException.class)
    public ResponseEntity<Object> handleUserException(UserException ex, WebRequest request) {
        System.err.println("UserException capturée : " + ex.getMessage());
        ErrorMessage errorMessage = new ErrorMessage(new Date(), ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)  // 404 au lieu de 500
                .header("Content-Type", "application/json")
                .body(errorMessage);
    }*/


    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<Object>HandleOtherUserException(Exception ex, WebRequest request){

        ErrorMessage errorMessage = new ErrorMessage(new Date(),ex.getMessage());

        return new  ResponseEntity<> (errorMessage,new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<Object> HandleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request){
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach((error) -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        return new  ResponseEntity<> (errors,new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(value = IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        ErrorMessage errorMessage = new ErrorMessage(new Date(), ex.getMessage());
        return new ResponseEntity<>(errorMessage, new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }


}
