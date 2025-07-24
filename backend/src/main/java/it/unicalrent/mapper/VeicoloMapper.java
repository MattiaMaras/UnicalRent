package it.unicalrent.mapper;

import it.unicalrent.dto.VeicoloDTO;
import it.unicalrent.entity.Veicolo;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class VeicoloMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public VeicoloDTO toDTO(Veicolo veicolo) {
        if (veicolo == null) return null;
        
        VeicoloDTO dto = new VeicoloDTO();
        dto.setId(veicolo.getId());
        dto.setMarca(veicolo.getMarca());
        dto.setModello(veicolo.getModello());
        dto.setTarga(veicolo.getTarga());
        dto.setPosti(veicolo.getPosti());
        dto.setAlimentazione(veicolo.getAlimentazione());
        dto.setTipo(veicolo.getTipo());
        dto.setAnno(veicolo.getAnno());
        dto.setCostoOrario(veicolo.getCostoOrario());
        dto.setImmagine(veicolo.getImmagine());
        dto.setDescrizione(veicolo.getDescrizione());
        dto.setAttivo(veicolo.getAttivo());
        dto.setDisponibile(veicolo.getDisponibile());

        if (veicolo.getDataAggiunta() != null) {
            dto.setDataAggiunta(veicolo.getDataAggiunta().format(DATE_FORMATTER));
        }
        
        return dto;
    }
    
    public Veicolo fromDTO(VeicoloDTO dto) {
        if (dto == null) return null;
        
        Veicolo veicolo = new Veicolo();
        veicolo.setId(dto.getId());
        veicolo.setMarca(dto.getMarca());
        veicolo.setModello(dto.getModello());
        veicolo.setTarga(dto.getTarga());
        veicolo.setPosti(dto.getPosti());
        veicolo.setAlimentazione(dto.getAlimentazione());
        veicolo.setTipo(dto.getTipo());
        veicolo.setAnno(dto.getAnno());
        veicolo.setCostoOrario(dto.getCostoOrario());
        veicolo.setImmagine(dto.getImmagine());
        veicolo.setDescrizione(dto.getDescrizione());
        veicolo.setAttivo(dto.getAttivo());
        veicolo.setDisponibile(dto.getDisponibile());

        if (dto.getDataAggiunta() != null && !dto.getDataAggiunta().isEmpty()) {
            veicolo.setDataAggiunta(LocalDate.parse(dto.getDataAggiunta(), DATE_FORMATTER));
        }
        
        return veicolo;
    }
    
    public List<VeicoloDTO> toDTOList(List<Veicolo> veicoli) {
        return veicoli.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}