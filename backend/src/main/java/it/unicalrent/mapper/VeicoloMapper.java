package it.unicalrent.mapper;

import it.unicalrent.dto.VeicoloDTO;
import it.unicalrent.entity.Veicolo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VeicoloMapper {
    
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
        
        return dto;
    }
    
    public List<VeicoloDTO> toDTOList(List<Veicolo> veicoli) {
        return veicoli.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}