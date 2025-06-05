package com.omohsine.project1.services.Impl;

import com.omohsine.project1.entities.UserEntity;
import com.omohsine.project1.repositories.UserRepository;
import com.omohsine.project1.services.UserService;
import com.omohsine.project1.shared.dto.UserDto;
import com.omohsine.project1.shared.dto.Utils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/*
authorotmani 
    */
@Service
public class UserServiceImpl implements UserService {


    @Autowired
    UserRepository userRepository;

    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;


    @Autowired
    Utils utils;

    public UserServiceImpl(UserRepository userRepository, Utils utils) {
        this.userRepository = userRepository;
        this.utils = utils;
    }


    @Override
    public UserDto createUser(UserDto user) {

        // Vérifier si l'utilisateur existe déjà
        UserEntity userCheck = userRepository.findByEmail(user.getEmail());
        if (userCheck != null) throw new RuntimeException("User already exists");

        // Mapper UserDto en UserEntity
        ModelMapper modelMapper = new ModelMapper();
        UserEntity userEntity = modelMapper.map(user, UserEntity.class);

        // Générer un ID unique pour l'utilisateur
        userEntity.setUserId(utils.generateStringId(32));
        userEntity.setEncryptedPassword(bCryptPasswordEncoder.encode(user.getPassword()));



        // Sauvegarder l'utilisateur dans la base
        UserEntity newUser = userRepository.save(userEntity);

        // Mapper UserEntity en UserDto pour la réponse
        UserDto returnValue = modelMapper.map(newUser, UserDto.class);

        return returnValue;
    }


    @Override
    public UserDto getUser(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if(userEntity == null) throw new UsernameNotFoundException(email);

        UserDto userDto = new UserDto();

        BeanUtils.copyProperties(userEntity, userDto);

        return userDto;
    }

    @Override
    public UserDto getUserByUserId(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId);

        if(userEntity == null) throw new UsernameNotFoundException(userId);

        UserDto userDto = new UserDto();

        BeanUtils.copyProperties(userEntity, userDto);

        return userDto;
    }


    @Override
    public UserDto updateUser(String userId, UserDto userDto) {

        UserEntity userEntity = userRepository.findByUserId(userId);

        if(userEntity == null) throw new UsernameNotFoundException(userId);

        userEntity.setFirstName(userDto.getFirstName());
        userEntity.setLastName(userDto.getLastName());

        UserEntity userUpdated = userRepository.save(userEntity);

        UserDto user = new UserDto();

        BeanUtils.copyProperties(userUpdated, user);

        return user;
    }

    @Override
    public void deleteUser(String UserId) {
        UserEntity userEntity = userRepository.findByUserId(UserId);
        if(userEntity == null) throw new UsernameNotFoundException(UserId);
        userRepository.delete(userEntity);


    }

    @Override
    public List<UserDto> getUsers(int page, int limit) {

        List<UserDto> usersDto = new ArrayList<>();

        Pageable pageableRequest = PageRequest.of(page, limit);
        Page<UserEntity> userPage = userRepository.findAll(pageableRequest);

        List<UserEntity> users = userPage.getContent();

        for (UserEntity userEntity : users) {
            UserDto user = new UserDto();
            BeanUtils.copyProperties(userEntity, user);
            usersDto.add(user);

        }
        return usersDto;


    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) throw new UsernameNotFoundException(email);
        return new User(userEntity.getEmail(),userEntity.getEncryptedPassword(),new ArrayList<>());
    }

    public UserDto authenticateUser(String username, String password) {
        UserEntity userEntity = userRepository.findByEmail(username);
        if (userEntity != null && bCryptPasswordEncoder.matches(password, userEntity.getEncryptedPassword())) {
            UserDto userDto = new UserDto();
            BeanUtils.copyProperties(userEntity, userDto);
            return userDto;
        }
        return null;
    }

}
