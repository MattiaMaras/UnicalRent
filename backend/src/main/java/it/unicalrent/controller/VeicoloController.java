package it.unicalrent.controller;

import it.unicalrent.entity.Veicolo;
import it.unicalrent.service.VeicoloService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller REST per la gestione dei veicoli.
 * Fornisce operazioni CRUD protette con accessi differenziati per ruolo.
 */
@RestController
@RequestMapping("/api/veicoli")
public class VeicoloController {

    private final VeicoloService veicoloService;

    public VeicoloController(VeicoloService veicoloService) {
        this.veicoloService = veicoloService;
    }

    /**
     * Restituisce tutti i veicoli attivi e disponibili.
     * Accesso libero per consultazione.
     */
    @GetMapping
    public ResponseEntity<List<Veicolo>> listaVeicoliAttivi() {
        return ResponseEntity.ok(veicoloService.listaVeicoliAttivi());
    }

    /**
     * Restituisce i dettagli di un singolo veicolo per ID.
     * Accesso libero.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Veicolo> getVeicolo(@PathVariable Long id) {
        return ResponseEntity.ok(veicoloService.getVeicoloById(id));
    }

    /**
     * Crea un nuovo veicolo (solo per amministratori).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veicolo> aggiungiVeicolo(@Valid @RequestBody Veicolo veicolo) {
        Veicolo creato = veicoloService.creaVeicolo(veicolo);
        return ResponseEntity.ok(creato);
    }

    /**
     * Modifica i dati di un veicolo esistente (solo per amministratori).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Veicolo> aggiornaVeicolo(@PathVariable Long id, @Valid @RequestBody Veicolo aggiornato) {
        return ResponseEntity.ok(veicoloService.aggiornaVeicolo(id, aggiornato));
    }

    /**
     * Soft delete: disattiva un veicolo invece di eliminarlo fisicamente (solo per amministratori).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminaVeicolo(@PathVariable Long id) {
        veicoloService.eliminaVeicolo(id);
        return ResponseEntity.noContent().build();
    }
}
