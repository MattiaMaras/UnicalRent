package it.unicalrent.service;

import it.unicalrent.entity.Ruolo;
import it.unicalrent.entity.Utente;
import it.unicalrent.repository.UtenteRepository;
import jakarta.annotation.security.PermitAll;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

/**
 * Service per la gestione degli Utenti.
 *
 * Qui applichiamo i controlli di sicurezza:
 * - solo ADMIN può creare, aggiornare, listare o eliminare utenti
 * - ADMIN o l’UTENTE proprietario può leggere il proprio profilo
 */
@Service
public class UtenteService {

    private final UtenteRepository utRepo;

    public UtenteService(UtenteRepository utRepo) {
        this.utRepo = utRepo;
    }


    /**
     * Registrazione “self-service” di un nuovo UTENTE.
     * Accessibile a chiunque (anonimo o autenticato).
     * Imposta il ruolo UTENTE di default.
     */
    @Transactional
    @PermitAll
    public Utente registerUtente(Utente u) {
        u.setRuolo(Ruolo.UTENTE);
        return utRepo.save(u);
    }

    /**
     * Modifica i dati di un utente esistente.
     * Solo ADMIN può invocare.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Utente aggiornaUtente(Utente u) {
        return utRepo.save(u);
    }

    /**
     * Recupera un utente per ID.
     * ADMIN può recuperare chiunque, un UTENTE solo se il proprio ID.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public Utente trovaPerId(String id) {
        Optional<Utente> opt = utRepo.findById(id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Utente non trovato: " + id);
        }
        return opt.get();
    }

    /**
     * Recupera un utente per email.
     * Solo ADMIN può invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Utente trovaPerEmail(String email) {
        Optional<Utente> opt = utRepo.findByEmail(email);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Utente non trovato per email: " + email);
        }
        return opt.get();
    }

    /**
     * Elenca tutti gli utenti.
     * Solo ADMIN può invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<Utente> listaUtenti() {
        return utRepo.findAll();
    }

    /**
     * Elimina un utente per ID.
     * Solo ADMIN può invocare.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminaUtente(String id) {
        utRepo.deleteById(id);
    }
}