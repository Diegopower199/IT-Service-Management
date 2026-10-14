/*package com.example.back_end.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.back_end.model.RolModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.RolRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UserRepository userRepository;
    private final ApplicationConfig applicationConfig;

    @Override
    public void run(String... args) {

        if (rolRepository.count() > 0 || userRepository.count() > 0) {
            System.out.println("Roles y usuarios ya existen en la base de datos. No se inicializan.");
            return;
        }

        RolModel adminRol = new RolModel();
        adminRol.setName("ADMIN");

        RolModel technicalRol = new RolModel();
        technicalRol.setName("TECHNICAL");

        RolModel userRol = new RolModel();
        userRol.setName("USER");

        adminRol = rolRepository.save(adminRol);
        technicalRol = rolRepository.save(technicalRol);
        userRol = rolRepository.save(userRol);

        UserModel admin = new UserModel();
        admin.setUsername("admin");
        admin.setEmail("admin@helpdesk.com");
        admin.setPassword(applicationConfig.passwordEncoder().encode("123456"));
        admin.setFirstName("Admin");
        admin.setLastName("HelpDesk");
        admin.setEnabled(true);
        admin.setRol(adminRol);

        UserModel technical = new UserModel();
        technical.setUsername("technical");
        technical.setEmail("technical@helpdesk.com");
        technical.setPassword(applicationConfig.passwordEncoder().encode("123456"));
        technical.setFirstName("Technical");
        technical.setLastName("HelpDesk");
        technical.setEnabled(true);
        technical.setRol(technicalRol);

        UserModel user = new UserModel();
        user.setUsername("user");
        user.setEmail("user@helpdesk.com");
        user.setPassword(applicationConfig.passwordEncoder().encode("123456"));
        user.setFirstName("User");
        user.setLastName("HelpDesk");
        user.setEnabled(true);
        user.setRol(userRol);

        userRepository.save(admin);
        userRepository.save(technical);
        userRepository.save(user);
    }
}*/