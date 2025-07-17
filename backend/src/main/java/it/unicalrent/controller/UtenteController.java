package it.unicalrent.controller;

import it.unicalrent.entity.Utente;
import it.unicalrent.service.UtenteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    private final UtenteService utService;

    public UtenteController(UtenteService utService) {
        this.utService = utService;
    }

    /** Profilo dell'utente autenticato */
    @GetMapping("/me")
    public Utente getMe(Principal principal) {
        return utService.trovaPerId(principal.getName());
    }

    /** Aggiorna il profilo dell'utente autenticato */
    @PutMapping("/me")
    public Utente updateMe(Principal principal, @RequestBody Utente u) {
        u.setId(principal.getName());
        return utService.aggiornaUtente(u);
    }

    /** Elenco di tutti gli utenti (solo ADMIN) */
    @GetMapping
    public List<Utente> listAll() {
        return utService.listaUtenti();
    }

    /** Elimina un utente per ID (solo ADMIN) */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        utService.eliminaUtente(id);
    }
}