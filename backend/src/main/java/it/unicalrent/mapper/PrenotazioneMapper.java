package it.unicalrent.mapper;

import it.unicalrent.dto.PrenotazioneDTO;
import it.unicalrent.dto.UtenteDTO;
import it.unicalrent.dto.VeicoloDTO;
import it.unicalrent.entity.Prenotazione;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PrenotazioneMapper {
    
    public PrenotazioneDTO toDTO(Prenotazione prenotazione) {
        if (prenotazione == null) return null;
        
        PrenotazioneDTO dto = new PrenotazioneDTO();
        dto.setId(prenotazione.getId());
        dto.setDataInizio(prenotazione.getDataInizio());
        dto.setDataFine(prenotazione.getDataFine());
        dto.setStato(prenotazione.getStato());
        dto.setCostoTotale(prenotazione.getCostoTotale());
        dto.setNote(prenotazione.getNote());
        
        // Mappa il veicolo
        if (prenotazione.getVeicolo() != null) {
            VeicoloDTO veicoloDTO = new VeicoloDTO();
            veicoloDTO.setId(prenotazione.getVeicolo().getId());
            veicoloDTO.setMarca(prenotazione.getVeicolo().getMarca());
            veicoloDTO.setModello(prenotazione.getVeicolo().getModello());
            veicoloDTO.setTarga(prenotazione.getVeicolo().getTarga());
            veicoloDTO.setPosti(prenotazione.getVeicolo().getPosti());
            veicoloDTO.setAlimentazione(prenotazione.getVeicolo().getAlimentazione());
            veicoloDTO.setTipo(prenotazione.getVeicolo().getTipo());
            veicoloDTO.setAnno(prenotazione.getVeicolo().getAnno());
            veicoloDTO.setCostoOrario(prenotazione.getVeicolo().getCostoOrario());
            veicoloDTO.setImmagine(prenotazione.getVeicolo().getImmagine());
            dto.setVeicolo(veicoloDTO);
        }
        
        // Mappa l'utente
        if (prenotazione.getUtente() != null) {
            UtenteDTO utenteDTO = new UtenteDTO();
            utenteDTO.setId(prenotazione.getUtente().getId());
            utenteDTO.setUsername(prenotazione.getUtente().getId());
            utenteDTO.setEmail(prenotazione.getUtente().getEmail());
            utenteDTO.setNome(prenotazione.getUtente().getNome());
            utenteDTO.setCognome(prenotazione.getUtente().getCognome());
            dto.setUtente(utenteDTO);
        }
        
        return dto;
    }
    
    public List<PrenotazioneDTO> toDTOList(List<Prenotazione> prenotazioni) {
        return prenotazioni.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}