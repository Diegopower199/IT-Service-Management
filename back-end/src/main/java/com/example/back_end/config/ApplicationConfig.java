package com.example.back_end.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.back_end.repository.UserRepository;


/**
 * Configuracion de los componentes utilizados durante la autenticacion.
 *
 * <p>
 * Aqui se registran como beans:
 * </p>
 * <ul>
 * <li>{@link AuthenticationManager}: inicia el proceso de autenticacion.</li>
 * <li>{@link AuthenticationProvider}: comprueba usuario y password.</li>
 * <li>{@link PasswordEncoder}: cifra y compara passwords con BCrypt.</li>
 * <li>{@link UserDetailsService}: carga usuarios desde la base de datos.</li>
 * 
 */
@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Obtiene el AuthenticationManager creado por Spring Security.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configura un proveedor de autenticacion basado en base de datos.
     *
     * <p>
     * DaoAuthenticationProvider utiliza el UserDetailsService para encontrar
     * al usuario y PasswordEncoder para comparar la password recibida con la
     * password cifrada almacenada.
     * </p>
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService());

        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    /**
     * Bean responsable de cifrar las passwords mediante BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Indica a Spring Security como localizar un usuario por username.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
