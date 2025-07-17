package it.unicalrent.repository;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.entity.Utente;
import it.unicalrent.entity.Veicolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {

    /**
     * Restituisce tutte le prenotazioni attive di un utente (non annullate).
     */
    List<Prenotazione> findByUtenteId(String utenteId);

    /**
     * Trova tutte le prenotazioni per un dato veicolo (usato per mostrare disponibilità).
     */
    List<Prenotazione> findByVeicoloId(Long veicoloId);

    /**
     * Controlla se esiste una prenotazione sullo stesso veicolo che
     * inizi prima di dataFine e finisca dopo dataInizio (overlap).
     */
    boolean existsByVeicoloAndDataInizioLessThanAndDataFineGreaterThan(
            Veicolo veicolo,
            LocalDateTime dataFine,
            LocalDateTime dataInizio
    );

    /**
     * Trova tutte le prenotazioni attive (usato per gli ADMIN).
     */
    @Query("SELECT p FROM Prenotazione p WHERE p.stato <> 'ANNULLATA'")
    List<Prenotazione> findAllNonAnnullate();

    /**
     * Trova tutte le prenotazioni approvate per un determinato giorno e veicolo.
     * Utile per analisi o report.
     */
    @Query("SELECT p FROM Prenotazione p WHERE p.veicolo.id = :veicoloId AND " +
            "DATE(p.dataInizio) = :giorno AND p.stato = 'APPROVATA'")
    List<Prenotazione> findByVeicoloAndGiorno(
            @Param("veicoloId") Long veicoloId,
            @Param("giorno") LocalDateTime giorno
    );

}