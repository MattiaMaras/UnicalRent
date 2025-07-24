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

    private final VeicoloMapper veicoloMapper;

    public PrenotazioneMapper(VeicoloMapper veicoloMapper) {
        this.veicoloMapper = veicoloMapper;
    }

    public PrenotazioneDTO toDTO(Prenotazione prenotazione) {
        if (prenotazione == null) return null;

        PrenotazioneDTO dto = new PrenotazioneDTO();
        dto.setId(prenotazione.getId());
        dto.setDataInizio(prenotazione.getDataInizio());
        dto.setDataFine(prenotazione.getDataFine());
        dto.setStato(prenotazione.getStato());
        dto.setCostoTotale(prenotazione.getCostoTotale());
        dto.setNote(prenotazione.getNote());

        dto.setDataCreazione(prenotazione.getDataCreazione() != null ?
                prenotazione.getDataCreazione() : prenotazione.getDataInizio());

        if (prenotazione.getVeicolo() != null) {
            dto.setVeicolo(veicoloMapper.toDTO(prenotazione.getVeicolo()));
        }

        if (prenotazione.getUtente() != null) {
            UtenteDTO utenteDTO = new UtenteDTO();
            utenteDTO.setUsername(prenotazione.getUtente().getId()); // Usa ID come username
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