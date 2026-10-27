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
 * Configures the authentication-related components used by Spring Security.
 *
 * <p>
 * This configuration registers the main authentication beans required by
 * the application:
 * </p>
 *
 * <ul>
 * <li>{@link AuthenticationManager}: coordinates the authentication
 * process.</li>
 * <li>{@link AuthenticationProvider}: validates user credentials.</li>
 * <li>{@link PasswordEncoder}: hashes and verifies passwords using BCrypt.</li>
 * <li>{@link UserDetailsService}: loads users from the database.</li>
 * </ul>
 */
@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Provides the {@link AuthenticationManager} configured by Spring Security.
     *
     * <p>
     * The authentication manager coordinates the available authentication
     * providers when authenticating a user.
     * </p>
     *
     * @param config the Spring Security authentication configuration
     * @return the configured {@link AuthenticationManager}
     * @throws Exception if the authentication manager cannot be created
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    /**
     * Configures the authentication provider used to validate user credentials.
     *
     * <p>
     * {@link DaoAuthenticationProvider} uses the configured
     * {@link UserDetailsService} to retrieve the user and the
     * {@link PasswordEncoder} to compare the submitted password with the
     * encrypted password stored in the database.
     * </p>
     *
     * @return the configured {@link AuthenticationProvider}
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService());

        authenticationProvider.setPasswordEncoder(passwordEncoder());

        return authenticationProvider;
    }

    /**
     * Provides the password encoder used by the application.
     *
     * <p>
     * Passwords are hashed and verified using the BCrypt algorithm.
     * </p>
     *
     * @return the configured {@link PasswordEncoder}
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Provides the service used by Spring Security to load users by username.
     *
     * <p>
     * Users are retrieved from the application's user repository. If the
     * username does not exist, Spring Security receives a
     * {@link UsernameNotFoundException}.
     * </p>
     *
     * @return the configured {@link UserDetailsService}
     */
    @Bean
    public UserDetailsService userDetailsService() {

        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User with username '" + username + "' not found"));
    }
}