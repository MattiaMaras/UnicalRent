package it.unicalrent.service;

import it.unicalrent.dto.CartaCreditoDTO;
import it.unicalrent.entity.CartaCredito;
import it.unicalrent.entity.Ruolo;
import it.unicalrent.entity.Utente;
import it.unicalrent.repository.UtenteRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
            String userId = jwt.getSubject();
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

    /**
     * Verifica se l'utente ha una carta di credito valida
     * Aggiornato per usare la nuova gestione delle carte multiple
     */
    @Transactional(readOnly = true)
    public boolean hasCartaCreditoValida(String userId) {
        return utRepo.findById(userId)
                .map(utente -> {
                    if (utente.hasCarteCredito()) {
                        return true;
                    }
                    return utente.hasCartaCredito();
                })
                .orElse(false);
    }

    /**
     * Ottiene i dati della carta di credito principale (mascherati per sicurezza)
     * Aggiornato per usare la carta principale dalla nuova gestione
     */
    @Transactional(readOnly = true)
    public CartaCreditoDTO getCartaCreditoMascherata(String userId) {
        Utente utente = utRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utente non trovato: " + userId));

        CartaCredito cartaPrincipale = utente.getCartaPrincipale();
        if (cartaPrincipale != null) {
            CartaCreditoDTO dto = new CartaCreditoDTO(
                    cartaPrincipale.getNumeroCarta(),
                    cartaPrincipale.getScadenzaCarta(),
                    "***",
                    cartaPrincipale.getIntestatarioCarta()
            );
            dto.setTipoCarta(cartaPrincipale.getTipoCarta());
            dto.setPrincipale(cartaPrincipale.isPrincipale());
            return dto;
        }

        if (!utente.hasCartaCredito()) {
            return null;
        }

        String numeroMascherato = "**** **** **** " + utente.getNumeroCarta().substring(12);
        
        return new CartaCreditoDTO(
                numeroMascherato,
                utente.getScadenzaCarta(),
                "***",
                utente.getIntestatarioCarta()
        );
    }

    /**
     * Verifica se l'utente ha una carta di credito valida e non scaduta
     */
    @Transactional(readOnly = true)
    public boolean hasCartaCreditoValidaENonScaduta(String userId) {
        return utRepo.findById(userId)
                .map(utente -> {
                    CartaCredito cartaPrincipale = utente.getCartaPrincipale();
                    if (cartaPrincipale != null) {
                        return !cartaPrincipale.isScaduta();
                    }
                    if (utente.hasCartaCredito()) {
                        return !isCartaScaduta(utente.getScadenzaCarta());
                    }
                    
                    return false;
                })
                .orElse(false);
    }

    /**
     * Verifica se una carta è scaduta (per compatibilità legacy)
     */
    private boolean isCartaScaduta(String scadenza) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yy");
            LocalDate dataScadenza = LocalDate.parse("01/" + scadenza, DateTimeFormatter.ofPattern("dd/MM/yy"));
            return dataScadenza.isBefore(LocalDate.now());
        } catch (Exception e) {
            return true;
        }
    }
}