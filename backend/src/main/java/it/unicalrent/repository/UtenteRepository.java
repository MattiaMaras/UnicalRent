package it.unicalrent.repository;

import it.unicalrent.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository per l'entità Utente.
 */
@Repository
public interface UtenteRepository extends JpaRepository<Utente, String> {

    /**
     * Recupera un utente dato il suo indirizzo email.
     * @param email email da cercare
     * @return Optional contenente l'Utente, se esistente
     */
    Optional<Utente> findByEmail(String email);
}