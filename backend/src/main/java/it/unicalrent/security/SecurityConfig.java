package it.unicalrent.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Configurazione di sicurezza per le API di Unical Rent:
 * - CSRF disabilitato (stateless, JWT-based)
 * - Endpoint pubblici per home, risorse statiche, registrazione e ricerca veicoli
 * - Protezione con ROLE_ADMIN su operazioni sensibili
 * - Sessione HTTP in modalità stateless
 * - Conversione custom del JWT di Keycloak in GrantedAuthority
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Definisce la catena di filtri di Spring Security.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // — swagger / OpenAPI UI e JSON
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/webjars/**"           // se serve
                        ).permitAll()
                        // 1) register pubblico
                        .requestMatchers(HttpMethod.POST, "/api/utenti/register").permitAll()

                        // 2) home e static resources
                        .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**").permitAll()

                        // 3) ricerca veicoli aperta
                        .requestMatchers(HttpMethod.GET, "/api/veicoli/**").permitAll()

                        // 4) resto veicoli solo ADMIN
                        .requestMatchers("/api/veicoli/**").hasRole("ADMIN")

                        // 5) prenotazioni
                        .requestMatchers(HttpMethod.GET, "/api/prenotazioni").hasRole("ADMIN")
                        .requestMatchers("/api/prenotazioni/**").authenticated()

                        // 6) tutte le altre rotte
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }


    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
        scopesConverter.setAuthorityPrefix("SCOPE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            // 1) scope
            authorities.addAll(scopesConverter.convert(jwt));

            // 2) realm_access.roles → ROLE_...
            Map<String,Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                @SuppressWarnings("unchecked")
                List<String> ra = (List<String>) realmAccess.get("roles");
                ra.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r)));
            }

            // 3) claim top-level "roles" → ROLE_...
            @SuppressWarnings("unchecked")
            List<String> topRoles = (List<String>) jwt.getClaim("roles");
            if (topRoles != null) {
                topRoles.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r)));
            }

            return authorities;
        });

        return converter;
    }
}