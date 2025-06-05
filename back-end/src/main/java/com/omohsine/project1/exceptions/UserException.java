package com.omohsine.project1.exceptions;


import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Data
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class UserException extends RuntimeException {

    public UserException(String message) {
        super(message);
    }
}
