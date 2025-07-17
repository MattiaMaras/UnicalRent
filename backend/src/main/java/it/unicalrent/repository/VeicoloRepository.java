package it.unicalrent.repository;

import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository per l'accesso ai dati dei veicoli.
 * Estende JpaRepository per CRUD completo + query derivate.
 */
@Repository
public interface VeicoloRepository extends JpaRepository<Veicolo, Long> {

    /**
     * Cerca un veicolo tramite targa.
     * La targa è univoca per ogni veicolo.
     */
    Optional<Veicolo> findByTarga(String targa);

    /**
     * Restituisce tutti i veicoli attivi (usati per prenotazioni e visibilità).
     */
    List<Veicolo> findByAttivoTrue();

    /**
     * Restituisce tutti i veicoli attivi filtrati per tipo.
     */
    List<Veicolo> findByAttivoTrueAndTipo(String tipo);

    /**
     * Restituisce tutti i veicoli attivi filtrati per alimentazione.
     */
    List<Veicolo> findByAttivoTrueAndAlimentazione(String alimentazione);

    /**
     * Restituisce tutti i veicoli attivi filtrati per tipo e alimentazione.
     */
    List<Veicolo> findByAttivoTrueAndTipoAndAlimentazione(String tipo, String alimentazione);

    Optional<Veicolo> findByIdAndAttivoTrue(Long id);
}