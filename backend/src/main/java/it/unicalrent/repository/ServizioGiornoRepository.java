package it.unicalrent.repository;

import it.unicalrent.entity.ServizioGiorno;
import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Repository per l'entity ServizioGiorno.
 *
 * Offre operazioni CRUD di base e un metodo per recuperare il contatore giornaliero di prenotazioni
 * per un determinato veicolo in una data specifica.
 */
@Repository
public interface ServizioGiornoRepository extends JpaRepository<ServizioGiorno, Long> {

    /**
     * Cerca il record ServizioGiorno che corrisponde al veicolo
     * e alla data specificati.
     *
     * @param veicolo l'istanza di Veicolo per cui cercare il contatore
     * @param data    la data (senza orario) di riferimento
     * @return Optional contenente il ServizioGiorno se esistente, altrimenti vuoto
     */
    Optional<ServizioGiorno> findByVeicoloAndData(Veicolo veicolo, LocalDate data);
}