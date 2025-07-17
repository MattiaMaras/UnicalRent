package it.unicalrent.controller;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.exception.BookingConflictException;
import it.unicalrent.service.PrenotazioneService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    private final PrenotazioneService prService;

    public PrenotazioneController(PrenotazioneService prService) {
        this.prService = prService;
    }

    /** Crea una nuova prenotazione (UTENTE o ADMIN) */
    @PostMapping
    public ResponseEntity<?> create(
            Principal principal,
            @RequestParam Long veicoloId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fine
    ) {
        try {
            String userId = principal.getName();

            Prenotazione p = prService.creaPrenotazione(userId, veicoloId, inizio, fine);

            // POPOLA i dati per evitare problemi lato frontend
            if (p.getUtente() != null) p.getUtente().setEmail(null); // opzionale
            if (p.getVeicolo() != null) p.getVeicolo().setDescrizione(null); // opzionale

            return ResponseEntity.ok(p);

        } catch (BookingConflictException ex) {
            return ResponseEntity.status(409).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Errore interno: " + ex.getMessage());
        }
    }

    /** Prenotazioni dell’utente autenticato */
    @GetMapping("/mybookings")
    public List<Prenotazione> myBookings(Principal principal) {
        return prService.listaPrenotazioniPerUtente(principal.getName());
    }

    /** Tutte le prenotazioni (solo ADMIN) */
    @GetMapping
    public List<Prenotazione> allBookings() {
        return prService.listaTuttePrenotazioni();
    }
}