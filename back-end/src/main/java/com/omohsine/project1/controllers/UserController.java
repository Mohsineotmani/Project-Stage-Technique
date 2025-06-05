package com.omohsine.project1.controllers;

/*
Author: otmani 
*/

import com.omohsine.project1.entities.UserEntity;
import com.omohsine.project1.exceptions.UserException;
import com.omohsine.project1.repositories.UserRepository;
import com.omohsine.project1.requests.UserRequest;
import com.omohsine.project1.responses.ErrorMessages;
import com.omohsine.project1.responses.UserResponse;
import com.omohsine.project1.security.SecurityConstans;
import com.omohsine.project1.services.UserService;
import com.omohsine.project1.shared.dto.UserDto;

import io.jsonwebtoken.Jwts;

import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/users") // localhost:8082/users
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping(path = "/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        if (id == null || id.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Return BAD REQUEST if ID is invalid
        }

        UserDto userDto = userService.getUserByUserId(id);
        
        if (userDto == null) { // Check if the user exists
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Return NOT FOUND if no user found
        }

        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(userDto, userResponse);
        
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping
    public List<UserResponse> getAllUsers(@RequestParam(value = "page", defaultValue = "1") int page,
                                           @RequestParam(value = "limit", defaultValue = "5") int limit) {
        if (page > 1) page = page - 1; // Adjust page number for zero-based index
        List<UserResponse> userResponses = new ArrayList<>();
        List<UserDto> users = userService.getUsers(page, limit);
        
        for (UserDto userDto : users) {
            UserResponse userResponse = new UserResponse();
            BeanUtils.copyProperties(userDto, userResponse);
            userResponses.add(userResponse);
        }
        
        return userResponses;
    }

    @PostMapping()
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid UserRequest userRequest) throws Exception {
        // Validate first name field
        if (userRequest.getFirstName() == null || userRequest.getFirstName().isEmpty()) {
            System.out.println("UserController : createUser :");
            throw new UserException(ErrorMessages.MISSING_REQUIRED_FIELD.getErrorMessage());
        }

        UserEntity loadedUserByEmail = userRepository.findByEmail(userRequest.getEmail());
        if(loadedUserByEmail != null){
            System.out.println("loadedUserByEmail != null: true");
            throw new UserException(ErrorMessages.USER_WITH_EMAIL_ALREADY_EXIST .getErrorMessage());
        }

        // Set default role if none is provided
        if (userRequest.getRole() == null || userRequest.getRole().isEmpty()) {
            userRequest.setRole("CANDIDAT");
        }

        ModelMapper modelMapper = new ModelMapper();
        UserDto userDto = modelMapper.map(userRequest, UserDto.class);
        UserDto createdUser = userService.createUser(userDto);
        
        UserResponse userResponse = modelMapper.map(createdUser, UserResponse.class);

        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody UserRequest userRequest) {
        UserDto userDto = userService.authenticateUser(userRequest.getEmail(), userRequest.getPassword());
        
        if (userDto == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Unauthorized access
        }
        
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(userDto, userResponse);
        
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, 
                                                   @RequestBody @Valid UserRequest userRequest, 
                                                   @RequestHeader("Authorization") String token) {
       
       // Pas de vérification d'autorisation ici

       UserDto userDto = new UserDto();
       BeanUtils.copyProperties(userRequest, userDto);
       
       // Update logic here
       UserDto updatedUser = userService.updateUser(id, userDto);
       
       if (updatedUser == null) {
           return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Return NOT FOUND if the requested ID does not exist
       }
       
       UserResponse userResponse = new UserResponse();
       BeanUtils.copyProperties(updatedUser, userResponse);

       return new ResponseEntity<>(userResponse, HttpStatus.OK); // Return updated user info with OK status
   }

   private String extractRoleFromToken(String token) {
       token = token.replace(SecurityConstans.TOKEN_PREFIX, "");
       
       try {
           return Jwts.parser()
                   .setSigningKey(SecurityConstans.TOKEN_SECRET)
                   .parseClaimsJws(token)
                   .getBody()
                   .get("role", String.class);
       } catch (Exception e) {
           System.out.println("Failed to extract role from token: " + e.getMessage());
           return null; // Handle parsing failure gracefully
       }
   }

   private String extractUserIdFromToken(String token) {
       token = token.replace(SecurityConstans.TOKEN_PREFIX, "");
       
       try {
           return Jwts.parser()
                   .setSigningKey(SecurityConstans.TOKEN_SECRET)
                   .parseClaimsJws(token)
                   .getBody()
                   .get("sub", String.class); // Assuming 'sub' contains the user's ID in JWT claims
       } catch (Exception e) {
           System.out.println("Failed to extract user ID from token: " + e.getMessage());
           return null; // Handle parsing failure gracefully
       }
   }

   @DeleteMapping(path = "/{id}")
   public ResponseEntity<Object> deleteUser(@PathVariable String id) {
       userService.deleteUser(id);
       return new ResponseEntity<>(HttpStatus.NO_CONTENT);
   }
}
