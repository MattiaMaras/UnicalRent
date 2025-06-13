package it.unicalrent.repository;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

/**
 * Repository per l'entità Prenotazione.
 */
@Repository
public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {

    /**
     * Verifica se esiste almeno una prenotazione per lo stesso veicolo
     * con fascia oraria in sovrapposizione [inizio, fine].
     *
     * Corrisponde a:
     *   SELECT COUNT(*) > 0 FROM prenotazioni p
     *   WHERE p.veicolo = :veicolo
     *     AND p.inizio < :fine
     *     AND p.fine > :inizio
     *
     * @param veicolo il veicolo da controllare
     * @param inizio  data/ora di inizio richiesta
     * @param fine    data/ora di fine richiesta
     * @return true se esiste almeno una sovrapposizione
     */
    boolean existsByVeicoloAndInizioLessThanAndFineGreaterThan(
            Veicolo veicolo,
            LocalDateTime fine,
            LocalDateTime inizio
    );
}