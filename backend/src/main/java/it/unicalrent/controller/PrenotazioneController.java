package it.unicalrent.controller;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.exception.BookingConflictException;
import it.unicalrent.service.PrenotazioneService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller REST per la gestione delle prenotazioni.
 */
@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    private final PrenotazioneService prenotazioneService;

    public PrenotazioneController(PrenotazioneService prenotazioneService) {
        this.prenotazioneService = prenotazioneService;
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
                return ResponseEntity.badRequest().body("La data di inizio deve essere precedente a quella di fine.");
            }

            Prenotazione prenotazione = prenotazioneService.creaPrenotazione(userId, veicoloIdLong, dataInizio, dataFine);
            return ResponseEntity.ok(prenotazione);

        } catch (BookingConflictException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Errore durante la creazione della prenotazione: " + e.getMessage());
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
    public List<Prenotazione> getPrenotazioniUtente(Principal principal) {
        return prenotazioneService.listaPrenotazioniPerUtente(principal.getName());
    }

    /**
     * Elenco di tutte le prenotazioni (solo ADMIN).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Prenotazione> getTuttePrenotazioni() {
        return prenotazioneService.listaTuttePrenotazioni();
    }

    /**
     * Annulla una prenotazione (soft-delete logica).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('UTENTE', 'ADMIN')")
    public ResponseEntity<?> annullaPrenotazione(Principal principal, @PathVariable Long id) {
        try {
            prenotazioneService.annullaPrenotazione(id, principal.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Errore durante l'annullamento: " + e.getMessage());
        }
    }
}