package br.com.portfolio.frota.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }

    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            .securityContext(context -> context.securityContextRepository(securityContextRepository()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/api/auth/csrf", "/api/auth/login", "/actuator/health/**", "/actuator/info", "/error").permitAll()
                .requestMatchers("/api/auth/users/**").hasRole("ADMIN_MASTER")
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/veiculos/**", "/api/dashboard").authenticated()
                .requestMatchers("/api/veiculos/**").hasAnyRole("ADMIN_MASTER", "GERENTE")
                .requestMatchers(HttpMethod.GET, "/api/funcionarios/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "RH")
                .requestMatchers("/api/funcionarios/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "RH")
                .requestMatchers(HttpMethod.GET, "/api/proprietarios/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "VENDEDOR", "RH")
                .requestMatchers("/api/proprietarios/**").hasAnyRole("ADMIN_MASTER", "GERENTE")
                .requestMatchers(HttpMethod.GET, "/api/pecas/**", "/api/manutencoes/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "MECANICO", "OPERACAO")
                .requestMatchers("/api/pecas/**", "/api/manutencoes/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "MECANICO", "OPERACAO")
                .requestMatchers("/api/vendas/**").hasAnyRole("ADMIN_MASTER", "GERENTE", "VENDEDOR")
                .requestMatchers("/api/relatorios/**").hasAnyRole("ADMIN_MASTER", "GERENTE")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll());
        return http.build();
    }
}
