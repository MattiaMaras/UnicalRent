package it.unicalrent.controller;

import it.unicalrent.entity.Utente;
import it.unicalrent.service.UtenteService;
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
}