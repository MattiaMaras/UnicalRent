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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private final UtenteService utenteService;

    public PrenotazioneService(UtenteRepository utenteRepo, VeicoloRepository veicoloRepo, PrenotazioneRepository prenotazioneRepo, ServizioGiornoRepository servizioGiornoRepo, UtenteService utenteService) {
        this.utenteRepo = utenteRepo;
        this.veicoloRepo = veicoloRepo;
        this.prenotazioneRepo = prenotazioneRepo;
        this.servizioGiornoRepo = servizioGiornoRepo;
        this.utenteService = utenteService;
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

            Ruolo ruolo = Ruolo.UTENTE;
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) realmAccess.get("roles");
                if (roles != null && roles.contains("ADMIN")) {
                    ruolo = Ruolo.ADMIN;
                }
            }
            nuovo.setRuolo(ruolo);
    
            return utenteRepo.save(nuovo);
        });
    }

    /**
     * Crea una nuova prenotazione con gestione ottimale della concorrenza.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Prenotazione creaPrenotazione(String userId, Long veicoloId, LocalDateTime inizio, LocalDateTime fine) {
        if (!utenteService.hasCartaCreditoValida(userId)) {
            throw new IllegalStateException("È necessario inserire una carta di credito valida prima di effettuare una prenotazione");
        }

        int maxRetry = 3;
        for (int tentativo = 1; tentativo <= maxRetry; tentativo++) {
            try {
                return creaPrenotazioneInterno(userId, veicoloId, inizio, fine);
            } catch (OptimisticLockingFailureException ex) {
                if (tentativo == maxRetry) {
                    throw new IllegalStateException("Concorrenza troppo alta, riprova più tardi");
                }
                try {
                    Thread.sleep(100 * tentativo);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Operazione interrotta");
                }
            }
        }
        throw new IllegalStateException("Errore imprevisto nella creazione della prenotazione");
    }
    
    /**
     * Metodo interno che implementa la logica di creazione con optimistic locking.
     */
    @Transactional
    protected Prenotazione creaPrenotazioneInterno(String userId, Long veicoloId, LocalDateTime inizio, LocalDateTime fine) {
        if (!inizio.isBefore(fine)) {
            throw new IllegalArgumentException("La data di inizio deve essere precedente alla data di fine.");
        }

        long minutiDurata = java.time.Duration.between(inizio, fine).toMinutes();
        if (minutiDurata < 60) {
            throw new IllegalArgumentException("La durata minima della prenotazione deve essere di almeno un'ora.");
        }

        Utente utente = getOrCreateUtenteDaJWT(userId);
        Veicolo veicolo = veicoloRepo.findById(veicoloId)
                .orElseThrow(() -> new IllegalArgumentException("Veicolo non trovato"));
    
        // PRIMA incremento ServizioGiorno per ogni giorno (questo forza il lock)
        LocalDate giorno = inizio.toLocalDate();
        while (!giorno.isAfter(fine.toLocalDate())) {
            ServizioGiorno sg = servizioGiornoRepo.findByVeicoloAndData(veicolo, giorno)
                    .orElse(new ServizioGiorno(veicolo, giorno));
            
            // Controllo se il veicolo è già prenotato in questo giorno
            // DOPO aver acquisito il lock tramite ServizioGiorno
            if (sg.getNumeroPrenotazioni() > 0) {
                // Verifica dettagliata delle sovrapposizioni per questo giorno specifico
                LocalDateTime inizioGiorno = giorno.atStartOfDay();
                LocalDateTime fineGiorno = giorno.plusDays(1).atStartOfDay();
                
                boolean sovrapposta = prenotazioneRepo.existsByVeicoloAndStatoAndDataInizioLessThanAndDataFineGreaterThan(
                    veicolo,
                    StatoPrenotazione.ATTIVA,
                    Math.max(inizio.toEpochSecond(java.time.ZoneOffset.UTC), inizioGiorno.toEpochSecond(java.time.ZoneOffset.UTC)) == inizio.toEpochSecond(java.time.ZoneOffset.UTC) ? fine : fineGiorno,
                    Math.min(fine.toEpochSecond(java.time.ZoneOffset.UTC), fineGiorno.toEpochSecond(java.time.ZoneOffset.UTC)) == fine.toEpochSecond(java.time.ZoneOffset.UTC) ? inizio : inizioGiorno
                );
                
                if (sovrapposta) {
                    throw new BookingConflictException("Il veicolo non è disponibile nella fascia richiesta per il giorno " + giorno);
                }
            }
            
            // Incremento il contatore (questo scatena l'optimistic lock se c'è concorrenza)
            sg.incrementaPrenotazioni();
            servizioGiornoRepo.save(sg);
            giorno = giorno.plusDays(1);
        }
    
        // Calcolo del costo totale
        long minuti = java.time.Duration.between(inizio, fine).toMinutes();
        double ore = minuti / 60.0;
        double costoTotale = Math.round(ore * veicolo.getCostoOrario() * 100.0) / 100.0;
    
        // Creazione e salvataggio della prenotazione
        Prenotazione pren = new Prenotazione(utente, veicolo, inizio, fine);
        pren.setStato(StatoPrenotazione.ATTIVA); // Cambiato da RICHIESTA ad ATTIVA
        pren.setCostoTotale(costoTotale);
    
        return prenotazioneRepo.save(pren);
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

        prenotazioneRepo.delete(esistente);
        return creaPrenotazione(userId, esistente.getVeicolo().getId(), nuovoInizio, nuovoFine);
    }

    /**
     * Annulla una prenotazione (soft delete logico).
     */
    /**
     * Cancella una prenotazione dell'utente (soft-delete logica).
     */
    @Transactional
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public void cancellaPrenotazione(Long prenId, String userId) {
        Prenotazione prenotazione = prenotazioneRepo.findById(prenId)
                .orElseThrow(() -> new IllegalArgumentException("Prenotazione non trovata"));
    
        if (!prenotazione.getUtente().getId().equals(userId)) {
            throw new SecurityException("Non puoi cancellare una prenotazione altrui");
        }
    
        if (prenotazione.getStato() != StatoPrenotazione.ATTIVA) {
            throw new IllegalArgumentException("Puoi cancellare solo prenotazioni attive");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursFromNow = now.plusHours(2);
        if (prenotazione.getDataInizio().isBefore(twoHoursFromNow)) {
            throw new IllegalArgumentException("Non puoi cancellare una prenotazione che inizia tra meno di 2 ore");
        }

        prenotazione.setStato(StatoPrenotazione.ANNULLATA);
        
        // Decrementa i contatori ServizioGiorno
        LocalDate giorno = prenotazione.getDataInizio().toLocalDate();
        while (!giorno.isAfter(prenotazione.getDataFine().toLocalDate())) {
            Optional<ServizioGiorno> sgOpt = servizioGiornoRepo.findByVeicoloAndData(prenotazione.getVeicolo(), giorno);
            if (sgOpt.isPresent()) {
                ServizioGiorno sg = sgOpt.get();
                sg.decrementaPrenotazioni();
                servizioGiornoRepo.save(sg);
            }
            giorno = giorno.plusDays(1);
        }
        
        prenotazioneRepo.save(prenotazione);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<Prenotazione> listaTuttePrenotazioni() {
        return prenotazioneRepo.findAll();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public List<Prenotazione> listaPrenotazioniPerUtente(String userId) {
        getOrCreateUtenteDaJWT(userId);
        return prenotazioneRepo.findByUtenteId(userId);
    }
    
    /**
     * Metodo di utilità per ricalcolare tutti i contatori ServizioGiorno
     * basandosi sulle prenotazioni attive nel database.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void ricalcolaContatori() {
        List<ServizioGiorno> tuttiServizi = servizioGiornoRepo.findAll();
        for (ServizioGiorno sg : tuttiServizi) {
            sg.setNumeroPrenotazioni(0);
            servizioGiornoRepo.save(sg);
        }

        List<Prenotazione> prenotazioniAttive = prenotazioneRepo.findAll().stream()
                .filter(p -> p.getStato() == StatoPrenotazione.ATTIVA)
                .collect(Collectors.toList());
        
        for (Prenotazione p : prenotazioniAttive) {
            LocalDate giorno = p.getDataInizio().toLocalDate();
            while (!giorno.isAfter(p.getDataFine().toLocalDate())) {
                ServizioGiorno sg = servizioGiornoRepo.findByVeicoloAndData(p.getVeicolo(), giorno)
                        .orElse(new ServizioGiorno(p.getVeicolo(), giorno));
                sg.incrementaPrenotazioni();
                servizioGiornoRepo.save(sg);
                giorno = giorno.plusDays(1);
            }
        }
    }
    

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminaPrenotazione(Long prenId) {
        Prenotazione prenotazione = prenotazioneRepo.findById(prenId)
                .orElseThrow(() -> new IllegalArgumentException("Prenotazione non trovata"));

        if (prenotazione.getStato() == StatoPrenotazione.ATTIVA) {
            LocalDate giorno = prenotazione.getDataInizio().toLocalDate();
            while (!giorno.isAfter(prenotazione.getDataFine().toLocalDate())) {
                Optional<ServizioGiorno> sgOpt = servizioGiornoRepo.findByVeicoloAndData(prenotazione.getVeicolo(), giorno);
                if (sgOpt.isPresent()) {
                    ServizioGiorno sg = sgOpt.get();
                    sg.decrementaPrenotazioni();
                    servizioGiornoRepo.save(sg);
                }
                giorno = giorno.plusDays(1);
            }
        }
        prenotazioneRepo.delete(prenotazione);
    }
}