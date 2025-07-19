package it.unicalrent.repository;

import it.unicalrent.entity.CartaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartaCreditoRepository extends JpaRepository<CartaCredito, Long> {
    
    List<CartaCredito> findByUtenteIdOrderByPrincipaleDescDataCreazioneDesc(String utenteId);
    
    Optional<CartaCredito> findByUtenteIdAndPrincipaleTrue(String utenteId);
    
    @Query("SELECT c FROM CartaCredito c WHERE c.utente.id = :utenteId AND c.numeroCarta = :numeroCarta")
    Optional<CartaCredito> findByUtenteIdAndNumeroCarta(@Param("utenteId") String utenteId, @Param("numeroCarta") String numeroCarta);
    
    long countByUtenteId(String utenteId);
}