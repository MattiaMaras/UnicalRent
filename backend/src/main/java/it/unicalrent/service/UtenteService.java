package it.unicalrent.service;

import it.unicalrent.entity.Ruolo;
import it.unicalrent.entity.Utente;
import it.unicalrent.repository.UtenteRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UtenteService {

    private final UtenteRepository utRepo;

    public UtenteService(UtenteRepository utRepo) {
        this.utRepo = utRepo;
    }

    /**
     * Restituisce o crea l'utente corrente (estratto da Keycloak).
     */
    @Transactional
    public Utente getOrCreateUtenteDaPrincipal(java.security.Principal principal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String userId = jwt.getSubject(); // <-- è SEMPRE presente, NON null
            return utRepo.findById(userId)
                    .orElseGet(() -> utRepo.save(estraiUtenteDaJwt(jwt)));
        }
        throw new IllegalStateException("Impossibile determinare l'ID utente dal JWT");
    }

    /**
     * Estrae i dati utente da JWT e li trasforma in oggetto Utente persistibile.
     */
    private Utente estraiUtenteDaJwt(Jwt jwt) {
        String userId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String nome = jwt.getClaimAsString("given_name");
        String cognome = jwt.getClaimAsString("family_name");
    
        // Estrazione corretta dei ruoli
        Ruolo ruolo = Ruolo.UTENTE;
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles != null && roles.contains("ADMIN")) {
                ruolo = Ruolo.ADMIN;
            }
        }
    
        Utente u = new Utente();
        u.setId(userId);
        u.setEmail(email != null ? email : userId + "@unicalrent.local");
        u.setNome(nome != null ? nome : "Nome");
        u.setCognome(cognome != null ? cognome : "Cognome");
        u.setRuolo(ruolo);
    
        return u;
    }

    /**
     * Lista completa utenti (solo admin).
     */
    @Transactional(readOnly = true)
    public List<Utente> getAllUtenti() {
        return utRepo.findAll();
    }

    /**
     * Utente per ID (solo admin).
     */
    @Transactional(readOnly = true)
    public Utente getUtenteById(String id) {
        return utRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utente non trovato: " + id));
    }
}