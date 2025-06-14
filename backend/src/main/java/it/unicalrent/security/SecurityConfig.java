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
                // 1) Disabilita CSRF: non necessario per API JWT-based stateless
                .csrf(csrf -> csrf.disable())

                // 2) Regole di accesso
                .authorizeHttpRequests(auth -> auth
                        // — home e static resources sempre pubblici
                        .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**")
                        .permitAll()
                        // — registrazione utenti self-service
                        .requestMatchers(HttpMethod.POST, "/api/utenti/register")
                        .permitAll()
                        // — ricerca veicoli aperta a tutti
                        .requestMatchers(HttpMethod.GET, "/api/veicoli/**")
                        .permitAll()
                        // — tutte le altre operazioni su veicoli riservate a ADMIN
                        .requestMatchers("/api/veicoli/**")
                        .hasRole("ADMIN")
                        // — GET lista prenotazioni riservato a ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/prenotazioni")
                        .hasRole("ADMIN")
                        // — tutte le altre rotte di prenotazioni richiedono autenticazione
                        .requestMatchers("/api/prenotazioni/**")
                        .authenticated()
                        // — qualsiasi altra rotta richiede autenticazione
                        .anyRequest()
                        .authenticated()
                )

                // 3) Configura il resource-server JWT con converter personalizzato
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )

                // 4) Sessione HTTP in modalità stateless (nessuna HttpSession)
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }

    /**
     * Converte il JWT di Keycloak in una collezione di GrantedAuthority:
     *  1) Mappa gli scope (prefisso "SCOPE_") via JwtGrantedAuthoritiesConverter
     *  2) Mappa i ruoli da realm_access.roles (prefisso "ROLE_")
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
        scopesConverter.setAuthorityPrefix("SCOPE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            // 1) Aggiunge gli scope come authority
            authorities.addAll(scopesConverter.convert(jwt));

            // 2) Estrae i ruoli da realm_access.roles
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) realmAccess.get("roles");
                roles.stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .forEach(authorities::add);
            }

            return authorities;
        });

        return converter;
    }
}