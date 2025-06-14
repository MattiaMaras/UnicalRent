package it.unicalrent.repository;

import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository per l'entità Veicolo.
 */
@Repository
public interface VeicoloRepository extends JpaRepository<Veicolo, Long> {

    /**
     * Recupera un veicolo dato il suo numero di targa.
     * @param targa targa da cercare
     * @return Optional contenente il Veicolo, se esistente
     */
    Optional<Veicolo> findByTarga(String targa);

    /**
     * Restituisce tutti i veicoli che non hanno prenotazioni sovrapposte all'intervallo [inizio, fine].
     */
    @Query("SELECT v FROM Veicolo v "
            + "WHERE NOT EXISTS ("
            + "  SELECT 1 FROM Prenotazione p "
            + "  WHERE p.veicolo = v "
            + "    AND p.inizio < :fine "
            + "    AND p.fine   > :inizio"
            + ")")
    List<Veicolo> findAvailable(
            @Param("inizio") LocalDateTime inizio,
            @Param("fine")   LocalDateTime fine
    );
}