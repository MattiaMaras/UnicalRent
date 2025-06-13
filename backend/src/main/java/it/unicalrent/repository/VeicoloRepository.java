package it.unicalrent.repository;

import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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
}