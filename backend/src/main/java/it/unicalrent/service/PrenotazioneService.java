package it.unicalrent.service;

import it.unicalrent.entity.*;
import it.unicalrent.exception.BookingConflictException;
import it.unicalrent.repository.*;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servizio per la gestione delle prenotazioni, con supporto a:
 * - validazione temporale,
 * - mutua esclusione tramite ServizioGiorno,
 * - optimistic locking,
 * - estrazione utente da JWT.
 */
@Service
public class PrenotazioneService {

    private final UtenteRepository utenteRepo;
    private final VeicoloRepository veicoloRepo;
    private final PrenotazioneRepository prenotazioneRepo;
    private final ServizioGiornoRepository servizioGiornoRepo;

    public PrenotazioneService(UtenteRepository utenteRepo, VeicoloRepository veicoloRepo,
                               PrenotazioneRepository prenotazioneRepo, ServizioGiornoRepository servizioGiornoRepo) {
        this.utenteRepo = utenteRepo;
        this.veicoloRepo = veicoloRepo;
        this.prenotazioneRepo = prenotazioneRepo;
        this.servizioGiornoRepo = servizioGiornoRepo;
    }

    /**
     * Estrae o crea l'utente corrente dai dati nel JWT.
     */
    private Utente getOrCreateUtenteDaJWT(String userId) {
        return utenteRepo.findById(userId).orElseGet(() -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Jwt jwt = (Jwt) auth.getPrincipal();

            Utente nuovo = new Utente();
            nuovo.setId(userId);
            nuovo.setEmail(jwt.getClaimAsString("email"));
            nuovo.setNome(jwt.getClaimAsString("given_name"));
            nuovo.setCognome(jwt.getClaimAsString("family_name"));
            nuovo.setRuolo(jwt.getClaimAsString("realm_access").contains("ADMIN") ? Ruolo.ADMIN : Ruolo.UTENTE);

            return utenteRepo.save(nuovo);
        });
    }

    /**
     * Crea una nuova prenotazione.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Prenotazione creaPrenotazione(String userId, Long veicoloId, LocalDateTime inizio, LocalDateTime fine) {
        if (!inizio.isBefore(fine)) {
            throw new IllegalArgumentException("La data di inizio deve essere precedente alla data di fine.");
        }

        Utente utente = getOrCreateUtenteDaJWT(userId);
        Veicolo veicolo = veicoloRepo.findById(veicoloId).orElseThrow(() -> new IllegalArgumentException("Veicolo non trovato"));

        boolean sovrapposta = prenotazioneRepo.existsByVeicoloAndDataInizioLessThanAndDataFineGreaterThan(veicolo, inizio, fine);
        if (sovrapposta) {
            throw new BookingConflictException("Il veicolo non è disponibile nella fascia richiesta.");
        }

        // blocco logico per ogni giorno nella fascia prenotata
        LocalDate giorno = inizio.toLocalDate();
        while (!giorno.isAfter(fine.toLocalDate())) {
            ServizioGiorno sg = servizioGiornoRepo.findByVeicoloAndData(veicolo, giorno).orElse(new ServizioGiorno(veicolo, giorno));
            sg.incrementaPrenotazioni();
            servizioGiornoRepo.save(sg);
            giorno = giorno.plusDays(1);
        }

        Prenotazione pren = new Prenotazione(utente, veicolo, inizio, fine);
        pren.setStato(StatoPrenotazione.APPROVATA);

        int retry = 0;
        while (true) {
            try {
                return prenotazioneRepo.save(pren);
            } catch (OptimisticLockingFailureException ex) {
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                if (++retry >= 3) throw new IllegalStateException("Concorrenza troppo alta, riprova");
                try { Thread.sleep(50L * retry); } catch (InterruptedException ignored) { }
            }
        }
    }

    /**
     * Modifica una prenotazione esistente con gli stessi controlli della creazione.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Prenotazione modificaPrenotazione(Long prenId, String userId, LocalDateTime nuovoInizio, LocalDateTime nuovoFine) {
        Prenotazione esistente = prenotazioneRepo.findById(prenId)
                .orElseThrow(() -> new IllegalArgumentException("Prenotazione non trovata"));

        if (!esistente.getUtente().getId().equals(userId)) {
            throw new SecurityException("Non puoi modificare una prenotazione altrui");
        }

        prenotazioneRepo.delete(esistente); // soft-delete futura

        return creaPrenotazione(userId, esistente.getVeicolo().getId(), nuovoInizio, nuovoFine);
    }

    /**
     * Annulla una prenotazione (soft delete logico).
     */
    @Transactional
    public void annullaPrenotazione(Long id, String userId) {
        Prenotazione p = prenotazioneRepo.findById(id).orElseThrow();
        if (!p.getUtente().getId().equals(userId)) {
            throw new SecurityException("Non puoi annullare una prenotazione altrui");
        }
        p.setStato(StatoPrenotazione.ANNULLATA);
        prenotazioneRepo.save(p);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<Prenotazione> listaTuttePrenotazioni() {
        return prenotazioneRepo.findAll();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public List<Prenotazione> listaPrenotazioniPerUtente(String userId) {
        return prenotazioneRepo.findByUtenteId(userId);
    }
}