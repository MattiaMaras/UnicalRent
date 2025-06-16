// backend/src/main/java/it/unicalrent/service/VeicoloService.java
package it.unicalrent.service;

import it.unicalrent.entity.Veicolo;
import it.unicalrent.repository.VeicoloRepository;
import jakarta.annotation.security.PermitAll;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service per la gestione dei Veicoli.
 *
 * Controlli di sicurezza:
 * - solo ADMIN può creare, aggiornare o eliminare veicoli
 * - UTENTE e ADMIN possono leggere e cercare disponibilità
 */
@Service
public class VeicoloService {

    private final VeicoloRepository veRepo;

    public VeicoloService(VeicoloRepository veRepo) {
        this.veRepo = veRepo;
    }

    /**
     * Aggiunge un nuovo veicolo.
     * Solo ADMIN può invocare.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Veicolo creaVeicolo(Veicolo v) {
        return veRepo.save(v);
    }

    /**
     * Modifica un veicolo esistente.
     * Solo ADMIN può invocare.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Veicolo aggiornaVeicolo(Veicolo v) {
        return veRepo.save(v);
    }

    /**
     * Recupera un veicolo per ID.
     * UTENTE o ADMIN possono invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Veicolo trovaPerId(Long id) {
        Optional<Veicolo> opt = veRepo.findById(id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Veicolo non trovato: " + id);
        }
        return opt.get();
    }

    /**
     * Cerca un veicolo per targa.
     * UTENTE o ADMIN possono invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public Veicolo trovaPerTarga(String targa) {
        Optional<Veicolo> opt = veRepo.findByTarga(targa);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Veicolo non trovato per targa: " + targa);
        }
        return opt.get();
    }

    /**
     * Elenca tutti i veicoli.
     * UTENTE o ADMIN possono invocare.
     */
    @Transactional(readOnly = true)
    @PermitAll
    public List<Veicolo> listaTutti() {
        return veRepo.findAll();
    }

    /**
     * Elenca i veicoli disponibili nella fascia [inizio, fine].
     * UTENTE o ADMIN possono invocare.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('UTENTE','ADMIN')")
    public List<Veicolo> listaDisponibili(LocalDateTime inizio, LocalDateTime fine) {
        return veRepo.findAvailable(inizio, fine);
    }

    /**
     * Elimina un veicolo per ID.
     * Solo ADMIN può invocare.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminaVeicolo(Long id) {
        veRepo.deleteById(id);
    }
}