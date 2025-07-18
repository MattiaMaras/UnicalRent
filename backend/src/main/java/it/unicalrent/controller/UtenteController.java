package it.unicalrent.controller;

import it.unicalrent.dto.CartaCreditoDTO;
import it.unicalrent.entity.Utente;
import it.unicalrent.service.UtenteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    private final UtenteService utenteService;

    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }

    /**
     * Restituisce il profilo dell'utente autenticato.
     */
    @GetMapping("/me")
    public Utente getProfiloUtente(Principal principal) {
        return utenteService.getOrCreateUtenteDaPrincipal(principal);
    }

    /**
     * Restituisce tutti gli utenti del sistema.
     * Accesso riservato all'admin.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Utente> getAllUtenti() {
        return utenteService.getAllUtenti();
    }

    /**
     * Restituisce un singolo utente per ID.
     * Accesso riservato all'admin.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Utente getUtenteById(@PathVariable String id) {
        return utenteService.getUtenteById(id);
    }

    /**
     * Aggiorna la carta di credito dell'utente corrente
     */
    @PutMapping("/me/carta-credito")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<Utente> aggiornaCartaCredito(
            Principal principal,
            @Valid @RequestBody CartaCreditoDTO cartaDTO
    ) {
        String userId = principal.getName();
        Utente utenteAggiornato = utenteService.aggiornaCartaCredito(userId, cartaDTO);
        return ResponseEntity.ok(utenteAggiornato);
    }

    /**
     * Verifica se l'utente ha una carta di credito valida
     */
    @GetMapping("/me/carta-credito/valida")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<Boolean> hasCartaCreditoValida(Principal principal) {
        String userId = principal.getName();
        boolean hasCartaValida = utenteService.hasCartaCreditoValida(userId);
        return ResponseEntity.ok(hasCartaValida);
    }

    /**
     * Ottiene i dati della carta di credito (mascherati)
     */
    @GetMapping("/me/carta-credito")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<CartaCreditoDTO> getCartaCredito(Principal principal) {
        String userId = principal.getName();
        CartaCreditoDTO carta = utenteService.getCartaCreditoMascherata(userId);
        return ResponseEntity.ok(carta);
    }
}