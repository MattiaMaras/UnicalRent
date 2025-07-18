package it.unicalrent.service;

import it.unicalrent.entity.Prenotazione;
import it.unicalrent.entity.StatoPrenotazione;
import it.unicalrent.repository.PrenotazioneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servizio per la gestione automatica degli stati delle prenotazioni.
 * Aggiorna automaticamente le prenotazioni scadute da ATTIVA a COMPLETATA.
 */
@Service
public class PrenotazioneSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(PrenotazioneSchedulerService.class);
    
    private final PrenotazioneRepository prenotazioneRepo;

    public PrenotazioneSchedulerService(PrenotazioneRepository prenotazioneRepo) {
        this.prenotazioneRepo = prenotazioneRepo;
    }

    /**
     * Task schedulato che viene eseguito ogni 5 minuti per aggiornare
     * le prenotazioni attive scadute a completate.
     */
    @Scheduled(fixedRate = 300000) // Ogni 5 minuti (300000 ms)
    @Transactional
    public void aggiornaPrenotazioniScadute() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Trova tutte le prenotazioni attive con data fine passata
            List<Prenotazione> prenotazioniScadute = prenotazioneRepo
                .findByStatoAndDataFineBefore(StatoPrenotazione.ATTIVA, now);
            
            if (!prenotazioniScadute.isEmpty()) {
                logger.info("Trovate {} prenotazioni scadute da aggiornare", prenotazioniScadute.size());
                
                // Aggiorna lo stato a COMPLETATA
                for (Prenotazione prenotazione : prenotazioniScadute) {
                    prenotazione.setStato(StatoPrenotazione.COMPLETATA);
                    prenotazioneRepo.save(prenotazione);
                    
                    logger.debug("Prenotazione ID {} aggiornata da ATTIVA a COMPLETATA (scaduta il {})", 
                        prenotazione.getId(), prenotazione.getDataFine());
                }
                
                logger.info("Aggiornate {} prenotazioni da ATTIVA a COMPLETATA", prenotazioniScadute.size());
            }
            
        } catch (Exception e) {
            logger.error("Errore durante l'aggiornamento delle prenotazioni scadute", e);
        }
    }
    
    /**
     * Metodo manuale per forzare l'aggiornamento delle prenotazioni scadute.
     * Utile per test o per esecuzione manuale da parte dell'admin.
     */
    @Transactional
    public int aggiornaPrenotazioniScaduteManuale() {
        LocalDateTime now = LocalDateTime.now();
        
        List<Prenotazione> prenotazioniScadute = prenotazioneRepo
            .findByStatoAndDataFineBefore(StatoPrenotazione.ATTIVA, now);
        
        for (Prenotazione prenotazione : prenotazioniScadute) {
            prenotazione.setStato(StatoPrenotazione.COMPLETATA);
            prenotazioneRepo.save(prenotazione);
        }
        
        logger.info("Aggiornamento manuale: {} prenotazioni aggiornate da ATTIVA a COMPLETATA", 
            prenotazioniScadute.size());
        
        return prenotazioniScadute.size();
    }
}