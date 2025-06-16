package it.unicalrent.service;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.entity.ServizioGiorno;
import it.unicalrent.entity.Utente;
import it.unicalrent.entity.Veicolo;
import it.unicalrent.entity.StatoPrenotazione;
import it.unicalrent.exception.BookingConflictException;
import it.unicalrent.repository.PrenotazioneRepository;
import it.unicalrent.repository.ServizioGiornoRepository;
import it.unicalrent.repository.UtenteRepository;
import it.unicalrent.repository.VeicoloRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servizio per la gestione delle prenotazioni.
 *
 * Garantisce:
 *  - Controllo di sovrapposizione delle fasce orarie.
 *  - Mutua esclusione su base giornaliera tramite ServizioGiorno.
 *  - Retry in caso di conflitti di optimistic locking.
 */
@Service
public class PrenotazioneService {

    private final UtenteRepository utRepo;
    private final VeicoloRepository veRepo;
    private final PrenotazioneRepository prRepo;
    private final ServizioGiornoRepository sgRepo;

    public PrenotazioneService(UtenteRepository utRepo, VeicoloRepository veRepo, PrenotazioneRepository prRepo, ServizioGiornoRepository sgRepo) {
        this.utRepo = utRepo;
        this.veRepo = veRepo;
        this.prRepo = prRepo;
        this.sgRepo = sgRepo;
    }

    /**
     * Tenta di creare una prenotazione atomica:
     * 1) controlla assenza di sovrapposizioni,
     * 2) aggiorna il contatore giornaliero per ogni giorno della fascia,
     * 3) salva la prenotazione, con retry in caso di conflitto di ottimistic locking.
     *
     * @param userId    ID dell'utente che prenota
     * @param veicoloId ID del veicolo da prenotare
     * @param inizio    data/ora inizio
     * @param fine      data/ora fine
     * @return l'oggetto Prenotazione salvato
     */
    @Transactional
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Prenotazione creaPrenotazione(String userId, Long veicoloId, LocalDateTime inizio, LocalDateTime fine) {
        // Recupero Utente
        Optional<Utente> optUt = utRepo.findById(userId);
        if (!optUt.isPresent()) {
            throw new IllegalArgumentException("Utente non trovato: " + userId);
        }
        Utente utente = optUt.get();

        // Recupero Veicolo
        Optional<Veicolo> optVe = veRepo.findById(veicoloId);
        if (!optVe.isPresent()) {
            throw new IllegalArgumentException("Veicolo non trovato: " + veicoloId);
        }
        Veicolo veicolo = optVe.get();

        // Verifica sovrapposizioni esistenti
        boolean occupato = prRepo.existsByVeicoloAndInizioLessThanAndFineGreaterThan(veicolo, inizio, fine);
        if (occupato) {
            throw new BookingConflictException(
                    "Il veicolo con targa " + veicolo.getTarga() + " non è disponibile dal " + inizio + " al " + fine
            );
        }

        // Mutua esclusione giornaliera
        LocalDate dataInizio = inizio.toLocalDate();
        LocalDate dataFine = fine.toLocalDate();

        // Itero ogni giorno da dataInizio a dataFine inclusi
        LocalDate giorno = dataInizio;
        while (!giorno.isAfter(dataFine)) {
            // aggiorno ServizioGiorno per 'giorno'
            Optional<ServizioGiorno> optSg = sgRepo.findByVeicoloAndData(veicolo, giorno);
            ServizioGiorno sg;
            if (optSg.isPresent()) {
                sg = optSg.get();
            } else {
                sg = new ServizioGiorno(veicolo, giorno);
            }

            // incremento il contatore e salvo (scatta optimistic lock)
            sg.incrementaPrenotazioni();
            sgRepo.save(sg);

            // passo al giorno successivo
            giorno = giorno.plusDays(1);
        }

        // 5. Crea la prenotazione
        Prenotazione pren = new Prenotazione(utente, veicolo, inizio, fine);
        pren.setStato(StatoPrenotazione.APPROVATA);

        // 6. Salvataggio con retry per optimistic locking
        int tentativi = 0;
        while (true) {
            try {
                return prRepo.save(pren);
            } catch (OptimisticLockingFailureException ex) {
                // Segno la transazione corrente per rollback
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                tentativi++;
                if (tentativi >= 3) {
                    throw new IllegalStateException(
                            "Concorrenza elevata, riprova più tardi", ex);
                }
                try {
                    Thread.sleep(50L * tentativi);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }


    /**
     * Restituisce tutte le prenotazioni.
     * Solo ADMIN può invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<Prenotazione> listaTuttePrenotazioni() {
        return prRepo.findAll();
    }

    /**
     * Restituisce le prenotazioni di un singolo utente.
     * UTENTE può vedere solo le proprie, ADMIN può vedere tutte.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public List<Prenotazione> listaPrenotazioniPerUtente(String userId) {
        return prRepo.findByUtenteId(userId);
    }
}