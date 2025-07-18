package it.unicalrent.controller;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.exception.BookingConflictException;
import it.unicalrent.service.PrenotazioneService;
import it.unicalrent.service.PrenotazioneSchedulerService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Aggiungi l'import
import it.unicalrent.dto.PrenotazioneDTO;
import it.unicalrent.mapper.PrenotazioneMapper;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    private final PrenotazioneService prenotazioneService;
    private final PrenotazioneMapper prenotazioneMapper;
    private final PrenotazioneSchedulerService prenotazioneSchedulerService;

    public PrenotazioneController(PrenotazioneService prenotazioneService, PrenotazioneMapper prenotazioneMapper, PrenotazioneSchedulerService prenotazioneSchedulerService) {
        this.prenotazioneService = prenotazioneService;
        this.prenotazioneMapper = prenotazioneMapper;
        this.prenotazioneSchedulerService = prenotazioneSchedulerService;
    }

    /**
     * Crea una nuova prenotazione (solo UTENTE o ADMIN autenticati).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<?> creaPrenotazione(
            Principal principal,
            @RequestParam @NotBlank String veicoloId,
            @RequestParam @NotBlank String inizio,
            @RequestParam @NotBlank String fine
    ) {
        try {
            String userId = principal.getName();

            Long veicoloIdLong = Long.parseLong(veicoloId);
            LocalDateTime dataInizio = LocalDateTime.parse(inizio);
            LocalDateTime dataFine = LocalDateTime.parse(fine);
    
            if (dataInizio.isAfter(dataFine) || dataInizio.equals(dataFine)) {
                Map<String, Object> errore = new HashMap<>();
                errore.put("tipo", "VALIDATION_ERROR");
                errore.put("messaggio", "La data di inizio deve essere precedente a quella di fine.");
                return ResponseEntity.badRequest().body(errore);
            }
    
            Prenotazione prenotazione = prenotazioneService.creaPrenotazione(userId, veicoloIdLong, dataInizio, dataFine);
            return ResponseEntity.ok(prenotazione);
    
        } catch (IllegalArgumentException e) {
            // Gestione errori di validazione (inclusa durata minima)
            Map<String, Object> errore = new HashMap<>();
            errore.put("tipo", "VALIDATION_ERROR");
            errore.put("messaggio", e.getMessage());
            return ResponseEntity.badRequest().body(errore);
        } catch (BookingConflictException e) {
            // Errore dettagliato per conflitti di prenotazione
            Map<String, Object> errore = new HashMap<>();
            errore.put("tipo", "BOOKING_CONFLICT");
            errore.put("messaggio", "Il veicolo non è disponibile nelle date selezionate.");
            errore.put("dettaglio", "Prova a selezionare date diverse o controlla la disponibilità del veicolo.");
            errore.put("veicoloId", veicoloId);
            return ResponseEntity.status(409).body(errore);
        } catch (Exception e) {
            Map<String, Object> errore = new HashMap<>();
            errore.put("tipo", "INTERNAL_ERROR");
            errore.put("messaggio", "Errore durante la creazione della prenotazione.");
            errore.put("dettaglio", e.getMessage());
            return ResponseEntity.internalServerError().body(errore);
        }
    }

    /**
     * Modifica una prenotazione esistente (con gli stessi controlli della creazione).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<?> modificaPrenotazione(
            Principal principal,
            @PathVariable Long id,
            @RequestParam @NotBlank String inizio,
            @RequestParam @NotBlank String fine
    ) {
        try {
            String userId = principal.getName();
            LocalDateTime nuovaInizio = LocalDateTime.parse(inizio);
            LocalDateTime nuovaFine = LocalDateTime.parse(fine);

            if (nuovaInizio.isAfter(nuovaFine) || nuovaInizio.equals(nuovaFine)) {
                return ResponseEntity.badRequest().body("La data di inizio deve essere precedente a quella di fine.");
            }

            Prenotazione modificata = prenotazioneService.modificaPrenotazione(id, userId, nuovaInizio, nuovaFine);
            return ResponseEntity.ok(modificata);

        } catch (BookingConflictException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Errore durante la modifica: " + e.getMessage());
        }
    }

    /**
     * Elenco delle prenotazioni dell’utente autenticato.
     */
    @GetMapping("/mybookings")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public List<PrenotazioneDTO> getPrenotazioniUtente(Principal principal) {
        List<Prenotazione> prenotazioni = prenotazioneService.listaPrenotazioniPerUtente(principal.getName());
        return prenotazioneMapper.toDTOList(prenotazioni);
    }

    /**
     * Elenco di tutte le prenotazioni (solo ADMIN).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PrenotazioneDTO> getTuttePrenotazioni() {
        List<Prenotazione> prenotazioni = prenotazioneService.listaTuttePrenotazioni();
        return prenotazioneMapper.toDTOList(prenotazioni);
    }

    /**
     * Annulla una prenotazione (soft-delete logica).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminaPrenotazione(@PathVariable Long id) {
        prenotazioneService.eliminaPrenotazione(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Ricalcola tutti i contatori ServizioGiorno (solo ADMIN).
     */
    @PostMapping("/ricalcola-contatori")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> ricalcolaContatori() {
        try {
            prenotazioneService.ricalcolaContatori();
            Map<String, String> response = new HashMap<>();
            response.put("messaggio", "Contatori ricalcolati con successo");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("errore", "Errore durante il ricalcolo dei contatori: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * Cancella una prenotazione dell'utente (soft-delete logica).
     */
    @PutMapping("/{id}/cancella")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<?> cancellaPrenotazione(
            Principal principal,
            @PathVariable Long id
    ) {
        try {
            String userId = principal.getName();
            prenotazioneService.cancellaPrenotazione(id, userId);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("Non puoi cancellare una prenotazione altrui");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Errore durante la cancellazione: " + e.getMessage());
        }
    }
    
    @PostMapping("/aggiorna-scadute")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> aggiornaPrenotazioniScadute() {
        int aggiornate = prenotazioneSchedulerService.aggiornaPrenotazioniScaduteManuale();
        return ResponseEntity.ok("Aggiornate " + aggiornate + " prenotazioni da ATTIVA a COMPLETATA");
    }
}