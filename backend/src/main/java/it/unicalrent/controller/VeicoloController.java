package it.unicalrent.controller;

import it.unicalrent.dto.VeicoloDTO;
import it.unicalrent.entity.Prenotazione;
import it.unicalrent.entity.StatoPrenotazione;
import it.unicalrent.entity.Veicolo;
import it.unicalrent.mapper.VeicoloMapper;
import it.unicalrent.repository.PrenotazioneRepository;
import it.unicalrent.service.VeicoloService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/veicoli")
public class VeicoloController {

    private final VeicoloService veicoloService;
    private final VeicoloMapper veicoloMapper;
    private final PrenotazioneRepository prenotazioneRepository;

    public VeicoloController(VeicoloService veicoloService, VeicoloMapper veicoloMapper, PrenotazioneRepository prenotazioneRepository) {
        this.veicoloService = veicoloService;
        this.veicoloMapper = veicoloMapper;
        this.prenotazioneRepository = prenotazioneRepository;
    }

    /**
     * Restituisce tutti i veicoli attivi e disponibili.
     * Accesso libero per consultazione.
     */
    @GetMapping
    public ResponseEntity<List<VeicoloDTO>> listaVeicoliAttivi() {
        List<Veicolo> veicoli = veicoloService.listaVeicoliAttivi();
        return ResponseEntity.ok(veicoloMapper.toDTOList(veicoli));
    }

    /**
     * Restituisce i dettagli di un singolo veicolo per ID.
     * Accesso libero.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VeicoloDTO> getVeicolo(@PathVariable Long id) {
        Veicolo veicolo = veicoloService.getVeicoloById(id);
        return ResponseEntity.ok(veicoloMapper.toDTO(veicolo));
    }

    /**
     * Crea un nuovo veicolo (solo per amministratori).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeicoloDTO> aggiungiVeicolo(@Valid @RequestBody Veicolo veicolo) {
        Veicolo creato = veicoloService.creaVeicolo(veicolo);
        return ResponseEntity.ok(veicoloMapper.toDTO(creato));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeicoloDTO> aggiornaVeicolo(@PathVariable Long id, @Valid @RequestBody VeicoloDTO aggiornato) {
        Veicolo veicoloAggiornato = veicoloMapper.fromDTO(aggiornato);
        Veicolo veicolo = veicoloService.aggiornaVeicolo(id, veicoloAggiornato);
        return ResponseEntity.ok(veicoloMapper.toDTO(veicolo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminaVeicolo(@PathVariable Long id) {
        veicoloService.eliminaVeicolo(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restituisce le date disponibili per un veicolo nei prossimi 30 giorni.
     */
    @GetMapping("/{id}/disponibilita")
    public ResponseEntity<Map<String, Object>> getDisponibilitaVeicolo(@PathVariable Long id) {
        try {
            Veicolo veicolo = veicoloService.getById(id);
            
            List<String> dateDisponibili = new ArrayList<>();
            List<String> dateOccupate = new ArrayList<>();
            
            LocalDate oggi = LocalDate.now();
            LocalDate limite = oggi.plusDays(30);
            
            // Tutte le prenotazioni attive per questo veicolo
            List<Prenotazione> prenotazioniAttive = prenotazioneRepository.findByVeicoloAndStato(veicolo, StatoPrenotazione.ATTIVA);
            
            for (LocalDate data = oggi; !data.isAfter(limite); data = data.plusDays(1)) {
                final LocalDate dataCorrente = data; //copia final per l'uso nella lambda
                boolean isOccupata = prenotazioniAttive.stream()
                    .anyMatch(prenotazione -> {
                        LocalDate inizioPrenotazione = prenotazione.getDataInizio().toLocalDate();
                        LocalDate finePrenotazione = prenotazione.getDataFine().toLocalDate();
                        return !dataCorrente.isBefore(inizioPrenotazione) && !dataCorrente.isAfter(finePrenotazione);
                    });
                
                if (isOccupata) {
                    dateOccupate.add(dataCorrente.toString());
                } else {
                    dateDisponibili.add(dataCorrente.toString());
                }
            }
            
            Map<String, Object> risultato = new HashMap<>();
            risultato.put("veicoloId", id);
            risultato.put("dateDisponibili", dateDisponibili);
            risultato.put("dateOccupate", dateOccupate);
            
            return ResponseEntity.ok(risultato);
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Restituisce tutti i veicoli (attivi e disattivati) per gestione admin.
     */
    @GetMapping("/admin/tutti")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VeicoloDTO>> listaVeicoliTutti() {
        List<Veicolo> veicoli = veicoloService.listaVeicoliTutti();
        return ResponseEntity.ok(veicoloMapper.toDTOList(veicoli));
    }

    /**
     * Riattiva un veicolo disattivato.
     */
    @PutMapping("/{id}/riattiva")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeicoloDTO> riattivaVeicolo(@PathVariable Long id) {
        veicoloService.riattivaVeicolo(id);
        Veicolo veicolo = veicoloService.getVeicoloById(id);
        return ResponseEntity.ok(veicoloMapper.toDTO(veicolo));
    }
}
