package it.unicalrent.service;

import it.unicalrent.entity.Veicolo;
import it.unicalrent.repository.VeicoloRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Servizio per la gestione dei veicoli.
 * Consente la creazione, modifica, eliminazione e ricerca dei veicoli.
 */
@Service
public class VeicoloService {

    private final VeicoloRepository veicoloRepository;

    public VeicoloService(VeicoloRepository veicoloRepository) {
        this.veicoloRepository = veicoloRepository;
    }

    /**
     * Restituisce tutti i veicoli attivi (visibili anche agli utenti).
     */
    public List<Veicolo> getVeicoliDisponibili() {
        return veicoloRepository.findByAttivoTrue();
    }

    /**
     * Recupera un veicolo attivo per ID, altrimenti solleva eccezione.
     */
    public Veicolo getById(Long id) {
        return veicoloRepository.findByIdAndAttivoTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Veicolo non trovato con ID: " + id));
    }

    /**
     * Crea un nuovo veicolo.
     * Solo ADMIN può accedere.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Veicolo creaVeicolo(Veicolo veicolo) {
        if (veicolo.getAttivo() == null) {
            veicolo.setAttivo(true);
        }

        if (veicolo.getDisponibile() == null) {
            veicolo.setDisponibile(true);
        }

        if (veicolo.getDataAggiunta() == null) {
            veicolo.setDataAggiunta(LocalDate.now());
        }

        return veicoloRepository.save(veicolo);
    }

    /**
     * Aggiorna un veicolo esistente.
     * Solo ADMIN può accedere.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Veicolo aggiornaVeicolo(Long id, Veicolo aggiornato) {
        Veicolo esistente = veicoloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veicolo non trovato con ID: " + id));

        esistente.setMarca(aggiornato.getMarca());
        esistente.setModello(aggiornato.getModello());
        esistente.setTarga(aggiornato.getTarga());
        esistente.setAnno(aggiornato.getAnno());
        esistente.setAlimentazione(aggiornato.getAlimentazione());
        esistente.setTipo(aggiornato.getTipo());
        esistente.setPosti(aggiornato.getPosti());
        esistente.setCostoOrario(aggiornato.getCostoOrario());
        esistente.setDescrizione(aggiornato.getDescrizione());
        esistente.setImmagine(aggiornato.getImmagine());
        esistente.setDisponibile(aggiornato.getDisponibile());

        return veicoloRepository.save(esistente);
    }

    /**
     * Soft-delete di un veicolo.
     * Solo ADMIN può accedere.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminaVeicolo(Long id) {
        Veicolo veicolo = veicoloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veicolo non trovato con ID: " + id));
        veicolo.setAttivo(false);
        veicoloRepository.save(veicolo);
    }

    /**
     * Restituisce solo i veicoli attivi (disponibili per la visualizzazione).
     * Accessibile sia da UTENTE che da ADMIN.
     */
    @Transactional(readOnly = true)
    public List<Veicolo> listaVeicoliAttivi() {
        return veicoloRepository.findByAttivoTrue();
    }

    /**
     * Recupera un veicolo dato il suo ID, se esiste ed è attivo.
     *
     * @param id ID del veicolo da cercare
     * @return il veicolo trovato
     * @throws IllegalArgumentException se il veicolo non esiste o è disattivato
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Veicolo getVeicoloById(Long id) {
        return veicoloRepository.findById(id)
                .filter(Veicolo::getAttivo)
                .orElseThrow(() -> new IllegalArgumentException("Veicolo non trovato o disattivato con id: " + id));
    }

    /**
     * Restituisce tutti i veicoli (attivi e disattivati) per la gestione admin.
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<Veicolo> listaVeicoliTutti() {
        return veicoloRepository.findAll();
    }

    /**
     * Riattiva un veicolo disattivato.
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void riattivaVeicolo(Long id) {
        Veicolo veicolo = veicoloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veicolo non trovato con ID: " + id));
        veicolo.setAttivo(true);
        veicoloRepository.save(veicolo);
    }
}