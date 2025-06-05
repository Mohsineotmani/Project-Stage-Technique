package com.omohsine.project1.controllers;

import com.omohsine.project1.exceptions.UserException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping()
public class TestController {

    @GetMapping("/api/test-exception")
    public String testException() {
        throw new UserException("Test exception message");
    }
}